<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdc = $data["idProdc"]; // lote produccion
    $idProdt = $data["idProdt"]; // producto
    $idProdFin = $data["idProdFin"]; // referencia la producto final de produccion id
    $idProdDevMot = $data["idMotDev"]; // motivo de devolucion
    $canProdDev = floatval($data["canReqDevDet"]); // cantidad devuelta
    $nomProd = $data["nomProd"]; // producto
    $idReqDev = $data["idReqDev"]; // id de requisicion de devolucion
    $idReqDevDet = $data["id"]; // id de requisicion devolucion detalle
    $idAlm = 0; // id almacen

    if ($pdo) {
        switch ($idProdDevMot) {
                // si el motivo es faltante
            case 1:
                $idAlm = 1; // almacen principal
                break;
                // si el motivo es desmedro
            case 2:
                $idAlm = 7; // almacen de desmedros
                break;
                // si el motivo es excedente
            case 3:
                $idAlm = 1; // almacen principal
                break;
                // si el motivo es devolucion
            case 4:
                $idAlm = 1; // almacen principal
                break;
        }


        // si el motivo de devolucion no es desmedro
        if ($idProdDevMot != 2) {
            $salidasEmpleadas = []; // salidas empleadas
            /*
                Primero debemos identificar que entradas fueron utilizadas para
                cumplir con la requisicion del producto a devolver:

                1. Primero recorro las requisicion con idProdc
                2. Recorro las salidas de stock del idReq donde idProdt = ?
                3. Obtengo las salidas utilizadas para cumplir con idProdt = ?
                4. La devolucion tiene que ir a la ultima entrada utilizada porque se supone que el uso se hace de manera secuencial en el FIFO
                5. Creamos cada registro para la trazabilidad
                6. Fin del algoritmo
            */

            // primero debemos identificar si el producto final no fue programado
            $esProdcProdtProg = 1;

            $sql_select_presentacion_final =
                "SELECT esProdcProdtProg 
            FROM produccion_producto_final
            WHERE id = ?";
            $stmt_select_presentacion_final = $pdo->prepare($sql_select_presentacion_final);
            $stmt_select_presentacion_final->bindParam(1, $idProdFin, PDO::PARAM_INT);
            $stmt_select_presentacion_final->execute();

            $row_select = $stmt_select_presentacion_final->fetch(PDO::FETCH_ASSOC);
            if ($row_select !== false) {
                // Comprueba si es true o false (asumiendo que es un booleano en la base de datos)
                if ($row_select['esProdcProdtProg'] == 0) {
                    $esProdcProdtProg = 0;
                }
            }

            // debemos formar un sql adecuado para cada ocasion
            /*
                1. si el producto final fue algo programado, su requisicion se encuentra en requisicon
                2. si el producto final no fue programado y fue agregado se encuentra en requisicion agregacion
            */
            $sql_salidas_empleadas_requisicion_detalle = "";

            // si fue un producto programado
            if ($esProdcProdtProg == 1) {
                $sql_salidas_empleadas_requisicion_detalle =
                    "SELECT * FROM salida_stock st
                JOIN requisicion AS r ON r.id = st.idReq
                WHERE st.idProdt = ? AND r.idProdc = ?
                ORDER BY idEntSto DESC";
            }

            // si no fue un producto programado
            else {
                $sql_salidas_empleadas_requisicion_detalle =
                    "SELECT * FROM salida_stock st
                JOIN requisicion_agregacion AS ra ON ra.id = st.idAgre
                WHERE st.idProdt = ? AND ra.idProdc = ?
                ORDER BY idEntSto DESC";
            }

            try {
                $stmt_salidas_empleadas_requisicion_detalle = $pdo->prepare($sql_salidas_empleadas_requisicion_detalle);
                $stmt_salidas_empleadas_requisicion_detalle->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_salidas_empleadas_requisicion_detalle->bindParam(2, $idProdc, PDO::PARAM_INT);
                $stmt_salidas_empleadas_requisicion_detalle->execute();

                // recorremos las salidas y las ingresamos en las salidas utilizadas
                if ($stmt_salidas_empleadas_requisicion_detalle->rowCount() != 0) {
                    while ($row_salidas_empleadas = $stmt_salidas_empleadas_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                        array_push($salidasEmpleadas, $row_salidas_empleadas);
                    }

                    $cantidadAdevolver = $canProdDev; // acumulado
                    $cantSalPorIteracion = 0; // cantidad auxiliar
                    $idEntStoEst = 1; // estado de disponible de entrada

                    // ahora recorremos las salidas
                    foreach ($salidasEmpleadas as $value) {
                        $idEntSto = $value["idEntSto"]; // entrada
                        $canSalStoReq = $value["canSalStoReq"]; // cantidad

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

                        try {
                            $pdo->beginTransaction();
                            $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                            $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                            $stmt_update_entrada_stock->execute();

                            $sql_insert_trazabilidad_devolucion_entrada =
                                "INSERT INTO trazabilidad_devolucion_entrada
                                (idReqDevDet, idEntSto, canReqDevDet)
                                VALUES(?, ?, $cantSalPorIteracion)";
                            $stmt_insert_trazabilidad_devolucion_entrada = $pdo->prepare($sql_insert_trazabilidad_devolucion_entrada);
                            $stmt_insert_trazabilidad_devolucion_entrada->bindParam(1, $idReqDevDet, PDO::PARAM_INT);
                            $stmt_insert_trazabilidad_devolucion_entrada->bindParam(2, $idEntSto, PDO::PARAM_INT);
                            $stmt_insert_trazabilidad_devolucion_entrada->execute();

                            $pdo->commit();
                        } catch (PDOException $e) {
                            $pdo->rollBack();
                            $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                            $description_error = $e->getMessage();
                        }

                        if ($cantidadAdevolver == 0) {
                            break;
                        }
                    }
                } else {
                    $message_error = "No se genero las salidas del producto";
                    $description_error = $description_error . "No se generaron las salidas del producto de su requisicion: $nomProd" . "\n";
                }
            } catch (PDOException $e) {
                $message_error = "ERROR EN LA SELECCION DE SALIDAS";
                $description_error = $e->getMessage();
            }
        }

        if (empty($message_error)) {
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
        }

        // actualizamos los estados
        if (empty($message_error)) {
            try {
                // Iniciamos una transaccion
                $pdo->beginTransaction();
                // ACTUALIZAMOS EL ESTADO DE LA REQUISICION MOLIENDA DETALLE

                $esComReqDevDet = 1; // ESTADO DE COMPLETADO
                $total_requisiciones_detalle_no_completadas = 0;
                $sql_consulta_requisicion_detalle =
                    "SELECT * FROM requisicion_devolucion_detalle
                    WHERE idReqDev = ? AND esComReqDevDet <> ?";
                $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
                $stmt_consulta_requisicion_detalle->bindParam(1, $idReqDev, PDO::PARAM_INT);
                $stmt_consulta_requisicion_detalle->bindParam(2, $esComReqDevDet, PDO::PARAM_BOOL);
                $stmt_consulta_requisicion_detalle->execute();

                $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

                $idReqEst = 0; // inicializacion

                if ($total_requisiciones_detalle_no_completadas === 1) { // si no hay requisiciones detalle pendientes
                    $idReqEst = 3; // COMPLETADO
                } else {
                    $idReqEst = 2; // EN PROCESO
                }

                // PRIMERO ACTUALIZAMOS EL DETALLE
                $sql_update_requisicion_detalle =
                    "UPDATE requisicion_devolucion_detalle
                    SET esComReqDevDet = ?
                    WHERE id = ?";
                $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
                $stmt_update_requisicion_detalle->bindParam(1, $esComReqDevDet, PDO::PARAM_BOOL);
                $stmt_update_requisicion_detalle->bindParam(2, $idReqDevDet, PDO::PARAM_INT);
                $stmt_update_requisicion_detalle->execute();

                // LUEGO ACTUALIZAMOS EL MAESTRO
                if ($idReqEst == 3) {
                    // obtenemos la fecha actual
                    $fecComReqDev = date('Y-m-d H:i:s');
                    $sql_update_requisicion_completo =
                        "UPDATE requisicion_devolucion
                    SET idReqEst = ?, fecComReqDev = ?
                    WHERE id = ?";
                    $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                    $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                    $stmt_update_requisicion_completo->bindParam(2, $fecComReqDev);
                    $stmt_update_requisicion_completo->bindParam(3, $idReqDev, PDO::PARAM_INT);
                    $stmt_update_requisicion_completo->execute();
                } else {
                    $sql_update_requisicion =
                        "UPDATE requisicion_devolucion
                    SET idReqEst = ?
                    WHERE id = ?";
                    $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                    $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                    $stmt_update_requisicion->bindParam(2, $idReqDev, PDO::PARAM_INT);
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
