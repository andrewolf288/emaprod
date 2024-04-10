<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReqDevDet = $data["id"]; // requisicion agregacion detalle
    $canReqMatDet = $data["canReqMatDet"]; // cantidad de la requisicion agregacion

    if ($pdo) {
        $fecActReqMatDet = date('Y-m-d H:i:s'); // fecha de actualizacion
        $sql_update_detalle_requisicion_materiales =
            "UPDATE requisicion_materiales_detalle SET canReqMatDet = $canReqMatDet, fecActReqMatDet = ?
            WHERE id = ?";

        try {
            $stmt_update_detalle_requisicion_materiales = $pdo->prepare($sql_update_detalle_requisicion_materiales);
            $stmt_update_detalle_requisicion_materiales->bindParam(1, $fecActReqMatDet);
            $stmt_update_detalle_requisicion_materiales->bindParam(2, $idReqDevDet, PDO::PARAM_INT);
            $stmt_update_detalle_requisicion_materiales->execute();
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en insercion de salidas";
            $description_error = $e->getMessage();
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
