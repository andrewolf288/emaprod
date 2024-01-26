<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdcIngProdt = $data["id"];
    $idProdc = $data["idProdc"]; // produccion
    $codLotProd = $data["codLot"]; // codigo lote
    $idProdt = $data["idProdt"]; // producto
    $refProdtProg = $data["refProdtProg"]; // referencia producto programado
    $canProdIng = $data["canProdIng"]; // cantidad ingresada
    $fecEntSto = $data["fecProdIng"]; // fecha ingreso
    $fecProdVen = $data["fecProdVen"]; // fecha vencimiento
    $fecProdIngAlm = date('Y-m-d H:i:s'); // fecha ingreso almacen
    $codProd2 = $data["codProd2"]; // codigo de producto
    $letAniEntSto = $data["letAniEntSto"]; // letra anio
    $diaJulEntSto = $data["diaJulEntSto"]; // dia juliano
    $detalleEntradaAlmacen = $data["detalleEntradaAlmacen"]; // detalle de entrada almacen
    $manLotProd = $data["manLotProd"];

    //regProFin
    if ($pdo) {
        try {
            $pdo->beginTransaction();

            // 1. primero debemos verificar si es un producto que maneja lotes
            if ($manLotProd === 0) {
                // obtenemos informacion del lote
                $lotPorDef = $data["lotPorDef"];
                $sql_find_lote_produccion_defecto =
                    "SELECT * FROM produccion 
                WHERE codLotProd = ?";
                $stmt_find_lote_produccion_defecto = $pdo->prepare($sql_find_lote_produccion_defecto);
                $stmt_find_lote_produccion_defecto->bindParam(1, $lotPorDef, PDO::PARAM_STR);
                $stmt_find_lote_produccion_defecto->execute();

                $result_produccion = $stmt_find_lote_produccion_defecto->fetch(PDO::FETCH_ASSOC);
                $idProdc = $result_produccion["id"];
                $codLotProd = $result_produccion["codLotProd"];
            }

            // 2. Ahora debemos recorrer el detalle de entradas a almacen
            foreach ($detalleEntradaAlmacen as $value) {
                // OBTENEMOS LOS DATOS DE LA ENTRADA
                $idProv = 1; // proveedor EMARANSAC
                $idAlm = $value["idAlm"]; // almacen principal
                $idEntStoEst = 1; // disponible
                $codProv = "00"; // proveedor EMARANSAC
                $esSel = 0; // es seleccion
                $docEntSto = "PRODUCTO FINAL";
                $idEntStoTip = 3; // entrada de produto final
                $canIngAlm = $value["canIngAlm"];

                $anioActual = explode("-", explode(" ", $fecEntSto)[0])[0]; // año actual

                $sql_numero_entrada =
                    "SELECT 
                MAX(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
                FROM entrada_stock
                WHERE idProd = ? AND YEAR(fecEntSto) = ?
                ORDER BY refNumIngEntSto DESC LIMIT 1";

                // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
                $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
                $stmt_numero_entrada->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_numero_entrada->bindParam(2, $anioActual);
                $stmt_numero_entrada->execute();

                // Recorremos los resultados
                $refNumIngEntSto = 0;

                // si hay ingresos de ese producto ese año
                if ($stmt_numero_entrada->rowCount() == 1) {
                    while ($row = $stmt_numero_entrada->fetch(PDO::FETCH_ASSOC)) {
                        $refNumIngEntSto = intval($row["refNumIngEntSto"]) + 1;
                    }
                } else {
                    // si no hay ingresos de productos ese año
                    $refNumIngEntSto = 1;
                }

                // EL CODIGO DE INGRESO ES DE 
                $refNumIngEntSto = str_pad(strval($refNumIngEntSto), 3, "0", STR_PAD_LEFT);
                // ***** FORMAMOS EL CODIGO DE ENTRADA ******
                $codEntSto = $codProd2 . $codProv . $letAniEntSto . $diaJulEntSto . $refNumIngEntSto;

                $sql_insert_entrada_stock =
                    "INSERT INTO entrada_stock
                (idProd,
                idProv,
                idAlm,
                idEntStoEst,
                codEntSto,
                letAniEntSto,
                diaJulEntSto,
                refNumIngEntSto,
                esSel,
                canTotEnt,
                canTotDis,
                docEntSto,
                fecEntSto,
                fecVenEntSto, 
                referencia,
                refProdc,
                codLot,
                idEntStoTip
                )
                VALUES (?,?,?,?,?,?,?,?,?, $canIngAlm, $canIngAlm,?,?,?,?,?,?,?)";

                $stmt_insert_entrada_stock = $pdo->prepare($sql_insert_entrada_stock);
                $stmt_insert_entrada_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(2, $idProv, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(3, $idAlm, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(4, $idEntStoEst, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(5, $codEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(6, $letAniEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(7, $diaJulEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(8, $refNumIngEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(9, $esSel, PDO::PARAM_BOOL);
                $stmt_insert_entrada_stock->bindParam(10, $docEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(11, $fecEntSto);
                $stmt_insert_entrada_stock->bindParam(12, $fecProdVen);
                $stmt_insert_entrada_stock->bindParam(13, $idProdc, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(14, $idProdc, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(15, $codLotProd, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(16, $idEntStoTip, PDO::PARAM_INT); // entrada de tipo producto final
                $stmt_insert_entrada_stock->execute();

                // finalmente actualizamos stock de almacen principal
                // primero consultamos si existe el producto registrado
                $sql_consult_stock_almacen =
                    "SELECT * FROM almacen_stock
                WHERE idAlm = ? AND idProd = ?";

                $stmt_consult_stock_almacen = $pdo->prepare($sql_consult_stock_almacen);
                $stmt_consult_stock_almacen->bindParam(1, $idAlm, PDO::PARAM_INT);
                $stmt_consult_stock_almacen->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_consult_stock_almacen->execute();

                // Si esta registrado el producto en el almacen principal (UPDATE)
                if ($stmt_consult_stock_almacen->rowCount() == 1) {
                    $sql_update_stock_almacen =
                        "UPDATE almacen_stock SET
                    canSto = canSto + $canIngAlm, canStoDis = canStoDis + $canIngAlm
                    WHERE idAlm = ? AND idProd = ?";

                    $stmt_update_stock_almacen = $pdo->prepare($sql_update_stock_almacen);
                    $stmt_update_stock_almacen->bindParam(1, $idAlm, PDO::PARAM_INT);
                    $stmt_update_stock_almacen->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_update_stock_almacen->execute();
                    // Si no esta registrado el producto en el almacen principal (CREATE)
                } else {
                    $sql_create_stock_almacen =
                        "INSERT INTO almacen_stock
                    (idProd, idAlm, canSto, canStoDis)
                    VALUES(?, ?, $canIngAlm, $canIngAlm)";

                    $stmt_create_stock_almacen = $pdo->prepare($sql_create_stock_almacen);
                    $stmt_create_stock_almacen->bindParam(1, $idProdt, PDO::PARAM_INT);
                    $stmt_create_stock_almacen->bindParam(2, $idAlm, PDO::PARAM_INT);
                    $stmt_create_stock_almacen->execute();
                }
            }

            // actualizamos el detalle de ingreso
            $esComProdIng = 1;
            $sql_update_produccion_ingreso_producto =
                "UPDATE produccion_ingreso_producto
            SET fecProdIngAlm = ?, esComProdIng = ?
            WHERE id = ?";
            $stmt_update_produccion_ingreso_producto = $pdo->prepare($sql_update_produccion_ingreso_producto);
            $stmt_update_produccion_ingreso_producto->bindParam(1, $fecProdIngAlm, PDO::PARAM_STR);
            $stmt_update_produccion_ingreso_producto->bindParam(2, $esComProdIng, PDO::PARAM_BOOL);
            $stmt_update_produccion_ingreso_producto->bindParam(3, $idProdcIngProdt, PDO::PARAM_INT);
            $stmt_update_produccion_ingreso_producto->execute();

            // Actualizamos la programacion de producto final
            $sql_update_producto_final =
                "UPDATE produccion_producto_final
            SET canTotIngProdFin = canTotIngProdFin + $canProdIng, fecActProdcProdtFin = ?
            WHERE id = ?";
            $stmt_update_producto_final = $pdo->prepare($sql_update_producto_final);
            $stmt_update_producto_final->bindParam(1, $fecProdIngAlm); // fecha de actualizacion
            $stmt_update_producto_final->bindParam(2, $refProdtProg, PDO::PARAM_INT);
            $stmt_update_producto_final->execute();
        } catch (PDOException $e) {
            $message_error = "Error en la consulta de almacen principal";
            $description_error = $e->getMessage();
        }

        $pdo->commit();
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
