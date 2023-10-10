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

    $idProdCat = $data["idProdCat"];
    $nomProd = $data["nomProd"];
    $desProd = $data["desProd"];
    $stoProd = $data["stoProd"];

    if ($pdo) {
        $sql =
            "INSERT INTO
        producto
        (idProdCat, nomProd, desProd, stoProd)
        VALUES (?,?,?,'$stoProd')
        ";
        //Preparamos la consulta
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $idProdCat, PDO::PARAM_INT); //CATEGORIA
        $stmt->bindParam(2, $nomProd, PDO::PARAM_STR); //NOMBRE
        $stmt->bindParam(3, $desProd, PDO::PARAM_STR); //DESCRIPCION

        // Comprobamos la respuesta
        try {
            if (!$stmt->execute()) {
                $message_error = "No se pudo realizar la insercion";
                $description_error = "No se pudo realizar la insercion por favor verifique los datos ingresados";
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
