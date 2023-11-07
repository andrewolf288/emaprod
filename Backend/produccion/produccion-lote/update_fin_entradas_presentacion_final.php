<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "PUT") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $dataPresentacionFinal = $data["dataPresentacionFinal"];
    $idProdcProdFin = $dataPresentacionFinal["idProdcProdFin"]; // id de la presentacion final
    $canTotProgProdFin = $dataPresentacionFinal["canTotProgProdFin"]; // cantidad programada
    $canTotIngProdFin = $dataPresentacionFinal["canTotIngProdFin"]; // cantidad ingresada
    $idProdt = $dataPresentacionFinal["idProdt"]; // presentacion final
    $idProdcProdtFinEst = $dataPresentacionFinal["idProdcProdtFinEst"]; // estado

    $idProdc = $data["idProdc"]; // id de produccion

    $esTerIngProFin = 1; // estado de terminado
    $sql_update_produccion_producto_final =
        "UPDATE produccion_producto_final SET esTerIngProFin = ?, idProdcProdtFinEst = ?
        WHERE id = ?";
    try {
        $stmt_update_produccion_produccto_final = $pdo->prepare($sql_update_produccion_producto_final);
        $stmt_update_produccion_produccto_final->bindParam(1, $esTerIngProFin, PDO::PARAM_INT);
        $stmt_update_produccion_produccto_final->bindParam(2, $idProdcProdtFinEst, PDO::PARAM_INT);
        $stmt_update_produccion_produccto_final->bindParam(3, $idProdcProdFin, PDO::PARAM_INT);
        $stmt_update_produccion_produccto_final->execute();

        // ahora debemos verificar si se cumplio la entrega de todas las presentaciones
        // para pasar a un estado de terminado de entregar
    } catch (PDOException $e) {
        $message_error = "ERROR SERVER INTERNO: ERROR EN LA ACTUALIZACION DE PRODUCCION";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
