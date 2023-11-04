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

    $producto = $data["producto"];
    $idAlm = 1;

    $result["data"] = [];
    $result["header"] = ["Clase", "Sub Clase", "SIGO", "EMAPROD", "Nombre", "Medida", "Cantidad", "Fecha actualizado"];
    $result["columnWidths"] = [17.88, 25.88, 8, 9, 66, 5.75, 10, 18];
    $sql =
        "SELECT
    cl.desCla,
    scl.desSubCla,
    p.codProd,
    p.codProd2,
    p.nomProd,
    me.simMed,
    als.canSto,
    als.fecActAlmSto
    FROM almacen_stock AS als
    JOIN producto AS p ON p.id = als.idProd
    JOIN medida AS me ON me.id = p.idMed
    JOIN clase AS cl ON cl.id = p.idCla
    JOIN sub_clase AS scl ON scl.id = p.idSubCla
    WHERE als.idAlm = $idAlm
    ";
    if ($producto !== 0) {
        $sql = $sql . " AND als.idProd = $producto";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $result["data"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
