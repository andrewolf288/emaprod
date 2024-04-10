<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdt = $data["idProdt"]; // producto
    $idReqMat = $data["idReqMat"]; // producto
    $idMotDev = $data["idMotDev"]; // motivo de devolucion
    $canReqDevMatDet = floatval($data["canReqDevMatDet"]); // cantidad devuelta
    $nomProd = $data["nomProd"]; // producto
    $idReqDevMat = $data["idReqDevMat"]; // id de requisicion de devolucion
    $idReqDevMatDet = $data["id"]; // id de requisicion devolucion detalle
    // tolerancia de error de punto flotante
    $tolerancia = 0.000001;

    if ($pdo) {
        // si el motivo de devolucion no es desmedro
        if ($idMotDev != 2) {
            $salidasEmpleadas = []; // salidas empleadas

            $sql_select_requisicion_materiales = 
            "SELECT id FROM requisicion_materiales_detalle
            WHERE idProdt = ? AND idReqMat = ?";
            $stmt_select_requisicion_materiales = $pdo->prepare($sql_select_requisicion_materiales);
            $stmt_select_requisicion_materiales->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_select_requisicion_materiales->bindParam(2, $idReqMat, PDO::PARAM_INT);
            $stmt_select_requisicion_materiales->execute();
            $row_requisicion_materiales = $stmt_select_requisicion_materiales->fetch(PDO::FETCH_ASSOC);
            $idReqMatDet = $row_requisicion_materiales["id"];

            // seleccionar salidas correspondientes
            $sql_salidas_requisicion_materiales = 
            "SELECT * FROM salida_requisicion_materiales
            WHERE idReqMatDet = ?";
            $stmt_salidas_requisicion_materiales = $pdo->prepare($sql_salidas_requisicion_materiales);
            $stmt_salidas_requisicion_materiales->bindParam(1, $idReqMatDet, PDO::PARAM_INT);
            $stmt_salidas_requisicion_materiales->execute();
            $salidasEmpleadas = $stmt_salidas_requisicion_materiales->fetchAll(PDO::FETCH_ASSOC);

            // si se obtuvo sus salidas empleadas
            if (!empty($salidasEmpleadas)) {

                $cantidadAdevolver = $canReqDevMatDet; // acumulado
                $cantSalPorIteracion = 0; // cantidad auxiliar
                $idEntStoEst = 1; // estado de disponible de entrada
                try {
                    $pdo->beginTransaction();
                    // recorremos las salidas
                    foreach ($salidasEmpleadas as $value) {
                        $idEntSto = $value["idEntSto"]; // entrada
                        $canSalStoReq = $value["canSalReqMatDet"]; // cantidad
                        $idAlmacenEntrada = 1; // almacen principal

                        // si la cantidad a devolver es mayor a salida de la entrada
                        if ($cantidadAdevolver - $canSalStoReq >= -$tolerancia) {
                            $cantidadAdevolver -= $canSalStoReq;
                            $cantSalPorIteracion = $canSalStoReq;
                        } else {
                            $cantSalPorIteracion = $cantidadAdevolver;
                            $cantidadAdevolver = 0;
                        }

                        // actualizamos la entrada
                        $sql_update_entrada_stock =
                            "UPDATE entrada_stock
                            SET canTotDis = canTotDis + $cantSalPorIteracion, idEntStoEst = ?
                            WHERE id = ?";

                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->execute();

                        // tenemos que registrar la trazabilidad de la devolucion
                        $sql_insert_trazabilidad_requisicion_devolucion_materiales =
                            "INSERT INTO trazabilidad_requisicion_devolucion_materiales
                                (idReqDevMatDet, idEntSto, canReqDevMatDet)
                                VALUES(?, ?, $cantSalPorIteracion)";
                        $stmt_insert_trazabilidad_requisicion_devolucion_materiales = $pdo->prepare($sql_insert_trazabilidad_requisicion_devolucion_materiales);
                        $stmt_insert_trazabilidad_requisicion_devolucion_materiales->bindParam(1, $idReqDevMatDet, PDO::PARAM_INT);
                        $stmt_insert_trazabilidad_requisicion_devolucion_materiales->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_insert_trazabilidad_requisicion_devolucion_materiales->execute();

                        // debemos actualizar el stock almacen
                        $sql_consult_almacen_stock =
                            "SELECT * FROM almacen_stock
                            WHERE idProd = ? AND idAlm = ?";
                        $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
                        $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->bindParam(2, $idAlmacenEntrada, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->execute();

                        if ($stmt_consult_almacen_stock->rowCount() === 1) {
                            // ACTUALIZAMOS
                            $sql_update_almacen_stock =
                                "UPDATE almacen_stock 
                                    SET canSto = canSto + $cantSalPorIteracion, canStoDis = canStoDis + $cantSalPorIteracion
                                    WHERE idProd = ? AND idAlm = ?";
                            $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                            $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->bindParam(2, $idAlmacenEntrada, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->execute();
                        } else {
                            // CREAMOS
                            $sql_insert_almacen_stock =
                                "INSERT INTO almacen_stock
                                    (idProd, idAlm, canSto, canStoDis)
                                    VALUES(?, ?, $cantSalPorIteracion, $cantSalPorIteracion)";
                            $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                            $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                            $stmt_insert_almacen_stock->bindParam(2, $idAlmacenEntrada, PDO::PARAM_INT);
                            $stmt_insert_almacen_stock->execute();
                        }

                        // si la cantidad a devolver es igual a 0
                        if (abs($cantidadAdevolver) < $tolerancia) {
                            break;
                        }
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                    $description_error = $e->getMessage();
                }
            } else {
                $message_error = "No se genero las salidas del producto";
                $description_error = $description_error . "No se generaron las salidas del producto de su requisicion: $nomProd" . "\n";
            }
        }
        // debemos hacer el tratamiento para la devolucion al almacen de desmedro
        else {
            $sql_select_requisicion_materiales = 
            "SELECT id FROM requisicion_materiales_detalle
            WHERE idProdt = ? AND idReqMat = ?";
            $stmt_select_requisicion_materiales = $pdo->prepare($sql_select_requisicion_materiales);
            $stmt_select_requisicion_materiales->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_select_requisicion_materiales->bindParam(2, $idReqMat, PDO::PARAM_INT);
            $stmt_select_requisicion_materiales->execute();
            $row_requisicion_materiales = $stmt_select_requisicion_materiales->fetch(PDO::FETCH_ASSOC);

            if($row_requisicion_materiales){

                $idAlmacenDesmedros = 7; // almacen de desmedros
                // primero consultamos si existe ese almacen stock
                $sql_consult_almacen_stock =
                    "SELECT * FROM almacen_stock
                    WHERE idProd = ? AND idAlm = ?";
                try {
                    // iniciamos una transaccion
                    $pdo->beginTransaction();
                    $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
                    $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                    $stmt_consult_almacen_stock->bindParam(2, $idAlmacenDesmedros, PDO::PARAM_INT);
                    $stmt_consult_almacen_stock->execute();
    
                    if ($stmt_consult_almacen_stock->rowCount() === 1) {
                        // ACTUALIZAMOS
                        $sql_update_almacen_stock =
                            "UPDATE almacen_stock 
                        SET canSto = canSto + $canReqDevMatDet, canStoDis = canStoDis + $canReqDevMatDet
                        WHERE idProd = ? AND idAlm = ?";
                        $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                        $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->bindParam(2, $idAlmacenDesmedros, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->execute();
                    } else {
                        // CREAMOS
                        $sql_insert_almacen_stock =
                            "INSERT INTO almacen_stock
                        (idProd, idAlm, canSto, canStoDis)
                        VALUES(?, ?, $canReqDevMatDet, $canReqDevMatDet)";
                        $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                        $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                        $stmt_insert_almacen_stock->bindParam(2, $idAlmacenDesmedros, PDO::PARAM_INT);
                        $stmt_insert_almacen_stock->execute();
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA CONSULTA DEL ALMACEN STOCK";
                    $description_error = $e->getMessage();
                }
            } else {
                $message_error = "No existe detalle de requisicion para este producto";
                $description_error = "No existe detalle de requisicion para este producto";
            }
        }

        // actualizamos los estados
        if (empty($message_error)) {
            try {
                // Iniciamos una transaccion
                $pdo->beginTransaction();
                // ACTUALIZAMOS EL ESTADO DE LA REQUISICION MOLIENDA DETALLE
                $esComReqDevMatDet = 1; // ESTADO DE COMPLETADO
                $total_requisiciones_detalle_no_completadas = 0;
                $sql_consulta_requisicion_detalle =
                    "SELECT * FROM requisicion_devolucion_materiales_detalle
                    WHERE idReqDevMat = ? AND esComReqDevMatDet <> ?";
                $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
                $stmt_consulta_requisicion_detalle->bindParam(1, $idReqDevMat, PDO::PARAM_INT);
                $stmt_consulta_requisicion_detalle->bindParam(2, $esComReqDevMatDet, PDO::PARAM_BOOL);
                $stmt_consulta_requisicion_detalle->execute();

                $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

                $idReqEst = 0; // inicializacion

                if ($total_requisiciones_detalle_no_completadas === 1) { // si no hay requisiciones detalle pendientes
                    $idReqEst = 3; // COMPLETADO
                } else {
                    $idReqEst = 2; // EN PROCESO
                }

                // PRIMERO ACTUALIZAMOS EL DETALLE
                $sql_update_requisicion_detalle =
                    "UPDATE requisicion_devolucion_materiales_detalle
                    SET esComReqDevMatDet = ?
                    WHERE id = ?";
                $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
                $stmt_update_requisicion_detalle->bindParam(1, $esComReqDevMatDet, PDO::PARAM_BOOL);
                $stmt_update_requisicion_detalle->bindParam(2, $idReqDevMatDet, PDO::PARAM_INT);
                $stmt_update_requisicion_detalle->execute();

                // LUEGO ACTUALIZAMOS EL MAESTRO
                if ($idReqEst == 3) {
                    // obtenemos la fecha actual
                    $fecComReqDevMat = date('Y-m-d H:i:s');
                    $sql_update_requisicion_completo =
                        "UPDATE requisicion_devolucion_materiales
                    SET idReqEst = ?, fecComReqDevMat = ?
                    WHERE id = ?";
                    $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                    $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                    $stmt_update_requisicion_completo->bindParam(2, $fecComReqDevMat);
                    $stmt_update_requisicion_completo->bindParam(3, $idReqDevMat, PDO::PARAM_INT);
                    $stmt_update_requisicion_completo->execute();
                } else {
                    $sql_update_requisicion =
                        "UPDATE requisicion_devolucion_materiales
                    SET idReqEst = ?
                    WHERE id = ?";
                    $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                    $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                    $stmt_update_requisicion->bindParam(2, $idReqDevMat, PDO::PARAM_INT);
                    $stmt_update_requisicion->execute();
                }

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
                $description_error = $e->getMessage();
            }
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
