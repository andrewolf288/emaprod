<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idRefGui = intVal($data["idRefGui"]); // id de la guia de remision
    $idCredNot = $data["idCredNot"]; // id de la nota decredito
    $idMot = intVal($data["idMotivo"]); // motivo
    $invoice_serie = $data["invoice_serie"]; // serie
    $invoice_number = $data["invoice_number"]; // numero
    $items = $data["items"]; // items

    if ($pdo) {
        $idOpeFac = 0; // id de la operacion de salida de facturacion de GR

        if ($idRefGui === 0) {
            $message_error =  "No se proporciono la GR";
            $description_error = "No se proporciono la GR: $idRefGui";
        } else {
            $idOpeFacMot = 1; // motivo de salida de guia de remision
            $idReqEst = 1;
            $fueAfePorDev = false;

            $sql_consult_operacion =
                "SELECT * FROM operacion_facturacion
            WHERE idGuiRem = ? AND idOpeFacMot = ? AND fueAfePorDev = ?";
            $stmt_consult_operacion = $pdo->prepare($sql_consult_operacion);
            $stmt_consult_operacion->bindParam(1, $idRefGui, PDO::PARAM_INT);
            $stmt_consult_operacion->bindParam(2, $idOpeFacMot, PDO::PARAM_INT);
            $stmt_consult_operacion->bindParam(3, $fueAfePorDev, PDO::PARAM_BOOL);
            $stmt_consult_operacion->execute();

            $row = $stmt_consult_operacion->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $idOpeFac = $row["id"]; // id de la operacion de facturacion
                $idLastInsertion = 0; // vairable para guardar la referencia
                $idOpeFacMot = 0; // motivo de operacion
                $esEnt = true; // es una operacion de entrada

                // si es un motivo por anulacion de la operacion
                if ($idMot == 48) {
                    $idOpeFacMot = 3;
                }

                // si es un motivo por devolucion total
                if ($idMot == 53) {
                    $idOpeFacMot = 4;
                }

                // si es un motivo por devolucion por items
                if ($idMot == 54) {
                    $idOpeFacMot = 5;
                }

                // si es un motivo por anulacion de guia de remision
                if ($idMot == 100) {
                    $idOpeFacMot = 2;
                    $idCredNot = NULL;
                    $invoice_serie = $row["invSerFac"]; // serie
                    $invoice_number = $row["invNumFac"]; // numero
                }

                // insertamos la operacion facturacion
                $sql_insert_operacion_facturacion =
                    "INSERT INTO 
                    operacion_facturacion (idGuiRem, idNotCre, idOpeFacMot, esEnt, invSerFac, invNumFac, idReqEst)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
                try {
                    $pdo->beginTransaction();
                    $stmt_insert_operacion_facturacion = $pdo->prepare($sql_insert_operacion_facturacion);
                    $stmt_insert_operacion_facturacion->bindParam(1, $idRefGui, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->bindParam(2, $idCredNot, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->bindParam(3, $idOpeFacMot, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->bindParam(4, $esEnt, PDO::PARAM_BOOL);
                    $stmt_insert_operacion_facturacion->bindParam(5, $invoice_serie, PDO::PARAM_STR);
                    $stmt_insert_operacion_facturacion->bindParam(6, $invoice_number, PDO::PARAM_STR);
                    $stmt_insert_operacion_facturacion->bindParam(7, $idReqEst, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->execute();

                    $idLastInsertion = $pdo->lastInsertId();

                    // CODIGO PARA DEVOLUCION POR ITEM
                    if ($idMot === 54) {
                        // recorremos cada item de la devolucion
                        foreach ($items as $item) {
                            $reference = $item["product_reference"];
                            $quantity = intval($item["quantity"]);
                            $salidas_producto = array();

                            $sql_select_salida_producto =
                                "SELECT * FROM operacion_facturacion_detalle
                            WHERE idOpeFac = ? AND refProdt = ?";
                            $stmt_select_salida_producto = $pdo->prepare($sql_select_salida_producto);
                            $stmt_select_salida_producto->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                            $stmt_select_salida_producto->bindParam(2, $reference, PDO::PARAM_STR);
                            $stmt_select_salida_producto->execute();

                            $salidas_producto = $stmt_select_salida_producto->fetchAll(PDO::FETCH_ASSOC);

                            // si las salidas de productos no esta vacia
                            if (!empty($salidas_producto)) {
                                foreach ($salidas_producto as $row_salidas_operacion) {
                                    $refProdt = $row_salidas_operacion["refProdt"]; // referencia
                                    $idProdt = $row_salidas_operacion["idProdt"]; // producto
                                    $esMerProm = $row_salidas_operacion["esMerProm"];
                                    $esProdFin = $row_salidas_operacion["esProFin"];

                                    $sql_create_operacion_facturacion_detalle =
                                        "INSERT INTO operacion_facturacion_detalle
                                    (idOpeFac, idProdt, refProdt, canOpeFacDet, esMerProm, esProFin)
                                    VALUES(?, ?, ?, $quantity , ?, ?)";
                                    $stmt_create_operacion_facturacion_detalle = $pdo->prepare($sql_create_operacion_facturacion_detalle);
                                    $stmt_create_operacion_facturacion_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                                    $stmt_create_operacion_facturacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                                    $stmt_create_operacion_facturacion_detalle->bindParam(3, $refProdt, PDO::PARAM_STR);
                                    $stmt_create_operacion_facturacion_detalle->bindParam(4, $esMerProm, PDO::PARAM_BOOL);
                                    $stmt_create_operacion_facturacion_detalle->bindParam(5, $esProdFin, PDO::PARAM_BOOL);
                                    $stmt_create_operacion_facturacion_detalle->execute();
                                }
                            }
                        }
                    } else {
                        $sql_select_salidas_operacion =
                            "SELECT * FROM operacion_facturacion_detalle
                            WHERE idOpeFac = ?";
                        $stmt_select_salidas_operacion = $pdo->prepare($sql_select_salidas_operacion);
                        $stmt_select_salidas_operacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                        $stmt_select_salidas_operacion->execute();

                        while ($row_salidas_operacion = $stmt_select_salidas_operacion->fetch(PDO::FETCH_ASSOC)) {
                            $refProdt = $row_salidas_operacion["refProdt"]; // referencia
                            $idProdt = $row_salidas_operacion["idProdt"]; // producto
                            $canOpeFacDet = $row_salidas_operacion["canOpeFacDet"]; // cantidad salida
                            $esMerProm = $row_salidas_operacion["esMerProm"];
                            $esProdFin = $row_salidas_operacion["esProFin"];

                            $sql_create_operacion_facturacion_detalle =
                                "INSERT INTO operacion_facturacion_detalle
                            (idOpeFac, idProdt, refProdt, canOpeFacDet, esMerProm, esProFin)
                            VALUES(?, ?, ?, $canOpeFacDet, ?, ?)";
                            $stmt_create_operacion_facturacion_detalle = $pdo->prepare($sql_create_operacion_facturacion_detalle);
                            $stmt_create_operacion_facturacion_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                            $stmt_create_operacion_facturacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt_create_operacion_facturacion_detalle->bindParam(3, $refProdt, PDO::PARAM_STR);
                            $stmt_create_operacion_facturacion_detalle->bindParam(4, $esMerProm, PDO::PARAM_BOOL);
                            $stmt_create_operacion_facturacion_detalle->bindParam(5, $esProdFin, PDO::PARAM_BOOL);
                            $stmt_create_operacion_facturacion_detalle->execute();
                        }
                    }

                    if (empty($message_error)) {
                        // actualizamos la operacion de salida afectada
                        $esAfecto = true;

                        $sql_update_operacion_facturacion =
                            "UPDATE operacion_facturacion
                        SET fueAfePorDev = ?
                        WHERE id = ?";
                        $stmt_update_operacion_facturacion = $pdo->prepare($sql_update_operacion_facturacion);
                        $stmt_update_operacion_facturacion->bindParam(1, $esAfecto, PDO::PARAM_BOOL);
                        $stmt_update_operacion_facturacion->bindParam(2, $idOpeFac, PDO::PARAM_INT);
                        $stmt_update_operacion_facturacion->execute();
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA OPERACION";
                    $description_error = $e->getMessage();
                }
            } else {
                $message_error =  "No se registro la GR";
                $description_error = "No se registro ninguna salida de almacen o la operacion ya fue afectada con la guia: $idRefGui";
            }
        }
    } else {
        $message_error =  "Error en la conexion";
        $description_error = "No se pudo conectar con la base de datos a través de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    echo json_encode($return);
}
