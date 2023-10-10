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
    $idReqSelDet = $data["id"];

    if ($pdo) {
        $sql =
            "SELECT
            rsd.id,
            rsd.idMatPri,
            rsd.idReqSel,
            rs.codReqSel,
            rs.codLotSel,
            p.nomProd,
            p.codProd,
            p.codProd2,
            rsd.idReqSelDetEst,
            rsde.desReqSelDetEst,
            rsd.canReqSelDet
            FROM requisicion_seleccion_detalle as rsd
            JOIN producto as p on p.id = rsd.idMatPri
            JOIN requisicion_seleccion_detalle_estado as rsde on rsde.id = rsd.idReqSelDetEst
            JOIN requisicion_seleccion as rs on rs.id = rsd.idreqSel
            WHERE rsd.id = ?
            ";
        // PREPARAMOS LA CONSULTA
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $idReqSelDet, PDO::PARAM_INT);
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
