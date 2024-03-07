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

    $codLot = $data["codLot"]; // lotes utilizados
    $anioCreLote = $data["anioCreLote"]; // producto
    $idProdt = $data["idProdt"]; // producto
    $proRef = 0;

    // buscamos la referencia del producto del detalle
    $sql_consult_producto =
        "SELECT proRef FROM producto WHERE id = ?";
    $stmt_consult_producto = $pdo->prepare($sql_consult_producto);
    $stmt_consult_producto->bindParam(1, $idProdt, PDO::PARAM_INT);
    $stmt_consult_producto->execute();

    $row_consult_producto = $stmt_consult_producto->fetch(PDO::FETCH_ASSOC);
    if ($row_consult_producto) {
        $proRef = $row_consult_producto["proRef"];
    }

    $sql_find_lote_produccion =
        "SELECT pd.id AS refProdc, pd.idProdt, pd.codProd, pd.codLotProd, pd.fecProdIni, pd.fecVenLotProd 
    FROM produccion AS pd
    WHERE pd.codLotProd = ? AND YEAR(pd.fecProdIni) = ? AND pd.idProdt = ? LIMIT 1";

    $stmt_find_lote_produccion = $pdo->prepare($sql_find_lote_produccion);
    $stmt_find_lote_produccion->bindParam(1, $codLot, PDO::PARAM_STR);
    $stmt_find_lote_produccion->bindParam(2, $anioCreLote, PDO::PARAM_STR);
    $stmt_find_lote_produccion->bindParam(3, $proRef, PDO::PARAM_INT);
    $stmt_find_lote_produccion->execute();

    $row_find_element = $stmt_find_lote_produccion->fetch(PDO::FETCH_ASSOC);

    if ($row_find_element) {
        $refProdc = $row_find_element["id"];
        $entradas_lote = array();
        // debemos comprobar que el lote elegido tenga entradas
        $sql_select_entradas_stock_lote =
            "SELECT * FROM entrada_stock
        WHERE refProdc = ? LIMIT 1";
        $stmt_select_entradas_stock_lote = $pdo->prepare($sql_select_entradas_stock_lote);
        $stmt_select_entradas_stock_lote->bindParam(1, $refProdc, PDO::PARAM_INT);
        $stmt_select_entradas_stock_lote->execute();

        $entradas_lote = $stmt_select_entradas_stock_lote->rowCount();
        if ($entradas_lote > 0) {

            $result = $row_find_element;
        } else {
            $message_error = "No se encontraron entradas";
            $description_error = "El lote seleccionado no tiene entradas";
        }
    } else {
        $message_error = "No se encontro el lote de producción";
        $description_error = "No se encontro el lote de producción o el producto del detalle no corresponde al lote ingresado";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
