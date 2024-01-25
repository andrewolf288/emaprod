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

    // OBTENEMOS LOS DATOS
    $idReq = $data["idReq"]; // requisicion
    $idReqDet = $data["idReqDet"]; // requisicion detalle
    $idProdt = $data["idProdt"]; // producto (materia prima, material, insumo, etc)
    $idAlm = $data["idAlm"]; // almacen de la transferencia (A. Principal --> A. Indicado)
    $docSalSto = $data["docSalSto"]; // documento de salida, parte de salida u otro
    $canReqDet = $data["canReqDet"]; // cantidad de requisicion detalle
    $salStoDet = $data["salStoDet"];
    $idEstSalSto = 1; // estado de completado
    // tolerancia de error de punto flotante
    $tolerancia = 0.000001;

    if ($pdo) {
        $sql = "";
        // RECORREMOS TODAS LAS ENTRADAS SELECCIONADAS PARA LA SALIDA
        foreach ($salStoDet as $item) {
            try {
                // INICIAMOS UNA TRANSACCION
                $pdo->beginTransaction();

                // OBTENEMOS LOS DATOS
                $idEntSto = $item["idEntSto"]; // id de la entrada
                $canSalStoReq = $item["canSalStoReq"]; // cantidad de salida de stock
                //$canTotDis = $item["canTotDis"];

                // CONSULTAMOS LA ENTRADA 
                $canTotDisEntSto = 0; // cantidad disponible
                $idEntStoEst = 0; // estado de la entrada
                $idAlmacen = 0; // id del almacen para realizar la actualizacion
                $merDis = 0; // merma disponible de la entrada
                $esSel = 0; // si la entrada es seleccion

                $sql_consult_entrada_stock =
                    "SELECT 
                    canTotDis,
                    idAlm,
                    merDis,
                    esSel
                    FROM entrada_stock
                    WHERE id = ?";
                $stmt_consulta_entrada_stock = $pdo->prepare($sql_consult_entrada_stock);
                $stmt_consulta_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
                $stmt_consulta_entrada_stock->execute();

                while ($row = $stmt_consulta_entrada_stock->fetch(PDO::FETCH_ASSOC)) {
                    $canTotDisEntSto = $row["canTotDis"];
                    $idAlmacen = $row["idAlm"];
                    $merDis =  $row["merDis"];
                    $esSel = $row["esSel"];
                }

                // CREAMOS LA SALIDA DE STOCK MOLIENDA CORRESPONDIENTE
                // calculamos la merma correspondiente a la salida
                $merSalStoReq = 0; // merma de la salida de stock
                if ($esSel) {
                    $merSalStoReq = ($canSalStoReq * $merDis) / $canTotDisEntSto;
                    $merSalStoReq = round($merSalStoReq);
                }
                // sentencia sql
                $sql =
                    "INSERT
                salida_stock
                (idEntSto, idReq, idProdt, idAlm, idEstSalSto, docSalSto, canSalStoReq, merSalStoReq)
                VALUES (?, ?, ?, ?, ?, ?, $canSalStoReq, $merSalStoReq)";

                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $idEntSto, PDO::PARAM_INT);
                $stmt->bindParam(2, $idReq, PDO::PARAM_INT);
                $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                $stmt->bindParam(4, $idAlm, PDO::PARAM_INT);
                $stmt->bindParam(5, $idEstSalSto, PDO::PARAM_INT);
                $stmt->bindParam(6, $docSalSto, PDO::PARAM_STR);

                // EJECUTAMOS LA CREACION DE UNA SALIDA
                $stmt->execute();

                // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                if (abs($canResAftOpe) < $tolerancia) {
                    $canResAftOpe = 0;
                    $idEntStoEst = 2; // ESTADO DE ENTRADA AGOTADA O TERMINADA
                    $fecFinSto = date('Y-m-d H:i:s'); // FECHA DE TERMINO DE STOCK DE LA ENTRADA

                    // sql actualizar entrada stock con fecha de finalización
                    $sql_update_entrada_stock =
                        "UPDATE
                        entrada_stock
                        SET canTotDis = $canResAftOpe, merDis = merDis - $merSalStoReq, idEntStoEst = ?, fecFinSto = ?
                        WHERE id = ?
                        ";
                    $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                    $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                    $stmt_update_entrada_stock->bindParam(2, $fecFinSto);
                    $stmt_update_entrada_stock->bindParam(3, $idEntSto, PDO::PARAM_INT);
                    $stmt_update_entrada_stock->execute();
                } else {
                    $idEntStoEst = 1; // ESTADO DE ENTRADA DISPONIBLE

                    // ACTUALIZAMOS LA ENTRADA STOCK
                    $sql_update_entrada_stock =
                        "UPDATE
                        entrada_stock
                        SET canTotDis = $canResAftOpe, merDis = merDis - $merSalStoReq, idEntStoEst = ?
                        WHERE id = ?
                        ";
                    $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                    $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                    $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                    $stmt_update_entrada_stock->execute();
                }

                // ACTUALIZAMOS EL ALMACEN CORRESPONDIENTE A LA ENTRADA
                if ($esSel) {
                    // SI ES SELECCION SOLO DISMINUIMOS EL STOCK DISPONIBLE 
                    $sql_update_almacen_stock =
                        "UPDATE almacen_stock
                    SET canStoDis = canStoDis - $canSalStoReq
                    WHERE idAlm = ? AND idProd = ?";

                    $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                    $stmt_update_almacen_stock->bindParam(1, $idAlmacen, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->execute();
                } else {
                    // SI NO ES SELECCIÓN DISMINUIMOS AMBOS CAMPOS DE STOCK
                    $sql_update_almacen_stock =
                        "UPDATE almacen_stock
                        SET canSto = canSto - $canSalStoReq, canStoDis = canStoDis - $canSalStoReq
                        WHERE idAlm = ? AND idProd = ?";

                    $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                    $stmt_update_almacen_stock->bindParam(1, $idAlmacen, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->execute();
                }

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en inserción de salidas";
                $description_error = $e->getMessage();
            }
        }

        // REALIZAMOS LA TRANSFERENCIA AL ALMACEN INDICADO EN LA SALIDA
        // if (empty($message_error)) {
        //     $sql_consult_almacen_stock =
        //         "SELECT * FROM almacen_stock 
        //             WHERE idProd = ? AND idAlm = ?";
        //     try {
        //         // Iniciamos una transaccion
        //         $pdo->beginTransaction();
        //         // consultamos si existe un registro de almacen stock con el prod y alm
        //         $stmt_consult_almacen_stock =  $pdo->prepare($sql_consult_almacen_stock);
        //         $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
        //         $stmt_consult_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
        //         $stmt_consult_almacen_stock->execute();

        //         if ($stmt_consult_almacen_stock->rowCount() === 1) {
        //             // UPDATE ALMACEN STOCK
        //             $sql_update_almacen_stock =
        //                 "UPDATE almacen_stock 
        //             SET canSto = canSto + $canReqDet, canStoDis = canStoDis + $canReqDet, fecActAlmSto = ?
        //             WHERE idProd = ? AND idAlm = ?";
        //             try {
        //                 $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
        //                 $stmt_update_almacen_stock->bindParam(1, $fecEntSto, PDO::PARAM_INT);
        //                 $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
        //                 $stmt_update_almacen_stock->bindParam(3, $idAlm, PDO::PARAM_INT);

        //                 $stmt_update_almacen_stock->execute(); // ejecutamos
        //             } catch (PDOException $e) {
        //                 $pdo->rollback();
        //                 $message_error = "ERROR INTERNO SERVER AL ACTUALIZAR ALMACEN STOCK";
        //                 $description_error = $e->getMessage();
        //             }
        //         } else {
        //             // CREATE NUEVO REGISTRO ALMACEN STOCK
        //             $sql_create_almacen_stock =
        //                 "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
        //         VALUE (?, ?, $canReqDet, $canReqDet)";
        //             try {
        //                 $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
        //                 $stmt_create_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
        //                 $stmt_create_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);

        //                 $stmt_create_almacen_stock->execute(); // ejecutamos
        //             } catch (PDOException $e) {
        //                 $pdo->rollback();
        //                 $message_error = "ERROR INTERNO SERVER AL CREAR ALMACEN STOCK";
        //                 $description_error = $e->getMessage();
        //             }
        //         }
        //         // TERMINAMOS LA TRANSACCION
        //         $pdo->commit();
        //     } catch (PDOException $e) {
        //         $pdo->rollback();
        //         $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
        //         $description_error = $e->getMessage();
        //     }
        // }

        // ACTUALIZAMOS LOS ESTADOS DE LA REQUISICION MOLIENDA MAESTRO Y DETALLE
        if (empty($message_error)) {
            try {
                // Iniciamos una transaccion
                $pdo->beginTransaction();
                // ACTUALIZAMOS EL ESTADO DE LA REQUISICION MOLIENDA DETALLE

                $idReqDetEst = 2; // ESTADO DE COMPLETADO
                $total_requisiciones_detalle_no_completadas = 0;
                $sql_consulta_requisicion_detalle =
                    "SELECT * FROM requisicion_detalle
                WHERE idReq = ? AND idReqDetEst <> ?";
                $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
                $stmt_consulta_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
                $stmt_consulta_requisicion_detalle->bindParam(2, $idReqDetEst, PDO::PARAM_INT);
                $stmt_consulta_requisicion_detalle->execute();

                $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

                $idReqEst = 0; // inicializacion

                if ($total_requisiciones_detalle_no_completadas == 1) { // si es la unica requisicion detalle por completar
                    $idReqEst = 3; // COMPLETADO
                } else {
                    $idReqEst = 2; // EN PROCESO
                }

                // PRIMERO ACTUALIZAMOS EL DETALLE
                $idReqDetEstCom = 2; // ESTADO DE COMPLETADO
                $sql_update_requisicion_detalle =
                    "UPDATE requisicion_detalle
                SET idReqDetEst = ?
                WHERE id = ?";
                $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
                $stmt_update_requisicion_detalle->bindParam(1, $idReqDetEstCom, PDO::PARAM_INT);
                $stmt_update_requisicion_detalle->bindParam(2, $idReqDet, PDO::PARAM_INT);
                $stmt_update_requisicion_detalle->execute();

                // LUEGO ACTUALIZAMOS EL MAESTRO
                $sql_update_requisicion =
                    "UPDATE requisicion
                SET idReqEst = ?
                WHERE id = ?";
                $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion->bindParam(2, $idReq, PDO::PARAM_INT);
                $stmt_update_requisicion->execute();

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
