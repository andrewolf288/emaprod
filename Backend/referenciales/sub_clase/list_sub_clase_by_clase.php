<?php

require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idCla = $data["idCla"];

        $sql = "SELECT * FROM sub_clase
        WHERE idCla = ?";
        // Preparamos la consulta
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $idCla, PDO::PARAM_INT);
        // Ejecutamos la consulta
        $stmt->execute();
        // Recorremos los resultados
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($result, $row);
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
} else {
    $message_error = "No se realizo una peticion post";
    $description_error = "No se realizo una peticion post";
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
