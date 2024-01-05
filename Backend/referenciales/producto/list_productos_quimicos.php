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
        P.id,
        P.idMed,
        ME.simMed,
        P.nomProd,
        P.codProd2,
        P.esMatPri,
        P.esProFin,
        P.esProProd
        FROM producto p
        LEFT JOIN medida ME ON P.idMed = ME.id
        WHERE P.idCla = ?
        ";
        try {
            // Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            $claseProductosQuimicos = 7; // filtramos las materis primas
            $stmt->bindParam(1, $claseProductosQuimicos, PDO::PARAM_INT);
            // Ejecutamos la consulta
            $stmt->execute();
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (PDOException $e) {
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
}
