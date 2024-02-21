<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdtInt = $data["idProdtInt"];

    $sql_select_producto_intermedio =
        "SELECT id, idProdt, codLotProd, fecProdIni, fecVenLotProd
    FROM produccion
    WHERE idProdt = ?
    ORDER BY fecProdIni DESC";
    try {
        $stmt_select_producto_intermedio = $pdo->prepare($sql_select_producto_intermedio);
        $stmt_select_producto_intermedio->bindParam(1, $idProdtInt, PDO::PARAM_INT);
        $stmt_select_producto_intermedio->execute();
        $result = $stmt_select_producto_intermedio->fetchAll(PDO::FETCH_ASSOC);
        if (empty($result)) {
            $message_error = "No hay lotes disponibles para este producto intermedio";
            $description_error = "No hay lotes disponibles para este producto intermedio";
        }
    } catch (PDOException) {
        $message_error = "ERROR EN LA CONEXIOON";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
