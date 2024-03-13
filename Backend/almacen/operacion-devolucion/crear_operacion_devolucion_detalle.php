<?php
// CON ESTE SCRIPT VAMOS A REALIZAR EL CUMPLIMIENTO DE UNA OPERACION DE DEVOLUCION
/*
    1. EL SCRIPT DEBE VERIFICAR SI LA OPCION MARCADA ES:
        a. RETORNO A STOCK
            i. se debe verificar el detalle de lotes de salida (IMPORTANTE: siempre se sabra de donde salio)
            segun la información de salida registrada en movimiento_operacion_facturacion
            ii. se registra en movimiento_operacion_devolucion los retornos correspondientes
        b. NO RETORNO A STOCK
            i. Por cada detalle de la nota de credito debemos crear un registro en operacion_devolucion_calidad
            
*/
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeDev = $data["id"]; // id operacion devolucion
    $idGuiRem = $data["idGuiRem"]; // id de guia de remision
    $idOpeFacMot = $data["idOpeFacMot"]; // id operacion motivo
    $esRet = $data["esRet"]; // indica si es de retorno
    $esOpeFacExi = $data["esOpeFacExi"]; // indica si existe o no el registro
    $detOpeDev = $data["detOpeDev"]; // detalle de devolucion
    $idAlmacenPrincipal = 1; // almacen principal
    $fecDateNow = date('Y-m-d H:i:s');

    // si no es de retorno
    if ($esRet == 0) {
        /* 
            SE DEBE CREAR OPERACIONES DE REPROCESO EN EL LADO DE CALIDAD
        */
        try {
            $pdo->beginTransaction();
            foreach ($detOpeDev as $detalleDevolucion) {
                $idOpeDevDet = $detalleDevolucion["id"];

                $sql_create_operacion_devolucion_calidad =
                    "INSERT INTO operacion_devolucion_calidad 
                (idOpeDev, idOpeDevDet)
                VALUES(?, ?)";
                $stmt_create_operacion_devolucion_calidad = $pdo->prepare($sql_create_operacion_devolucion_calidad);
                $stmt_create_operacion_devolucion_calidad->bindParam(1, $idOpeDev, PDO::PARAM_INT);
                $stmt_create_operacion_devolucion_calidad->bindParam(2, $idOpeDevDet, PDO::PARAM_INT);
                $stmt_create_operacion_devolucion_calidad->execute();
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "ERROR EN LA OPERACION";
            $description_error = $e->getMessage();
        }
    } else {
        /*
            CASO 1: SI HAY TRAZABILIDAD
                a. Es devolucion por items
                b. Es devolucion completa por anulacion o devolucion
            CASO 2: SI NO HAY TRAZABILIDAD
                a. Se ejecuta las caracteristicas indicadas en el frontend con cada detalle
        */

        // SI HAY TRAZABILIDAD
        if ($esOpeFacExi == 1) {
            // BUSCAMOS LA REFERENCIA A SU SALIDA DE VENTAS
            $sql_select_operacion_facturacion =
                "SELECT id, idReqEst, invSerFac, invNumFac FROM operacion_facturacion
            WHERE idGuiRem = ?";
            $stmt_select_operacion_facturacion = $pdo->prepare($sql_select_operacion_facturacion);
            $stmt_select_operacion_facturacion->bindParam(1, $idGuiRem, PDO::PARAM_INT);
            $stmt_select_operacion_facturacion->execute();
            $row_operacion_facturacion = $stmt_select_operacion_facturacion->fetch(PDO::FETCH_ASSOC);
            $idOpeFac = $row_operacion_facturacion["id"];

            // LA OPERACION FACTURACION DEBE ESTAR COMPLETA
            if ($row_operacion_facturacion["idReqEst"] == 3) {
                // BUSCAMOS SUS MOVIMIENTOS DE SALIDA Y LOS ORDENAMOS DE MANERA DESCENDIENTE
                $sql_select_movimientos_operacion_facturacion =
                    "SELECT * FROM movimiento_operacion_facturacion
                WHERE idOpeFac = ? ORDER BY idEntSto DESC";
                $stmt_select_movimientos_operacion_facturacion = $pdo->prepare($sql_select_movimientos_operacion_facturacion);
                $stmt_select_movimientos_operacion_facturacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                $stmt_select_movimientos_operacion_facturacion->execute();
                $rows_movimientos_operacion_facturacion = $stmt_select_movimientos_operacion_facturacion->fetchAll(PDO::FETCH_ASSOC);

                $idEntStoEst = 1; // estado de disponible
                try {
                    $pdo->beginTransaction();
                    foreach ($detOpeDev as $detalleDevolucion) {
                        $cantidadAdevolver = $detalleDevolucion["canOpeDevDet"];
                        $idProdt = $detalleDevolucion["idProdt"];
                        $idOpeDevDet = $detalleDevolucion["id"];
                        $cantSalPorIteracion = 0; // cantidad auxiliar

                        // debemos obtener los movimientos correspondientes a cierto producto
                        $movimientos_operacion_facturacion_producto = array();
                        foreach ($rows_movimientos_operacion_facturacion as $row_movimiento) {
                            if ($row_movimiento["idProdt"] == $idProdt) {
                                array_push($movimientos_operacion_facturacion_producto, $row_movimiento);
                            }
                        }

                        // AHORA APLICAMOS EL ALGORITMO DE REPARTICION
                        foreach ($movimientos_operacion_facturacion_producto as $value) {
                            $idEntSto = $value["idEntSto"];
                            $canSalStoReq = $value["canMovOpeFac"];
                            $idProdc = $value["idProdc"];
                            $codLotProd = $value["codLotProd"];

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

                            // insetamos el movimiento de facturacion
                            $esEnt = 1;
                            $sql =
                                "INSERT
                            movimiento_operacion_devolucion
                            (idOpeDev, idOpeDevDet, idProdt, idEntSto, idProdc, codLotProd, canMovOpe)
                            VALUES (?, ?, ?, ?, ?, ?, $cantSalPorIteracion)";

                            $stmt = $pdo->prepare($sql);
                            $stmt->bindParam(1, $idOpeDev, PDO::PARAM_INT); // id de la operacion facturacion
                            $stmt->bindParam(2, $idOpeDevDet, PDO::PARAM_INT);
                            $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
                            $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);
                            $stmt->bindParam(5, $idProdc, PDO::PARAM_INT);
                            $stmt->bindParam(6, $codLotProd, PDO::PARAM_STR);
                            $stmt->execute();

                            // ACTUALIZAMOS EL ALMACEN CORRESPONDIENTE A LA ENTRADA
                            $sql_update_almacen_stock =
                                "UPDATE almacen_stock
                            SET canSto = canSto + $cantSalPorIteracion, canStoDis = canStoDis + $cantSalPorIteracion
                            WHERE idAlm = ? AND idProd = ?";

                            $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                            $stmt_update_almacen_stock->bindParam(1, $idAlmacenPrincipal, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->execute();

                            if ($cantidadAdevolver == 0) {
                                break;
                            }
                        }
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LAS OPERACIONES";
                    $description_error = $e->getMessage();
                }
            } else {
                $invSerFacOpeFac = $row_operacion_facturacion["invSerFac"];
                $invNumFacOpeFac = $row_operacion_facturacion["invNumFac"];
                $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                $description_error = "LA OPERACION DE SALIDA DE $invSerFacOpeFac - $invNumFacOpeFac no fue completada";
            }
        }
        // SI NO HAY TRAZABILIDAD
        else {
            // SE LLEVA A CABO EN OTRO ENDPOINT O LO MANEJAMOS INTERNAMENTE AQUI
        }
    }

    // actualizamos el estado de la operacion d edevolucion
    if (empty($message_error)) {
        try {
            $pdo->beginTransaction();
            $idReqEstCom = 3; // requisicion completa
            $fueComDet = 1; // fue completo el detalle

            $sql_update_operacion_devolucion =
                "UPDATE operacion_devolucion
            SET idReqEst = ?, esRet = ?, fecActOpeDev = ?
            WHERE id = ?";
            $stmt_update_operacion_devolucion = $pdo->prepare($sql_update_operacion_devolucion);
            $stmt_update_operacion_devolucion->bindParam(1, $idReqEstCom, PDO::PARAM_INT);
            $stmt_update_operacion_devolucion->bindParam(2, $esRet, PDO::PARAM_BOOL);
            $stmt_update_operacion_devolucion->bindParam(3, $fecDateNow, PDO::PARAM_STR);
            $stmt_update_operacion_devolucion->bindParam(4, $idOpeDev, PDO::PARAM_INT);
            $stmt_update_operacion_devolucion->execute();

            foreach ($detOpeDev as $detalleDevolucion) {
                $idOpeDevDet = $detalleDevolucion["id"];

                $sql_update_operacion_devolucion_detalle =
                    "UPDATE operacion_devolucion_detalle
                SET fueComDet = ?, fecComOpeDevDet = ?, fecActOpeDevDet = ?
                WHERE id = ?";
                $stmt_update_operacion_devolucion_detalle = $pdo->prepare($sql_update_operacion_devolucion_detalle);
                $stmt_update_operacion_devolucion_detalle->bindParam(1, $fueComDet, PDO::PARAM_BOOL);
                $stmt_update_operacion_devolucion_detalle->bindParam(2, $fecDateNow, PDO::PARAM_STR);
                $stmt_update_operacion_devolucion_detalle->bindParam(3, $fecDateNow, PDO::PARAM_STR);
                $stmt_update_operacion_devolucion_detalle->bindParam(4, $idOpeDevDet, PDO::PARAM_INT);
                $stmt_update_operacion_devolucion_detalle->execute();
            }

            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
            $description_error = $e->getMessage();
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
