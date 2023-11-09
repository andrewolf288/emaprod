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
    $items = $data["items"]; // arreglo de items

    /* Vamos a describir el procedimiento de procesamiento de guia de remision
    1. Primero debemos validar que las cantidades especificadas en los items se encuentren en stock
    2. Una vez validado, enviamos el resultado de l validacion al cliente
    3. Si no hay stock para cualquier producto, se prepara el mensaje detallado y se envia al frontend

    */
    $errorsValidation = stockSuficiente($items, $pdo);
    // si no se han encontrado errores en la validacion
    if (empty($errorsValidation)) {
        // debemos informarle al cliente que hay stock disponible y que continue con su ejecucion
        // enviamos el mensaje al cliente
        echo json_encode(["message_error" => "", "description_error" => ""]);
        // enviar los datos al cliente
        flush();

        /* Ejecutamos la siguiente secuencia de pasos
            1. Primero creamos la operacion facturacion, indicar motivo
            2. Obtenemos el id de la ultima inserción
            3. Aplicamos el FIFO de los items
        */

        $pdo->beginTransaction(); // iniciamos una operacion de transaccion

        $idOpeFacMot = 1; // motivo salida de GRE
        $esSal = 1; // es una operaicon de saida
        $idLastInsertion = 0; // id de lautlima insercion

        // 1. primero realizamos la insercion de la operacion de factura
        $sql_insert_operacion_facturacion =
            "INSERT INTO operacion_facturacion (idGuiRem, idOpeFacMot, esSal)
        VALUES (?, ?, ?)";
        try {
            $stmt_insert_operacion_facturacion = $pdo->prepare($sql_insert_operacion_facturacion);
            $stmt_insert_operacion_facturacion->bindParam(1, $idGuiRem, PDO::PARAM_INT);
            $stmt_insert_operacion_facturacion->bindParam(2, $idOpeFacMot, PDO::PARAM_INT);
            $stmt_insert_operacion_facturacion->bindParam(3, $esSal, PDO::PARAM_BOOL);
            $stmt_insert_operacion_facturacion->execute();

            // 2. Obtenemos el id de la ultima insercion
            $idLastInsertion = $pdo->lastInsertId();

            // 3. Aplicamos el FIFO de los items
            $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS

            foreach ($items as $item) {
                $idProdt = $item["item"]; // obtenemos informacion del producto
                $refProdt = $item["reference"]; // referencia del produto
                $cantidad = $item["quantity"]; // cantidad requerida
                $array_entradas_disponibles = []; // arreglo de entradas disponibles

                $sql_consult_entradas_disponibles =
                    "SELECT
                es.id,
                es.codEntSto,
                es.refNumIngEntSto,
                DATE(es.fecEntSto) AS fecEntSto,
                es.canTotDis
                FROM entrada_stock AS es
                WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0
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

                    if (!empty($array_entradas_disponibles)) {
                        $entradasUtilizadas = []; // entradas utilizadas
                        $cantidad_faltante = $cantidad; // cantidad total faltante
                        /* 
                            1. Si la cantidad disponible de la entrada es mayor o igual a lo solicitado:
                            Se procede a realizar el descuento
                        */
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
                            $sql = "";
                            foreach ($entradasUtilizadas as $item) {
                                try {
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
                                        refProdc
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

                                    // sentencia sql
                                    $sql =
                                        "INSERT
                                    salida_operacion_facturacion
                                    (idOpeFac, refProdt, idProdt, idEntSto, idProdc, codLotProd, canSalOpeFac)
                                    VALUES (?, ?, ?, ?, ?, ?, $canSalStoReq)";

                                    $stmt = $pdo->prepare($sql);
                                    $stmt->bindParam(1, $idLastInsertion, PDO::PARAM_INT); // id de la operacion facturacion
                                    $stmt->bindParam(2, $refProdt, PDO::PARAM_STR);
                                    $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                                    $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                                    $stmt->bindParam(5, $refProdc, PDO::PARAM_INT);
                                    $stmt->bindParam(6, $codLot, PDO::PARAM_STR);

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
                                } catch (PDOException $e) {
                                    $message_error = "ERROR INTERNO SERVER: fallo en insercion de salidas";
                                    $description_error = $e->getMessage();
                                }
                            }
                        }
                    } else {
                        $message_error = "No hay entradas disponibles";
                        $description_error = "No hay entradas disponibles para el producto del detalle";
                    }
                } catch (PDOException $e) {
                }
            }

            $pdo->commit();
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
        echo json_encode(["message_error" => "Error en la validacion", "description_error" => $stringErrorsValidation]);
        // enviar los datos al cliente
        flush();
        // terminamos la ejecucion del programa
        exit;
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    echo json_encode($return);
}

function stockSuficiente($items, $pdo)
{
    $idAlm = 1; // almacen principal
    $errors = []; // arreglo de errores

    foreach ($items as $item) {
        $reference = $item["reference"]; // referencia del producto
        $cantidad = $item["quantity"]; // cantidad requerida

        // consulta de producto stock en almacen
        $sql_consult_stock_almacen =
            "SELECT als.canSto, als.idProd
        FROM almacen_stock AS als
        JOIN producto AS p ON p.id = als.idProd
        WHERE p.codProd = ? AND als.idAlm = ?";

        try {
            $stmt_consult_stock_almacen = $pdo->prepare($sql_consult_stock_almacen);
            $stmt_consult_stock_almacen->bindParam(1, $reference, PDO::PARAM_STR);
            $stmt_consult_stock_almacen->bindParam(2, $idAlm, PDO::PARAM_INT);
            $stmt_consult_stock_almacen->execute();

            $row = $stmt_consult_stock_almacen->fetch(PDO::FETCH_ASSOC);

            // verificamos si se encontro el producto en almacen
            if ($row) {
                $cantidadConsult = $row["canSto"]; // cantidad consultada
                $idProdt = $row["idProdt"]; // producto consultado

                // si la cantidad requerida es mayor a la que se encuentra en stock
                if ($cantidadConsult < $cantidad) {
                    $cantidadFaltante = $cantidad - $cantidadConsult;
                    $message_error_faltante_stock = "Falta stock en el item $reference: $cantidadFaltante";
                    array_push($errors, $message_error_faltante_stock);
                }

                // le agregamos el idProdt a la informacion de cada item
                $item["idProdt"] = $idProdt;
            }
            // en caso no se encuentre el producto en almacen
            else {
                $message_error_producto_inexistente = "No se ha encontrado el item $reference en almacen";
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
