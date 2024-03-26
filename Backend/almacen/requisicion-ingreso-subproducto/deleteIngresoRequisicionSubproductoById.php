<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReqIngProd = $data["id"]; // requisicion agregacion detalle

    if ($pdo) {
        $sql_delete_detalle_requisicion_ingreso_subproducto =
            "DELETE FROM requisicion_ingreso_subproducto
            WHERE id = ?";
        try {
            $stmt_delete_detalle_requisicion_ingreso_subproducto = $pdo->prepare($sql_delete_detalle_requisicion_ingreso_subproducto);
            $stmt_delete_detalle_requisicion_ingreso_subproducto->bindParam(1, $idReqIngProd, PDO::PARAM_INT);
            $stmt_delete_detalle_requisicion_ingreso_subproducto->execute();
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