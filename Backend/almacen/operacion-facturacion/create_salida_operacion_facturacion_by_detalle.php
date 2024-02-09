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
    $detSal = $data["detSal"]; // detalle de salida
    $idAlmacenPrincipal = 1; // almacen principal

    // si es mercancia promocional
    if ($esMerProm == 1) {
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
            $pdo->beginTransaction();

            $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
            $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(3, $idAlmacenPrincipal, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->execute();

            // AÑADIMOS AL ARRAY
            $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

            // comprobamos si hay entradas disponibles para ahorrar proceso computacional
            if (!empty($array_entradas_disponibles)) {
                $entradasUtilizadas = [];
                $cantidad_faltante = $canOpeFacDet;
                foreach ($array_entradas_disponibles as $row_entrada_disponible) {
                    if ($cantidad_faltante > 0) {

                        $idEntStoUti = $row_entrada_disponible["id"]; // id entrada
                        $canDisEnt = intval($row_entrada_disponible["canTotDis"]); // cantidad disponible

                        if ($canDisEnt >= $cantidad_faltante) {
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
                    // RECORREMOS TODAS LAS ENTRADAS UTILIZADAS PARA LA SALIDA
                    foreach ($entradasUtilizadas as $item) {
                        // OBTENEMOS LOS DATOS
                        $idEntSto = $item["idEntSto"]; // id de la entrada
                        $canSalStoReq = intval($item["canSalStoReq"]); // cantidad de salida de stock
                        //$canTotDis = $item["canTotDis"];

                        // CONSULTAMOS LA ENTRADA 
                        $canTotDisEntSto = 0; // cantidad disponible
                        $idEntStoEst = 0; // estado de la entrada
                        $idAlmacen = 0; // id del almacen para realizar la actualizacion

                        $sql_consult_entrada_stock =
                            "SELECT 
                                canTotDis,
                                idAlm
                                FROM entrada_stock
                                WHERE id = ?";
                        $stmt_consulta_entrada_stock = $pdo->prepare($sql_consult_entrada_stock);
                        $stmt_consulta_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
                        $stmt_consulta_entrada_stock->execute();

                        while ($row = $stmt_consulta_entrada_stock->fetch(PDO::FETCH_ASSOC)) {
                            $canTotDisEntSto = $row["canTotDis"];
                            $idAlmacen = $row["idAlm"];
                        }

                        $esSal = 1;
                        // sentencia sql
                        $sql =
                            "INSERT
                         movimiento_operacion_facturacion
                         (idOpeFac, idOpeFacDet, idProdt, idEntSto, canMovOpeFac, esSal)
                         VALUES (?, ?, ?, ?, $canSalStoReq, ?)";

                        $stmt = $pdo->prepare($sql);
                        $stmt->bindParam(1, $idOpeFac, PDO::PARAM_INT); // id de la operacion facturacion
                        $stmt->bindParam(2, $idOpeFacDet, PDO::PARAM_STR);
                        $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                        $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                        $stmt->bindParam(5, $esSal, PDO::PARAM_BOOL);

                        // EJECUTAMOS LA CREACION DE UNA SALIDA
                        $stmt->execute();

                        // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                        $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                        if ($canResAftOpe == 0) { // SI LA CANTIDAD RESTANTE ES 0
                            $idEntStoEst = 2; // ESTADO DE ENTRADA AGOTADA O TERMINADA
                            $fecFinSto = date('Y-m-d H:i:s'); // FECHA DE TERMINO DE STOCK DE LA ENTRADA

                            // sql actualizar entrada stock con fecha de finalización
                            $sql_update_entrada_stock =
                                "UPDATE
                            entrada_stock
                            SET canTotDis = $canResAftOpe, idEntStoEst = ?, fecFinSto = ?
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
                            SET canTotDis = $canResAftOpe, idEntStoEst = ?
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
                } else {
                    throw new Exception("No hay entradas suficientes del producto para cumplir con la salida");
                }
            } else {
                throw new Exception("No hay entradas disponibles para el producto del detalle");
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
    }

    // si no es un detalle de mercancia de promocion, sino un producto final
    else {
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
                             movimiento_operacion_facturacion
                             (idOpeFac, idOpeFacDet, idProdt, idEntSto, idProdc, codLotProd, canMovOpeFac, esSal)
                             VALUES (?, ?, ?, ?, ?, ?, $canSalStoReq, ?)";

                            $stmt = $pdo->prepare($sql);
                            $stmt->bindParam(1, $idOpeFac, PDO::PARAM_INT); // id de la operacion facturacion
                            $stmt->bindParam(2, $idOpeFacDet, PDO::PARAM_STR);
                            $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                            $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                            $stmt->bindParam(5, $refProdc, PDO::PARAM_INT);
                            $stmt->bindParam(6, $codLot, PDO::PARAM_STR);
                            $stmt->bindParam(7, $esSal, PDO::PARAM_BOOL);

                            // EJECUTAMOS LA CREACION DE UNA SALIDA
                            $stmt->execute();

                            // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                            $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                            if ($canResAftOpe == 0) { // SI LA CANTIDAD RESTANTE ES 0
                                $idEntStoEst = 2; // ESTADO DE ENTRADA AGOTADA O TERMINADA
                                $fecFinSto = date('Y-m-d H:i:s'); // FECHA DE TERMINO DE STOCK DE LA ENTRADA

                                // sql actualizar entrada stock con fecha de finalización
                                $sql_update_entrada_stock =
                                    "UPDATE
                                entrada_stock
                                SET canTotDis = $canResAftOpe, idEntStoEst = ?, fecFinSto = ?
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
                                SET canTotDis = $canResAftOpe, idEntStoEst = ?
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
