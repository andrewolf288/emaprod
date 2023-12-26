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

    $detProdFinLotProd = $data["detProdFinLotProd"]; // obtenenmos el detalle de los productos finales
    $datosProduccion = $data["datosProduccion"]; // datos de produccion
    $idProdc = $datosProduccion["idProduccion"]; // id de produccion
    $codLotProd = $datosProduccion["codLotProd"]; // codigo de lote

    $fecha = date('Y-m-d H:i:s'); // fecha actual

    //regProFin
    if ($pdo) {
        try {
            // iniciamos una transaccion
            $pdo->beginTransaction();

            foreach ($detProdFinLotProd as $row) {
                $idProdc = $row["idProdc"]; // lote produccion
                $idProdt = $row["idProdt"]; // producto
                $canProdFin = $row["canProdFin"]; // cantidad total
                $fecVenEntProdFin = $row["fecVenEntProdFin"]; // fecha de vencimiento
                $idProdFinal = $row["idProdFinal"]; // id de producto en produccion_producto_final
                $fecEntSto = $row["fecEntSto"]; // fecha entrada

                $sql_create_produccion_ingreso_producto =
                    "INSERT INTO produccion_ingreso_producto
                (idProdc, codLot, idProdt, refProdtProg, canProdIng, fecProdIng, fecProdVen)
                VALUES(?, ?, ?, ?, $canProdFin, ?, ? )";
                $stmt_create_produccion_ingreso_producto = $pdo->prepare($sql_create_produccion_ingreso_producto);
                $stmt_create_produccion_ingreso_producto->bindParam(1, $idProdc, PDO::PARAM_INT);
                $stmt_create_produccion_ingreso_producto->bindParam(2, $codLotProd, PDO::PARAM_STR);
                $stmt_create_produccion_ingreso_producto->bindParam(3, $idProdt, PDO::PARAM_INT);
                $stmt_create_produccion_ingreso_producto->bindParam(4, $idProdFinal, PDO::PARAM_INT);
                $stmt_create_produccion_ingreso_producto->bindParam(5, $fecEntSto, PDO::PARAM_STR);
                $stmt_create_produccion_ingreso_producto->bindParam(6, $fecVenEntProdFin, PDO::PARAM_STR);
                $stmt_create_produccion_ingreso_producto->execute();
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
