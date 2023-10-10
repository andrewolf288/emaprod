<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $codEntSto = $data["codEntSto"];

    $prestProdt = $data["prestProdt"];
    $certCal = $data["certCal"];
    $lotProv = $data["lotProv"];
    $resbEval = $data["resbEval"];
    $fecProduccion = $data["fecProduccion"];
    $humedad = $data["humedad"];
    $obsEnt = $data["obsEnt"];

    if ($pdo) {
        try {

            $pdo->beginTransaction();

            $sql_update_entrada_stock =
                "UPDATE entrada_stock 
            SET prestProdt = ?, 
            certCal =  ?, 
            lotProv = ?,
            resbEval = ?,
            fecProduccion = ?,
            humedad = ?,
            obsEnt = ?
            WHERE  codEntSto = ?";
            $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
            $stmt_update_entrada_stock->bindParam(1, $prestProdt, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(2, $certCal, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(3, $lotProv, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(4, $resbEval, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(5, $fecProduccion, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(6, $humedad, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(7, $obsEnt, PDO::PARAM_STR);
            $stmt_update_entrada_stock->bindParam(8, $codEntSto, PDO::PARAM_STR);

            $stmt_update_entrada_stock->execute();
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollback();
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
