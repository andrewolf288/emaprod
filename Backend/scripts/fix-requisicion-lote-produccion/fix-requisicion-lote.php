<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $pdo->beginTransaction();
        $sql_produccion = 
        "SELECT id, codLotProd FROM produccion
        WHERE obsProd = ''";
        $stmt_produccion = $pdo->prepare($sql_produccion);
        $stmt_produccion->execute();

        while($row_produccion = $stmt_produccion->fetch(PDO::FETCH_ASSOC)){
            $idProdc = $row_produccion["id"];
            $codLotProd = $row_produccion["codLotProd"];

            $sql_select_requisicion = 
            "SELECT id FROM requisicion
            WHERE codLotProd = ? AND idReqTip = 1";
            $stmt_select_requisicion = $pdo->prepare($sql_select_requisicion);
            $stmt_select_requisicion->bindParam(1, $codLotProd, PDO::PARAM_STR);
            $stmt_select_requisicion->execute();
            $row_requisicion = $stmt_select_requisicion->fetch(PDO::FETCH_ASSOC);

            $sql_update_produccion = 
            "UPDATE produccion SET idReqLot = ?
            WHERE id = ?";
            $stmt_update_produccion = $pdo->prepare($sql_update_produccion);
            $stmt_update_produccion->bindParam(1, $row_requisicion["id"], PDO::PARAM_INT);
            $stmt_update_produccion->bindParam(2, $idProdc, PDO::PARAM_INT);
            $stmt_update_produccion->execute();
        }

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "HUBO UN PROBLEMA";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
