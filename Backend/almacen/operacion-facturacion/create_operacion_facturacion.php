<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $esSal = $data["esSal"];
    $esEnt = $data["esEnt"];
    $idGuiRem = $data["idRefGui"]; // identificador de guia de remision
    $items = $data["items"]; // arreglo de items
    $idCredNot = $data["idCredNot"]; // id de la nota decredito
    $idMot = intVal($data["idMotivo"]); // motivo

    if ($pdo) {
        $idLastInsertion = 0; // id de la utlima insercion
        // primero debemos comprobar que tipo de operacion se esta realizando:
        // 1. Salida, 2. Ingreso
        try {
            $pdo->beginTransaction();
            if ($esSal == 1) {
                // cuando hablamos de una salida
                // 1. Tenemos que comprobar que no exista una operacion de salida con el mismo id de guia de remision
                $esSal = 1;
                $idOpeFacMot = 1;
                $sql_operacion_facturacion_salida =
                    "SELECT * FROM operacion_facturacion
                WHERE esSal = ? AND idGuiRem = ? LIMIT 1";
                $stmt_operacion_facturacion_salida = $pdo->prepare($sql_operacion_facturacion_salida);
                $stmt_operacion_facturacion_salida->bindParam(1, $esSal, PDO::PARAM_BOOL);
                $stmt_operacion_facturacion_salida->bindParam(2, $idGuiRem, PDO::PARAM_INT);
                $stmt_operacion_facturacion_salida->execute();

                if ($stmt_operacion_facturacion_salida->rowCount() == 0) {
                    $sql_create_operacion_facturacion_salida =
                        "INSERT INTO operacion_facturacion (idGuiRem, idOpeFacMot, esSal)
                    VALUES (?, ?, ?)";
                    $stmt_create_operacion_facturacion_salida = $pdo->prepare($sql_create_operacion_facturacion_salida);
                    $stmt_create_operacion_facturacion_salida->bindParam(1, $idGuiRem, PDO::PARAM_INT);
                    $stmt_create_operacion_facturacion_salida->bindParam(2, $idOpeFacMot, PDO::PARAM_INT);
                    $stmt_create_operacion_facturacion_salida->bindParam(3, $esSal, PDO::PARAM_BOOL);
                    $stmt_create_operacion_facturacion_salida->execute();
                    $idLastInsertion = $stmt_create_operacion_facturacion_salida = $pdo->lastInsertId();
                } else {
                    $message_error = "No se pudo crear la operacion facturacion";
                    $description_error = "Ya se ha registrado esta guia de remision como salida de venta";
                }
            }
            if ($esEnt == 1) {
                // cuando hablamos de un ingeso
                $idOpeFacMot = 1; // motivo de salida de guia de remision
                $esEnt = 1;
                $fueAfePorDev = false;

                $sql_consult_operacion =
                    "SELECT * FROM operacion_facturacion
                WHERE idGuiRem = ? AND idOpeFacMot = ? AND fueAfePorDev = ?";
                $stmt_consult_operacion = $pdo->prepare($sql_consult_operacion);
                $stmt_consult_operacion->bindParam(1, $idRefGui, PDO::PARAM_INT);
                $stmt_consult_operacion->bindParam(2, $idOpeFacMot, PDO::PARAM_INT);
                $stmt_consult_operacion->bindParam(3, $fueAfePorDev, PDO::PARAM_BOOL);
                $stmt_consult_operacion->execute();

                $row = $stmt_consult_operacion->fetch(PDO::FETCH_ASSOC);

                if ($row) {
                }
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
