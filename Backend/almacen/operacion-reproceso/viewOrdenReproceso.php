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

    $idOpeDevCal = $data["idOpeDevCal"];
    $requisiciones_devoluciones = array();

    if ($pdo) {
        // primero traemos la data de operacion devolucion calidad
        $sql_select_operacion_devolucion_calidad =
            "SELECT
        odc.id,
        odc.fueCom,
        odc.numLots,
        p.nomProd,
        me.simMed,
        p.codProd2,
        odd.canOpeDevDet,
        odc.fecCreOpeDevCal
        FROM operacion_devolucion_calidad AS odc
        JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
        JOIN producto AS p ON p.id = odd.idProdt
        JOIN medida AS me ON me.id = p.idMed
        WHERE odc.id = ?";
        $stmt_select_operacion_devolucion_calidad = $pdo->prepare($sql_select_operacion_devolucion_calidad);
        $stmt_select_operacion_devolucion_calidad->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
        $stmt_select_operacion_devolucion_calidad->execute();
        $result = $stmt_select_operacion_devolucion_calidad->fetch(PDO::FETCH_ASSOC);

        // luego traemos la data de requisiciones de devolucion
        $sql_select_trazabilidad_reproceso_devolucion =
            "SELECT trd.idReqDev
        FROM trazabilidad_reproceso_devolucion AS trd
        JOIN operacion_devolucion_calidad_detalle AS odcd ON odcd.id = trd.idOpeDevCalDet
        WHERE odcd.idOpeDevCal = ?";
        $stmt_select_trazabilidad_reproceso_devolucion = $pdo->prepare($sql_select_trazabilidad_reproceso_devolucion);
        $stmt_select_trazabilidad_reproceso_devolucion->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
        $stmt_select_trazabilidad_reproceso_devolucion->execute();

        while ($row_trazabilidad_reproceso_devolucion = $stmt_select_trazabilidad_reproceso_devolucion->fetch(PDO::FETCH_ASSOC)) {
            $idReqDev = $row_trazabilidad_reproceso_devolucion["idReqDev"];

            $sql_requisicion_devolucion =
                "SELECT 
            rd.id,
            rd.idProdc,
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
                array_push($requisiciones_devoluciones, $row_requisicion_devolucion);
            }
        }

        $result["devoluciones"] = $requisiciones_devoluciones;
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
