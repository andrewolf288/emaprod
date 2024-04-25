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
    $idReqEmpProm = $data["idReqEmpProm"]; // requisicion
    $idReqEmpPromDet = $data["id"]; // requisicion detalle
    $idProdt = $data["idProdt"]; // producto (materia prima, material, insumo, etc)
    $idProdc = $data["idProdc"]; // produccion
    $esProdFin = $data["esProdFin"]; // es producto final
    $esMatReq = $data["esMatReq"]; // es material de requisicion
    $idAlmacenPrincipal = 1; // almacen principal
    $canReqMatDet = floatval($data["canReqEmpPromDet"]); // cantidad de requisicion detalle
    // tolerancia de error de punto flotante
    $tolerancia = 0.000001;

    if ($pdo) {
        // PASO NUMERO 1: CONSULTA DE ENTRADAS DISPONIBLES
        $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
        $entradasUtilizadas = []; // entradas utilizadas para la salida

        // 1. recorremos el detalle de salidas
        try {
            $sql_consult_entradas_disponibles =
                "SELECT
            es.id,
            es.codEntSto,
            es.refNumIngEntSto,
            DATE(es.fecEntSto) AS fecEntSto,
            es.canTotDis 
            FROM entrada_stock AS es
            WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0 AND idAlm = ?";
            // si se especifico un lote
            if(!is_null($idProdc)){
                $sql_consult_entradas_disponibles .= " AND refProdc = ?";
            }
            $sql_consult_entradas_disponibles .= " ORDER BY es.fecEntSto ASC";
            $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
            $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(3, $idAlmacenPrincipal, PDO::PARAM_INT);
            if(!is_null($idProdc)){
                $stmt_consult_entradas_disponibles->bindParam(4, $idProdc, PDO::PARAM_INT);
            }
            $stmt_consult_entradas_disponibles->execute();
            // agregamos las entradas disponibles
            $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

            // comprobamos si hay entradas disponibles para ahorrar proceso computacional
            if (!empty($array_entradas_disponibles)) {
                $cantidad_faltante = $canReqMatDet; // nos aseguramos que sea un valor flotante
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
                if ($cantidad_faltante != 0) {
                    // lanzamos una excepcion para que finalice el calculo
                    throw new Exception("No hay entradas suficientes para el producto del detalle");
                }
            } else {
                // lanzamos una excepcion para que finalice el calculo
                throw new Exception("No hay entradas disponibles para el producto del detalle");
            }
        } catch (Exception $e) {
            $message_error = "No hay suficiente stock";
            $description_error = $e->getMessage();
        } catch (PDOException $e) {
            $message_error = "Hubo un error en la base de datos";
            $description_error = $e->getMessage();
        }

        // ahora debemos recorres las entradas que seran utilizadas
        if (empty($message_error)) {
            // RECORREMOS TODAS LAS ENTRADAS UTILIZADAS PARA LA SALIDA
            try {
                // INICIAMOS UNA TRANSACCION
                $pdo->beginTransaction();
                foreach ($entradasUtilizadas as $item) {
                    // OBTENEMOS LOS DATOS
                    $idEntSto = $item["idEntSto"]; // id de la entrada
                    $canSalStoReq = $item["canSalStoReq"]; // cantidad de salida de stock
                    //$canTotDis = $item["canTotDis"];

                    // CONSULTAMOS LA ENTRADA 
                    $canTotDisEntSto = 0; // cantidad disponible
                    $idEntStoEst = 0; // estado de la entrada
                    $idAlmacen = 0; // id del almacen para realizar la actualizacion

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
                    }

                    // sentencia sql para crear salida de stock
                    $sql =
                        "INSERT
                    salida_requisicion_empaquetado_promocional
                    (idReqEmpPromDet, idEntSto, canSalReqEmpProm)
                    VALUES (?, ?, $canSalStoReq)";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(1, $idReqEmpPromDet, PDO::PARAM_INT);
                    $stmt->bindParam(2, $idEntSto, PDO::PARAM_INT);
                    $stmt->execute();

                    // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                    $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                    if (abs($canResAftOpe) < $tolerancia) { // SI LA CANTIDAD RESTANTE ES 0
                        $canResAftOpe = 0;
                        $idEntStoEst = 2; // ESTADO DE ENTRADA AGOTADA O TERMINADA
                        $fecFinSto = date('Y-m-d H:i:s'); // FECHA DE TERMINO DE STOCK DE LA ENTRADA

                        // sql actualizar entrada stock con fecha de finalización
                        $sql_update_entrada_stock =
                            "UPDATE
                        entrada_stock
                        SET canTotDis = $canResAftOpe, idEntStoEst = ?, fecFinSto = ?
                        WHERE id = ?";
                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $fecFinSto, PDO::PARAM_STR);
                        $stmt_update_entrada_stock->bindParam(3, $idEntSto, PDO::PARAM_INT);

                        $stmt_update_entrada_stock->execute();
                    } else {
                        $idEntStoEst = 1; // ESTADO DE ENTRADA DISPONIBLE

                        // ACTUALIZAMOS LA ENTRADA STOCK
                        $sql_update_entrada_stock =
                            "UPDATE
                        entrada_stock
                        SET canTotDis = $canResAftOpe, idEntStoEst = ?
                        WHERE id = ?";
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
                // TERMINAMOS LA TRANSACCIÓN
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en insercion de salidas";
                $description_error = $e->getMessage();
            }

            // ACTUALIZAMOS LOS ESTADOS DE LA REQUISICION MOLIENDA MAESTRO Y DETALLE
            if (empty($message_error)) {
                try {
                    // Iniciamos una transaccion
                    $pdo->beginTransaction();
                    // ACTUALIZAMOS EL ESTADO DE LA REQUISICION MOLIENDA DETALLE

                    $esCom = 1; // ESTADO DE COMPLETADO
                    $total_requisiciones_detalle_no_completadas = 0;
                    $sql_consulta_requisicion_materiales_detalle =
                        "SELECT * FROM requisicion_empaquetado_promocional_detalle
                    WHERE idReqEmpProm = ? AND esCom <> ?";
                    $stmt_consulta_requisicion_materiales_detalle = $pdo->prepare($sql_consulta_requisicion_materiales_detalle);
                    $stmt_consulta_requisicion_materiales_detalle->bindParam(1, $idReqEmpProm, PDO::PARAM_INT);
                    $stmt_consulta_requisicion_materiales_detalle->bindParam(2, $esCom, PDO::PARAM_BOOL);
                    $stmt_consulta_requisicion_materiales_detalle->execute();

                    $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_materiales_detalle->rowCount();

                    $idReqEmpPromEst = 0; // inicializacion

                    if ($total_requisiciones_detalle_no_completadas == 1) { // si es la unica requisicion detalle por completar
                        $idReqEmpPromEst = 3; // COMPLETADO
                    } else {
                        $idReqEmpPromEst = 2; // EN PROCESO
                    }

                    // PRIMERO ACTUALIZAMOS EL DETALLE
                    $sql_update_requisicion_materiales_detalle =
                        "UPDATE requisicion_empaquetado_promocional_detalle
                    SET esCom = ?
                    WHERE id = ?";
                    $stmt_update_requisicion_materiales_detalle = $pdo->prepare($sql_update_requisicion_materiales_detalle);
                    $stmt_update_requisicion_materiales_detalle->bindParam(1, $esCom, PDO::PARAM_BOOL);
                    $stmt_update_requisicion_materiales_detalle->bindParam(2, $idReqEmpPromDet, PDO::PARAM_INT);
                    $stmt_update_requisicion_materiales_detalle->execute();

                    // LUEGO ACTUALIZAMOS EL MAESTRO
                    if ($idReqEmpPromEst == 3) {
                        // obtenemos la fecha actual
                        $fecComReqEmpProm = date('Y-m-d H:i:s');
                        $sql_update_requisicion_completo =
                            "UPDATE requisicion_empaquetado_promocional
                        SET idReqEst = ?, fecComReqEmpProm = ?
                        WHERE id = ?";
                        $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                        $stmt_update_requisicion_completo->bindParam(1, $idReqEmpPromEst, PDO::PARAM_INT);
                        $stmt_update_requisicion_completo->bindParam(2, $fecComReqEmpProm, PDO::PARAM_STR);
                        $stmt_update_requisicion_completo->bindParam(3, $idReqEmpProm, PDO::PARAM_INT);
                        $stmt_update_requisicion_completo->execute();
                    } else {
                        $sql_update_requisicion =
                            "UPDATE requisicion_empaquetado_promocional
                        SET idReqEst = ?
                        WHERE id = ?";
                        $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                        $stmt_update_requisicion->bindParam(1, $idReqEmpPromEst, PDO::PARAM_INT);
                        $stmt_update_requisicion->bindParam(2, $idReqEmpProm, PDO::PARAM_INT);
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
