<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $fechaToday = getTodayDateNow();
    $fechaInicio = $fechaToday[0]; // inicio del mes
    $fechaFin = $fechaToday[1]; // fin del mes
    $idAreEnv = 5; // area de envasado
    $idAreEnc = 6; // srea de encajonado

    if (isset($data)) {
        if (!empty($data["fechaInicio"])) {
            $fechaInicio = $data["fechaInicio"];
        }
        if (!empty($data["fechaFin"])) {
            $fechaFin = $data["fechaFin"];
        }
    }

    if ($pdo) {
        $sql_select_ordenes_transformacion =
            "SELECT 
        ot.id,
        ot.idProdtInt,
        ot.idProdc,
        ot.codLotProd,
        ot.idProdtOri,
        p1.nomProd AS nomProd1,
        ot.canUndProdtOri,
        ot.idProdtDes,
        p2.nomProd AS nomProd2,
        ot.canUndProdtDes,
        ot.fecCreOrdTrans
        FROM orden_transformacion AS ot
        JOIN producto AS p1 ON p1.id = ot.idProdtOri
        JOIN producto AS p2 ON p2.id = ot.idProdtDes
        WHERE DATE(ot.fecCreOrdTrans) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY ot.fecCreOrdTrans DESC";

        $stmt_select_ordenes_transformacion = $pdo->prepare($sql_select_ordenes_transformacion);
        $stmt_select_ordenes_transformacion->execute();
        // $result = $stmt_select_ordenes_transformacion->fetchAll(PDO::FETCH_ASSOC);
        while ($row_orden_transformacion = $stmt_select_ordenes_transformacion->fetch(PDO::FETCH_ASSOC)) {
            $idOrdTrans = $row_orden_transformacion["id"];
            $trazabilidadRequisicion = array();
            $trazabilidadDevolucion = array();
            $trazabilidadProduccionProductoFinal = array();

            // consultamos trazabilidad de requisicion
            $sql_consult_trazabilidad_requisicion =
                "SELECT * FROM trazabilidad_transformacion_requisicion
            WHERE idOrdTrans = ?";
            $stmt_consult_trazabilidad_requisicion = $pdo->prepare($sql_consult_trazabilidad_requisicion);
            $stmt_consult_trazabilidad_requisicion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
            $stmt_consult_trazabilidad_requisicion->execute();
            $trazabilidadRequisicion = $stmt_consult_trazabilidad_requisicion->fetchAll(PDO::FETCH_ASSOC);

            // verificamos el estado de la requisicion
            foreach ($trazabilidadRequisicion as $traReq) {
                $idReq = $traReq["idReq"];
                $sql_select_requisicion_encaje_envase =
                    "SELECT
                COALESCE(SUM(CASE WHEN r.idReqEst = 1 THEN 1 ELSE 0 END), 0) AS requerido,
                COALESCE(SUM(CASE WHEN r.idReqEst = 2 THEN 1 ELSE 0 END), 0) AS en_proceso,
                COALESCE(SUM(CASE WHEN r.idReqEst = 3 THEN 1 ELSE 0 END), 0) AS terminado
                FROM requisicion AS r
                WHERE r.id = ? AND (r.idAre = ? OR r.idAre = ?)";
                $stmt_select_requisicion_encaje_envase = $pdo->prepare($sql_select_requisicion_encaje_envase);
                $stmt_select_requisicion_encaje_envase->bindParam(1, $idReq, PDO::PARAM_INT);
                $stmt_select_requisicion_encaje_envase->bindParam(2, $idAreEnv, PDO::PARAM_INT);
                $stmt_select_requisicion_encaje_envase->bindParam(3, $idAreEnc, PDO::PARAM_INT);
                $stmt_select_requisicion_encaje_envase->execute();
                $row_orden_transformacion["req_env_enc"] = $stmt_select_requisicion_encaje_envase->fetchAll(PDO::FETCH_ASSOC);
            }

            // consultamos trazabilidad de devolucion
            $sql_consult_trazabilidad_devolucion =
                "SELECT * FROM trazabilidad_transformacion_devolucion
            WHERE idOrdTrans = ?";
            $stmt_consult_trazabilidad_devolucion = $pdo->prepare($sql_consult_trazabilidad_devolucion);
            $stmt_consult_trazabilidad_devolucion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
            $stmt_consult_trazabilidad_devolucion->execute();
            $trazabilidadDevolucion = $stmt_consult_trazabilidad_devolucion->fetchAll(PDO::FETCH_ASSOC);

            foreach ($trazabilidadDevolucion as $traDev) {
                $idReqDev = $traDev["idReqDev"];
                $sql_select_requisicion_devolucion =
                    "SELECT
                 COALESCE(SUM(CASE WHEN r.idReqEst = 1 THEN 1 ELSE 0 END), 0) AS requerido,
                 COALESCE(SUM(CASE WHEN r.idReqEst = 2 THEN 1 ELSE 0 END), 0) AS en_proceso,
                 COALESCE(SUM(CASE WHEN r.idReqEst = 3 THEN 1 ELSE 0 END), 0) AS terminado
                FROM requisicion_devolucion AS r
                WHERE r.id = ?";
                $stmt_select_requisicion_devolucion = $pdo->prepare($sql_select_requisicion_devolucion);
                $stmt_select_requisicion_devolucion->bindParam(1, $idReqDev, PDO::PARAM_INT);
                $stmt_select_requisicion_devolucion->execute();
                $row_orden_transformacion["req_dev"] = $stmt_select_requisicion_devolucion->fetchAll(PDO::FETCH_ASSOC);
            }

            // consultamos trazabilidad de producto final
            $sql_consult_trazabilidad_produccion_producto_final =
                "SELECT
                COALESCE(SUM(CASE WHEN esComProdIng = 0 THEN 1 ELSE 0 END), 0) AS requerido,
                COALESCE(SUM(CASE WHEN esComProdIng = 1 THEN 1 ELSE 0 END), 0) AS terminado
                FROM orden_transformacion_ingreso_producto
            WHERE idOrdTrans = ?";
            $stmt_consult_trazabilidad_produccion_producto_final = $pdo->prepare($sql_consult_trazabilidad_produccion_producto_final);
            $stmt_consult_trazabilidad_produccion_producto_final->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
            $stmt_consult_trazabilidad_produccion_producto_final->execute();
            $row_orden_transformacion["req_ing_prod"] = $stmt_consult_trazabilidad_produccion_producto_final->fetchAll(PDO::FETCH_ASSOC);

            array_push($result, $row_orden_transformacion);
        }
    } else {
        $message_error = "No se pudo conectar con la base de datos";
        $description_error = "No se pudo conectar con la base de datos";
    }


    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
