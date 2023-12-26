<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdt = $data["idProdt"];
    $detAtriCal = $data["detAtriCal"];

    if ($pdo) {
        try {
            $pdo->beginTransaction();
            foreach ($detAtriCal as $detalle) {
                $sql_create_atributo_calidad =
                    "INSERT INTO producto_atributo_calidad
                (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr)
                VALUES(?, ?, ?, ?)";
                $stmt_create_atributo_calidad = $pdo->prepare($sql_create_atributo_calidad);
                $stmt_create_atributo_calidad->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_create_atributo_calidad->bindParam(2, $detalle["nomProdAtr"], PDO::PARAM_STR);
                $stmt_create_atributo_calidad->bindParam(3, $detalle["idTipProdAtr"], PDO::PARAM_STR);
                $stmt_create_atributo_calidad->bindParam(4, $detalle["opcProdAtr"], PDO::PARAM_STR);
                $stmt_create_atributo_calidad->execute();
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "Error en la insercion de los datos";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
