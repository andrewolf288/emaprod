<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (isset($data["id"])) {

        $idProducto = $data["id"];
        $idProdCat = $data["idProdCat"];
        $nomProd = $data["nomProd"];
        $desProd = $data["desProd"];
        $stoProd = $data["stoProd"];

        if ($pdo) {
            $sql =
                "UPDATE
            producto
            SET idProdCat = ?,
            nomProd = ?,
            desProd = ?,
            stoProd = '$stoProd'
            WHERE id = ?;
            ";
            //Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idProdCat, PDO::PARAM_INT); //ID CATEGORIA
            $stmt->bindParam(2, $nomProd, PDO::PARAM_STR); //NOMBRE
            $stmt->bindParam(3, $desProd, PDO::PARAM_STR); //DESCRIPCION
            $stmt->bindParam(4, $idProducto, PDO::PARAM_INT); //ID PRODUCTO

            // Comprobamos la respuesta
            try {
                if (!$stmt->execute()) {
                    $message_error = "No se pudo realizar la actualización";
                    $description_error = "No se pudo actualizar, por favor verifique que existe el id ingresado";
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
    } else {
        $message_error = "No se proporciono el id del producto";
        $description_error = "No se proporciono el id del producto";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
