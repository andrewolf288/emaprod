<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOrdIrra = $data["idOrdIrra"]; // id de operacion de facturacion
    $idOrdIrraDet = $data["id"]; // id de operacion de facturacion detalle
    $canOpeIrra = $data["canOpeIrra"]; // cantidad de salida
    $idProdt = $data["idProdt"];  // id de producto
    $refProdt = $data["refProdt"]; // referencia del producto
    $detSal = $data["detSal"]; // detalle de salida
    $idAlmacenPrincipal = 1; // almacen principal

    // recorremos el detalle de salida
    try {
        $pdo->beginTransaction();

        foreach ($detSal as $detalle) {
            $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
            $canSalLotProd = intVal($detalle["canSalLotProd"]); // cantidad de salida de lote de produccion
            $refProdc = $detalle["refProdc"]; // referencia a la produccion
            $array_entradas_disponibles = []; // arreglo de entradas disponibles

            // realizamos una consulta para traer las entradas correspondientes
            $sql_consult_entradas_disponibles =
                "SELECT
                es.id,
                es.refProdc,
                DATE(es.fecEntSto) AS fecEntSto,
                es.canTotDis
                FROM entrada_stock AS es
                WHERE idProd = ? AND idEntStoEst = ? AND refProdc = ? AND canTotDis > 0 AND idAlm = ?
                ORDER BY es.fecEntSto ASC";

            $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
            $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(3, $refProdc, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(4, $idAlmacenPrincipal, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->execute();

            // AÑADIMOS AL ARRAY
            $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($array_entradas_disponibles)) {
                $entradasUtilizadas = []; // entradas utilizadas
                $cantidad_faltante = $canSalLotProd; // cantidad total faltante

                foreach ($array_entradas_disponibles as $row_entrada_disponible) {
                    if ($cantidad_faltante > 0) {

                        $idEntStoUti = $row_entrada_disponible["id"]; // id entrada
                        $canDisEnt = intval($row_entrada_disponible["canTotDis"]); // cantidad disponible
                        $refProdc = $row_entrada_disponible["refProdc"]; // referencia a produccion

                        if ($canDisEnt >= $cantidad_faltante) {
                            // añadimos a entradas utilizadas
                            array_push(
                                $entradasUtilizadas,
                                array(
                                    "idEntSto" => $idEntStoUti,
                                    "canSalStoReq" => $cantidad_faltante, // la cantidad de la requisicion detalle
                                    "refProdc" => $refProdc,

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
                                    "canSalStoReq" => $canDisEnt, // la cantidad disponible de la entrada
                                    "refProdc" => $refProdc,
                                )
                            );
                        }
                    } else {
                        break; // salimos del flujo
                    }
                }

                // comprobamos finalmente que la cantidad faltante sea exactamente 0
                if ($cantidad_faltante == 0) {
                    foreach ($entradasUtilizadas as $item) {
                        // OBTENEMOS LOS DATOS
                        $idEntSto = $item["idEntSto"]; // id de la entrada
                        $canSalStoReq = $item["canSalStoReq"]; // cantidad de salida de stock
                        //$canTotDis = $item["canTotDis"];

                        // CONSULTAMOS LA ENTRADA 
                        $canTotDisEntSto = 0; // cantidad disponible
                        $idEntStoEst = 0; // estado de la entrada
                        $idAlmacen = 0; // id del almacen para realizar la actualizacion
                        $refProdc = 0; // referencia a produccion
                        $codLot = ""; // codigo de lote de produccion

                        $sql_consult_entrada_stock =
                            "SELECT 
                            canTotDis,
                            idAlm,
                            refProdc,
                            codLot
                            FROM entrada_stock
                            WHERE id = ?";
                        $stmt_consulta_entrada_stock = $pdo->prepare($sql_consult_entrada_stock);
                        $stmt_consulta_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
                        $stmt_consulta_entrada_stock->execute();

                        while ($row = $stmt_consulta_entrada_stock->fetch(PDO::FETCH_ASSOC)) {
                            $canTotDisEntSto = $row["canTotDis"];
                            $idAlmacen = $row["idAlm"];
                            $refProdc = $row["refProdc"];
                            $codLot = $row["codLot"];
                        }

                        $esSal = 1;
                        // sentencia sql
                        $sql =
                            "INSERT
                        movimiento_orden_irradiacion
                        (idOrdIrra, idOrdIrraDet, idProdt, idEntSto, idProdc, codLotProd, canMovOpeIrra, esSal)
                        VALUES (?, ?, ?, ?, ?, ?, $canSalStoReq, ?)";

                        $stmt = $pdo->prepare($sql);
                        $stmt->bindParam(1, $idOrdIrra, PDO::PARAM_INT); // id de la operacion facturacion
                        $stmt->bindParam(2, $idOrdIrraDet, PDO::PARAM_STR);
                        $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                        $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                        $stmt->bindParam(5, $refProdc, PDO::PARAM_INT);
                        $stmt->bindParam(6, $codLot, PDO::PARAM_STR);
                        $stmt->bindParam(7, $esSal, PDO::PARAM_BOOL);

                        // EJECUTAMOS LA CREACION DE UNA SALIDA
                        $stmt->execute();

                        // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                        $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                        //OBTENEMOS LA FECHA ACTUAL PARA ACTUALIZACIONES
                        $fecDateNow = date('Y-m-d H:i:s');
                        if ($canResAftOpe == 0) { // SI LA CANTIDAD RESTANTE ES 0
                            $idEntStoEst = 2; // ESTADO DE ENTRADA AGOTADA O TERMINADA

                            // sql actualizar entrada stock con fecha de finalización
                            $sql_update_entrada_stock =
                                "UPDATE
                            entrada_stock
                            SET canTotDis = $canResAftOpe, idEntStoEst = ?, fecFinSto = ?, fecActEntSto = ?
                            WHERE id = ?";
                            $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                            $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->bindParam(2, $fecDateNow, PDO::PARAM_STR);
                            $stmt_update_entrada_stock->bindParam(3, $fecDateNow, PDO::PARAM_STR);
                            $stmt_update_entrada_stock->bindParam(4, $idEntSto, PDO::PARAM_INT);

                            $stmt_update_entrada_stock->execute();
                        } else {
                            $idEntStoEst = 1; // ESTADO DE ENTRADA DISPONIBLE

                            // ACTUALIZAMOS LA ENTRADA STOCK
                            $sql_update_entrada_stock =
                                "UPDATE
                            entrada_stock
                            SET canTotDis = $canResAftOpe, idEntStoEst = ?, fecActEntSto = ?
                            WHERE id = ?";
                            $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                            $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->bindParam(2, $fecDateNow, PDO::PARAM_STR);
                            $stmt_update_entrada_stock->bindParam(3, $idEntSto, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->execute();
                        }

                        // ACTUALIZAMOS EL ALMACEN CORRESPONDIENTE A LA ENTRADA
                        $sql_update_almacen_stock =
                            "UPDATE almacen_stock
                        SET canSto = canSto - $canSalStoReq, canStoDis = canStoDis - $canSalStoReq, fecActAlmSto = ?
                        WHERE idAlm = ? AND idProd = ?";

                        $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                        $stmt_update_almacen_stock->bindParam(1, $fecDateNow, PDO::PARAM_STR);
                        $stmt_update_almacen_stock->bindParam(2, $idAlmacen, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->bindParam(3, $idProdt, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->execute();
                    }
                } else {
                    throw new Exception("No hay entradas disponibles para el producto del detalle");
                }
            } else {
                throw new Exception("No hay entradas disponibles para el producto del detalle");
            }
        }
        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "Hubo un error al realizar la operacion";
        $description_error = $e->getMessage();
    } catch (Exception $e) {
        $pdo->rollBack();
        $message_error = "Hubo un error al realizar la operacion";
        $description_error = $e->getMessage();
    }

    // ACTUALIZAMOS LOS ESTADOS DE LA REQUISICION MOLIENDA MAESTRO Y DETALLE
    if (empty($message_error)) {
        try {
            // Iniciamos una transaccion
            $pdo->beginTransaction();
            // ACTUALIZAMOS EL ESTADO DE LA REQUISICION MOLIENDA DETALLE

            $esComSalStoDet = 1; // ESTADO DE COMPLETADO
            $total_requisiciones_detalle_no_completadas = 0;
            $sql_consulta_requisicion_detalle =
                "SELECT * FROM orden_irradiacion_detalle
            WHERE idOrdIrra = ? AND fueComSal <> ?";
            $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
            $stmt_consulta_requisicion_detalle->bindParam(1, $idOrdIrra, PDO::PARAM_INT);
            $stmt_consulta_requisicion_detalle->bindParam(2, $esComSalStoDet, PDO::PARAM_BOOL);
            $stmt_consulta_requisicion_detalle->execute();

            $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

            $idOrdIrraEst  = 0; // inicializacion

            // obtenemos la fecha actual
            $fecSalOrdIrraDet = date('Y-m-d H:i:s');
            $sql_update_requisicion_detalle =
                "UPDATE orden_irradiacion_detalle
                SET fueComSal = ?, fecSalOrdIrraDet = ?
                WHERE id = ?";
            $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
            $stmt_update_requisicion_detalle->bindParam(1, $esComSalStoDet, PDO::PARAM_BOOL);
            $stmt_update_requisicion_detalle->bindParam(2, $fecSalOrdIrraDet, PDO::PARAM_STR);
            $stmt_update_requisicion_detalle->bindParam(3, $idOrdIrraDet, PDO::PARAM_INT);
            $stmt_update_requisicion_detalle->execute();

            if ($total_requisiciones_detalle_no_completadas === 1) { // si es la unica requisicion detalle por completar
                $idOrdIrraEst  = 3; // REQUERIDO PARA RETORNO
            } else {
                $idOrdIrraEst  = 2; // EN PROCESO DE SALIDA
            }

            // actualizamos el maestro
            $sql_update_requisicion_completo =
                "UPDATE orden_irradiacion
            SET idOrdIrraEst  = ?
            WHERE id = ?";
            $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
            $stmt_update_requisicion_completo->bindParam(1, $idOrdIrraEst, PDO::PARAM_INT);
            $stmt_update_requisicion_completo->bindParam(2, $idOrdIrra, PDO::PARAM_INT);
            $stmt_update_requisicion_completo->execute();

            // TERMINAMOS LA TRANSACCION
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
            $description_error = $e->getMessage();
        } catch (PDOException $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
            $description_error = $e->getMessage();
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
