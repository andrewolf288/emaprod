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

    $detDevLotProd = $data["detDevLotProd"];

    if ($pdo) {

        /*
        EN LAS DEVOLUCIONES TENEMOS 2 OPCIONES
        1.- DEVOLUCION DE DESMEDRO (NO GENERA ENTRADAS INTERINAS)
        2.- DEVOLUCION DE SOBRANTE (GENERA ENTRADA INTERINA)
        */
        $idAlm = 0; // Almacen destino

        foreach ($detDevLotProd as $value) {
            $idProdc = $value["idProdc"]; // lote produccion
            $idProdt = $value["idProdt"]; // producto
            $idProdDevMot = $value["idProdDevMot"]; // motivo de devolucion
            $canProdDev = $value["canProdDev"]; // cantidad devuelta
            $nomProd = $value["nomProd"]; // nombre del producto
            $idMed = $value["idMed"]; // medida del producto

            // obtenemos el almacen de destino
            switch ($idProdDevMot) {
                case 1: // sobrantes de requisicion
                    $idAlm = 1; // almacen principal
                    break;
                case 2: // desmedros de produccion
                    $idAlm = 7; // almacen de desmedros
                    break;
                default:
                    $idAlm = 1; // almacen principal
            }

            if ($idProdDevMot != 2) {

                $salidasEmpleadas = []; // salidas empleadas
                $totalRequisicionProducto = 0; // total de la requisicion inicial

                /*
                Primero debemos identificar que entradas fueron utilizadas para
                cumplir con la requisicion del producto a devolver:

                1. Primero recorro las requisicion con idProdc
                2. Recorro las salidas de stock del idReq donde idProdt = ?
                3. Obtengo las salidas utilizadas para cumplir con idProdt = ?
                4. Realizamos el prorrateo con la cantidad devuelta y lo utilzado
                en cada salida
                5. Creamos cada registro para la trazabilidad
                6. Fin del algoritmo
                */

                $sql_salidas_empleadas_requisicion_detalle =
                    "SELECT * 
                    FROM salida_stock st
                    JOIN requisicion AS r ON r.id = st.idReq
                    WHERE st.idProdt = ? AND r.idProdc = ?";

                try {

                    
                    $stmt_salidas_empleadas_requisicion_detalle = $pdo->prepare($sql_salidas_empleadas_requisicion_detalle);
                    $stmt_salidas_empleadas_requisicion_detalle->bindParam(1, $idProdt, PDO::PARAM_INT);
                    $stmt_salidas_empleadas_requisicion_detalle->bindParam(2, $idProdc, PDO::PARAM_INT);
                    $stmt_salidas_empleadas_requisicion_detalle->execute();

                    //while ($row_salidas_empleadas = $stmt_salidas_empleadas_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                    //    array_push($salidasEmpleadas, $row_salidas_empleadas);
                    //    $totalRequisicionProducto += $row_salidas_empleadas["canSalStoReq"];
                    //}
                    //die(json_encode($salidasEmpleadas));
                    

                    if ($stmt_salidas_empleadas_requisicion_detalle->rowCount() != 0) {

                        while ($row_salidas_empleadas = $stmt_salidas_empleadas_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                            array_push($salidasEmpleadas, $row_salidas_empleadas);
                            $totalRequisicionProducto += $row_salidas_empleadas["canSalStoReq"];
                        }

                       // die(json_encode($salidasEmpleadas));


                        $idLastInsertion = 0;
                        $sql_insert_detalle_devolucion_lote_produccion =
                            "INSERT INTO produccion_devolucion
                            (idProdc, idProdt, idAlm, idProdDevMot, canProdDev)
                            VALUES (?, ?, ?, ?, $canProdDev)";

                        try {
                            $stmt_insert_detalle_devolucion_lote_produccion = $pdo->prepare($sql_insert_detalle_devolucion_lote_produccion);
                            $stmt_insert_detalle_devolucion_lote_produccion->bindParam(1, $idProdc, PDO::PARAM_INT);
                            $stmt_insert_detalle_devolucion_lote_produccion->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt_insert_detalle_devolucion_lote_produccion->bindParam(3, $idAlm, PDO::PARAM_INT);
                            $stmt_insert_detalle_devolucion_lote_produccion->bindParam(4, $idProdDevMot, PDO::PARAM_INT);
                            $stmt_insert_detalle_devolucion_lote_produccion->execute();

                            // obtenemos el id de la insercion
                            $idLastInsertion = $pdo->lastInsertId();

                            // recorremos las salidas empleadas
                            foreach ($salidasEmpleadas as $value) {
                                $idEntSto = $value["idEntSto"]; // entrada
                                $idReq = $value["idReq"]; // requisicion
                                $canSalStoReq = $value["canSalStoReq"]; // cantidad

                                // REALIZAMOS EL PRORRATEO
                                if ($idMed == 1 || $idMed == 2) {
                                    // prorratero de KG y LT
                                    $prorrateo = round((($canProdDev * $canSalStoReq) / $totalRequisicionProducto), 3);
                                } else {
                                    // prorrateo de UND, DP, ETC (todas las unidades)
                                    $prorrateo = round((($canProdDev * $canSalStoReq) / $totalRequisicionProducto));
                                }

                                // ACTUALIZAMOS LA ENTRADA
                                $idEntStoEst = 1; // disponible

                                $sql_update_entrada_stock =
                                    "UPDATE entrada_stock
                                    SET canTotDis = canTotDis + $prorrateo, idEntStoEst = ?
                                    WHERE id = ?";

                                try {
                                    $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                                    $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                                    $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                                    $stmt_update_entrada_stock->execute();

                                    // GENERAMOS EL REGISTRO
                                    $sql_insert_producto_devolucion_trazabilidad =
                                        "INSERT INTO producto_devolucion_trazabilidad
                                        (idProdDev, idEntSto, canProdDevTra)
                                        VALUE(?, ?, $prorrateo)";

                                    try {
                                        $stmt_insert_producto_devolucion_trazabilidad = $pdo->prepare($sql_insert_producto_devolucion_trazabilidad);
                                        $stmt_insert_producto_devolucion_trazabilidad->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                                        $stmt_insert_producto_devolucion_trazabilidad->bindParam(2, $idEntSto, PDO::PARAM_INT);
                                        $stmt_insert_producto_devolucion_trazabilidad->execute();
                                    } catch (PDOException $e) {
                                        $message_error = "ERROR EN LA CREACION DE LA TRAZABILIDAD";
                                        $description_error = $e->getMessage();
                                    }
                                } catch (PDOException $e) {
                                    $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                                    $description_error = $e->getMessage();
                                }
                            }

                            // AHORA ACTUALIZAMOS EL STOCK FINAL
                            // primero consultamos si existe ese almacen stock
                            $sql_consult_almacen_stock =
                                "SELECT * FROM almacen_stock
                                    WHERE idProd = ? AND idAlm = ?";
                            try {
                                $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
                                $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                                $stmt_consult_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                                $stmt_consult_almacen_stock->execute();

                                if ($stmt_consult_almacen_stock->rowCount() === 1) {
                                    // ACTUALIZAMOS
                                    $sql_update_almacen_stock =
                                        "UPDATE almacen_stock 
                                            SET canSto = canSto + $canProdDev, canStoDis = canStoDis + $canProdDev
                                            WHERE idProd = ? AND idAlm = ?";

                                    try {
                                        $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                                        $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                                        $stmt_update_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                                        $stmt_update_almacen_stock->execute();
                                    } catch (PDOException $e) {
                                        $message_error = "ERROR EN LA ACTUALIZACION DEL ALMACEN STOCK";
                                        $description_error = $e->getMessage();
                                    }
                                } else {
                                    // CREAMOS
                                    $sql_insert_almacen_stock =
                                        "INSERT INTO almacen_stock
                                            (idProd, idAlm, canSto, canStoDis)
                                            VALUES(?, ?, $canProdDev, $canProdDev)";

                                    try {
                                        $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                                        $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                                        $stmt_insert_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                                        $stmt_insert_almacen_stock->execute();
                                    } catch (PDOException $e) {
                                        $message_error = "ERROR EN LA INSERCION DEL ALMACEN STOCK";
                                        $description_error = $e->getMessage();
                                    }
                                }
                            } catch (PDOException $e) {
                                $message_error = "ERROR EN LA CONSULTA DEL ALMACEN STOCK";
                                $description_error = $e->getMessage();
                            }
                        } catch (PDOException $e) {
                            $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                            $description_error = $e->getMessage();
                        }
                    } else {
                        $message_error = "No se genero las salidas del producto";
                        $description_error = $description_error . "No se generaron las salidas del producto: $nomProd" . "\n";
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR EN LA SELECCION DE SALIDAS";
                    $description_error = $e->getMessage();
                }
            }
            // cuando es por desmedro
            else {
                // insertamos la devolucion de desmedro
                $sql_insert_detalle_devolucion_lote_produccion =
                    "INSERT INTO produccion_devolucion
                (idProdc, idProdt, idAlm, idProdDevMot, canProdDev)
                VALUES (?, ?, ?, ?, $canProdDev)";

                try {
                    $stmt_insert_detalle_devolucion_lote_produccion = $pdo->prepare($sql_insert_detalle_devolucion_lote_produccion);
                    $stmt_insert_detalle_devolucion_lote_produccion->bindParam(1, $idProdc, PDO::PARAM_INT);
                    $stmt_insert_detalle_devolucion_lote_produccion->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_insert_detalle_devolucion_lote_produccion->bindParam(3, $idAlm, PDO::PARAM_INT);
                    $stmt_insert_detalle_devolucion_lote_produccion->bindParam(4, $idProdDevMot, PDO::PARAM_INT);
                    $stmt_insert_detalle_devolucion_lote_produccion->execute();

                    // primero consultamos si existe ese almacen stock
                    $sql_consult_almacen_stock =
                        "SELECT * FROM almacen_stock
                        WHERE idProd = ? AND idAlm = ?";
                    try {
                        $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
                        $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->execute();

                        if ($stmt_consult_almacen_stock->rowCount() === 1) {
                            // ACTUALIZAMOS
                            $sql_update_almacen_stock =
                                "UPDATE almacen_stock 
                                SET canSto = canSto + $canProdDev, canStoDis = canStoDis + $canProdDev
                                WHERE idProd = ? AND idAlm = ?";

                            try {
                                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                                $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                                $stmt_update_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                                $stmt_update_almacen_stock->execute();
                            } catch (PDOException $e) {
                                $message_error = "ERROR EN LA ACTUALIZACION DEL ALMACEN STOCK";
                                $description_error = $e->getMessage();
                            }
                        } else {
                            // CREAMOS
                            $sql_insert_almacen_stock =
                                "INSERT INTO almacen_stock
                                (idProd, idAlm, canSto, canStoDis)
                                VALUES(?, ?, $canProdDev, $canProdDev)";

                            try {
                                $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                                $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                                $stmt_insert_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                                $stmt_insert_almacen_stock->execute();
                            } catch (PDOException $e) {
                                $message_error = "ERROR EN LA INSERCION DEL ALMACEN STOCK";
                                $description_error = $e->getMessage();
                            }
                        }
                    } catch (PDOException $e) {
                        $message_error = "ERROR EN LA CONSULTA DEL ALMACEN STOCK";
                        $description_error = $e->getMessage();
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR EN LA INSERCION DE LA PRODUCCION DEVOLUCION";
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
