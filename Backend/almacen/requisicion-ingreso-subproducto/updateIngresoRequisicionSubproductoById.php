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

    $idReqIngProd = $data["id"]; // requisicion agregacion detalle
    $canReqIngDetNew = $data["canReqIngDetNew"]; // cantidad de la requisicion agregacion

    if ($pdo) {
        $fecActReqProdIng = date('Y-m-d H:i:s'); // fecha de actualizacion
        $sql_update_detalle_requisicion_ingreso_producto =
            "UPDATE requisicion_ingreso_subproducto 
            SET canProdIng = $canReqIngDetNew, fecActReqProdIng = ?
            WHERE id = ?";

        try {
            $stmt_update_detalle_requisicion_ingreso_producto = $pdo->prepare($sql_update_detalle_requisicion_ingreso_producto);
            $stmt_update_detalle_requisicion_ingreso_producto->bindParam(1, $fecActReqProdIng, PDO::PARAM_STR);
            $stmt_update_detalle_requisicion_ingreso_producto->bindParam(2, $idReqIngProd, PDO::PARAM_INT);
            $stmt_update_detalle_requisicion_ingreso_producto->execute();
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
