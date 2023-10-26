<?php
require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $prodRef = $data["prodRef"];

    if ($pdo) {
        $sql =
            "SELECT
        p.id,
        p.idMed,
        me.simMed,
        p.nomProd,
        p.codProd2,
        p.esMatPri,
        p.esProFin,
        p.esProProd,
        p.esEnvEnc,
        p.idCla,
        p.idSubCla
        FROM producto p
        JOIN medida me ON me.id = p.idMed
        WHERE p.proRef = ?";

        try {
            // Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $prodRef, PDO::PARAM_INT);
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
