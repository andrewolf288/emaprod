<?php
// CON ESTE SCRIPT DEBEMOS TRAER LA INFORMACION DE LA OPERACION DEVOLUCION CALIDAD POR ID
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion_integracion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDOContanet();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    # obtengo la informacion enviada de consulta
    $serie = $data["serie"];
    $numero = $data["numero"];
    $documento = $data["documento"];
    $producto = $data["producto"];

    # consulta para obtener la informacion de la orden de compra
    $sql_consult_orden_compra =
    "SELECT 
    cm.Cd_Com, 
    CONVERT(VARCHAR, cm.FecED, 103) AS FecED,
    cm.NroSre, 
    cm.NroDoc
    FROM dbo.Compra2 AS cm
    JOIN dbo.Proveedor2 AS pv ON pv.Cd_Prv = cm.Cd_Prv
    WHERE cm.NroSre = ? AND cm.NroDoc = ? AND pv.NDoc = ?";
    $stmt_consult_orden_compra = $pdo->prepare($sql_consult_orden_compra);
    $stmt_consult_orden_compra->bindParam(1, $serie, PDO::PARAM_STR);
    $stmt_consult_orden_compra->bindParam(2, $numero, PDO::PARAM_STR);
    $stmt_consult_orden_compra->bindParam(3, $documento, PDO::PARAM_STR);
    $stmt_consult_orden_compra->execute();
    $row_orden_compra = $stmt_consult_orden_compra->fetch(PDO::FETCH_ASSOC);
    
    if($row_orden_compra){
        $Cd_Com = $row_orden_compra["Cd_Com"];
        $sql_compra_detalle = 
        "SELECT
        cmd.Cant
        FROM dbo.CompraDet2 AS cmd
        JOIN dbo.Producto2 AS prd ON prd.Cd_Prod = cmd.Cd_Prod
        WHERE cmd.Cd_Com = ? AND prd.CodCo2_ = ?";
        $stmt_compra_detalle = $pdo->prepare($sql_compra_detalle);
        $stmt_compra_detalle->bindParam(1, $Cd_Com, PDO::PARAM_STR);
        $stmt_compra_detalle->bindParam(2, $producto, PDO::PARAM_STR);
        $stmt_compra_detalle->execute();
        $row_compra_detalle = $stmt_compra_detalle->fetch(PDO::FETCH_ASSOC);

        if($row_compra_detalle){
            $cantidad = $row_compra_detalle['Cant'];
            $row_orden_compra["cantidad"] = $cantidad;
        }

        $result = $row_orden_compra;
    } else {
        $message_error = "No se encontraron resultados";
        $description_error = "No se encontraron resultados";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}