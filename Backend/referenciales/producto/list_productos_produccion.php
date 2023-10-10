<?php

require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $parameter = "";

    if (isset($data["idFrescos"]) && isset($data["idSalPar"])) {
        $parameter = " and M.idSubCla =  " . $data["idFrescos"] . "  or M.idSubCla = " . $data["idSalPar"];
    }
    if (isset($data["idMol"])) {
        $parameter = " and M.idSubCla =  " . $data["idMol"];
    }

    //die(json_encode($parameter));

    if ($pdo) {
        $sql =
            "SELECT
        M.id,
        M.idMed,
        ME.simMed,
        M.nomProd,
        M.codProd2,
        M.esMatPri,
        M.esProFin,
        M.esProProd
        FROM producto M
        LEFT JOIN medida ME ON M.idMed = ME.id
        WHERE M.esProProd = ? " . $parameter;
        // Preparamos la consulta
        $stmt = $pdo->prepare($sql);
        $esProInt = 1; // filtramos los productos de molienda
        $stmt->bindParam(1, $esProInt, PDO::PARAM_BOOL);
        // Ejecutamos la consulta
        try {
            $stmt->execute();
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
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
