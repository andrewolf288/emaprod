<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $index = 1;
    $codReqMat = "RMPRO";

    $sql_select_orden_transformacion =
        "SELECT id FROM requisicion_materiales";
    $stmt_select_requisicion_materiales = $pdo->prepare($sql_select_orden_transformacion);
    $stmt_select_requisicion_materiales->execute();

    while ($row_requisicion_materiales = $stmt_select_requisicion_materiales->fetch(PDO::FETCH_ASSOC)) {
        $idReqMat = $row_requisicion_materiales["id"];
        $auxCod = $codReqMat . str_pad(strval($index), 7, "0", STR_PAD_LEFT);

        $sql_update_correlativo =
            "UPDATE requisicion_materiales SET codReqMat = ?
        WHERE id = ?";
        $stmt_update_correlativo = $pdo->prepare($sql_update_correlativo);
        $stmt_update_correlativo->bindParam(1, $auxCod, PDO::PARAM_STR);
        $stmt_update_correlativo->bindParam(2, $idReqMat, PDO::PARAM_INT);
        $stmt_update_correlativo->execute();
        $index++;
    }


    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
