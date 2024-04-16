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
    $correlativo = "OT";

    $sql_select_orden_transformacion =
        "SELECT id FROM orden_transformacion
        ORDER BY id ASC";
    $stmt_select_orden_transformacion = $pdo->prepare($sql_select_orden_transformacion);
    $stmt_select_orden_transformacion->execute();

    while ($row_orden_transformacion = $stmt_select_orden_transformacion->fetch(PDO::FETCH_ASSOC)) {
        $idOrdTrans = $row_orden_transformacion["id"];
        $auxCod = $correlativo . str_pad(strval($index), 7, "0", STR_PAD_LEFT);

        $sql_update_correlativo =
            "UPDATE orden_transformacion 
        SET correlativo = ?
        WHERE id = ?";
        $stmt_update_correlativo = $pdo->prepare($sql_update_correlativo);
        $stmt_update_correlativo->bindParam(1, $auxCod, PDO::PARAM_STR);
        $stmt_update_correlativo->bindParam(2, $idOrdTrans, PDO::PARAM_INT);
        $stmt_update_correlativo->execute();

        $index++;
    }


    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
