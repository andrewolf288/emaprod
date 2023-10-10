<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idLotProdc = $data["id"];

        $sql =
            "SELECT
        pd.id,
        pd.idProdt,
        p.nomProd,
        pd.idProdEst,
        pe.desEstPro,
        pd.idProdTip,
        pt.desProdTip,
        pd.codLotProd,
        pd.klgLotProd,
        pd.canLotProd,
        pd.fecVenLotProd
    FROM produccion pd
    JOIN producto as p ON p.id = pd.idProdt
    JOIN produccion_estado as pe ON pe.id = pd.idProdEst
    JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
    WHERE pd.id = ?";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idLotProdc, PDO::PARAM_INT);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
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
