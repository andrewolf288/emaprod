<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $esSal = $data["esSal"];
    $esEnt = $data["esEnt"];
    $idGuiRem = $data["idRefGui"]; // identificador de guia de remision
    $items = $data["items"]; // arreglo de items

    if ($pdo) {
        // primero debemos comprobar que tipo de operacion se esta realizando:
        // 1. Salida, 2. Ingreso
        if ($esSal == 1) {
            // cuando hablamos de una salida
            // 1. Tenemos que comprobar que no exista una operacion de salida con el mismo id de guia de remision
            $esSal = 1;
            $sql_operacion_facturacion_salida =
                "SELECT * FROM operacion_facturacion
            WHERE esSal = ? AND idGuiRem = ? LIMIT 1";
            $stmt_operacion_facturacion_salida = $pdo->prepare($sql_operacion_facturacion_salida);
            $stmt_operacion_facturacion_salida->bindParam(1, $esSal, PDO::PARAM_BOOL);
            $stmt_operacion_facturacion_salida->bindParam(2, $idGuiRem, PDO::PARAM_INT);
            $stmt_operacion_facturacion_salida->execute();

            if ($stmt_operacion_facturacion_salida->rowCount() > 0) {
            } else {
                $message_error = "No se pudo crear la operacion facturacion";
                $description_error = "Ya se ha registrado esta guia de remision como salida de venta";
            }
        }
        if ($esEnt == 1) {
            // cuando hablamos de una entrada
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
