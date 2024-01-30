<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        // primero definimos el almacen
        $idAlm = 1;
        $tolerancia = 0.000001;

        $sql_select_stock_almacen =
            "SELECT idProd, canStoDis FROM almacen_stock WHERE idAlm = ?";
        $stmt_select_stock_almacen = $pdo->prepare($sql_select_stock_almacen);
        $stmt_select_stock_almacen->bindParam(1, $idAlm, PDO::PARAM_INT);
        $stmt_select_stock_almacen->execute();

        while ($row = $stmt_select_stock_almacen->fetch(PDO::FETCH_ASSOC)) {
            $canTotal = 0;
            $idProd = $row["idProd"];
            $canStoDis = $row["canStoDis"];
            $sql_select_entradas_stock =
                "SELECT canTotDis FROM entrada_stock WHERE idProd = ? AND idAlm = ?";
            $stmt_select_entradas_stock = $pdo->prepare($sql_select_entradas_stock);
            $stmt_select_entradas_stock->bindParam(1, $idProd, PDO::PARAM_INT);
            $stmt_select_entradas_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
            $stmt_select_entradas_stock->execute();
            while ($row_entrada = $stmt_select_entradas_stock->fetch(PDO::FETCH_ASSOC)) {
                $canTotal += $row_entrada["canTotDis"];
            }
            array_push($result, [
                "idProd" => $idProd,
                "stock" => $canStoDis,
                "stockEntradas" => $canTotal,
                "cuadre" => abs($canStoDis - $canTotal) < $tolerancia
            ]);
        }
    } else {
        $message_error = "ERROR EN LA CONECCION";
        $description_error = "ERROR EN LA CONECCION";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
