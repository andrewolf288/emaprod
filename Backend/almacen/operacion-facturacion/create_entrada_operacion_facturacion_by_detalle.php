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

    $idOpeFacDet = $data["id"]; // id de operacion de facturacion detalle
    $esMerProm = $data["esMerProm"]; // es mercancia promocional
    $canOpeFacDet = $data["canOpeFacDet"]; // cantidad de salida
    $idOpeFac = $data["idOpeFac"]; // id de operacion de facturacion
    $idProdt = $data["idProdt"];  // id de producto
    $refProdt = $data["refProdt"]; // referencia del producto
    $idGuiRem = $data["idGuiRem"]; // referencia a su salida
    $detSal = $data["detSal"]; // detalle de salida

    // si es mercancia promocional
    if ($esMerProm == 1) {
        // PASO 1: consulto las entradas utilizadas para la salida de la mercancia promocional
        // PASO 2: segun la cantidad a devolver y en base a lo que salio de cada entrada, 
        //         devolvemos las cantidades empezando por el ultimo en salir
        // PASO 3: comprobamos que los saldos se retornaron correctamente
        $salidasEmpleadas =  array();

        $sql_select_movimiento_operacion_facturacion =
            "SELECT * FROM movimiento_operacion_facturacion
        WHERE idOpeFacDet = ? ORDER BY idEntSto DESC";

        $stmt_select_movimiento_operacion_facturacion = $pdo->prepare($sql_select_movimiento_operacion_facturacion);
        $stmt_select_movimiento_operacion_facturacion->bindParam(1, $idOpeFacDet, PDO::PARAM_INT);
        $stmt_select_movimiento_operacion_facturacion->execute();

        $salidasEmpleadas = $stmt_select_movimiento_operacion_facturacion->fetchAll(PDO::FETCH_ASSOC);

        $cantidadAdevolver = $canOpeFacDet; // acumulado
        $cantSalPorIteracion = 0; // cantidad auxiliar
        $idEntStoEst = 1; // estado de disponible de entrada

        try {
            $pdo->beginTransaction();
            // ahora recorremos las salidas
            foreach ($salidasEmpleadas as $value) {
                $idEntSto = $value["idEntSto"]; // entrada
                $canSalStoReq = $value["canMovOpeFac"]; // cantidad

                if ($cantidadAdevolver >= $canSalStoReq) {
                    $cantidadAdevolver -= $canSalStoReq;
                    $cantSalPorIteracion = $canSalStoReq;
                } else {
                    $cantSalPorIteracion = $cantidadAdevolver;
                    $cantidadAdevolver = 0;
                }

                $sql_update_entrada_stock =
                    "UPDATE entrada_stock
                    SET canTotDis = canTotDis + $cantSalPorIteracion, idEntStoEst = ?
                    WHERE id = ?";

                $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                $stmt_update_entrada_stock->execute();

                $esEnt = 1;
                $sql =
                    "INSERT
                    movimiento_operacion_facturacion
                    (idOpeFac, idOpeFacDet, idProdt, idEntSto, canMovOpeFac, esEnt)
                    VALUES (?, ?, ?, ?, $canSalStoReq, ?)";

                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $idOpeFac, PDO::PARAM_INT); // id de la operacion facturacion
                $stmt->bindParam(2, $idOpeFacDet, PDO::PARAM_STR);
                $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                $stmt->bindParam(5, $esEnt, PDO::PARAM_BOOL);

                // EJECUTAMOS LA CREACION DE UNA SALIDA
                $stmt->execute();

                if ($cantidadAdevolver == 0) {
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
        // primero debemos buscar su referencia a la operacion factueacion
        $esSal = 1;
        $sql_select_operacion_facturacion =
            "SELECT id FROM operacion_facturacion
        WHERE idGuiRem = ? AND esSal = ? LIMIT 1";
        $stmt_select_operacion_facturacion = $pdo->prepare($sql_select_operacion_facturacion);
        $stmt_select_operacion_facturacion->bindParam(1, $idGuiRem, PDO::PARAM_INT);
        $stmt_select_operacion_facturacion->bindParam(2, $esSal, PDO::PARAM_BOOL);
        $stmt_select_operacion_facturacion->execute();

        $row_select_operacion_facturacion = $stmt_select_operacion_facturacion->fetchAll(PDO::FETCH_ASSOC);

        // luego consultamos los lotes utilizados para la salida
        $sql_select_movimientos_detalle =
            "SELECT *
        FROM movimiento_operacion_facturacion
        WHERE idOpeFact = ? AND idProdt = ? ORDER BY idEntSto DESC";
        $sql_select_movimientos_detalle = $pdo->prepare($sql_select_movimientos_detalle);
        $sql_select_movimientos_detalle->bindParam(1, $row_select_operacion_facturacion["id"], PDO::PARAM_INT);
        $sql_select_movimientos_detalle->execute();

        $movimientos_detalle = array();
        $movimientos_detalle = $sql_select_movimientos_detalle->fetchAll(PDO::FETCH_ASSOC);

        // recorremos el detalle de devolucion
        foreach ($detSal as $detalle) {
            $encontrado = false;
            $canSalStoProd = $detalle["canSalStoProd"];
            $refProdc = $detalle["refProdc"];

            // tenemos que identificar si el detalle de devolucion es un lote que no salio del movimiento de salida
            foreach ($movimientos_detalle as $movimiento) {
                if ($movimiento["idProdc"] === $refProdc) {
                    $encontrado = true;
                    break;
                }
            }

            // si el lote fue usado en la salida
            if ($encontrado) {
                $cantidadAdevolver = $canSalStoProd; // acumulado
                $cantSalPorIteracion = 0; // cantidad auxiliar
                $idEntStoEst = 1; // estado de disponible de entrada

                //aplicamos el algoritmos de reparticion
                try {
                    $pdo->beginTransaction();
                    foreach ($movimientos_detalle as $value) {
                        $idEntSto = $value["idEntSto"]; // entrada
                        $canSalStoReq = $value["canMovOpeFac"]; // cantidad

                        if ($cantidadAdevolver >= $canSalStoReq) {
                            $cantidadAdevolver -= $canSalStoReq;
                            $cantSalPorIteracion = $canSalStoReq;
                        } else {
                            $cantSalPorIteracion = $cantidadAdevolver;
                            $cantidadAdevolver = 0;
                        }

                        $sql_update_entrada_stock =
                            "UPDATE entrada_stock
                            SET canTotDis = canTotDis + $cantSalPorIteracion, idEntStoEst = ?
                            WHERE id = ?";

                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->execute();

                        $esEnt = 1;
                        $sql =
                            "INSERT
                            movimiento_operacion_facturacion
                            (idOpeFac, idOpeFacDet, idProdt, idEntSto, canMovOpeFac, esEnt)
                            VALUES (?, ?, ?, ?, $canSalStoReq, ?)";

                        $stmt = $pdo->prepare($sql);
                        $stmt->bindParam(1, $idOpeFac, PDO::PARAM_INT); // id de la operacion facturacion
                        $stmt->bindParam(2, $idOpeFacDet, PDO::PARAM_STR);
                        $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                        $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                        $stmt->bindParam(5, $esEnt, PDO::PARAM_BOOL);

                        // EJECUTAMOS LA CREACION DE UNA SALIDA
                        $stmt->execute();

                        if ($cantidadAdevolver == 0) {
                            break;
                        }
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                    $description_error = $e->getMessage();
                }
            }
            // caso contrario
            else {
                // seleccionamos las entradas del lote en especifico segun un producto
                $sql_consult_entradas_lote_produccion =
                    "SELECT * FROM entrada_stock
                WHERE refProdc = ? AND idProdt = ? ORDER BY id DESC";
                try {
                    $stmt_consult_entradas_lote_produccion = $pdo->prepare($sql_consult_entradas_lote_produccion);
                    $stmt_consult_entradas_lote_produccion->bindParam(1, $refProdc, PDO::PARAM_INT);
                    $stmt_consult_entradas_lote_produccion->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_consult_entradas_lote_produccion->execute();

                    $row_entrada_lote_produccion = $stmt_consult_entradas_lote_produccion->fetchAll(PDO::FETCH_ASSOC);

                    $cantidadAdevolver = $canSalStoProd; // acumulado
                    $cantSalPorIteracion = 0; // cantidad auxiliar
                    $idEntStoEst = 1; // estado de disponible de entrada

                    $pdo->beginTransaction();
                    //aplicamos el algoritmos de reparticion
                    foreach ($row_entrada_lote_produccion as $value) {
                        $idEntSto = $value["id"]; // entrada
                        $canSalStoReq = $value["canTotEnt"]; // cantidad

                        if ($cantidadAdevolver >= $canSalStoReq) {
                            $cantidadAdevolver -= $canSalStoReq;
                            $cantSalPorIteracion = $canSalStoReq;
                        } else {
                            $cantSalPorIteracion = $cantidadAdevolver;
                            $cantidadAdevolver = 0;
                        }

                        $sql_update_entrada_stock =
                            "UPDATE entrada_stock
                            SET canTotDis = canTotDis + $cantSalPorIteracion, idEntStoEst = ?
                            WHERE id = ?";

                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->execute();

                        $esEnt = 1;
                        $sql =
                            "INSERT
                            movimiento_operacion_facturacion
                            (idOpeFac, idOpeFacDet, idProdt, idEntSto, canMovOpeFac, esEnt)
                            VALUES (?, ?, ?, ?, $canSalStoReq, ?)";

                        $stmt = $pdo->prepare($sql);
                        $stmt->bindParam(1, $idOpeFac, PDO::PARAM_INT); // id de la operacion facturacion
                        $stmt->bindParam(2, $idOpeFacDet, PDO::PARAM_STR);
                        $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                        $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                        $stmt->bindParam(5, $esEnt, PDO::PARAM_BOOL);

                        // EJECUTAMOS LA CREACION DE UNA SALIDA
                        $stmt->execute();

                        if ($cantidadAdevolver == 0) {
                            break;
                        }
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                    $description_error = $e->getMessage();
                }
            }
        }
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
                "SELECT * FROM operacion_facturacion_detalle
            WHERE idOpeFac = ? AND fueComDet <> ?";
            $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
            $stmt_consulta_requisicion_detalle->bindParam(1, $idOpeFac, PDO::PARAM_INT);
            $stmt_consulta_requisicion_detalle->bindParam(2, $esComSalStoDet, PDO::PARAM_BOOL);
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
                "UPDATE operacion_facturacion_detalle
            SET fueComDet = ?
            WHERE id = ?";
            $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
            $stmt_update_requisicion_detalle->bindParam(1, $esComSalStoDet, PDO::PARAM_BOOL);
            $stmt_update_requisicion_detalle->bindParam(2, $idOpeFacDet, PDO::PARAM_INT);
            $stmt_update_requisicion_detalle->execute();

            // LUEGO ACTUALIZAMOS EL MAESTRO
            if ($idReqEst == 3) {
                // obtenemos la fecha actual
                $fecComOpeFac = date('Y-m-d H:i:s');
                $sql_update_requisicion_completo =
                    "UPDATE operacion_facturacion
                SET idReqEst = ?, fecComOpeFac = ?
                WHERE id = ?";
                $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion_completo->bindParam(2, $fecComOpeFac);
                $stmt_update_requisicion_completo->bindParam(3, $idOpeFac, PDO::PARAM_INT);
                $stmt_update_requisicion_completo->execute();
            } else {
                $sql_update_requisicion =
                    "UPDATE operacion_facturacion
                SET idReqEst = ?
                WHERE id = ?";
                $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion->bindParam(2, $idOpeFac, PDO::PARAM_INT);
                $stmt_update_requisicion->execute();
            }

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
