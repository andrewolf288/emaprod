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

    $detProdFinLotProd = $data["detProdFinLotProd"];
    $datosTransformacion = $data["datosTransformacion"];
    $idOrdTrans = $datosTransformacion["id"];

    $fecha = date('Y-m-d H:i:s'); // fecha actual

    if ($pdo) {
        try {
            // iniciamos una transaccion
            $pdo->beginTransaction();
            foreach ($detProdFinLotProd as $row) {
                $idProdt = $row["idProdt"];
                $idProdc = $row["idProdc"];
                $canProdFin = $row["canProdFin"];
                $fecVenSto = $row["fecVenSto"];
                $fecEntSto = $row["fecEntSto"];

                $sql_insert_ingreso_orden_transformacion = 
                "INSERT INTO orden_transformacion_ingreso_producto
                (idOrdTrans, idProdc, idProdt, canProdIng, fecProdIng, fecProdVen)
                VALUES(?, ?, ?, $canProdFin, ?, ?)";
                $stmt_insert_ingreso_orden_transformacion = $pdo->prepare($sql_insert_ingreso_orden_transformacion);
                $stmt_insert_ingreso_orden_transformacion->bindParam(1, $idOrdTrans, PDO::PARAM_INT );
                $stmt_insert_ingreso_orden_transformacion->bindParam(2, $idProdc, PDO::PARAM_INT);
                $stmt_insert_ingreso_orden_transformacion->bindParam(3, $idProdt, PDO::PARAM_INT);
                $stmt_insert_ingreso_orden_transformacion->bindParam(4, $fecEntSto, PDO::PARAM_STR);
                $stmt_insert_ingreso_orden_transformacion->bindParam(5, $fecVenSto, PDO::PARAM_STR);
                $stmt_insert_ingreso_orden_transformacion->execute();
            }
            // commit de los cambios
            $pdo->commit();
        } catch (PDOException $e) {
            // rolllback de la operacion
            $pdo->rollBack();
            $message_error = "Error al crear el ingreso de producto a produccion";
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