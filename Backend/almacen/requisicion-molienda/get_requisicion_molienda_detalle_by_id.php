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
    $idReqDet = $data["id"];

    if ($pdo) {
        $sql =
            "SELECT
            rd.id,
            rd.idProdt,
            rd.idReq,
            rd.idReqDetEst,
            pd.codLotProd,
            p.nomProd,
            p.codProd,
            p.codProd2,
            rde.desReqDetEst,
            rd.canReqMolDet
            FROM requisicion_detalle as rd
            JOIN producto as p on p.id = rd.idProdt
            JOIN requisicion_detalle_estado as rde on rde.id = rd.idReqDetEst
            JOIN requisicion as r on r.id = rd.idReq
            JOIN produccion pd on pd.id = r.idProdc
            WHERE rd.id = ?
            ";
        // PREPARAMOS LA CONSULTA
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $idReqDet, PDO::PARAM_INT);
        try {
            $stmt->execute();
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($result, $row);
        }

        // DESCOMENTAR PARA VER LA DATA DE LA CONSULTA Y REALIZAR CAMBIOS
        // print_r($result);
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
