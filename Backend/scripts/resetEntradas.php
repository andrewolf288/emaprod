<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    /* 
        Es una actualización masiva en donde:
        - El estado de la entrada queda como terminada
        - El estado de registro queda en inactivo
    */

    // actualizamos las entradas
    $sql_update_reset_entradas =
        "UPDATE entrada_stock
    SET idEntStoEst = ? AND estReg = ?
    ";

    $idEntStoEst = 2; // entrada terminada
    $estReg = "I"; // estado de inactivo

    $stmt_update_reset_entradas = $pdo->prepare($sql_update_reset_entradas);
    $stmt_update_reset_entradas->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
    $stmt_update_reset_entradas->bindParam(2, $estReg, PDO::PARAM_STR);
    $stmt_update_reset_entradas->execute();

    // eliminamos toda la data de almacen_stock
    $sql_update_almacen_stock =
        "DELETE FROM almacen_stock";

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
