<?php
// CON ESTE SCRIPT DEBEMOS TRAER EL DETALLE DEVOLUCION
/*
    1. Primero debemos buscar si ha existido una operacion de salida que tenga el detalle de salida
        i. Si tiene detalle de salida, debemos formar la data para que se realice la salida correspondiente
        ii. Si no tiene detalle de salida, debemos devolver un arraya vacio.
*/

include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);



    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
