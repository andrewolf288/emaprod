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

    $codPro = $data["codPro"];
    $nomPro = $data["nomPro"];
    $apePro = $data["apePro"];
    //if(isset($data["desMatPri"]))
    $desPro = $data["desPro"];

    if ($pdo) {
        $sql =
            "INSERT INTO
            proveedor
            (codPro,nomPro,apePro,desPro)
            VALUES (?,?,?,?);
            ";
        //Preparamos la consulta
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $codPro, PDO::PARAM_STR); //CODIGO
        $stmt->bindParam(2, $nomPro, PDO::PARAM_INT); //NOMBRE
        $stmt->bindParam(3, $apePro, PDO::PARAM_STR); //APELLIDO
        $stmt->bindParam(4, $desPro, PDO::PARAM_INT); //DESCRIPCION

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

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
