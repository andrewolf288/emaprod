<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "PUT") {

    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idEntradaStock = $data["id"]; // entrada stock
        $idEntradaCalidad = $data["idEntCal"]; // entrada calidad
        $esAprEnt = $data["esAprEnt"]; // aprobacion de calidad

        try {
            $pdo->beginTransaction();
            $fecActEntCal = date('Y-m-d H:i:s');;
            // primero debemos actualizar los datos de calidad
            $sql_update_entrada_calidad =
                "UPDATE entrada_calidad SET esAprEnt = ?, fecActEntCal = ?
            WHERE id = ?";
            $stmt_update_entrada_calidad = $pdo->prepare($sql_update_entrada_calidad);
            $stmt_update_entrada_calidad->bindParam(1, $esAprEnt, PDO::PARAM_BOOL);
            $stmt_update_entrada_calidad->bindParam(2, $fecActEntCal, PDO::PARAM_STR);
            $stmt_update_entrada_calidad->bindParam(3, $idEntradaCalidad, PDO::PARAM_INT);
            $stmt_update_entrada_calidad->execute();

            // FINALMENTE DEBEMOS VERIFICAR EL VALOR DE APROBACION
            $idEntStoEst = $esAprEnt === true ? 1 : 2;
            $sql_update_entrada_stock =
                "UPDATE entrada_stock SET idEntStoEst = ?
            WHERE id = ?";
            $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
            $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
            $stmt_update_entrada_stock->bindParam(2, $idEntradaStock, PDO::PARAM_INT);
            $stmt_update_entrada_stock->execute();

            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "OCURRIO UN ERROR EN EL PROCESO";
            $description_error = $e->getMessage();
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
