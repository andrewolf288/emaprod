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

    $idReqDet = $data["id"]; // id requisicion detalle
    $canReqDetNew = floatval($data["cantidadNueva"]); // cantidad nueva

    if ($pdo) {
        // variables utilizadas
        $cantidadResultante = 0; // cantidad diferencia entre nuevo y actual
        $canReqDet = 0; // cantidad actual de la requisicion
        $idProd = 0; // producto de la requisicion
        $idAlm = 0; // almacen destino
        $idAlmacenPrincipal = 1; // almacen principal

        // finalmente actualizamos la requisicion detalle
        $sql_update_requisicion_detalle =
            "UPDATE requisicion_detalle SET
            canReqDet = $canReqDetNew
            WHERE id = ?";

        try {
            $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
            $stmt_update_requisicion_detalle->bindParam(1, $idReqDet, PDO::PARAM_INT);
            $stmt_update_requisicion_detalle->execute();

            // actualizamos el almacen principal
        } catch (PDOException $e) {
            $message_error = "Error en la actualizacion de requisicion detalle";
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
