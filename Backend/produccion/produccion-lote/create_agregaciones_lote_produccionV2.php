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

    $requisicionAgregacion = $data["requisicionAgregacion"]; // obtenemos la requisicion de agregacion
    $detalleProductosAgregados = $data["detalleProductosAgregados"]; // obtenemos el detalle

    if ($pdo) {
        $idProdc = $requisicionAgregacion["idProdc"]; // id de produccion
        $idProdcMot = $requisicionAgregacion["idProdcMot"]; // id de motivo de produccion
        $idProdt = $requisicionAgregacion["idProdt"]; // id producto
        $cantidadDeProducto = $requisicionAgregacion["cantidadDeProducto"]; // cantidad de producto
        $cantidadDeLote = $requisicionAgregacion["cantidadDeLote"]; // cantidad klg de lote

        $idLastInsert = 0; // id de la ultima insercion
        $idLastInsertProdFin = 0;
        $idReqEst = 1; // estado de creado

        try {
            $pdo->beginTransaction();

            // si es una agregacion de presentacion nueva
            if ($idProdcMot == 2) {
                $idProdcProdtFinEst = 1; // creado
                $esProdcProdtProg = 0; // no programado

                $sql_insert_produccion_producto_final =
                    "INSERT INTO produccion_producto_final
                (idProdc, idProdcProdtFinEst, idProdt, canTotProgProdFin, esProdcProdtProg)
                VALUES (?, ?, ?, $cantidadDeProducto, ?)";

                $stmt_insert_produccion_producto_final = $pdo->prepare($sql_insert_produccion_producto_final);
                $stmt_insert_produccion_producto_final->bindParam(1, $idProdc, PDO::PARAM_INT);
                $stmt_insert_produccion_producto_final->bindParam(2, $idProdcProdtFinEst, PDO::PARAM_INT);
                $stmt_insert_produccion_producto_final->bindParam(3, $idProdt, PDO::PARAM_INT);
                $stmt_insert_produccion_producto_final->bindParam(4, $esProdcProdtProg, PDO::PARAM_BOOL);
                $stmt_insert_produccion_producto_final->execute();
                $idLastInsertProdFin = $pdo->lastInsertId(); // obtenemos el id de la ultima insercion
            }

            // si se agrego una presentacion final, seteamos su ultima insercion
            // caso contrario la obtenemos de la data extraida
            $idProdFin = $idLastInsertProdFin != 0 ? $idLastInsertProdFin : $requisicionAgregacion["idProdFin"]; // referencia producto final programado

            // si es una agregacion de encuadre
            if ($idProdcMot == 3) {
                $sql_update_produccion_producto_final =
                    "UPDATE produccion_producto_final 
                SET canTotProgProdFin = canTotProgProdFin + $cantidadDeProducto
                WHERE id = ?";
                $stmt_update_produccion_producto_final = $pdo->prepare($sql_update_produccion_producto_final);
                $stmt_update_produccion_producto_final->bindParam(1, $idProdFin, PDO::PARAM_INT);
                $stmt_update_produccion_producto_final->execute();
            }

            // debemos crear la requisicion de agregacion
            $sql_insert_requisicion_agregacion =
                "INSERT INTO requisicion_agregacion
            (idProdc, idProdcMot, idProdFin, idProdt, idReqEst, canTotUndReqAgr, canTotKlgReqAgr)
            VALUES (?, ?, ?, ?, ?, $cantidadDeProducto, $cantidadDeLote)";

            $stmt_insert_requisicion_agregacion = $pdo->prepare($sql_insert_requisicion_agregacion);
            $stmt_insert_requisicion_agregacion->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt_insert_requisicion_agregacion->bindParam(2, $idProdcMot, PDO::PARAM_INT);
            $stmt_insert_requisicion_agregacion->bindParam(3, $idProdFin, PDO::PARAM_INT);
            $stmt_insert_requisicion_agregacion->bindParam(4, $idProdt, PDO::PARAM_INT);
            $stmt_insert_requisicion_agregacion->bindParam(5, $idReqEst, PDO::PARAM_INT);
            $stmt_insert_requisicion_agregacion->execute();

            $idLastInsert = $pdo->lastInsertId(); // obtenemos el id de la ultima insercion

            $esComReqAgrDet = 0; // requisicion no completa
            foreach ($detalleProductosAgregados as $detalle) {
                $idProdtDetalle = $detalle["idProd"]; // producto
                $canReqProdLot = $detalle["canReqProdLot"]; // cantidad de detalle

                $sql_insert_requisicion_agregacion_detalle =
                    "INSERT INTO requisicion_agregacion_detalle
                        (idReqAgr, idProdt, esComReqAgrDet, canReqAgrDet)
                        VALUES (?, ?, ?, $canReqProdLot)";
                $stmt_insert_requisicion_agregacion_detalle = $pdo->prepare($sql_insert_requisicion_agregacion_detalle);
                $stmt_insert_requisicion_agregacion_detalle->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                $stmt_insert_requisicion_agregacion_detalle->bindParam(2, $idProdtDetalle, PDO::PARAM_INT);
                $stmt_insert_requisicion_agregacion_detalle->bindParam(3, $esComReqAgrDet, PDO::PARAM_BOOL);
                $stmt_insert_requisicion_agregacion_detalle->execute();
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "error interno SERVER";
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
