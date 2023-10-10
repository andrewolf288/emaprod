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
    $idReqSelDet =  $data["idReqSelDet"];

    try {
        $idReqSelDetEstPorSel = 5;
        $sql_update_requisicion_molienda_detalle =
            "UPDATE requisicion_seleccion_detalle
    SET idReqSelDetEst = ?
    WHERE id = ?";
        $stmt_update_requisicion_molienda_detalle = $pdo->prepare($sql_update_requisicion_molienda_detalle);
        $stmt_update_requisicion_molienda_detalle->bindParam(1, $idReqSelDetEstPorSel, PDO::PARAM_INT);
        $stmt_update_requisicion_molienda_detalle->bindParam(2, $idReqSelDet, PDO::PARAM_INT);
        $stmt_update_requisicion_molienda_detalle->execute();

        // TERMINAMOS LA TRANSACCION
        $pdo->commit();
    } catch (PDOException $e) {
        $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
        $description_error = $e->getMessage();
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
