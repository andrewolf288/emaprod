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

        $idProveedor = $data["id"];
        $codPro = $data["codPro"];
        $nomPro = $data["nomPro"];
        $apePro = $data["apePro"];
        //if(isset($data["desMatPri"]))
        $desPro = $data["desPro"];

        if ($pdo) {
            $sql =
                "UPDATE
            proveedor
            SET codPro = :codPro,
            nomPro = :nomPro,
            apePro = :apePro,
            desPro = :desPro
            WHERE id = :id;
            ";
            //Preparamos la consulta
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':codPro', $codPro, PDO::PARAM_STR); //CODIGO
            $stmt->bindParam(':nomPro', $nomPro, PDO::PARAM_INT); //NOMBRE
            $stmt->bindParam(':apePro', $apePro, PDO::PARAM_STR); //APELLIDO
            $stmt->bindParam(':desPro', $desPro, PDO::PARAM_INT); //DESCRIPCION
            $stmt->bindParam(':id', $idProveedor, PDO::PARAM_INT); //ID

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
        $message_error = "No se proporciono el id del proveedor";
        $description_error = "No se proporciono el id del proveedor en la consulta";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
