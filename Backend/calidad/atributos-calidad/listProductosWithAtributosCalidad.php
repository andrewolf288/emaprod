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

    $idClaMatPri = 2;
    $idClaEnvEnc = 5;
    $sql_select_producto_with_atributos =
        "SELECT 
    p.id,
    p.nomProd,
    p.idSubCla,
    sc.desSubCla,
    me.simMed,
    p.codProd,
    p.codProd2
    FROM producto as p
    JOIN medida as me on me.id = p.idMed
    JOIN sub_clase as sc on sc.id = p.idSubCla";
    $stmt_selet_producto_with_atributos = $pdo->prepare($sql_select_producto_with_atributos);
    $stmt_selet_producto_with_atributos->execute();

    while ($row_atributos_producto = $stmt_selet_producto_with_atributos->fetch(PDO::FETCH_ASSOC)) {
        $idProdt = $row_atributos_producto["id"];

        $sql_select_atributos_calidad =
            "SELECT * FROM producto_atributo_calidad
        WHERE idProdt = ?";
        $stmt_select_atributos_calidad = $pdo->prepare($sql_select_atributos_calidad);
        $stmt_select_atributos_calidad->bindParam(1, $idProdt, PDO::PARAM_INT);
        $stmt_select_atributos_calidad->execute();

        $row_atributos_producto["detAtrCal"] = $stmt_select_atributos_calidad->fetchAll(PDO::FETCH_ASSOC);

        array_push($result, $row_atributos_producto);
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
