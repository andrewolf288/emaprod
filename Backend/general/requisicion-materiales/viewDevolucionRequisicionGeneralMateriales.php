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

    $idReqMat = $data["idReqMat"];

    if ($pdo) {
        $sql_select_requisicion_materiales =
            "SELECT 
        rm.id,
        rm.idReqEst,
        re.desReqEst,
        rm.idMotReqMat,
        mrm.desMotReqMat,
        rm.idAre,
        ar.desAre,
        rm.codReqMat,
        rm.notReqMat,
        DATE(rm.fecCreReqMat) AS fecCreReqMat
        FROM requisicion_materiales AS rm
        JOIN requisicion_estado AS re ON re.id = rm.idReqEst
        JOIN motivo_requisicion_materiales AS mrm ON mrm.id = rm.idMotReqMat
        JOIN area AS ar ON ar.id = rm.idAre
        WHERE rm.id = ?";
        $stmt_select_requisicion_materiales = $pdo->prepare($sql_select_requisicion_materiales);
        $stmt_select_requisicion_materiales->bindParam(1, $idReqMat, PDO::PARAM_INT);
        $stmt_select_requisicion_materiales->execute();

        while ($row_requisicion_materiales = $stmt_select_requisicion_materiales->fetch(PDO::FETCH_ASSOC)) {
            $sql_select_requisicion_materiales_detalle =
                "SELECT 
            rmd.id,
            rmd.idReqMat,
            rmd.idProdt,
            p.nomProd,
            p.codProd,
            p.codProd2,
            cl.desCla,
            sc.desSubCla,
            me.simMed,
            rmd.canReqMatDet,
            rmd.fueCom,
            rmd.fecComReqMatDet,
            rmd.fecCreReqMatDet,
            rmd.fecActReqMatDet
            FROM requisicion_materiales_detalle AS rmd
            JOIN producto AS p ON p.id = rmd.idProdt
            JOIN medida AS me ON me.id = p.idMed
            JOIN clase AS cl ON cl.id = p.idCla
            JOIN sub_clase AS sc ON sc.id = p.idSubCla
            WHERE rmd.idReqMat = ?";
            $stmt_select_requisicion_materiales_detalle = $pdo->prepare($sql_select_requisicion_materiales_detalle);
            $stmt_select_requisicion_materiales_detalle->bindParam(1, $idReqMat, PDO::PARAM_INT);
            $stmt_select_requisicion_materiales_detalle->execute();

            $row_requisicion_materiales["detReq"] = $stmt_select_requisicion_materiales_detalle->fetchAll(PDO::FETCH_ASSOC);
            
            // devoluciones
            // $sql_select_devolucion
            $result = $row_requisicion_materiales;
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
