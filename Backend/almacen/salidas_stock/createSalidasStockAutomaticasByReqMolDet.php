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
    $idReqDet = $data["id"]; // requisicion detalle
    $idProdt = $data["idProdt"]; // producto (materia prima, material, insumo, etc)
    // $idAlm = $data["idAlm"]; // almacen de la transferencia (A. Principal --> A. Correspondiente)
    $idAre = $data["idAre"]; // area
    $idAlm = 1; // almacen principal
    $idAlmDes = 0; // almacen destino
    $canReqDet = floatval($data["canReqDet"]); // cantidad de requisicion detalle
    $idEstSalSto = 1; // estado de completado
    $numop = $data["numop"]; // area
    $detalleSalidaAlmacen = $data["detalleSalidaAlmacen"];
    // tolerancia de error de punto flotante
    $tolerancia = 0.000001;


    if ($pdo) {
        // PRIMERO OBTENEMOS LA LISTA DE ENTRADAS DISPONIBLES
        /*
            EL ALGORITMO SERA EL SIGUIENTE:
            1. Se realiza la consulta de todas las entradas que cumplan las siguientes condiciones:
                * que la cantidad disponibles sea mayor a 0
                * que tenga un estado de disponible la entrada
                * que corresponda al producto que especifica el detalle de la requisicion
            2. Una vez obtenido la lista de ingresos disponibles se debe empezar por el mas antiguo
            3. Un for va recorriendo las cantidad disponibles y va comparando con el total solicitado
            4. Tenemos los siguientes casos:
                a. Si hay la cantidad requerida, por ende detenemos el bucle y proseguimos
                b. Se recorrio todo el array y no se cumplio lo requerido por ende se muestra el mensaje de 
                error y se finaliza el proceso.
            5. Una vez obtenido la informacion de las entradas requeridas para salida se procede
                a realizar las salidas correspondientes
            6. Se actualizan los estados de los detalles y maestros
            7. Termina el proceso
        */

        // PASO NUMERO 1: CONSULTA DE ENTRADAS DISPONIBLES
        $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
        $entradasUtilizadas = []; // entradas utilizadas para la salida

        // 1. recorremos el detalle de salidas
        try {
            foreach ($detalleSalidaAlmacen as $detalleSalida) {
                $idAlmacenSalidaDetalle = $detalleSalida["idAlm"]; // almacen
                $nomAlmacenSalidaDetalle = $detalleSalida["nomAlm"]; // almacen nomnbre
                $canAlmacenSalidaDetalle = $detalleSalida["canSalAlm"]; // cantidad
                $array_entradas_disponibles = []; // ARREGLO DE ENTRADAS DISPONIBLES

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
                $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
                $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
                $stmt_consult_entradas_disponibles->bindParam(3, $idAlmacenSalidaDetalle, PDO::PARAM_INT);
                $stmt_consult_entradas_disponibles->execute();
                // agregamos las entradas disponibles
                $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);
                // comprobamos si hay entradas disponibles para ahorrar proceso computacional
                if (!empty($array_entradas_disponibles)) {
                    $cantidad_faltante = floatval($canAlmacenSalidaDetalle); // nos aseguramos que sea un valor flotante
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
                        throw new Exception("No hay entradas suficientes en el almacen $nomAlmacenSalidaDetalle del producto para cumplir con la salida");
                    }
                } else {
                    // lanzamos una excepcion para que finalice el calculo
                    throw new Exception("No hay entradas disponibles para el producto del detalle");
                }
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

            $fecSalStoReq = date('Y-m-d H:i:s');
            $sql = "";
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
                        $merSalStoReq = round($merSalStoReq, 2);
                    }
                    // estamos hablando de una salida total
                    $esSalTot = 1;
                    // sentencia sql
                    $sql =
                        "INSERT
                        salida_stock
                        (idEntSto, idReq, idReqDet, idProdt, idAlm, idEstSalSto, canSalStoReq, merSalStoReq, numop, esSalTot, fecSalStoReq)
                        VALUES (?, ?, ?, ?, ?, ?, $canSalStoReq, $merSalStoReq, ?, ?, ?)";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(1, $idEntSto, PDO::PARAM_INT);
                    $stmt->bindParam(2, $idReq, PDO::PARAM_INT);
                    $stmt->bindParam(3, $idReqDet, PDO::PARAM_INT);
                    $stmt->bindParam(4, $idProdt, PDO::PARAM_INT);
                    $stmt->bindParam(5, $idAlmDes, PDO::PARAM_INT);
                    $stmt->bindParam(6, $idEstSalSto, PDO::PARAM_INT);
                    $stmt->bindParam(7, $numop, PDO::PARAM_INT);
                    $stmt->bindParam(8, $esSalTot, PDO::PARAM_BOOL);
                    $stmt->bindParam(9, $fecSalStoReq, PDO::PARAM_STR);

                    // EJECUTAMOS LA CREACION DE UNA SALIDA
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
                            SET canTotDis = $canResAftOpe, merDis = merDis - $merSalStoReq, idEntStoEst = ?, fecFinSto = ?
                            WHERE id = ?";
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
                // TERMINAMOS LA TRANSACCION
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
                    if ($idReqEst == 3) {
                        // obtenemos la fecha actual
                        $fecEntReq = date('Y-m-d H:i:s');
                        $sql_update_requisicion_completo =
                            "UPDATE requisicion
                            SET idReqEst = ?, fecEntReq = ?
                            WHERE id = ?";
                        $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                        $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                        $stmt_update_requisicion_completo->bindParam(2, $fecEntReq);
                        $stmt_update_requisicion_completo->bindParam(3, $idReq, PDO::PARAM_INT);
                        $stmt_update_requisicion_completo->execute();
                    } else {
                        $sql_update_requisicion =
                            "UPDATE requisicion
                            SET idReqEst = ?
                            WHERE id = ?";
                        $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                        $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                        $stmt_update_requisicion->bindParam(2, $idReq, PDO::PARAM_INT);
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
