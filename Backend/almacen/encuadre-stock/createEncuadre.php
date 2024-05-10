<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require '../../vendor/autoload.php';
require('./findLoteProduccion.php');
require('./salidaDetalleEncuadre.php');
require('./entradaDetalleEncuadre.php');

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

$message_error = "";
$description_error = "";
$result = array();
$pdo = getPDO();
$tolerancia = 0.0001;
$data = array();
$dataErrors = array();

$idLastInsertionOpeEnc = 0;
$idLastInsertionOpeEncDet = 0;
$contenidoArchivo = "";

if (isset($_FILES['encuadre_excel']) && $_FILES['encuadre_excel']['error'] === UPLOAD_ERR_OK) {
    //obtenemos la informacion de almacen
    $idAlmacen = isset($_POST['idAlm']) ? $_POST['idAlm'] : 0;
    $idAlmacen = intval($idAlmacen);
    // Ruta temporal del archivo subido
    $archivo_temporal = $_FILES['encuadre_excel']['tmp_name'];
    // Cargar el archivo con PhpSpreadsheet
    $archivo_excel = IOFactory::load($archivo_temporal);
    readDataEncuadre($data, $archivo_excel, "Materia Prima", $tolerancia, $dataErrors);
    readDataEncuadre($data, $archivo_excel, "Embalajes-Auxiliares", $tolerancia, $dataErrors);
    readDataEncuadre($data, $archivo_excel, "Promociones", $tolerancia, $dataErrors);
    readDataProductoFinalEncuadre($data, $archivo_excel, "Producto final", $tolerancia, $dataErrors, $pdo);

    // si la data de errores esta vacia
    if (empty($dataErrors)) {
        $sql_create_operacion_encuadre =
            "INSERT INTO operacion_encuadre (idAlm)
        VALUES(?)";
        $stmt_create_operacion_encuadre = $pdo->prepare($sql_create_operacion_encuadre);
        $stmt_create_operacion_encuadre->bindParam(1, $idAlmacen, PDO::PARAM_INT);
        $stmt_create_operacion_encuadre->execute();
        $idLastInsertionOpeEnc = $pdo->lastInsertId();

        try {
            $pdo->beginTransaction();
            // primero realizamos el encuadre de materias primas y materiales
            foreach ($data as $detalle) {
                $codProd2 = $detalle["codProd2"];
                $valorG = $detalle["valorG"];
                $valorH = $detalle["valorH"];
                $diferencia = $detalle["diferencia"];
                $esMat = $detalle["esMat"];
                $esProFin = $detalle["esProFin"];
                $diferencia_valor_absoluto = abs($diferencia);

                $sql_select_producto =
                    "SELECT id, nomProd FROM producto
                WHERE codProd2 = ?";
                $stmt_select_producto = $pdo->prepare($sql_select_producto);
                $stmt_select_producto->bindParam(1, $codProd2, PDO::PARAM_STR);
                $stmt_select_producto->execute();
                $row_producto = $stmt_select_producto->fetch(PDO::FETCH_ASSOC);

                $sql_insert_operacion_encuadre_detalle = "";
                if ($esMat) {
                    $sql_insert_operacion_encuadre_detalle =
                        "INSERT INTO operacion_encuadre_detalle 
                    (idOpeEnc, idProdt, canStock, canStockEnc, canVarEnc)
                    VALUES(?, ?, $valorG, $valorH, $diferencia)";
                }
                if ($esProFin) {
                    $sql_insert_operacion_encuadre_detalle =
                        "INSERT INTO operacion_encuadre_detalle 
                    (idOpeEnc, idProdt, canStock, canStockEnc, canVarEnc, idProdc)
                    VALUES(?, ?, $valorG, $valorH, $diferencia, ?)";
                }
                $stmt_insert_operacion_encuadre_detalle = $pdo->prepare($sql_insert_operacion_encuadre_detalle);
                $stmt_insert_operacion_encuadre_detalle->bindParam(1, $idLastInsertionOpeEnc, PDO::PARAM_INT);
                $stmt_insert_operacion_encuadre_detalle->bindParam(2, $row_producto["id"], PDO::PARAM_INT);
                if ($esProFin) {
                    $stmt_insert_operacion_encuadre_detalle->bindParam(3, $detalle["produccion"], PDO::PARAM_INT);
                }
                $stmt_insert_operacion_encuadre_detalle->execute();
                $idLastInsertionOpeEncDet = $pdo->lastInsertId();

                // comprobamos si la diferencia es mayor a 0, realizamos una entrada
                if ($diferencia > 0) {
                    if ($esMat) {
                        entradaDetalleEncuadre($row_producto["id"], $codProd2, $idAlmacen, $diferencia_valor_absoluto, $idLastInsertionOpeEncDet, $pdo);
                    }
                    if ($esProFin) {
                        entradaDetalleEncuadre($row_producto["id"], $codProd2, $idAlmacen, $diferencia_valor_absoluto, $idLastInsertionOpeEncDet, $pdo, $detalle["produccion"], $detalle["lote"]);
                    }
                }
                // comprobampos si la diferencia es menor a 0, realizamos una salida
                else {
                    $result_operacion = array();
                    if ($esMat) {
                        $result_operacion = salidaDetalleEncuadre($row_producto["id"], $diferencia_valor_absoluto, $idLastInsertionOpeEncDet, $idAlmacen, $pdo);
                    }
                    if ($esProFin) {
                        $result_operacion = salidaDetalleEncuadre($row_producto["id"], $diferencia_valor_absoluto, $idLastInsertionOpeEncDet, $idAlmacen, $pdo, $detalle["produccion"]);
                    }
                    $message_error_operacion  = $result_operacion["message_error"];
                    if (!empty($message_error_operacion)) {
                        $errorParse = $message_error_operacion . " Código de producto: {$codProd2}. Nombre producto: {$row_producto["nomProd"]}";
                        array_push($dataErrors, $errorParse);
                    }
                }
            }
            // debemos comprobar si en las operaciones hubo errores
            if (!empty($dataErrors)) {
                $erroresTexto = implode("\n- ", $dataErrors);
                $contenidoArchivo = "Errores:\n\n" . $erroresTexto;
            } else {
                $pdo->commit();
                $contenidoArchivo = "Todas las operaciones se realizaron con éxito!!";
            }
        } catch (PDOException $e) {
            $pdo->rollBack();
            $contenidoArchivo = "Errores:\n\n" . $e->getMessage();
        }
    } else {
        $erroresTexto = implode("\n- ", $dataErrors);
        $contenidoArchivo = "Errores:\n\n" . $erroresTexto;
    }
} else {
    $contenidoArchivo = "Errores:\n\nError al recibir el archivo";
}

