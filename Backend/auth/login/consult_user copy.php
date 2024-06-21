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

    //DATOS RECIBIDOS
    $username = $data["useUsu"];
    $password = $data["pasUsu"];

    if ($pdo) {
        // VERIFICAMOS SI EXISTE UN USUARIO CON LAS CREDENCIALES INGRESADAS

        // INSERTAMOS LA ENTRADA
        $sql =
            "SELECT 
            idRolUsu,
            idAre,
            nomUsu,
            apeUsu
             FROM
            usuario
            WHERE useUsu = ? AND pasUsu = ?  
        ";
        //Preparamos la consulta
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $username, PDO::PARAM_INT);
        $stmt->bindParam(2, $password, PDO::PARAM_INT);
        // Comprobamos la respuesta
        try {
            $stmt->execute();
            //die(json_encode($stmt->fetch())  );

            $total_result = $stmt->rowCount();
            if ($total_result == 1) {
                while ($row = $stmt->fetch()) {
                    $result = $row;
                }
            } else {
                $message_error = "Usuario o contraseña incorrectos";
                $description_error = "Las credenciales ingresadas no pertenecen a ningun usuario";
            }
        } catch (PDOException $e) {
            $pdo->rollback();
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
