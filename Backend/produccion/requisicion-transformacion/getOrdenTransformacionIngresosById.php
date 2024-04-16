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
        ot.correlativo,
        ot.idProdtInt,
        ot.idProdc,
        pc.codLotProd,
        DATE(pc.fecVenLotProd) AS fecVenLotProd,
        ot.idProdtOri,
        p1.nomProd AS nomProd1,
        ot.canUndProdtOri,
        ot.canPesProdtOri,
        ot.idProdtDes,
        sc.id AS idSubCla,
        p2.nomProd AS nomProd2,
        p2.codProd2,
        ot.canUndProdtDes,
        ot.canPesProdtDes,
        ot.fecCreOrdTrans
        FROM orden_transformacion AS ot
        JOIN producto AS p1 ON p1.id = ot.idProdtOri
        JOIN producto AS p2 ON p2.id = ot.idProdtDes
        JOIN produccion AS pc ON pc.id = ot.idProdc
        JOIN sub_clase AS sc ON sc.id = p2.idSubCla
        WHERE ot.id = ?";
    $stmt_select_orden_transformacion = $pdo->prepare($sql_select_orden_transformacion);
    $stmt_select_orden_transformacion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
    $stmt_select_orden_transformacion->execute();

    while ($row_orden_transformacion = $stmt_select_orden_transformacion->fetch(PDO::FETCH_ASSOC)) {
        $idProdtDes = $row_orden_transformacion["idProdtDes"];
        $idProdc = $row_orden_transformacion["idProdc"];

        $sql_requisicion_ingreso =
            "SELECT 
        otip.id,
        otip.idOrdTrans,
        otip.idProdc,
        pc.codLotProd,
        pc.fecVenLotProd,
        otip.idProdt,
        p.nomProd,
        me.simMed,
        otip.canProdIng,
        otip.fecProdIng,
        otip.fecProdVen,
        otip.fecProdIngAlm,
        otip.esComProdIng,
        otip.fecCreProdIng
        FROM orden_transformacion_ingreso_producto AS otip
        JOIN producto AS p ON p.id = otip.idProdt
        JOIN produccion AS pc ON pc.id = otip.idProdc
        JOIN medida AS me ON me.id = p.idMed
        WHERE otip.idOrdTrans = ?
        ORDER BY otip.id DESC";

        $stmt_requisicion_ingreso = $pdo->prepare($sql_requisicion_ingreso);
        $stmt_requisicion_ingreso->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
        $stmt_requisicion_ingreso->execute();

        $row_orden_transformacion["prodDetIng"] = $stmt_requisicion_ingreso->fetchAll(PDO::FETCH_ASSOC);

        $result = $row_orden_transformacion;
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
