<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idEntSto = $data["idEntSto"];
        $fecVenEntSto = $data["fecVenEntSto"];

        try {
            $sql_actualizar_fecha_vencimiento =
                "UPDATE entrada_stock SET fecVenEntSto = ?
            WHERE id = ?";
            $stmt_actualizar_fecha_vencimiento = $pdo->prepare($sql_actualizar_fecha_vencimiento);
            $stmt_actualizar_fecha_vencimiento->bindParam(1, $fecVenEntSto, PDO::PARAM_STR);
            $stmt_actualizar_fecha_vencimiento->bindParam(2, $idEntSto, PDO::PARAM_INT);
            $stmt_actualizar_fecha_vencimiento->execute();
        } catch (PDOException $e) {
            $message_error = "OCURRIO UN ERROR EN EL PROCESO";
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
