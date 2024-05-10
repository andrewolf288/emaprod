<?php
function salidaDetalleEncuadre(int $idProdt, $canReqDet, int $idOpeEncDet, int $idAlmacen, PDO $pdo, int $idProdc = 0)
{
    $message_error = "";
    $description_error = "";
    $idEntStoEst = 1;
    $array_entradas_disponibles = [];
    $tolerancia = 0.000001;

    $sql_consult_entradas_disponibles =
        "SELECT
    es.id,
    es.codEntSto,
    es.refNumIngEntSto,
    DATE(es.fecEntSto) AS fecEntSto,
    es.canTotDis 
    FROM entrada_stock AS es
    WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0 AND idAlm = ?";

    if ($idProdc != 0) {
        $sql_consult_entradas_disponibles .= " AND refProdc = ?";
    }

    $sql_consult_entradas_disponibles .= " ORDER BY es.fecEntSto ASC";

    $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
    $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
    $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
    $stmt_consult_entradas_disponibles->bindParam(3, $idAlmacen, PDO::PARAM_INT);
    if ($idProdc != 0) {
        $stmt_consult_entradas_disponibles->bindParam(4, $idProdc, PDO::PARAM_INT);
    }
    $stmt_consult_entradas_disponibles->execute();

    $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

    // comprobamos si hay entradas disponibles para ahorrar proceso computacional
    if (!empty($array_entradas_disponibles)) {
        $entradasUtilizadas = [];
        $cantidad_faltante = $canReqDet;

        foreach ($array_entradas_disponibles as $row_entrada_disponible) {
            if ($cantidad_faltante > 0) {
                $idEntStoUti = $row_entrada_disponible["id"]; // id entrada
                $canDisEnt = $row_entrada_disponible["canTotDis"]; // cantidad disponible

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
            // RECORREMOS TODAS LAS ENTRADAS UTILIZADAS PARA LA SALIDA
            foreach ($entradasUtilizadas as $item) {
                // OBTENEMOS LOS DATOS
                $idEntSto = $item["idEntSto"]; // id de la entrada
                $canSalStoReq = $item["canSalStoReq"]; // cantidad de salida de stock
                //$canTotDis = $item["canTotDis"];

                // CONSULTAMOS LA ENTRADA 
                $canTotDisEntSto = 0; // cantidad disponible
                $idEntStoEst = 0; // estado de la entrada

                $sql_consult_entrada_stock =
                    "SELECT 
                    canTotDis
                    FROM entrada_stock
                    WHERE id = ? LIMIT 1";
                $stmt_consulta_entrada_stock = $pdo->prepare($sql_consult_entrada_stock);
                $stmt_consulta_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
                $stmt_consulta_entrada_stock->execute();

                $row_entrada_stock = $stmt_consulta_entrada_stock->fetch(PDO::FETCH_ASSOC);
                $canTotDisEntSto = $row_entrada_stock["canTotDis"];

                // sentencia sql
                $sql_salida_operacion_encuadre =
                    "INSERT
                    salida_operacion_encuadre_detalle
                    (idOpeEncDet, idEntSto, canSalOpeEncDet)
                    VALUES (?, ?, $canSalStoReq)";

                $stmt = $pdo->prepare($sql_salida_operacion_encuadre);
                $stmt->bindParam(1, $idOpeEncDet, PDO::PARAM_INT);
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
                    $stmt_update_entrada_stock->bindParam(2, $fecFinSto);
                    $stmt_update_entrada_stock->bindParam(3, $idEntSto, PDO::PARAM_INT);

                    $stmt_update_entrada_stock->execute();
                } else {
                    $idEntStoEst = 1; // ESTADO DE ENTRADA DISPONIBLE

                    // ACTUALIZAMOS LA ENTRADA STOCK
                    $sql_update_entrada_stock =
                        "UPDATE
                        entrada_stock
                        SET canTotDis = canTotDis - $canSalStoReq, idEntStoEst = ?
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
        } else {
            $message_error = "No hay entradas suficientes";
            $description_error = "No hay entradas suficientes del producto para cumplir con la salida";
        }
    } else {
        $message_error = "No hay entradas";
        $description_error = "No se realizaron entradas";
    }
    return array(
        "message_error" => $message_error,
        "description_error" => $description_error
    );
}
