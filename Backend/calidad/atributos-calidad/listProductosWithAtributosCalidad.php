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

    $idCla = 1; // clase materia prima
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
    JOIN sub_clase as sc on sc.id = p.idSubCla
    WHERE p.idCla = ?";
    $stmt_selet_producto_with_atributos = $pdo->prepare($sql_select_producto_with_atributos);
    $stmt_selet_producto_with_atributos->bindParam(1, $idCla, PDO::PARAM_INT);
    $stmt_selet_producto_with_atributos->execute();

    $productos = $stmt_selet_producto_with_atributos->fetchAll(PDO::FETCH_ASSOC);

    foreach ($productos as $producto) {
        $idProdt = $producto["id"];
        $producto["detAtrCal"] = array();

        $sql_select_atributos_calidad =
            "SELECT * FROM producto_atributo_calidad
        WHERE idProdt = ?";
        $stmt_select_atributos_calidad = $pdo->prepare($sql_select_atributos_calidad);
        $stmt_select_atributos_calidad->bindParam(1, $idProdt, PDO::PARAM_INT);
        $stmt_select_atributos_calidad->execute();

        $producto["detAtrCal"] = $stmt_select_atributos_calidad->fetchAll(PDO::FETCH_ASSOC);

        array_push($result, $producto);
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
