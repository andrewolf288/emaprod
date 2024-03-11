<?php
// EN ESTE SCRIPT DEBE ESTAR LA OPERACION DE REGISTRO
// TIPO: INTEGRACION
/*
    1. EN EL SISTEMA EMAFACT SE REALIZA UNA OPERACION DE NOTA DE CREDITO
    2. AQUELLAS QUE SON DEL TIPO DE MOTIVO CORRESPONDIENTE SON DE NUESTRO INTERES
    (devolucion total, anulacion de pedido, devolucion parcial)
    3. SE COMUNICA CON EL SISTEMA EMAPROD Y CREA EL REGISTRO CORRESPONDIENTE
*/

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
    $idMot = intVal($data["idMot"]); // motivo
    $invoice_serie = $data["invoice_serie"]; // serie
    $invoice_number = $data["invoice_number"]; // numero
    $items = $data["items"]; // items

    if ($pdo) {
        $idOpeFac = 0; // id de la operacion de salida de facturacion de GR
        $idReqEst = 1;
        $idLastInsertion = 0; // vairable para guardar la referencia
        $idOpeFacMot = 0;

        // PRIMERO DEBEMOS OBTENER EL MOTIVO DE LA OPERACION
        if ($idMot == 48) { // si es un motivo por anulacion de la operacion
            $idOpeFacMot = 3;
        }

        if ($idMot == 53) { // si es un motivo por devolucion total
            $idOpeFacMot = 4;
        }

        if ($idMot == 54) { // si es un motivo por devolucion por items
            $idOpeFacMot = 5;
        }

        // DEBEMOS CONSULTAR SI LA OPERACION DE SALIDA FUE REGISTRADA
        $sql_consult_operacion_facturacion_by_guia_remision =
            "SELECT id, fueAfePorAnul
        FROM operacion_facturacion
        WHERE idGuiRem = ?";
        $stmt_consult_operacion_facturacion_by_guia_remision = $pdo->prepare($sql_consult_operacion_facturacion_by_guia_remision);
        $stmt_consult_operacion_facturacion_by_guia_remision->bindParam(1, $idRefGui, PDO::PARAM_INT);
        $stmt_consult_operacion_facturacion_by_guia_remision->execute();
        $row_operacion_facturacion = $stmt_consult_operacion_facturacion_by_guia_remision->fetch(PDO::FETCH_ASSOC);

        // si se ha registrado la salida en el emaprod
        if ($row_operacion_facturacion) {
            $fueAfePorAnul = $row_operacion_facturacion["fueAfePorAnul"];
            $idOpeFac = $row_operacion_facturacion["id"];

            // si la operacion no fue anulada
            if ($fueAfePorAnul == 0) {
                // insertamos la operacion devolucion
                try {
                    $pdo->beginTransaction();
                    $sql_insert_operacion_devolucion =
                        "INSERT INTO
                    operacion_devolucion (idGuiRem, idNotCre, invSerFac, invNumFac, idReqEst, idOpeFacMot)
                    VALUES(?, ?, ?, ?, ?, ?)";
                    $stmt_insert_operacion_devolucion = $pdo->prepare($sql_insert_operacion_devolucion);
                    $stmt_insert_operacion_devolucion->bindParam(1, $idRefGui, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion->bindParam(2, $idCredNot, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion->bindParam(3, $invoice_serie, PDO::PARAM_STR);
                    $stmt_insert_operacion_devolucion->bindParam(4, $invoice_number, PDO::PARAM_STR);
                    $stmt_insert_operacion_devolucion->bindParam(5, $idReqEst, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion->bindParam(6, $idOpeFacMot, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion->execute();

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

                            $row_salidas_operacion = $stmt_select_salida_producto->fetch(PDO::FETCH_ASSOC);

                            // si las salidas de productos no esta vacia
                            if ($row_salidas_operacion) {
                                $idProdt = $row_salidas_operacion["idProdt"]; // producto
                                $refProdt = $row_salidas_operacion["refProdt"]; // referencia
                                $esMerProm = $row_salidas_operacion["esMerProm"];
                                $esProdFin = $row_salidas_operacion["esProFin"];

                                $sql_create_operacion_facturacion_detalle =
                                    "INSERT INTO operacion_devolucion_detalle
                                    (idOpeDev, idProdt, refProdt, canOpeDevDet, esMerProm, esProFin)
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
                    // CUALQUIER OTRO MOTIVO
                    else {
                        $sql_select_salidas_operacion =
                            "SELECT * FROM operacion_facturacion_detalle
                            WHERE idOpeFac = ?";
                        $stmt_select_salidas_operacion = $pdo->prepare($sql_select_salidas_operacion);
                        $stmt_select_salidas_operacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                        $stmt_select_salidas_operacion->execute();

                        while ($row_salidas_operacion = $stmt_select_salidas_operacion->fetch(PDO::FETCH_ASSOC)) {
                            $refProdt = $row_salidas_operacion["refProdt"]; // referencia
                            $idProdt = $row_salidas_operacion["idProdt"]; // producto
                            $canOpeDevDet = $row_salidas_operacion["canOpeFacDet"]; // cantidad salida
                            $esMerProm = $row_salidas_operacion["esMerProm"];
                            $esProdFin = $row_salidas_operacion["esProFin"];

                            $sql_create_operacion_facturacion_detalle =
                                "INSERT INTO operacion_devolucion_detalle
                            (idOpeDev, idProdt, refProdt, canOpeDevDet, esMerProm, esProFin)
                            VALUES(?, ?, ?, $canOpeDevDet, ?, ?)";
                            $stmt_create_operacion_facturacion_detalle = $pdo->prepare($sql_create_operacion_facturacion_detalle);
                            $stmt_create_operacion_facturacion_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                            $stmt_create_operacion_facturacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt_create_operacion_facturacion_detalle->bindParam(3, $refProdt, PDO::PARAM_STR);
                            $stmt_create_operacion_facturacion_detalle->bindParam(4, $esMerProm, PDO::PARAM_BOOL);
                            $stmt_create_operacion_facturacion_detalle->bindParam(5, $esProdFin, PDO::PARAM_BOOL);
                            $stmt_create_operacion_facturacion_detalle->execute();
                        }
                    }

                    // si no hubo error alguno
                    if (empty($message_error)) {
                        // actualizamos la operacion de salida afectada
                        $fueAfecPorDev = 1;

                        $sql_update_operacion_facturacion =
                            "UPDATE operacion_facturacion
                        SET fueAfePorDev = ?
                        WHERE id = ?";
                        $stmt_update_operacion_facturacion = $pdo->prepare($sql_update_operacion_facturacion);
                        $stmt_update_operacion_facturacion->bindParam(1, $fueAfecPorDev, PDO::PARAM_BOOL);
                        $stmt_update_operacion_facturacion->bindParam(2, $idOpeFac, PDO::PARAM_INT);
                        $stmt_update_operacion_facturacion->execute();
                    }

                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA OPERACION";
                    $description_error = $e->getMessage();
                }
            }
            // si la operacion fue anulada
            else {
                $message_error =  "La salida fue anulada";
                $description_error = "La guia con ID: $idRefGui";
            }
        }
        // si no existe un registro, estamos hablando de operaciones anteriores
        else {
            $errorsValidation = stockSuficiente($items, $pdo);
            if (empty($errorsValidation)) {
                try {
                    $pdo->beginTransaction();
                    $sql_insert_operacion_devolucion_sin_trazabilidad =
                        "INSERT INTO
                    operacion_devolucion (idNotCre, invSerFac, invNumFac, idReqEst, idOpeFacMot)
                    VALUES(?, ?, ?, ?, ?)";
                    $stmt_insert_operacion_devolucion_sin_trazabilidad = $pdo->prepare($sql_insert_operacion_devolucion_sin_trazabilidad);
                    $stmt_insert_operacion_devolucion_sin_trazabilidad->bindParam(1, $idCredNot, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion_sin_trazabilidad->bindParam(2, $invoice_serie, PDO::PARAM_STR);
                    $stmt_insert_operacion_devolucion_sin_trazabilidad->bindParam(3, $invoice_number, PDO::PARAM_STR);
                    $stmt_insert_operacion_devolucion_sin_trazabilidad->bindParam(4, $idReqEst, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion_sin_trazabilidad->bindParam(5, $idOpeFacMot, PDO::PARAM_INT);
                    $stmt_insert_operacion_devolucion_sin_trazabilidad->execute();

                    $idLastInsertion = $pdo->lastInsertId();

                    // recorremos cada item de la devolucion
                    foreach ($items as $item) {
                        $idProdt = $item["idProdt"]; // obtenemos informacion del producto
                        $refProdt = $item["product_reference"]; // referencia del produto
                        $cantidad = $item["quantity"]; // cantidad requerida
                        $esMerProm = $item["esMerProm"]; // es merma promocional
                        $esProFin = $item["esProFin"]; // es producto final

                        $sql_create_operacion_facturacion_detalle =
                            "INSERT INTO operacion_devolucion_detalle
                        (idOpeDev, idProdt, refProdt, canOpeDevDet, esMerProm, esProFin)
                        VALUES(?, ?, ?, $cantidad, ?, ?)";
                        $stmt_create_operacion_facturacion_detalle = $pdo->prepare($sql_create_operacion_facturacion_detalle);
                        $stmt_create_operacion_facturacion_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                        $stmt_create_operacion_facturacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                        $stmt_create_operacion_facturacion_detalle->bindParam(3, $refProdt, PDO::PARAM_STR);
                        $stmt_create_operacion_facturacion_detalle->bindParam(4, $esMerProm, PDO::PARAM_BOOL);
                        $stmt_create_operacion_facturacion_detalle->bindParam(5, $esProFin, PDO::PARAM_BOOL);
                        $stmt_create_operacion_facturacion_detalle->execute();
                    }

                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA OPERACION";
                    $description_error = $e->getMessage();
                }
            }

            // si se han encontrado errores en la validacion
            else {
                // formamos la data de string de errores de validacion
                $stringErrorsValidation = implode("\n", $errorsValidation);
                // enviamos el mensaje al cliente
                $message_error = "Error en la validacion";
                $description_error = $stringErrorsValidation;
                // terminamos la ejecucion del programa
                exit;
            }
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    echo json_encode($return);
}

function stockSuficiente(&$items, $pdo)
{
    $errors = []; // arreglo de errores

    foreach ($items as &$item) {
        $reference = $item["product_reference"]; // referencia del producto

        // consulta de producto stock en almacen
        $sql_consult_product =
            "SELECT p.id,
            p.esMerProm,
            p.esProFin
        FROM producto AS p
        WHERE p.codProd = ?";

        try {
            $stmt_consult_product = $pdo->prepare($sql_consult_product);
            $stmt_consult_product->bindParam(1, $reference, PDO::PARAM_STR);
            $stmt_consult_product->execute();

            $row = $stmt_consult_product->fetch(PDO::FETCH_ASSOC);

            // verificamos si se encontro el producto en almacen
            if ($row) {
                // le agregamos el idProdt a la informacion de cada item
                $item["idProdt"] = $row["id"];
                $item["esMerProm"] = $row["esMerProm"];
                $item["esProFin"] = $row["esProFin"];
            }
            // en caso no se encuentre el producto en almacen
            else {
                $message_error_producto_inexistente = "No se ha encontrado el producto $reference en la base de datos";
                array_push($errors, $message_error_producto_inexistente);
            }
        }
        // si hubo un problema en la consulta del producto en almacen
        catch (PDOException $e) {
            $message_error_database = "Hubo un problema al consultar el item $reference";
            array_push($errors, $message_error_database);
        }
    }
    return $errors;
}
