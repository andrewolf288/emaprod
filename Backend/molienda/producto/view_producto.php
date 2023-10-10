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
    if (isset($data["id"])) {

        $idProducto = $data["id"];

        if ($pdo) {
            $sql =
                "SELECT
            P.id,
            P.nomProd, 
            P.desProd,
            PC.desProdCat,
            P.idProdCat,
            P.stoProd
            FROM producto P
            LEFT JOIN producto_categoria PC ON P.idProdCat = PC.id
            WHERE P.id = ?
            ";
            // Preparamos la consulta
            $stmt = $pdo->prepare($sql);

            $stmt->bindParam(1, $idProducto, PDO::PARAM_INT);
            // Ejecutamos la consulta
            try {
                $stmt->execute();
            } catch (Exception $e) {
                $message_error = "ERROR INTERNO SERVER";
                $description_error = $e->getMessage();
            }
            // Recorremos los resultados
            $count_results = 0;
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
                $count_results++;
            }

            if ($count_results == 0) {
                $message_error = "No se pudo encontrar el elemento";
                $description_error = "El id proporcionado no corresponde a ningun producto";
            }
        } else {
            // No se pudo realizar la conexion a la base de datos
            $message_error = "Error con la conexion a la base de datos";
            $description_error = "Error con la conexion a la base de datos a traves de PDO";
        }
    } else {
        $message_error = "No se proporciono el id del producto";
        $description_error = "No se proporciono el id del producto en la consulta";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
