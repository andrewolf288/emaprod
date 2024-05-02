<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

$message_error = "";
$description_error = "";
$result = array();
$pdo = getPDO();
$tolerancia = 0.0001;
$data = array();

$idLastInsertionOpeEnc = 0;
$idLastInsertionOpeEncDet = 0;

if (isset($_FILES['encuadre_excel']) && $_FILES['encuadre_excel']['error'] === UPLOAD_ERR_OK) {
    //obtenemos la informacion de almacen
    $idAlmacen = isset($_POST['idAlm']) ? $_POST['idAlm'] : 0;
    // Ruta temporal del archivo subido
    $archivo_temporal = $_FILES['encuadre_excel']['tmp_name'];
    // Cargar el archivo con PhpSpreadsheet
    $archivo_excel = IOFactory::load($archivo_temporal);
    readDataEncuadre($data, $archivo_excel, "Materia Prima", $tolerancia);
    readDataEncuadre($data, $archivo_excel, "Embalajes-Auxiliares", $tolerancia);
    readDataEncuadre($data, $archivo_excel, "Promociones", $tolerancia);
    // readDataEncuadre($data, $archivo_excel, "Producto final", $tolerancia);
    print_r($data);

    // luego queda recorrer los encuadres y hacer las operaciones correspondientes
    /*
        1. Creamos la operacion de encuadre
        2. Agregamos el detalle de la operacion de encuadre
        3. Si la diferencia es negativa, necesitamos realizar una salida
        4. Si la diferencia es positiva, necesitamos realizar una entrada
        5. Considerar añadir estos movimientos en reportes
    */
    $sql_create_operacion_encuadre =
        "INSERT INTO operacion_encuadre (idAlm)
    VALUES(?)";
    $stmt_create_operacion_encuadre = $pdo->prepare($sql_create_operacion_encuadre);
    $stmt_create_operacion_encuadre->bindParam(1, $idAlmacen, PDO::PARAM_INT);
    $stmt_create_operacion_encuadre->execute();
    $idLastInsertionOpeEnc = $pdo->lastInsertId();

    foreach ($data as $detalle) {
        $codProd2 = $detalle["codProd2"];
        $valorG = $detalle["valorG"];
        $valorH = $detalle["valorH"];
        $diferencia = $detalle["diferencia"];

        $sql_select_producto =
            "SELECT id FROM producto
        WHERE codProd2 = ?";
        $stmt_select_producto = $pdo->prepare($sql_select_producto);
        $stmt_select_producto->bindParam(1, $codProd2, PDO::PARAM_STR);
        $stmt_select_producto->execute();
        $row_producto = $stmt_select_producto->fetch(PDO::FETCH_ASSOC);

        $sql_insert_operacion_encuadre_detalle =
            "INSERT INTO operacion_encuadre_detalle 
        (idOpeEnc, idProdt, canStock, canStockEnc, canVarEnc)
        VALUES(?, ?, $valorG, $valorH, $diferencia)";
        $stmt_insert_operacion_encuadre_detalle = $pdo->prepare($sql_insert_operacion_encuadre_detalle);
        $stmt_insert_operacion_encuadre_detalle->bindParam(1, $idLastInsertionOpeEnc, PDO::PARAM_INT);
        $stmt_insert_operacion_encuadre_detalle->bindParam(2, $row_producto["id"], PDO::PARAM_INT);
        $stmt_insert_operacion_encuadre_detalle->execute();
        $idLastInsertionOpeEncDet = $pdo->lastInsertId();

        // comprobamos si la diferencia es mayor a 0
        if ($diferencia > 0) {
            $sql_insert_trazabilidad_entrada_operacion_encuadre_detalle =
                "INSERT INTO";
        } else {
            $sql_insert_salida_operacion_encuadre_detalle =
                "INSERT INTO";
        }
    }
} else {
    $message_error = "Error al recibir el archivo";
    $description_error = "Error al recibir el archivo";
}

// Retornamos el resultado
$return['message_error'] = $message_error;
$return['description_error'] = $description_error;
$return['result'] = $result;
echo json_encode($return);

function readDataEncuadre(array &$datos, Spreadsheet $archivo_excel, string $nameSheet, $tolerancia)
{
    $hoja = $archivo_excel->getSheetByName($nameSheet);

    if ($hoja) {
        $ultima_fila = $hoja->getHighestRow();
        // Iterar sobre las filas desde la fila 2 hasta la última fila con datos
        for ($fila = 2; $fila <= $ultima_fila; $fila++) {
            $valor_G = (float) $hoja->getCell('G' . $fila)->getValue();
            $valor_H = (float) $hoja->getCell('H' . $fila)->getValue();
            $valor_G_redondeado = round($valor_G, 3);
            $valor_H_redondeado = round($valor_H, 3);

            if (abs($valor_G_redondeado - $valor_H_redondeado) > $tolerancia) {
                // Si las diferencias son mayores que la tolerancia, añadir a $diferencias
                $valor_diferencia = floatval($valor_H_redondeado - $valor_G_redondeado);
                $valor_diferencia_redondeado = round($valor_diferencia, 3);

                array_push($datos, array(
                    'codProd2' => $hoja->getCell('B' . $fila)->getValue(),
                    'valorG' => $valor_G_redondeado,
                    'valorH' => $valor_H_redondeado,
                    'diferencia' => $valor_diferencia_redondeado
                ));
            }
        }
    }
}
