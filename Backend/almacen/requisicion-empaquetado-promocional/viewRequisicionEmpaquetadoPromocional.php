<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReqEmpProm = $data["idReqEmpProm"];

    if($pdo){
        $sql_requisicion_empaquetado_promocional = 
        "SELECT 
        rep.id,
        rep.correlativo,
        rep.idProdt,
        p.nomProd,
        me.simMed,
        rep.canReqEmpPro,
        rep.idReqEst,
        re.desReqEst,
        rep.fecCreReqEmpProm
        FROM requisicion_empaquetado_promocional AS rep
        JOIN producto AS p ON p.id = rep.idProdt
        JOIN medida AS me ON me.id = p.idMed
        JOIN requisicion_estado AS re ON re.id = rep.idReqEst
        WHERE rep.id = ?";
        $stmt_requisicion_empaquetado_promocional = $pdo->prepare($sql_requisicion_empaquetado_promocional);
        $stmt_requisicion_empaquetado_promocional->bindParam(1, $idReqEmpProm, PDO::PARAM_INT);
        $stmt_requisicion_empaquetado_promocional->execute();

        $row_requisicion_empaquetado_promocional = $stmt_requisicion_empaquetado_promocional->fetch(PDO::FETCH_ASSOC);

        $sql_requisicion_empaquetado_promocional_detalle = 
        "SELECT
        repd.id,
        repd.idReqEmpProm,
        repd.idProdt,
        repd.idProdc,
        pc.codLotProd,
        pc.fecVenLotProd,
        p.nomProd,
        me.simMed,
        p.codProd2,
        repd.canReqEmpPromDet,
        repd.esProdFin,
        repd.esMatReq,
        repd.esCom,
        repd.fecComReqEmpDet,
        repd.fecCreReqEmpDet
        FROM requisicion_empaquetado_promocional_detalle AS repd
        JOIN producto AS p ON p.id = repd.idProdt
        JOIN medida AS me ON me.id = p.idMed
        LEFT JOIN produccion AS pc ON pc.id = repd.idProdc
        WHERE repd.idReqEmpProm = ?";
        $stmt_requisicion_empaquetado_promocional_detalle = $pdo->prepare($sql_requisicion_empaquetado_promocional_detalle);
        $stmt_requisicion_empaquetado_promocional_detalle->bindParam(1, $idReqEmpProm, PDO::PARAM_INT);
        $stmt_requisicion_empaquetado_promocional_detalle->execute();

        $row_requisicion_empaquetado_promocional["detReqEmpProm"] = $stmt_requisicion_empaquetado_promocional_detalle->fetchAll(PDO::FETCH_ASSOC);
        $result = $row_requisicion_empaquetado_promocional;
    } else {
        $message_error = "Error en la conexión";
        $description_error = "Error en la conexión";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
