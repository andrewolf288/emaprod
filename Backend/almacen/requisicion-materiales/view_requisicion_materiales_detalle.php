<?php
require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $idReq = $data["idReq"]; // obtenemos la requisicion

        $sql_requisicion =
            "SELECT
            r.id,
            r.idReqEst,
            re.desReqEst,
            r.idAre,
            ar.desAre,
            r.idReqTip,
            rt.desReqTip,
            r.fecPedReq,
            r.fecEntReq,
            r.codReq
            FROM requisicion r
            JOIN requisicion_estado as re on re.id = r.idReqEst
            JOIN area as ar on ar.id = r.idAre
            JOIN requisicion_tipo as rt on r.idReqTip = rt.id
            WHERE r.id = ?";

        $stmt_requisicion = $pdo->prepare($sql_requisicion);
        $stmt_requisicion->bindParam(1, $idReq, PDO::PARAM_INT);
        $stmt_requisicion->execute();

        while ($row_requisicion = $stmt_requisicion->fetch(PDO::FETCH_ASSOC)) {
            $row_requisicion["reqDet"] = [];
            $sql_requisicion_detalle =
                "SELECT
                rd.id,
                rd.idProdt,
                p.nomProd,
                me.simMed,
                rd.idReq,
                rd.idReqDetEst,
                rde.desReqDetEst,
                rd.canReqDet
                FROM requisicion_detalle rd
                JOIN producto as p on p.id = rd.idProdt
                JOIN medida as me on me.id = p.idMed
                JOIN requisicion_detalle_estado as rde on rde.id = rd.idReqDetEst
                WHERE rd.idReq = ?";

            $stmt_requisicion_detalle = $pdo->prepare($sql_requisicion_detalle);
            $stmt_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
            $stmt_requisicion_detalle->execute();

            // AÑADIMOS LAS REQUISICIONES
            while ($row_requisicion_detalle = $stmt_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                array_push($row_requisicion["reqDet"], $row_requisicion_detalle);
            }
            array_push($result, $row_requisicion);
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
