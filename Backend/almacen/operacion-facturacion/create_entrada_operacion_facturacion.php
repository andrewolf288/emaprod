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
    $items = $data["items"]; // items

    if ($pdo) {
        $idOpeFac = 0; // id de la operacion de salida de facturacion de GR

        if ($idRefGui === 0) {
            echo json_encode(["message_error" => "No se proporciono la GR", "description_error" => "No se proporciono la GR: $idRefGui"]);
        } else {
            $idOpeFacMot = 1; // motivo de salida de guia de remision
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
                }

                // insertamos la operacion facturacion
                $sql_insert_operacion_facturacion =
                    "INSERT INTO operacion_facturacion (idGuiRem, idNotCre, idOpeFacMot, esEnt)
                VALUES (?, ?, ?, ?)";
                try {
                    $pdo->beginTransaction();
                    $stmt_insert_operacion_facturacion = $pdo->prepare($sql_insert_operacion_facturacion);
                    $stmt_insert_operacion_facturacion->bindParam(1, $idRefGui, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->bindParam(2, $idCredNot, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->bindParam(3, $idOpeFacMot, PDO::PARAM_INT);
                    $stmt_insert_operacion_facturacion->bindParam(4, $esEnt, PDO::PARAM_BOOL);
                    $stmt_insert_operacion_facturacion->execute();

                    $idLastInsertion = $pdo->lastInsertId();

                    // CODIGO PARA DEVOLUCION POR ITEM
                    if ($idMot === 54) {
                        // recorremos cada item de la devolucion
                        foreach ($items as $item) {
                            $reference = $item["product_reference"];
                            $quantity = $item["quantity"];
                            $salidas_producto = array();

                            $sql_select_salida_producto =
                                "SELECT * FROM salida_operacion_facturacion
                            WHERE idOpeFac = ? AND refProdt = ? ORDER BY id DESC";
                            $stmt_select_salida_producto = $pdo->prepare($sql_select_salida_producto);
                            $stmt_select_salida_producto->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                            $stmt_select_salida_producto->bindParam(2, $reference, PDO::PARAM_STR);
                            $stmt_select_salida_producto->execute();

                            $salidas_producto = $stmt_select_salida_producto->fetchAll(PDO::FETCH_ASSOC);

                            // si las salidas de productos no esta vacia
                            if (!empty($salidas_producto)) {

                                $cantidadAdevolver = $quantity; // acumulado
                                $cantSalPorIteracion = 0; // cantidad auxiliar
                                $idEntStoEst = 1; // estado de disponible de entrada

                                foreach ($salidas_producto as $value) {
                                    $idEntSto = $value["idEntSto"]; // entrada
                                    $canSalStoReq = $value["canSalOpeFac"]; // cantidad
                                    $idProdt = $value["idProdt"]; // producto
                                    $refProdt = $value["refProdt"]; // referencia
                                    $idProdc = $value["idProdc"]; // produccion
                                    $codLotProd = $value["codLotProd"]; // codigo de lote

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

                                    // luego actualizamos el stock del almacen principal
                                    $idAlm = 1; // almacen principal

                                    $sql_update_almacen_stock =
                                        "UPDATE almacen_stock
                                        SET canSto = canSto + $cantSalPorIteracion, canStoDis = canStoDis + $cantSalPorIteracion
                                        WHERE idAlm = ? AND idProd = ?";
                                    $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                                    $stmt_update_almacen_stock->bindParam(1, $idAlm, PDO::PARAM_INT);
                                    $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                                    $stmt_update_almacen_stock->execute();

                                    // realizamos una insercion de registro de entrada a almacen
                                    $sql_insert_entrada_operacion_facturacion =
                                        "INSERT INTO 
                                        entrada_operacion_facturacion (idOpeFac, refProdt, idProdt, idEntSto, idProdc, codLotProd, canEntOpeFac)
                                        VALUES (?, ?, ?, ?, ?, ?, $cantSalPorIteracion)";
                                    $stmt_insert_entrada_operacion_facturacion = $pdo->prepare($sql_insert_entrada_operacion_facturacion);
                                    $stmt_insert_entrada_operacion_facturacion->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                                    $stmt_insert_entrada_operacion_facturacion->bindParam(2, $refProdt, PDO::PARAM_STR);
                                    $stmt_insert_entrada_operacion_facturacion->bindParam(3, $idProdt, PDO::PARAM_INT);
                                    $stmt_insert_entrada_operacion_facturacion->bindParam(4, $idEntSto, PDO::PARAM_INT);
                                    $stmt_insert_entrada_operacion_facturacion->bindParam(5, $idProdc, PDO::PARAM_INT);
                                    $stmt_insert_entrada_operacion_facturacion->bindParam(6, $codLotProd, PDO::PARAM_STR);
                                    $stmt_insert_entrada_operacion_facturacion->execute();

                                    if ($cantidadAdevolver == 0) {
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        $sql_select_salidas_operacion =
                            "SELECT * FROM salida_operacion_facturacion
                            WHERE idOpeFac = ?";
                        $stmt_select_salidas_operacion = $pdo->prepare($sql_select_salidas_operacion);
                        $stmt_select_salidas_operacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                        $stmt_select_salidas_operacion->execute();

                        while ($row_salidas_operacion = $stmt_select_salidas_operacion->fetch(PDO::FETCH_ASSOC)) {
                            $refProdt = $row_salidas_operacion["refProdt"]; // referencia
                            $idProdt = $row_salidas_operacion["idProdt"]; // producto
                            $idEntSto = $row_salidas_operacion["idEntSto"]; // entrada stock
                            $idProdc = $row_salidas_operacion["idProdc"]; // produccion
                            $codLotProd = $row_salidas_operacion["codLotProd"]; // codigo de lote
                            $canSalOpeFac = $row_salidas_operacion["canSalOpeFac"]; // cantidad salida

                            // primero hacemos el retorno a la entrada correspondiente
                            $idEntStoEst = 1; // disponible

                            $sql_update_entrada_stock =
                                "UPDATE entrada_stock 
                                SET canTotDis = canTotDis + $canSalOpeFac, idEntStoEst = ? 
                                WHERE id = ?";
                            $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                            $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->execute();

                            // luego actualizamos el stock del almacen principal
                            $idAlm = 1; // almacen principal

                            $sql_update_almacen_stock =
                                "UPDATE almacen_stock
                                SET canSto = canSto + $canSalOpeFac, canStoDis = canStoDis + $canSalOpeFac
                                WHERE idAlm = ? AND idProd = ?";
                            $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                            $stmt_update_almacen_stock->bindParam(1, $idAlm, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->execute();

                            // realizamos una insercion de registro de entrada a almacen
                            $sql_insert_entrada_operacion_facturacion =
                                "INSERT INTO 
                                entrada_operacion_facturacion (idOpeFac, refProdt, idProdt, idEntSto, idProdc, codLotProd, canEntOpeFac)
                                VALUES (?, ?, ?, ?, ?, ?, $canSalOpeFac)";
                            $stmt_insert_entrada_operacion_facturacion = $pdo->prepare($sql_insert_entrada_operacion_facturacion);
                            $stmt_insert_entrada_operacion_facturacion->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                            $stmt_insert_entrada_operacion_facturacion->bindParam(2, $refProdt, PDO::PARAM_STR);
                            $stmt_insert_entrada_operacion_facturacion->bindParam(3, $idProdt, PDO::PARAM_INT);
                            $stmt_insert_entrada_operacion_facturacion->bindParam(4, $idEntSto, PDO::PARAM_INT);
                            $stmt_insert_entrada_operacion_facturacion->bindParam(5, $idProdc, PDO::PARAM_INT);
                            $stmt_insert_entrada_operacion_facturacion->bindParam(6, $codLotProd, PDO::PARAM_STR);
                            $stmt_insert_entrada_operacion_facturacion->execute();
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
                echo json_encode(["message_error" => $message_error, "description_error" => $description_error]);
            } else {
                echo json_encode(["message_error" => "No se registro la GR", "description_error" => "No se registro ninguna salida de almacen o la operacion ya fue afectada con la guia: $idRefGui"]);
            }
        }
    } else {
        echo json_encode(["message_error" => "Error en la conexion", "description_error" => "No se pudo conectar con la base de datos a través de PDO"]);
    }
}
