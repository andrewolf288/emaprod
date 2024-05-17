<?php
// CON ESTE SCRIPT DEBEMOS TRAER LA INFORMACION DE LA OPERACION DEVOLUCION CALIDAD POR ID
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idAlm = $data["idAlmacen"];
    $idProdt = $data["idProducto"];
    $idEntStoEst = 1;

    if($pdo){
        $sql_entradas_stock =
            "SELECT 
            id,
        codEntSto,
        canTotDis,
        docEntSto,
        DATE(fecEntSto) AS fecEntSto
        FROM entrada_stock
        WHERE idAlm = ? AND idProd = ? AND idEntStoEst = ? AND canTotDis > 0
        ORDER BY fecEntSto ASC";
        $stmt_entradas_stock = $pdo->prepare($sql_entradas_stock);
        $stmt_entradas_stock->bindParam(1, $idAlm, PDO::PARAM_INT);
        $stmt_entradas_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
        $stmt_entradas_stock->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
        $stmt_entradas_stock->execute();
        $result = $stmt_entradas_stock->fetchAll(PDO::FETCH_ASSOC);
    }  else {
        $message_error = "Error al intentar conectarse con la base de daors";
        $description_error = "Error al intentar conectarse con la base de daors";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
