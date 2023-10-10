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

    $detAgrLotProd = $data["detAgrLotProd"];

    if ($pdo) {
        // $idAlm = 0;

        $data = checkEntradas($pdo, $detAgrLotProd);
        if (count($data["noDisponible"]) > 0) {
            die(json_encode($data));
        } 

        foreach ($detAgrLotProd as $value) {
            // OBTENEMOS LOS DATOS DE LOS DETALLES
            $idProdc = $value["idProdc"]; // lote produccion
            $nomProd = $value["nomProd"]; // nombre producto
            $idProdt = $value["idProdt"]; // producto
            $idProdAgrMot = $value["idProdAgrMot"]; // motivo de agregacion
            $canProdAgr = floatval($value["canProdAgr"]); // cantidad agregada
            $idAre = $value["idAre"]; // area que cargara la cantidad
            $idAlmDes = 0; // almacen destino
            $fechaInicio = $value["fechaInicio"]; 
            $fechaFin = $value["fechaFin"]; 
            $flag = $value["flag"]; 

            // primero consultamos la disponibilidad de stock
            // $idAlmacenPrincipal = 1; // almacen principal

            // se aplica las reglas del FIFO
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
                WHERE idProd = ? AND idEntStoEst = ? AND canTotDis <> 0.000
                ORDER BY es.fecEntSto ASC";

            try {

                $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
                $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
                $stmt_consult_entradas_disponibles->execute();

                // AÑADIMOS AL ARRAY
                while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                    array_push($array_entradas_disponibles, $row);
                }

                // comprobamos si hay entradas disponibles para ahorrar proceso computacional
                if (!empty($array_entradas_disponibles)) {
                    $entradasUtilizadas = [];
                    $cantidad_faltante = $canProdAgr;
                    foreach ($array_entradas_disponibles as $row_entrada_dispomible) {
                        if ($cantidad_faltante > 0) {
                            $idEntStoUti = $row_entrada_dispomible["id"]; // id entrada
                            $canDisEnt = $row_entrada_dispomible["canTotDis"]; // cantidad disponible

                            if ($canDisEnt >= $cantidad_faltante) {
                                // añadimos a entradas utilizadas
                                array_push(
                                    $entradasUtilizadas,
                                    array(
                                        "idEntSto" => $idEntStoUti,
                                        "canSalStoReq" => $cantidad_faltante // la cantidad de la requisicion detalle
                                    )
                                );

                                // $cantidad_acumulada += $cantidad_faltante;
                                $cantidad_faltante = 0;

                                break; // termina el flujo
                            } else {
                                // $cantidad_acumulada += $canDisEnt;
                                $cantidad_faltante -= $canDisEnt;
                                //añadimos a entradas utilizadas
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

                        // AHORA CREAMOS EL REGISTRO CORRESPONDIENTE
                        // FINALMENTE CREAMOS LA AGREGACION DETALLE
                        $idLastInsert = 0;
                        $sql_insert_detalle_agregacion_lote_produccion =
                            "INSERT INTO produccion_agregacion
                        (idProdc, idProdt, idAlm, idProdAgrMot, canProdAgr, fechaInicio, fechaFin, flag)
                        VALUES (?, ?, ?, ?, $canProdAgr, ?, ?,?)";

                        $stmt_insert_detalle_agregacion_lote_produccion = $pdo->prepare($sql_insert_detalle_agregacion_lote_produccion);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(1, $idProdc, PDO::PARAM_INT);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(2, $idProdt, PDO::PARAM_INT);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(3, $idAlmDes, PDO::PARAM_INT);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(4, $idProdAgrMot, PDO::PARAM_INT);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(5, $fechaInicio, PDO::PARAM_STR);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(6, $fechaFin, PDO::PARAM_STR);
                        $stmt_insert_detalle_agregacion_lote_produccion->bindParam(7, $flag, PDO::PARAM_STR);
                        $stmt_insert_detalle_agregacion_lote_produccion->execute();

                        $idLastInsert = $pdo->lastInsertId(); // obtenemos la referencia


                        // RECORREMOS TODAS LAS ENTRADAS UTILIZADAS PARA LA SALIDA
                        foreach ($entradasUtilizadas as $item) {
                            try {
                                // INICIAMOS UNA TRANSACCION
                                $pdo->beginTransaction();

                                // OBTENEMOS LOS DATOS
                                $idEntSto = $item["idEntSto"]; // id de la entrada
                                $canSalStoReq = $item["canSalStoReq"]; // cantidad de salida de stock

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

                                // calculamos la merma correspondiente a la salida
                                $merSalStoReq = 0; // merma de la salida de stock
                                if ($esSel) {
                                    $merSalStoReq = ($canSalStoReq * $merDis) / $canTotDisEntSto;
                                    $merSalStoReq = round($merSalStoReq);
                                }

                                // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                                $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                                if ($canResAftOpe == 0) { // SI LA CANTIDAD RESTANTE ES 0
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

                                // CREAMOS LA TRAZABILIDAD
                                $sql_insert_producto_agregacion_trazabilidad =
                                    "INSERT INTO producto_agregacion_trazabilidad
                                (idProdAgr, idEntSto, canProdAgrTra)
                                VALUES(?,?,$canSalStoReq)";

                                $stmt_insert_producto_agregacion_trazabilidad = $pdo->prepare($sql_insert_producto_agregacion_trazabilidad);
                                $stmt_insert_producto_agregacion_trazabilidad->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                                $stmt_insert_producto_agregacion_trazabilidad->bindParam(2, $idEntSto, PDO::PARAM_INT);
                                $stmt_insert_producto_agregacion_trazabilidad->execute();

                                // TERMINAMOS LA TRANSACCION
                                $pdo->commit();
                            } catch (PDOException $e) {
                                $pdo->rollback();
                                $message_error = "ERROR INTERNO SERVER: fallo en insercion de salidas";
                                $description_error = $e->getMessage();
                            }
                        }

                        // AHORA REALIZAMOS LA TRANSFERENCIA DE ALMACEN Y CREACION DEL REGISTRO
                        if (empty($message_error)) {
                            // ACTUALIZAMOS EL ALMACEN DESTINO CORRESPONDIENTE
                            $sql_consult_almacen_stock_destino =
                                "SELECT * FROM almacen_stock
                            WHERE idAlm = ? AND idProd = ?";

                            try {
                                $stmt_consult_almacen_stock_destino = $pdo->prepare($sql_consult_almacen_stock_destino);
                                $stmt_consult_almacen_stock_destino->bindParam(1, $idAlmDes, PDO::PARAM_INT);
                                $stmt_consult_almacen_stock_destino->bindParam(2, $idProdt, PDO::PARAM_INT);
                                $stmt_consult_almacen_stock_destino->execute();

                                if ($stmt_consult_almacen_stock_destino->rowCount() === 1) {
                                    // ACTUALIZAMOS
                                    $sql_update_almacen_destino =
                                        "UPDATE almacen_stock 
                                        SET canSto = canSto + $canProdAgr, canStoDis = canStoDis + $canProdAgr
                                        WHERE idAlm = ? AND idProd = ?";

                                    try {
                                        $stmt_update_almacen_destino = $pdo->prepare($sql_update_almacen_destino);
                                        $stmt_update_almacen_destino->bindParam(1, $idAlmDes, PDO::PARAM_INT);
                                        $stmt_update_almacen_destino->bindParam(2, $idProdt, PDO::PARAM_INT);
                                        $stmt_update_almacen_destino->execute();
                                    } catch (PDOException $e) {
                                        $message_error = "ERROR EN LA ACTUALIZACION DEL STOCK DEL ALMACEN DESTINO";
                                        $description_error = $e->getMessage();
                                    }
                                } else {
                                    // INSERTAMOS
                                    $sql_insert_almacen_destino =
                                        "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                                        VALUES(?, ?, $canProdAgr, $canProdAgr)";

                                    try {
                                        $stmt_insert_almacen_destino = $pdo->prepare($sql_insert_almacen_destino);
                                        $stmt_insert_almacen_destino->bindParam(1, $idProdt, PDO::PARAM_INT);
                                        $stmt_insert_almacen_destino->bindParam(2, $idAlmDes, PDO::PARAM_INT);
                                        $stmt_insert_almacen_destino->execute();
                                    } catch (PDOException $e) {
                                        $message_error = "ERROR EN LA INSERCION DEL STOCK DEL ALMACEN DESTINO";
                                        $description_error = $e->getMessage();
                                    }
                                }
                            } catch (PDOException $e) {
                                $message_error = "ERROR EN LA CONSULTA DE STOCK ALMACEN DESTINO";
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


function checkEntradas( $pdo, $detAgrLotProd){

    
    $messageCustom["noDisponible"] = [];

    foreach ($detAgrLotProd as $value) {
        // OBTENEMOS LOS DATOS DE LOS DETALLES
        $idProdc = $value["idProdc"]; // lote produccion
        $nomProd = $value["nomProd"]; // nombre producto
        $idProdt = $value["idProdt"]; // producto
        $idProdAgrMot = $value["idProdAgrMot"]; // motivo de agregacion
        $canProdAgr = floatval($value["canProdAgr"]); // cantidad agregada
        $idAre = $value["idAre"]; // area que cargara la cantidad
        $idAlmDes = 0; // almacen destino
        $fechaInicio = $value["fechaInicio"]; 
        $fechaFin = $value["fechaFin"]; 
        $flag = $value["flag"]; 

        // primero consultamos la disponibilidad de stock
        // $idAlmacenPrincipal = 1; // almacen principal

        // se aplica las reglas del FIFO
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
            WHERE idProd = ? AND idEntStoEst = ? AND canTotDis <> 0.000
            ORDER BY es.fecEntSto ASC";

        try {

            $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
            $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->execute();

            while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                array_push($array_entradas_disponibles, $row);
            }

            if (empty($array_entradas_disponibles)) {
                array_push($messageCustom["noDisponible"], $value["nomProd"]);
            }  
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en la consulta de entradas disponibles";
            $description_error = $e->getMessage();
            array_push($messageCustom, $description_error);

        }

    }
    return $messageCustom;

}
