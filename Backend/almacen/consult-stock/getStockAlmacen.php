<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if($pdo){
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $idProd = $data["idProd"];
    
        $idAlmacenPrincipal = 1;
        $idAlmacenAuxiliar = 8;
    
        // recorremos las entradas del almacen principal
        $sql_consulta_stock_almacen_principal = 
        "SELECT SUM(canTotDis) FROM entrada_stock 
        WHERE idProd = ? AND idAlm = ? AND canTotDis > 0";
        $stmt_consulta_stock_almacen_principal = $pdo->prepare($sql_consulta_stock_almacen_principal);
        $stmt_consulta_stock_almacen_principal->bindParam(1, $idProd, PDO::PARAM_INT);
        $stmt_consulta_stock_almacen_principal->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
        $stmt_consulta_stock_almacen_principal->execute();
        $result["principal"] = $stmt_consulta_stock_almacen_principal->fetchAll(PDO::FETCH_COLUMN);
    
        // recorremos las entradas del almacen auxiliar
        $sql_consulta_stock_almacen_auxiliar =
        "SELECT SUM(canTotDis) FROM entrada_stock
        WHERE idProd = ? AND idAlm = ? AND canTotDis > 0";
        $stmt_consulta_stock_almacen_auxiliar = $pdo->prepare($sql_consulta_stock_almacen_auxiliar);
        $stmt_consulta_stock_almacen_auxiliar->bindParam(1, $idProd, PDO::PARAM_INT);
        $stmt_consulta_stock_almacen_auxiliar->bindParam(2, $idAlmacenAuxiliar, PDO::PARAM_INT);
        $stmt_consulta_stock_almacen_auxiliar->execute();
        $result["auxiliar"] = $stmt_consulta_stock_almacen_auxiliar->fetchAll(PDO::FETCH_COLUMN);
    } else {
        $message_error = "ERROR EN LA CONECCION";
        $description_error = "ERROR EN LA CONECCION";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}