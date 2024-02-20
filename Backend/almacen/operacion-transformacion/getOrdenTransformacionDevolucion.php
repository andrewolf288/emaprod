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

    //recorremos los resultados
    while ($row_orden_transformacion = $stmt_select_orden_transformacion->fetch(PDO::FETCH_ASSOC)) {
        $row_orden_transformacion["prodDetDev"] = []; // detalle de agregacion

        // debemos traer la requisicion de orden de transformacion
        $sql_select_trazabilidad_devolucion =
            "SELECT * FROM trazabilidad_transformacion_devolucion
        WHERE idOrdTrans = ?";
        $stmt_select_trazabilidad_devolucion = $pdo->prepare($sql_select_trazabilidad_devolucion);
        $stmt_select_trazabilidad_devolucion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
        $stmt_select_trazabilidad_devolucion->execute();

        $row_trazabilidad_devolucion = $stmt_select_trazabilidad_devolucion->fetchAll(PDO::FETCH_ASSOC);

        foreach ($row_trazabilidad_devolucion as $trazabilidad_requisicion) {
            $idReqDev = $trazabilidad_requisicion["idReqDev"];

            // ahora traemos la informacion de las requisiciones de devolucion
            $sql_requisicion_devolucion =
                "SELECT 
            rd.id,
            rd.correlativo,
            rd.idProdFin,
            rd.canTotUndReqDev,
            rd.idProdt,
            p.nomProd,
            rd.idReqEst,
            re.desReqEst,
            rd.fecCreReqDev,
            rd.fecActReqDev
            FROM requisicion_devolucion AS rd
            JOIN producto AS p ON p.id = rd.idProdt
            JOIN requisicion_estado AS re ON re.id = rd.idReqEst
            WHERE rd.id = ?";

            $stmt_requisicion_devolucion = $pdo->prepare($sql_requisicion_devolucion);
            $stmt_requisicion_devolucion->bindParam(1, $idReqDev, PDO::PARAM_INT);
            $stmt_requisicion_devolucion->execute();

            while ($row_requisicion_devolucion = $stmt_requisicion_devolucion->fetch(PDO::FETCH_ASSOC)) {
                $idReqDev = $row_requisicion_devolucion["id"]; // id de requisicion de agregacion
                $row_requisicion_devolucion["detReqDev"] = []; // detalle de requisicion de agregacion

                $sql_requisicion_devolucion_detalle =
                    "SELECT
                    rdd.id,
                    rdd.idReqDev,
                    rdd.idProdt,
                    p.nomProd,
                    me.simMed,
                    rdd.idMotDev,
                    pdm.desProdDevMot,
                    rdd.canReqDevDet,
                    rdd.esComReqDevDet,
                    rdd.fecCreReqDevDet,
                    rdd.fecActReqDevDet,
                    rdd.estReg
                    FROM requisicion_devolucion_detalle AS rdd
                    JOIN producto AS p ON p.id = rdd.idProdt
                    JOIN produccion_devolucion_motivo AS pdm ON pdm.id = rdd.idMotDev
                    JOIN medida AS me ON me.id = p.idMed
                    WHERE rdd.idReqDev = ?";
                $stmt_requisicion_devolucion_detalle = $pdo->prepare($sql_requisicion_devolucion_detalle);
                $stmt_requisicion_devolucion_detalle->bindParam(1, $idReqDev, PDO::PARAM_INT);
                $stmt_requisicion_devolucion_detalle->execute();
                while ($row_requisicion_devolucion_detalle = $stmt_requisicion_devolucion_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row_requisicion_devolucion["detReqDev"], $row_requisicion_devolucion_detalle);
                }
                array_push($row_orden_transformacion["prodDetDev"], $row_requisicion_devolucion);
            }
            array_push($result, $row_orden_transformacion);
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
