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
    $idGuiRem = $data["idRefGui"]; // identificador de guia de remision
    $invoice_serie = $data["invoice_serie"]; // serie
    $invoice_number = $data["invoice_number"]; // numero
    $address_destination_id = $data["address_destination_id"]; // direccion de destino
    $items = $data["items"]; // arreglo de items

    /* Vamos a describir el procedimiento de procesamiento de guia de remision
    1. Primero debemos validar que las cantidades especificadas en los items se encuentren en stock
    2. Una vez validado, enviamos el resultado de la validacion al cliente
    3. Si no hay stock para cualquier producto, se prepara el mensaje detallado y se envia al frontend
    */
    if ($pdo) {

        $errorsValidation = stockSuficiente($items, $pdo);
        // si no se han encontrado errores en la validacion

        if (empty($errorsValidation)) {

            /* Ejecutamos la siguiente secuencia de pasos
                    1. Primero creamos la operacion facturacion, indicar motivo
                    2. Obtenemos el id de la ultima inserción
                    3. Aplicamos el FIFO de los items
                */

            $idOpeFacMot = 1; // motivo salida de GRE
            $idLastInsertion = 0; // id de la utlima insercion
            $idReqEst = 1;

            try {
                $pdo->beginTransaction(); // iniciamos una operacion de transaccion
                // si el tipo de serie es T007
                if ($invoice_serie == "T007") {
                    // creamos un registro en orden de irradiacion
                    $sql_insert_orden_irradiacion =
                        "INSERT INTO orden_irradiacion (idGuiRem, invSerFac, invNumFac, idOrdIrraEst)
                    VALUES (?, ?, ?, ?)";
                    $stmt_insert_orden_irradiacion = $pdo->prepare($sql_insert_orden_irradiacion);
                    $stmt_insert_orden_irradiacion->bindParam(1, $idGuiRem, PDO::PARAM_INT);
                    $stmt_insert_orden_irradiacion->bindParam(2, $invoice_serie, PDO::PARAM_STR);
                    $stmt_insert_orden_irradiacion->bindParam(3, $invoice_number, PDO::PARAM_STR);
                    $stmt_insert_orden_irradiacion->bindParam(4, $idReqEst, PDO::PARAM_INT);
                    $stmt_insert_orden_irradiacion->execute();

                    // 2. Obtenemos el id de la ultima insercion
                    $idLastInsertion = $pdo->lastInsertId();

                    foreach ($items as $item) {
                        $idProdt = $item["idProdt"]; // obtenemos informacion del producto
                        $refProdt = $item["product_reference"]; // referencia del produto
                        $cantidad = $item["quantity"]; // cantidad requerida

                        $sql_insert_orden_irradiacion_detalle =
                            "INSERT INTO orden_irradiacion_detalle (idOpeIrra, idProdt, refProdt, canOpeIrra)
                            VALUES(?, ?, ?, $cantidad)";
                        $stmt_insert_orden_irradiacion_detalle = $pdo->prepare($sql_insert_orden_irradiacion_detalle);
                        $stmt_insert_orden_irradiacion_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                        $stmt_insert_orden_irradiacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                        $stmt_insert_orden_irradiacion_detalle->bindParam(3, $refProdt, PDO::PARAM_STR);
                        $stmt_insert_orden_irradiacion_detalle->execute();
                    }
                    // commit de las consultas
                    $pdo->commit();
                } else {
                    // si no tiene como destino PUNTA NEGRA
                    if ($address_destination_id != 89) {
                        // 1. primero realizamos la insercion de la operacion de factura
                        $sql_insert_operacion_facturacion =
                            "INSERT INTO operacion_facturacion (idGuiRem, idOpeFacMot, invSerFac, invNumFac, idReqEst)
                        VALUES (?, ?, ?, ?, ?, ?)";
                        $stmt_insert_operacion_facturacion = $pdo->prepare($sql_insert_operacion_facturacion);
                        $stmt_insert_operacion_facturacion->bindParam(1, $idGuiRem, PDO::PARAM_INT);
                        $stmt_insert_operacion_facturacion->bindParam(2, $idOpeFacMot, PDO::PARAM_INT);
                        $stmt_insert_operacion_facturacion->bindParam(3, $invoice_serie, PDO::PARAM_STR);
                        $stmt_insert_operacion_facturacion->bindParam(4, $invoice_number, PDO::PARAM_STR);
                        $stmt_insert_operacion_facturacion->bindParam(5, $idReqEst, PDO::PARAM_INT);
                        $stmt_insert_operacion_facturacion->execute();

                        // 2. Obtenemos el id de la ultima insercion
                        $idLastInsertion = $pdo->lastInsertId();

                        foreach ($items as $item) {
                            $idProdt = $item["idProdt"]; // obtenemos informacion del producto
                            $refProdt = $item["product_reference"]; // referencia del produto
                            $cantidad = $item["quantity"]; // cantidad requerida
                            $esMerProm = $item["esMerProm"]; // es merma promocional
                            $esProFin = $item["esProFin"]; // es producto final

                            $sql_create_operacion_facturacion_detalle =
                                "INSERT INTO operacion_facturacion_detalle
                            (idOpeFac, idProdt, refProdt, canOpeFacDet, esMerProm, esProFin)
                            VALUES(?, ?, ?, $cantidad, ?, ?)";
                            $stmt_create_operacion_facturacion_detalle = $pdo->prepare($sql_create_operacion_facturacion_detalle);
                            $stmt_create_operacion_facturacion_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                            $stmt_create_operacion_facturacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt_create_operacion_facturacion_detalle->bindParam(3, $refProdt, PDO::PARAM_STR);
                            $stmt_create_operacion_facturacion_detalle->bindParam(4, $esMerProm, PDO::PARAM_BOOL);
                            $stmt_create_operacion_facturacion_detalle->bindParam(5, $esProFin, PDO::PARAM_BOOL);
                            $stmt_create_operacion_facturacion_detalle->execute();
                        }
                        // commit de las consultas
                        $pdo->commit();
                    }
                }
            } catch (PDOException $e) {
                $pdo->rollBack();
                $message_error = "Hubo un error al realizar la operacion";
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
    } else {
        $message_error = "Error en la conexion";
        $description_error = "No se pudo conectar con la base de datos a través de PDO";
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
