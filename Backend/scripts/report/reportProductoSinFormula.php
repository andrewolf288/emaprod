<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $array_producto_sin_formula = array();

    $idCla = 2;
    $sql_select_presentaciones_finales =
        "SELECT * FROM producto WHERE idCla = ?";
    $stmt_select_presentaciones_finales = $pdo->prepare($sql_select_presentaciones_finales);
    $stmt_select_presentaciones_finales->bindParam(1, $idCla, PDO::PARAM_INT);
    $stmt_select_presentaciones_finales->execute();

    while ($row_producto_final = $stmt_select_presentaciones_finales->fetch(PDO::FETCH_ASSOC)) {
        $sql_select_formula_final =
            "SELECT * FROM formula_producto_terminado
        WHERE idProdFin = ?";
        $stmt_select_formula_final = $pdo->prepare($sql_select_formula_final);
        $stmt_select_formula_final->bindParam(1, $row_producto_final["id"], PDO::PARAM_INT);
        $stmt_select_formula_final->execute();
        $row_select_formula_final = $stmt_select_formula_final->fetch(PDO::FETCH_ASSOC);

        if (!$row_select_formula_final) {
            array_push($array_producto_sin_formula, $row_producto_final["nomProd"]);
        }
    }

    $result = $array_producto_sin_formula;

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
