<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";
require('./salidaTransferenciaAlmacen.php');
require('./entradaTransferenciaAlmacen.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

/*
1. Cuando el almacen de origen es desmedro, debemos comprobar el stock de almacen_stock
2. Cuando el almacen de origen no es desmedro, debemos comprobar que existan entradas en entrada_stock
3. Cuando el almacen de destino es desmedro, no generamos una entrada_stock, solo descontamos del almacen_stock
4. Cuando el almacen de destino no es desmedro, se debe generar entradas en entrada_stock segun corresponda
*/

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idAlmOri = $data["idAlmOri"];
    $idAlmDes = $data["idAlmDes"];
    $obsTranAlm = $data["obsTranAlm"];
    $detTranAlm = $data["detTranAlm"];
    $idLastInsertion = 0;
    $tolerancia = 0.0001;

    // primero debemos crear la operacion de traslado entre almacenes
    try {
        $pdo->beginTransaction();
        // creamos la requisicion de transferencia entre almacenes
        $sql_insert_transferencia_almacenes =
            "INSERT INTO operacion_transferencia_almacen
        (idAlmOri, idAlmDes, obsTranAlm)
        VALUES(?, ?, ?)";
        $stmt_insert_transferencia_almacenes = $pdo->prepare($sql_insert_transferencia_almacenes);
        $stmt_insert_transferencia_almacenes->bindParam(1, $idAlmOri, PDO::PARAM_INT);
        $stmt_insert_transferencia_almacenes->bindParam(2, $idAlmDes, PDO::PARAM_INT);
        $stmt_insert_transferencia_almacenes->bindParam(3, $obsTranAlm, PDO::PARAM_STR);
        $stmt_insert_transferencia_almacenes->execute();
        $idLastInsertion = $pdo->lastInsertId();

        foreach ($detTranAlm as $detalleTransferencia) {
            $idLastInsertionDetalle = 0;
            $esProFin = $detalleTransferencia["esProFin"];
            $cantidadTransferencia = floatval($detalleTransferencia["canMatPriFor"]);
            $idProdt = $detalleTransferencia["idProdt"];
            $informacionSalida = array();

            /* AÑADIMOS AL DETALLE DE TRANSFERENCIA ENTRE ALMACENES */
            $sql_insert_detalle_operacion_transferencia_almacen =
                "INSERT INTO operacion_transferencia_almacen_detalle
            (idOpeTranAlm, idProdt, canOpeTranAlmDet)
            VALUES(?, ?, $cantidadTransferencia)";
            $stmt_insert_detalle_operacion_transferencia_almacen = $pdo->prepare($sql_insert_detalle_operacion_transferencia_almacen);
            $stmt_insert_detalle_operacion_transferencia_almacen->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
            $stmt_insert_detalle_operacion_transferencia_almacen->bindParam(2, $idProdt, PDO::PARAM_INT);
            $stmt_insert_detalle_operacion_transferencia_almacen->execute();
            $idLastInsertionDetalle = $pdo->lastInsertId();

            /* PRIMERO VERIFICAMOS LA SALIDA DEL ALMACEN DE ORIGEN */
            // si el almacen de origen es el almcen de desmedro
            if ($idAlmOri == 7) {
                // tenemos que realizar una comprobación is hay suficiente stock para la salida
                $sql_consult_almacen_stock =
                    "SELECT canStoDis FROM almacen_stock
                WHERE idAlm = ? AND idProd = ?";
                $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
                $stmt_consult_almacen_stock->bindParam(1, $idAlmOri, PDO::PARAM_INT);
                $stmt_consult_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_consult_almacen_stock->execute();
                $cantidadDisponibleAlmacen = $stmt_consult_almacen_stock->fetchColumn();

                if ($cantidadDisponibleAlmacen >= $cantidadTransferencia) {
                    $salDes = 1;
                    // insetamos la tabla de trazabilidad de salida
                    $sql_create_salida_transferencia_almacen =
                        "INSERT INTO salida_transferencia_almacen
                    (idTranAlmDet, canSalTranAlm, salDes)
                    VALUES(?, $cantidadTransferencia, ?)";
                    $stmt_create_salida_transferencia_almacen = $pdo->prepare($sql_create_salida_transferencia_almacen);
                    $stmt_create_salida_transferencia_almacen->bindParam(1, $idLastInsertionDetalle, PDO::PARAM_INT);
                    $stmt_create_salida_transferencia_almacen->bindParam(2, $salDes, PDO::PARAM_BOOL);
                    $stmt_create_salida_transferencia_almacen->execute();

                    // hacemos el descuento a almacen de stock
                    $sql_update_almacen_stock =
                        "UPDATE almacen_stock 
                    SET canSto = canSto - $cantidadTransferencia, canStoDis = canStoDis - $cantidadTransferencia
                    WHERE idAlm = ? AND idProd = ?";
                    $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                    $stmt_update_almacen_stock->bindParam(1, $idAlmOri, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->execute();
                } else {
                    // apilamos los errores en un archivo de texto txt u otro medio
                }
            } else {
                // si es producto final
                if ($esProFin == 1) {
                    $resultSalida = salidaProductoFinalTransferenciaAlmacen();
                    $message_error_salida = $resultSalida["message_error"];
                    $description_error_salida = $resultSalida["description_error"];
                    if (empty($message_error_salida)) {
                        $informacionSalida = $resultSalida["result"];
                    } else {
                        $message_error = "Surgió un inconveniente";
                        $description_error = $description_error_salida;
                    }
                }
                // si es materia prima o material
                else {
                    $resultSalida = salidaMateriaPrimaMaterialesTransferenciaAlmacen();
                    $message_error_salida = $resultSalida["message_error"];
                    $description_error_salida = $resultSalida["description_error"];
                    if (empty($message_error_salida)) {
                        $informacionSalida = $resultSalida["result"];
                    } else {
                        $message_error = "Surgió un inconveniente";
                        $description_error = $description_error_salida;
                    }
                }
            }

            /* SEGUNDO VERIFICAMOS LA ENTRADA AL ALMACEN DE DESTINO */
            // si el almacen de destino es el almacen de desmedro
            if ($idAlmDes == 7) {
                $entDes = 1;
                // crear trazabilidad entrada
                $sql_create_entrada_transferencia_almacen =
                    "INSERT INTO entrada_transferencia_almacen
                (idTranAlmDet, canEntTranAlmDet, entDes)
                VALUES(?, $cantidadTransferencia, ?)";
                $stmt_create_entrada_transferencia_almacen = $pdo->prepare($sql_create_entrada_transferencia_almacen);
                $stmt_create_entrada_transferencia_almacen->bindParam(1, $idLastInsertionDetalle, PDO::PARAM_INT);
                $stmt_create_entrada_transferencia_almacen->bindParam(2, $entDes, PDO::PARAM_BOOL);
                $stmt_create_entrada_transferencia_almacen->execute();

                // actualizar almacen stock
                $sql_update_entrada_transferencia_almacen =
                    "UPDATE almacen_stock 
                SET canSto = canSto + $cantidadTransferencia, canStoDis = canStoDis + $cantidadTransferencia
                WHERE idAlm = ? AND idProd = ?";
                $stmt_update_entrada_transferencia_almacen = $pdo->prepare($sql_update_entrada_transferencia_almacen);
                $stmt_update_entrada_transferencia_almacen->bindParam(1, $idAlmDes, PDO::PARAM_INT);
                $stmt_update_entrada_transferencia_almacen->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_update_entrada_transferencia_almacen->execute();
            } else {
                // si la informacion de salida esta vacia
                if (empty($informacionSalida)) {
                    break;
                } else {
                    // hacemos las entradas segun la informacion de salida detallada
                    if ($esProFin == 1) {
                        $resultEntrada = entradaProductoFinalTransferenciaAlmacen();
                    } else {
                        $resultEntrada = entradaMateriaPrimaMaterialesTransferenciaAlmacen();
                    }
                }
            }
        }
        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "Error en las operaciones";
        $description_error = $e->getMessage();
    }


    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