header('Content-Type: text/plain');
header('Content-Disposition: attachment; filename="respuesta.txt"');
echo $contenidoArchivo;
exit;

// data encuadre materia prima, promociones y embajes-auxiliares
function readDataEncuadre(array &$datos, Spreadsheet $archivo_excel, string $nameSheet, $tolerancia, &$dataErrors)
{
    $hoja = $archivo_excel->getSheetByName($nameSheet);
    if ($hoja) {
        $ultima_fila = $hoja->getHighestRow();
        // Iterar sobre las filas desde la fila 2 hasta la última fila con datos
        for ($fila = 2; $fila <= $ultima_fila; $fila++) {
            if (is_numeric($hoja->getCell('G' . $fila)->getValue()) && is_numeric($hoja->getCell('H' . $fila)->getValue())) {
                $valor_G = floatval($hoja->getCell('G' . $fila)->getValue());
                $valor_H = floatval($hoja->getCell('H' . $fila)->getValue());
                $valor_diferencia = round($valor_H - $valor_G, 3);
                if ($valor_G >= 0 && $valor_H >= 0) {
                    if (abs($valor_G - $valor_H) > $tolerancia) {
                        array_push($datos, array(
                            'esMat' => true,
                            'esProFin' => false,
                            'codProd2' => $hoja->getCell('B' . $fila)->getValue(),
                            'valorG' => $valor_G,
                            'valorH' => $valor_H,
                            'diferencia' => $valor_diferencia
                        ));
                    }
                } else {
                    $stringError =
                        "El valor de encuadre debe ser mayor o igual a 0: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                    array_push($dataErrors, $stringError);
                }
            } else {
                $stringError =
                    "Los valores no son numéricos. Codigo producto: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                array_push($dataErrors, $stringError);
            }
        }
    }
}

