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

    $sql_select_formula =
        "SELECT 
    fptd.idForProdFin,
    fpt.idProdFin,
    p.nomProd
    FROM formula_producto_terminado_detalle AS fptd
    JOIN formula_producto_terminado AS fpt ON fpt.id = fptd.idForProdFin
    JOIN producto AS p ON p.id = fpt.idProdFin
    WHERE fptd.idProd = ?";
    $stmt_select_formula = $pdo->prepare($sql_select_formula);
    $stmt_select_formula->bindParam(1, $idProdtInt, PDO::PARAM_INT);
    $stmt_select_formula->execute();
    $rows_detalles_formulas = $stmt_select_formula->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows_detalles_formulas as &$row_detalle_formula) {
        $row_detalle_formula["detFor"] = array();

        $idForProdFin = $row_detalle_formula["idForProdFin"];
        $sql_select_formula_detalle =
            "SELECT
        fptd.id,
        fptd.idForProdFin,
        fptd.idProd,
        p.nomProd,
        fptd.canForProDet
        FROM formula_producto_terminado_detalle AS fptd
        JOIN producto AS p ON p.id = fptd.idProd
        WHERE fptd.idForProdFin = ?";
        $stmt_select_formula_detalle = $pdo->prepare($sql_select_formula_detalle);
        $stmt_select_formula_detalle->bindParam(1, $idForProdFin, PDO::PARAM_INT);
        $stmt_select_formula_detalle->execute();

        $row_detalle_formula["detFor"] = $stmt_select_formula_detalle->fetchAll(PDO::FETCH_ASSOC);
        unset($row_detalle_formula["idForProdFin"]);
    }
    // print_r($rows_detalles_formulas);
    $result = $rows_detalles_formulas;

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
