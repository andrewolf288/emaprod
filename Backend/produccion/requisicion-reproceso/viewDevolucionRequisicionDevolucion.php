<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeDevCalDet = $data["idOpeDevCalDet"];

    $sql_select_operacion_devolucion_calidad_detalle =
        "SELECT
    odcd.id,
    odcd.idProdc,
    p.id AS idProdt,
    odcd.codLotProd,
    DATE(pd.fecVenLotProd) AS fecVenLotProd,
    pd.idProdEst,
    pe.desEstPro,
    pd.idProdTip,
    pt.desProdTip,
    pd.klgTotalLoteProduccion,
    pd.totalUnidadesLoteProduccion,
    pd.fecProdIniProg,
    pd.fecProdFinProg,
    pd.fecCreProd,
    pd.numop,
    pd.obsProd,
    odcd.canLotProd,
    p.nomProd,
    odcd.fueComOpeRep,
    DATE(odcd.fecCreOpeDevCalDet) AS fecCreOpeDevCalDet
    FROM operacion_devolucion_calidad_detalle AS odcd
    JOIN produccion AS pd ON pd.id = odcd.idProdc
    JOIN operacion_devolucion_calidad AS odc ON odc.id = odcd.idOpeDevCal
    JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
    JOIN producto AS p ON p.id = odd.idProdt
    JOIN produccion_estado as pe ON pe.id = pd.idProdEst
    JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
    WHERE odcd.id = ?";
    $stmt_select_operacion_devolucion_calidad_detalle = $pdo->prepare($sql_select_operacion_devolucion_calidad_detalle);
    $stmt_select_operacion_devolucion_calidad_detalle->bindParam(1, $idOpeDevCalDet, PDO::PARAM_INT);
    $stmt_select_operacion_devolucion_calidad_detalle->execute();
    $row_operacion_devolucion_calidad_detalle = $stmt_select_operacion_devolucion_calidad_detalle->fetch(PDO::FETCH_ASSOC);

    $row_operacion_devolucion_calidad_detalle["reqDev"] = array();

    $sql_trazabilidad_reproceso_devolucion =
        "SELECT
    trd.idReqDev,
    rd.id,
    rd.correlativo,
    rd.idProdFin,
    rd.canTotUndReqDev,
    rd.idProdt,
    p.nomProd,
    p.codProd,
    p.codProd2,
    me.simMed,
    rd.idReqEst,
    re.desReqEst,
    rd.fecComReqDev,
    rd.fecCreReqDev,
    rd.fecActReqDev
    FROM trazabilidad_reproceso_devolucion AS trd
    JOIN requisicion_devolucion AS rd ON rd.id = trd.idReqDev
    JOIN producto AS p ON p.id = rd.idProdt
    JOIN medida AS me ON me.id = p.idMed
    JOIN requisicion_estado AS re ON re.id = rd.idReqEst
    WHERE idOpeDevCalDet = ?";
    $stmt_trazabilidad_reproceso_devolucion = $pdo->prepare($sql_trazabilidad_reproceso_devolucion);
    $stmt_trazabilidad_reproceso_devolucion->bindParam(1, $idOpeDevCalDet, PDO::PARAM_INT);
    $stmt_trazabilidad_reproceso_devolucion->execute();
    $row_trazabilidad_reproceso_devolucion = $stmt_trazabilidad_reproceso_devolucion->fetch(PDO::FETCH_ASSOC);

    if ($row_trazabilidad_reproceso_devolucion) {
        $row_trazabilidad_reproceso_devolucion["detReqDev"] = array();
        $idReqDev = $row_trazabilidad_reproceso_devolucion["idReqDev"];

        $sql_select_requisicion_devolucion_detalle =
            "SELECT
        rdd.id,
        rdd.idReqDev,
        rdd.idProdt,
        p.nomProd,
        p.codProd,
        p.codProd2,
        me.simMed,
        rdd.idMotDev,
        pdm.desProdDevMot,
        rdd.canReqDevDet,
        rdd.esComReqDevDet,
        rdd.fecCreReqDevDet,
        rdd.fecActReqDevDet,
        rdd.estReg
        FROM requisicion_devolucion_detalle AS rdd
        JOIN producto AS p ON p.id = rdd.idProdt
        JOIN medida AS me ON me.id = p.idMed
        JOIN produccion_devolucion_motivo AS pdm ON pdm.id = rdd.idMotDev
        WHERE rdd.idReqDev = ?";
        $stmt_select_requisicion_devolucion_detalle = $pdo->prepare($sql_select_requisicion_devolucion_detalle);
        $stmt_select_requisicion_devolucion_detalle->bindParam(1, $idReqDev, PDO::PARAM_INT);
        $stmt_select_requisicion_devolucion_detalle->execute();

        $row_trazabilidad_reproceso_devolucion["detReqDev"] = $stmt_select_requisicion_devolucion_detalle->fetchAll(PDO::FETCH_ASSOC);
        array_push($row_operacion_devolucion_calidad_detalle["reqDev"], $row_trazabilidad_reproceso_devolucion);
    }

    $result = $row_operacion_devolucion_calidad_detalle;

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
