<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReqEmpProm = $data["idReqEmpProm"];
    $idProdt = $data["idProdt"];
    $canProdIng = $data["canProdFin"];
    $fecProdIng = $data["fecEntSto"];
    $fecProdVen = $data["fecVenEntProdFin"];

    if ($pdo) {
        try {
            $sql_create_ingreso_requisicion_subproducto =
                "INSERT INTO requisicion_empaquetado_promocional_ingreso
            (idReqEmpProm, idProdt, canProdIng, fecProdIng, fecProdVen)
            VALUES(?, ?, $canProdIng, ?, ?)";
            $stmt_create_ingreso_requisicion_subproducto = $pdo->prepare($sql_create_ingreso_requisicion_subproducto);
            $stmt_create_ingreso_requisicion_subproducto->bindParam(1, $idReqEmpProm, PDO::PARAM_INT);
            $stmt_create_ingreso_requisicion_subproducto->bindParam(2, $idProdt, PDO::PARAM_INT);
            $stmt_create_ingreso_requisicion_subproducto->bindParam(3, $fecProdIng, PDO::PARAM_STR);
            $stmt_create_ingreso_requisicion_subproducto->bindParam(4, $fecProdVen, PDO::PARAM_STR);
            $stmt_create_ingreso_requisicion_subproducto->execute();
        } catch (PDOException $e) {
            $message_error = "Error en la operación";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "No se pudo conectar con la base de datos";
        $description_error = "No se pudo conectar con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
