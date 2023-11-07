<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idEntSto = $data["idEntSto"];
    /*
        Este script sirve para obtener información sobre el siguimiento de una entrada en especifico 
    */
    $sql_entrada_stock =
        "SELECT * FROM entrada_stock
    WHERE id = ?";
    $stmt_entrada_stock = $pdo->prepare($sql_entrada_stock);
    $stmt_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
    $stmt_entrada_stock->execute();

    $entrada_selected = $stmt_entrada_stock->fetch(PDO::FETCH_ASSOC);
    $cantidadSalida = 0;

    if ($entrada_selected) {
        $result = $entrada_selected;
        $result["salidas"] = [];

        $sql_salidas_entrada_stock =
            "SELECT * FROM salida_stock
        WHERE idEntSto = ?";
        $stmt_salidas_entrada_stock = $pdo->prepare($sql_salidas_entrada_stock);
        $stmt_salidas_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salidas_entrada_stock->execute();

        while ($row = $stmt_salidas_entrada_stock->fetch(PDO::FETCH_ASSOC)) {
            $canSalStoReq = $row["canSalStoReq"];
            $cantidadSalida += $canSalStoReq;
            array_push($result["salidas"], $row);
        }

        $result["cantidadSalidas"] = $cantidadSalida;
    } else {
        $return['message_error'] = "Error al encontrar la entrada";
        $return['description_error'] = "No se encontro la entrada";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
