<?php

require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {

        $frescosSinSeleccionar = "2401"; // frescos sin seleccionar
        $materiasPrimasSinSeleccionar = "2402"; // materias primas sin seleccionar

        $sql =
            "SELECT
        M.id,
        M.idMed,
        ME.simMed,
        M.idSubCla,
        SC.codSubCla,
        M.nomProd,
        M.codProd2,
        M.esMatPri,
        M.esProFin,
        M.esProProd
        FROM producto M
        LEFT JOIN medida ME ON M.idMed = ME.id
        LEFT JOIN sub_clase SC ON M.idSubCla = SC.id   
        WHERE SC.codSubCla = ? OR SC.codSubCla = ?
        ";

        try {
            // Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $frescosSinSeleccionar, PDO::PARAM_STR);
            $stmt->bindParam(2, $materiasPrimasSinSeleccionar, PDO::PARAM_STR);
            // Ejecutamos la consulta
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
