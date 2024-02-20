<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = array();
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
        $row_orden_transformacion["prodLotReq"] = array();

        // debemos traer la requisicion de orden de transformacion
        $sql_select_trazabilidad_requisiciones =
            "SELECT * FROM trazabilidad_transformacion_requisicion
        WHERE idOrdTrans = ?";
        $stmt_select_trazabilidad_requisiciones = $pdo->prepare($sql_select_trazabilidad_requisiciones);
        $stmt_select_trazabilidad_requisiciones->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
        $stmt_select_trazabilidad_requisiciones->execute();

        $rows_trazabilidad_requisicion = $stmt_select_trazabilidad_requisiciones->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows_trazabilidad_requisicion as $trazabilidad_requisicion) {
            $idReq = $trazabilidad_requisicion["idReq"]; // id de requisicion

            $sql_requisicion =
                "SELECT
            r.id,
            r.idProdc,
            r.idReqEst,
            re.desReqEst,
            r.idAre,
            ar.desAre,
            r.fecPedReq,
            r.fecEntReq
            FROM requisicion r
            JOIN requisicion_estado AS re ON re.id = r.idReqEst
            JOIN area AS ar ON ar.id = r.idAre
            WHERE r.id = ?";

            $stmt_requisicion = $pdo->prepare($sql_requisicion);
            $stmt_requisicion->bindParam(1, $idReq, PDO::PARAM_INT);
            $stmt_requisicion->execute();

            while ($row_requisicion = $stmt_requisicion->fetch(PDO::FETCH_ASSOC)) {
                $row_requisicion["reqDet"] = [];
                $sql_requisicion_detalle =
                    "SELECT
                            rd.id,
                            rd.idProdt,
                            p.nomProd,
                            p.salMixAlm,
                            me.simMed,
                            rd.idReq,
                            rd.idReqDetEst,
                            rde.desReqDetEst,
                            rd.canReqDet
                            FROM requisicion_detalle rd
                            JOIN producto as p on p.id = rd.idProdt
                            JOIN medida as me on me.id = p.idMed
                            JOIN requisicion_detalle_estado as rde on rde.id = rd.idReqDetEst
                            WHERE rd.idReq = ?";

                $stmt_requisicion_detalle = $pdo->prepare($sql_requisicion_detalle);
                $stmt_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
                $stmt_requisicion_detalle->execute();

                // AÑADIMOS LAS REQUISICIONES
                while ($row_requisicion_detalle = $stmt_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                    $idReqDet = $row_requisicion_detalle["id"];
                    $row_requisicion_detalle["salParc"] = []; // salidas parciales
                    $row_requisicion_detalle["canTotSalParc"] = 0; // cantidad total de salidas parciales
                    $cantidadSalidasParciales = 0;

                    $sql_salidas_parciales_requisicion_detalle =
                        "SELECT canSalStoReq, fecSalStoReq, esSalPar, esSalTot
                                FROM salida_stock
                                WHERE idReq = ? AND idReqDet = ?";
                    $stmt_salidas_parciales_requisicion_detalle = $pdo->prepare($sql_salidas_parciales_requisicion_detalle);
                    $stmt_salidas_parciales_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
                    $stmt_salidas_parciales_requisicion_detalle->bindParam(2, $idReqDet, PDO::PARAM_INT);
                    $stmt_salidas_parciales_requisicion_detalle->execute();

                    while ($row_salidas_stock = $stmt_salidas_parciales_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                        $cantidadSalidasParciales += $row_salidas_stock["canSalStoReq"];
                        array_push($row_requisicion_detalle["salParc"], $row_salidas_stock);
                    }
                    // agregamos la cantidad total parcial
                    $row_requisicion_detalle["canTotSalParc"] = $cantidadSalidasParciales;

                    array_push($row_requisicion["reqDet"], $row_requisicion_detalle);
                }
                array_push($row_orden_transformacion["prodLotReq"], $row_requisicion);
            }
        }
        array_push($result, $row_orden_transformacion);
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
