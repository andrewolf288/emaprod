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

    // OBTENEMOS LA DATA
    $idReqAgr = $data["idReqAgr"]; // requisicion agregacion
    $idReqAgrDet = $data["id"]; // requisicion agregacion detalle
    $idProdt = $data["idProdt"]; // producto
    $idAlm = 1; // almacen principal
    $idAre = 6; // area
    $idAlmDes = 0; // almacen destino
    $canReqDet = floatval($data["canReqAgrDet"]); // cantidad de requisicion detalle
    $idEstSalSto = 1; // estado de completado
    // tolerancia de error de punto flotante
    $tolerancia = 0.000001;

    if ($pdo) {

        // PASO NUMERO 1: CONSULTA DE ENTRADAS DISPONIBLES
        $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
        $array_entradas_disponibles = [];

        $sql_consult_entradas_disponibles =
            "SELECT
                es.id,
                es.codEntSto,
                es.refNumIngEntSto,
                DATE(es.fecEntSto) AS fecEntSto,
                es.canTotDis 
            FROM entrada_stock AS es
            WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0 AND idAlm = ?
            ORDER BY es.fecEntSto ASC";

        try {

            $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
            $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(3, $idAlm, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->execute();

            // AÑADIMOS AL ARRAY
            while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                array_push($array_entradas_disponibles, $row);
            }

            if (!empty($array_entradas_disponibles)) {
                $entradasUtilizadas = [];
                // $cantidad_acumulada = 0;
                $cantidad_faltante = $canReqDet;
                // Se tienen las siguientes condiciones:
                /* 
                    1. Si la cantidad disponible de la entrada es mayor o igual a lo solicitado:
                    Se procede a realizar el descuento
                */
                foreach ($array_entradas_disponibles as $row_entrada_dispomible) {
                    if ($cantidad_faltante > 0) {

                        $idEntStoUti = $row_entrada_dispomible["id"]; // id entrada
                        $canDisEnt = $row_entrada_dispomible["canTotDis"]; // cantidad disponible

                        if ($canDisEnt - $cantidad_faltante >= -$tolerancia) {
                            // añadimos a entradas utilizadas
                            array_push(
                                $entradasUtilizadas,
                                array(
                                    "idEntSto" => $idEntStoUti,
                                    "canSalStoReq" => $cantidad_faltante // la cantidad de la requisicion detalle
                                )
                            );

                            $cantidad_faltante = 0;

                            break; // termina el flujo
                        } else {
                            $cantidad_faltante -= $canDisEnt;
                            array_push(
                                $entradasUtilizadas,
                                array(
                                    "idEntSto" => $idEntStoUti,
                                    "canSalStoReq" => $canDisEnt // la cantidad disponible de la entrada
                                )
                            );
                        }
                    } else {
                        break; // salimos del flujo
                    }
                }

                // comprobamos finalmente que la cantidad faltante sea exactamente 0
                if ($cantidad_faltante == 0) {
                    // CONSULTAMOS EL ALMACEN DESTINO
                    $sql_consult_almacen_destino =
                        "SELECT id FROM 
                    almacen WHERE idAre = ?";
                    $stmt_consult_almacen_destino = $pdo->prepare($sql_consult_almacen_destino);
                    $stmt_consult_almacen_destino->bindParam(1, $idAre, PDO::PARAM_INT);
                    $stmt_consult_almacen_destino->execute();
                    while ($row_consult_almacen_destino = $stmt_consult_almacen_destino->fetch(PDO::FETCH_ASSOC)) {
                        $idAlmDes = $row_consult_almacen_destino["id"];
                    }

                    $sql = "";
                    try {
                        // INICIAMOS UNA TRANSACCION
                        $pdo->beginTransaction();
                        // RECORREMOS TODAS LAS ENTRADAS UTILIZADAS PARA LA SALIDA
                        foreach ($entradasUtilizadas as $item) {
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

                            // CREAMOS LA SALIDA DE STOCK CORRESPONDIENTE
                            // calculamos la merma correspondiente a la salida
                            $merSalStoReq = 0; // merma de la salida de stock
                            if ($esSel) {
                                $merSalStoReq = ($canSalStoReq * $merDis) / $canTotDisEntSto;
                                $merSalStoReq = round($merSalStoReq);
                            }

                            // sentencia sql
                            $esSalTot = 1; // es salida total
                            $sql =
                                "INSERT
                            salida_stock
                            (idEntSto, idProdt, idAlm, idEstSalSto, canSalStoReq, merSalStoReq, idAgre, idAgreDet, esSalTot)
                            VALUES (?, ?, ?, ?, $canSalStoReq, $merSalStoReq, ?, ?, ?)";

                            $stmt = $pdo->prepare($sql);
                            $stmt->bindParam(1, $idEntSto, PDO::PARAM_INT);
                            $stmt->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt->bindParam(3, $idAlmDes, PDO::PARAM_INT);
                            $stmt->bindParam(4, $idEstSalSto, PDO::PARAM_INT);
                            $stmt->bindParam(5, $idReqAgr, PDO::PARAM_INT);
                            $stmt->bindParam(6, $idReqAgrDet, PDO::PARAM_INT);
                            $stmt->bindParam(7, $esSalTot, PDO::PARAM_BOOL);
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
                        $message_error = "ERROR INTERNO SERVER: fallo en insercion de salidas";
                        $description_error = $e->getMessage();
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
                    //         $stmt_consult_almacen_stock->bindParam(2, $idAlmDes, PDO::PARAM_INT);
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
                    //                 $stmt_update_almacen_stock->bindParam(3, $idAlmDes, PDO::PARAM_INT);

                    //                 $stmt_update_almacen_stock->execute(); // ejecutamos
                    //             } catch (PDOException $e) {
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
                    //                 $stmt_create_almacen_stock->bindParam(2, $idAlmDes, PDO::PARAM_INT);

                    //                 $stmt_create_almacen_stock->execute(); // ejecutamos
                    //             } catch (PDOException $e) {
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

                            $esComReqAgrDet = 1; // ESTADO DE COMPLETADO
                            $total_requisiciones_detalle_no_completadas = 0;
                            $sql_consulta_requisicion_detalle =
                                "SELECT * FROM requisicion_agregacion_detalle
                            WHERE idReqAgr = ? AND esComReqAgrDet <> ?";
                            $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
                            $stmt_consulta_requisicion_detalle->bindParam(1, $idReqAgr, PDO::PARAM_INT);
                            $stmt_consulta_requisicion_detalle->bindParam(2, $esComReqAgrDet, PDO::PARAM_BOOL);
                            $stmt_consulta_requisicion_detalle->execute();

                            $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

                            $idReqEst = 0; // inicializacion

                            if ($total_requisiciones_detalle_no_completadas === 1) { // si es la unica requisicion detalle por completar
                                $idReqEst = 3; // COMPLETADO
                            } else {
                                $idReqEst = 2; // EN PROCESO
                            }

                            // PRIMERO ACTUALIZAMOS EL DETALLE
                            $sql_update_requisicion_detalle =
                                "UPDATE requisicion_agregacion_detalle
                            SET esComReqAgrDet = ?
                            WHERE id = ?";
                            $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
                            $stmt_update_requisicion_detalle->bindParam(1, $esComReqAgrDet, PDO::PARAM_BOOL);
                            $stmt_update_requisicion_detalle->bindParam(2, $idReqAgrDet, PDO::PARAM_INT);
                            $stmt_update_requisicion_detalle->execute();

                            // LUEGO ACTUALIZAMOS EL MAESTRO
                            if ($idReqEst == 3) {
                                // obtenemos la fecha actual
                                $fecEntReqAgr = date('Y-m-d H:i:s');
                                $sql_update_requisicion_completo =
                                    "UPDATE requisicion_agregacion
                                SET idReqEst = ?, fecEntReqAgr = ?
                                WHERE id = ?";
                                $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                                $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                                $stmt_update_requisicion_completo->bindParam(2, $fecEntReqAgr);
                                $stmt_update_requisicion_completo->bindParam(3, $idReqAgr, PDO::PARAM_INT);
                                $stmt_update_requisicion_completo->execute();
                            } else {
                                $sql_update_requisicion =
                                    "UPDATE requisicion_agregacion
                                SET idReqEst = ?
                                WHERE id = ?";
                                $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                                $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                                $stmt_update_requisicion->bindParam(2, $idReqAgr, PDO::PARAM_INT);
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
                    $message_error = "No hay entradas suficientes";
                    $description_error = "No hay entradas suficientes del producto para cumplir con la salida";
                }
            } else {
                $message_error = "No hay entradas disponibles";
                $description_error = "No hay entradas disponibles para el producto del detalle";
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en la consulta de entradas disponibles";
            $description_error = $e->getMessage();
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
