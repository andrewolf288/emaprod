<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOrdTrans = $data["idOrdTrans"];

    // consultamos la orden de transformacion
    $sql_select_orden_transformacion =
        "SELECT 
        ot.id,
        ot.idProdtInt,
        ot.idProdc,
        ot.codLotProd,
        ot.idProdtOri,
        p1.nomProd AS nomProd1,
        ot.canUndProdtOri,
        ot.canPesProdtOri,
        ot.idProdtDes,
        p2.nomProd AS nomProd2,
        ot.canUndProdtDes,
        ot.canPesProdtDes,
        ot.fecCreOrdTrans
        FROM orden_transformacion AS ot
        JOIN producto AS p1 ON p1.id = ot.idProdtOri
        JOIN producto AS p2 ON p2.id = ot.idProdtDes
        WHERE ot.id = ?";
    $stmt_select_orden_transformacion = $pdo->prepare($sql_select_orden_transformacion);
    $stmt_select_orden_transformacion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
    $stmt_select_orden_transformacion->execute();

    while ($row_orden_transformacion = $stmt_select_orden_transformacion->fetch(PDO::FETCH_ASSOC)) {
        $idProdtDes = $row_orden_transformacion["idProdtDes"];
        $idProdc = $row_orden_transformacion["idProdc"];

        $sql_requisicion_ingreso =
            "SELECT 
        pip.id,
        pip.idProdc,
        pip.codLot,
        pip.idProdt,
        p.nomProd,
        p.codProd2,
        p.manLotProd,
        p.lotPorDef,
        p.entMixAlm,
        pip.refProdtProg,
        pip.canProdIng,
        pip.fecProdIng,
        pip.fecProdVen,
        pip.esComProdIng
        FROM produccion_ingreso_producto AS pip
        JOIN producto AS p ON p.id = pip.idProdt
        WHERE pip.idProdt = ? AND pip.idProdc = ?
        ORDER BY pip.id DESC";

        $stmt_requisicion_ingreso = $pdo->prepare($sql_requisicion_ingreso);
        $stmt_requisicion_ingreso->bindParam(1, $idProdtDes, PDO::PARAM_INT);
        $stmt_requisicion_ingreso->bindParam(2, $idProdc, PDO::PARAM_INT);
        $stmt_requisicion_ingreso->execute();

        $row_orden_transformacion["prodDetIng"] = $stmt_requisicion_ingreso->fetchAll(PDO::FETCH_ASSOC);

        array_push($result, $row_orden_transformacion);
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
