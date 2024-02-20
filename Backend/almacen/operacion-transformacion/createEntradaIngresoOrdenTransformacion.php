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

    $idOrdTrans = $data["idOrdTrans"];
    $idProdcIngProdt = $data["id"];
    $idProdt = $data["idProdt"]; // producto
    $refProdtProg = $data["refProdtProg"]; // referencia producto programado
    $canProdIng = $data["canProdIng"]; // cantidad ingresada
    $fecProdIngAlm = date('Y-m-d H:i:s'); // fecha ingreso almacen

    //regProFin
    if ($pdo) {
        try {
            $pdo->beginTransaction();
            // 1. buscamos de que salida salio el producto para transformar
            $sql_consult_orden_transformacion_salida =
                "SELECT * FROM salida_orden_transformacion
            WHERE idOrdTrans = ?";
            $stmt_consult_orden_transformacion_salida = $pdo->prepare($sql_consult_orden_transformacion_salida);
            $stmt_consult_orden_transformacion_salida->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
            $stmt_consult_orden_transformacion_salida->execute();

            $row_salida_orden_transformacion = $stmt_consult_orden_transformacion_salida->fetch(PDO::FETCH_ASSOC);

            // 2. debemos consultar los datos de la entrada correspondiente
            $sql_select_entrada_stock_movimiento_salida =
                "SELECT * FROM entrada_stock
            WHERE id = ?";
            $stmt_select_entrada_stock_movimiento_salida = $pdo->prepare($sql_select_entrada_stock_movimiento_salida);
            $stmt_select_entrada_stock_movimiento_salida->bindParam(1, $row_salida_orden_transformacion["idEntSto"], PDO::PARAM_INT);
            $stmt_select_entrada_stock_movimiento_salida->execute();
            $row_entrada_stock = $stmt_select_entrada_stock_movimiento_salida->fetch(PDO::FETCH_ASSOC);

            $idEntStoEst = 1; // disponible
            $idEntStoTip = 6; // ENTRADA DE TRANSFORMACION
            $docEntSto = "ENTRADA DE TRANSFORMACION";

            // 2. Debemos replicar el ingreso de una entrada haciendo una replica exacta
            $sql_create_entrada_stock_ingreso_irradiacion =
                "INSERT INTO entrada_stock
            (idProd, 
            idProv, 
            idEntStoEst, 
            idAlm, 
            idEntStoTip,
            codEntSto,
            letAniEntSto,
            diaJulEntSto,
            refNumIngEntSto,
            canTotEnt,
            canTotDis,
            docEntSto,
            fecVenEntSto,
            fecEntSto,
            referencia,
            codLot,
            refProdc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, $canProdIng, $canProdIng, ?, ?, ?, ?, ?, ?)";
            $stmt_create_entrada_stock_ingreso_irradiacion = $pdo->prepare($sql_create_entrada_stock_ingreso_irradiacion);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(2, $row_entrada_stock["idProv"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(4, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(5, $idEntStoTip, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(6, $row_entrada_stock["codEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(7, $row_entrada_stock["letAniEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(8, $row_entrada_stock["diaJulEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(9, $row_entrada_stock["refNumIngEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(10, $docEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(11, $row_entrada_stock["fecVenEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(12, $row_entrada_stock["fecEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(13, $row_entrada_stock["referencia"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(14, $row_entrada_stock["codLot"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(15, $row_entrada_stock["refProdc"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->execute();

            // debemos asegurarnos de actualizar correctamente el stock
            $sql_consult_almacen_stock =
                "SELECT * FROM almacen_stock 
            WHERE idProd = ? AND idAlm = ?";
            $stmt_consult_almacen_stock =  $pdo->prepare($sql_consult_almacen_stock);
            $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->bindParam(2, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
            $stmt_consult_almacen_stock->execute();

            $fecDateNow = date('Y-m-d H:i:s');
            if ($stmt_consult_almacen_stock->rowCount() === 1) {
                // UPDATE ALMACEN STOCK
                $sql_update_almacen_stock =
                    "UPDATE almacen_stock 
                    SET canSto = canSto + $canProdIng, canStoDis = canStoDis + $canProdIng, fecActAlmSto = ?
                    WHERE idProd = ? AND idAlm = ?";
                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                $stmt_update_almacen_stock->bindParam(1, $fecDateNow, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(3, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
                $stmt_update_almacen_stock->execute(); // ejecutamos
            } else {
                // CREATE NUEVO REGISTRO ALMACEN STOCK
                $sql_create_almacen_stock =
                    "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                    VALUE (?, ?, $canProdIng, $canProdIng)";
                $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                $stmt_create_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_create_almacen_stock->bindParam(2, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
                $stmt_create_almacen_stock->execute(); // ejecutamos
            }

            // actualizamos el detalle de ingreso
            $esComProdIng = 1;
            $sql_update_produccion_ingreso_producto =
                "UPDATE produccion_ingreso_producto
            SET fecProdIngAlm = ?, esComProdIng = ?
            WHERE id = ?";
            $stmt_update_produccion_ingreso_producto = $pdo->prepare($sql_update_produccion_ingreso_producto);
            $stmt_update_produccion_ingreso_producto->bindParam(1, $fecProdIngAlm, PDO::PARAM_STR);
            $stmt_update_produccion_ingreso_producto->bindParam(2, $esComProdIng, PDO::PARAM_BOOL);
            $stmt_update_produccion_ingreso_producto->bindParam(3, $idProdcIngProdt, PDO::PARAM_INT);
            $stmt_update_produccion_ingreso_producto->execute();

            // Actualizamos la programacion de producto final
            $sql_update_producto_final =
                "UPDATE produccion_producto_final
            SET canTotIngProdFin = canTotIngProdFin + $canProdIng, fecActProdcProdtFin = ?
            WHERE id = ?";
            $stmt_update_producto_final = $pdo->prepare($sql_update_producto_final);
            $stmt_update_producto_final->bindParam(1, $fecProdIngAlm); // fecha de actualizacion
            $stmt_update_producto_final->bindParam(2, $refProdtProg, PDO::PARAM_INT);
            $stmt_update_producto_final->execute();

            // hacemos commit a los cambios
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "Error en la consulta de almacen principal";
            $description_error = $e->getMessage();
        }
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
