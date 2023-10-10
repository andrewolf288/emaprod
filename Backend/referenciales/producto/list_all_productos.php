<?php

require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $sql =
            "SELECT
        M.id,
        M.idMed,
        ME.simMed,
        M.nomProd,
        M.codProd2,
        M.esMatPri,
        M.esProFin,
        M.esProProd,
        M.esEnvEnc,
        M.idCla
        FROM producto M
        JOIN medida ME ON M.idMed = ME.id
        JOIN clase c ON c.id = M.idCla";

        try {
            // Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            // Ejecutamos la consulta
            $stmt->execute();
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
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