// data encuadre producto final
function readDataProductoFinalEncuadre(array &$datos, Spreadsheet $archivo_excel, string $nameSheet, $tolerancia, &$dataErrors, PDO $pdo)
{
    $hoja = $archivo_excel->getSheetByName($nameSheet);
    if ($hoja) {
        $ultima_fila = $hoja->getHighestRow();
        // Iterar sobre las filas desde la fila 2 hasta la última fila con datos
        for ($fila = 2; $fila <= $ultima_fila; $fila++) {
            if (is_numeric($hoja->getCell('G' . $fila)->getValue()) && is_numeric($hoja->getCell('H' . $fila)->getValue())) {
                $valor_G = intval($hoja->getCell('G' . $fila)->getValue());
                $valor_H = intval($hoja->getCell('H' . $fila)->getValue());
                $valor_diferencia = $valor_H - $valor_G;

                if ($valor_G >= 0 && $valor_H >= 0) {
                    if (abs($valor_G - $valor_H) > $tolerancia) {
                        // Si las diferencias son mayores que la tolerancia, añadir a $diferencias
                        $valorCodigoLote = $hoja->getCell('J' . $fila)->getValue();
                        $valorFechaVencimiento = $hoja->getCell('K' . $fila)->getValue();

                        // codigo de lote no es vacio y fecha vencimiento no es vacio
                        if (!empty($valorCodigoLote) && !empty($valorFechaVencimiento)) {
                            $expresion_regular_lote = "/^\d+$/";

                            // si ambos cumplen con el formato especifico
                            if (preg_match($expresion_regular_lote, $valorCodigoLote) && preg_match($expresion_regular_lote, $valorFechaVencimiento)) {
                                // buscamos el lote correspondiente
                                $resultFind = findLoteProduccion($valorCodigoLote, $valorFechaVencimiento, $hoja->getCell('B' . $fila)->getValue(), $pdo);
                                if (!empty($resultFind["message_error"])) {
                                    $stringError = $resultFind["message_error"] . ". Codigo producto: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                                    array_push($dataErrors, $stringError);
                                } else {
                                    // ya verificamos que el lote existe
                                    $idProduccionSearch = $resultFind["result"]["idProdc"];
                                    $codLotProdSearch = $resultFind["result"]["codLotProd"];
                                    $idProductoSearch = $resultFind["result"]["idProdt"];
                                    if ($valor_diferencia < 0) {
                                        // debemos comprobar si tiene stock
                                        $sql_suma_stock_producto_final =
                                            "SELECT SUM(canTotDis) FROM entrada_stock
                                        WHERE refProdc = ? AND idProd = ?";
                                        $stmt_suma_stock_producto_final = $pdo->prepare($sql_suma_stock_producto_final);

                                        $stmt_suma_stock_producto_final->bindParam(1, $idProduccionSearch, PDO::PARAM_INT);
                                        $stmt_suma_stock_producto_final->bindParam(2, $idProductoSearch, PDO::PARAM_INT);
                                        $stmt_suma_stock_producto_final->execute();

                                        $total_stock_producto = $stmt_suma_stock_producto_final->fetchColumn();

                                        if ($total_stock_producto >= abs($valor_diferencia)) {
                                            // mostramos información
                                            array_push($datos, array(
                                                'esMat' => false,
                                                'esProFin' => true,
                                                'codProd2' => $hoja->getCell('B' . $fila)->getValue(),
                                                'valorG' => $valor_G,
                                                'valorH' => $valor_H,
                                                'diferencia' => $valor_diferencia,
                                                'produccion' => $idProduccionSearch,
                                                'lote' => $codLotProdSearch
                                            ));
                                        } else {
                                            $stringError = "No hay stock suficiente para cubrir con la salida requerida. Codigo producto: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                                            array_push($dataErrors, $stringError);
                                        }
                                    } else {
                                        // mostramos información
                                        array_push($datos, array(
                                            'esMat' => false,
                                            'esProFin' => true,
                                            'codProd2' => $hoja->getCell('B' . $fila)->getValue(),
                                            'valorG' => $valor_G,
                                            'valorH' => $valor_H,
                                            'diferencia' => $valor_diferencia,
                                            'produccion' => $idProduccionSearch,
                                            'lote' => $codLotProdSearch
                                        ));
                                    }
                                }
                            } else {
                                $stringError = "El formato de codigo de lote o fecha de vencimiento no son válidos. Codigo producto: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                                array_push($dataErrors, $stringError);
                            }
                        } else {
                            $stringError = "El codigo de lote o la fecha de vencimiento no se proporcionaron. Codigo producto: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                            array_push($dataErrors, $stringError);
                        }
                    }
                } else {
                    $stringError =
                        "El valor de encuadre debe ser mayor o igual a 0: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                    array_push($dataErrors, $stringError);
                }
            } else {
                $stringError =
                    "Los valores no son numéricos. Codigo producto: {$hoja->getCell('B' .$fila)->getValue()}. Nombre producto: {$hoja->getCell('E' .$fila)->getValue()}";
                array_push($dataErrors, $stringError);
            }
        }
    }
}
