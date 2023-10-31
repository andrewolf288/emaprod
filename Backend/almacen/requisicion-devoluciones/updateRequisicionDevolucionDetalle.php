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
    $canReqDevDet = $data["canReqDevDetNew"]; // cantidad de la requisicion agregacion

    if ($pdo) {
        $fecActReqDevDet = date('Y-m-d H:i:s'); // fecha de actualizacion
        $sql_update_detalle_requisicion_devolucion =
            "UPDATE requisicion_devolucion_detalle SET canReqDevDet = $canReqDevDet, fecActReqDevDet = ?
            WHERE id = ?";

        try {
            $stmt_update_detalle_requisicion_devolucion = $pdo->prepare($sql_update_detalle_requisicion_devolucion);
            $stmt_update_detalle_requisicion_devolucion->bindParam(1, $fecActReqDevDet);
            $stmt_update_detalle_requisicion_devolucion->bindParam(2, $idReqDevDet, PDO::PARAM_INT);
            $stmt_update_detalle_requisicion_devolucion->execute();
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
