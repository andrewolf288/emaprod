<?php
// ESTE SCRIPT SIRVE PARA GESTIONAR LAS BAJAS DE GUIAS DE REMISION,
// TIPO: INTEGRACION
/*
    1. DESDE EL SISTEMAS EMAFACT SE REALIZA LA BAJA DE GUAI DE REMISION
    2. DEBEMOS BUSCAR EL REGISTRO EN EL SISTEMA EMAPROD
    3. AL ENCONTRAR EL REGISTRO, DEBEMOS HACER LA COMPROBACION:
        a. SE HIZO LA SALIDA COMPLETA DEL DETALLE
            i. Se busca en movimiento operacion facturacion el detalle completo de salida
            ii. Se vuelve a registrar pero ahora como entrada
        b. SE HIZO LA SALIDA PARCIAL DEL DETALLE
            i. Se busca en movimiento operacion facturacion el detalle parcial de salida
            ii. Se vuelve a registrar pero ahora como entrada solo del detalle salido
        c. NO SE HIZO NINGUNA SALIDA
    4. SE ACTUALIZA EL ESTADO DE LA GUIA A: GUIA DE BAJA
    5. SE INHABILITA LA VISUALIZACION DE ESTA
*/
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idRefGui = intVal($data["idRefGui"]); // id de la guia de remision
    $fechaActualizacion = date('Y-m-d H:i:s'); // fecha de actualizacion
    $idAlmacenPrincipal = 1; // almacen principal
    $idEntStoEst = 1;
    $esDev = 1;
    $fueAfePorAnul = 1;

    if ($pdo) {
        $sql_search_operacion_facturacion_by_idGuiRem =
            "SELECT id FROM operacion_facturacion
        WHERE idGuiRem = ? AND fueAfePorAnul <> ?";
        $stmt_search_operacion_facturacion_by_idGuiRem = $pdo->prepare($sql_search_operacion_facturacion_by_idGuiRem);
        $stmt_search_operacion_facturacion_by_idGuiRem->bindParam(1, $idRefGui, PDO::PARAM_INT);
        $stmt_search_operacion_facturacion_by_idGuiRem->bindParam(2, $fueAfePorAnul, PDO::PARAM_BOOL);
        $stmt_search_operacion_facturacion_by_idGuiRem->execute();
        $row_operacion_facturacion = $stmt_search_operacion_facturacion_by_idGuiRem->fetch(PDO::FETCH_ASSOC);

        // comprobamos si existe la operacion
        if ($row_operacion_facturacion) {
            $idOpeFac = $row_operacion_facturacion["id"];
            try {
                $pdo->beginTransaction();
                $sql_select_detalle_movimiento_orden_facturacion =
                    "SELECT
                id,
                idProdt,
                canMovOpeFac,
                idEntSto
                FROM movimiento_operacion_facturacion
                WHERE idOpeFac = ?";
                $stmt_select_detalle_movimiento_orden_facturacion = $pdo->prepare($sql_select_detalle_movimiento_orden_facturacion);
                $stmt_select_detalle_movimiento_orden_facturacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                $stmt_select_detalle_movimiento_orden_facturacion->execute();
                $rows_detalle_movimiento_orden_facturacion = $stmt_select_detalle_movimiento_orden_facturacion->fetchAll(PDO::FETCH_ASSOC);

                // comprobamos si se hicieron salidas
                if ($rows_detalle_movimiento_orden_facturacion) {
                    foreach ($rows_detalle_movimiento_orden_facturacion as $row_movimiento) {
                        $idMovOpeFact = $row_movimiento["id"];
                        $idProdt = $row_movimiento["idProdt"];
                        $canMovOpeFac = $row_movimiento["canMovOpeFac"];
                        $idEntSto = $row_movimiento["idEntSto"];

                        // primero hacemos la devolucion a la entrada correspondiente
                        $sql_update_entrada_stock =
                            "UPDATE entrada_stock
                        SET canTotDis = canTotDis + $canMovOpeFac, idEntStoEst = ?, fecActEntSto = ?
                        WHERE id = ?";
                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $fechaActualizacion, PDO::PARAM_STR);
                        $stmt_update_entrada_stock->bindParam(3, $idEntSto, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->execute();

                        // actualizamos el movimiento operacion facturacion
                        $sql_update_movimiento_operacion_facturacion =
                            "UPDATE
                        movimiento_operacion_facturacion
                        SET esDev = ?, fecActMovOpeFac = ?
                        WHERE id = ?";
                        $stmt_update_movimiento_operacion_facturacion = $pdo->prepare($sql_update_movimiento_operacion_facturacion);
                        $stmt_update_movimiento_operacion_facturacion->bindParam(1, $esDev, PDO::PARAM_INT); // id de la operacion facturacion
                        $stmt_update_movimiento_operacion_facturacion->bindParam(2, $fechaActualizacion, PDO::PARAM_STR);
                        $stmt_update_movimiento_operacion_facturacion->bindParam(3, $idMovOpeFact, PDO::PARAM_INT);
                        $stmt_update_movimiento_operacion_facturacion->execute();

                        // actualizamos el stock en el almacen
                        $sql_update_almacen_stock =
                            "UPDATE almacen_stock
                        SET canSto = canSto + $canMovOpeFac, canStoDis = canStoDis + $canMovOpeFac
                        WHERE idAlm = ? AND idProd = ?";
                        $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                        $stmt_update_almacen_stock->bindParam(1, $idAlmacenPrincipal, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->execute();
                    }
                }

                // actualizamos el detalle de operacion facturacion
                $fueAnulDet = 1;
                $sql_update_operacion_facturacion_detalle =
                    "UPDATE operacion_facturacion_detalle
                SET fueAnulDet = ?, fecActOpeFacDet = ?
                WHERE idOpeFac = ?";
                $stmt_update_operacion_facturacion_detalle = $pdo->prepare($sql_update_operacion_facturacion_detalle);
                $stmt_update_operacion_facturacion_detalle->bindParam(1, $fueAnulDet, PDO::PARAM_BOOL);
                $stmt_update_operacion_facturacion_detalle->bindParam(2, $fechaActualizacion, PDO::PARAM_STR);
                $stmt_update_operacion_facturacion_detalle->bindParam(3, $idOpeFac, PDO::PARAM_INT);
                $stmt_update_operacion_facturacion_detalle->execute();

                // actualizamos la cabecera de operacion facturacion
                $idReqEstAnulado = 5;
                $sql_update_operacion_facturacion =
                    "UPDATE operacion_facturacion
                SET idReqEst = ?, fueAfePorAnul = ?, fecAnuOpeFac = ?, fecActOpeFac = ?
                WHERE id = ?";
                $stmt_update_operacion_facturacion = $pdo->prepare($sql_update_operacion_facturacion);
                $stmt_update_operacion_facturacion->bindParam(1, $idReqEstAnulado, PDO::PARAM_INT);
                $stmt_update_operacion_facturacion->bindParam(2, $fueAfePorAnul, PDO::PARAM_BOOL);
                $stmt_update_operacion_facturacion->bindParam(3, $fechaActualizacion, PDO::PARAM_STR);
                $stmt_update_operacion_facturacion->bindParam(4, $fechaActualizacion, PDO::PARAM_STR);
                $stmt_update_operacion_facturacion->bindParam(5, $idOpeFac, PDO::PARAM_INT);
                $stmt_update_operacion_facturacion->execute();

                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollBack();
                $message_error =  "Error en la operacion con la base de datos";
                $description_error = $e->getMessage();
            } catch (Exception $e) {
                $pdo->rollBack();
                $message_error =  "Error en el codigo interno";
                $description_error = $e->getMessage();
            }
        }
    } else {
        $message_error =  "Error en la conexion";
        $description_error = "No se pudo conectar con la base de datos a través de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
