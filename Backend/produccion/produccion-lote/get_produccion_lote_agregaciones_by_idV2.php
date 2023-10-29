<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idLotProdc = $data["id"]; // id de produccion

        // en primer lugar traemos la informacion de produccion
        $sql =
            "SELECT
        pd.id,
        pd.idProdt,
        p.nomProd,
        pd.idProdEst,
        pe.desEstPro,
        pd.idProdTip,
        pt.desProdTip,
        pd.codLotProd,
        pd.klgLotProd,
        pd.canLotProd,
        pd.fecVenLotProd,
        p.idSubCla,
        pd.numop 
    FROM produccion pd
    JOIN producto as p ON p.id = pd.idProdt
    JOIN produccion_estado as pe ON pe.id = pd.idProdEst
    JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
    WHERE pd.id = ?";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idLotProdc, PDO::PARAM_INT);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["prodDetAgr"] = []; // detalle de agregacion
                $row["prodDetProdc"] = []; // detalle de productos finales

                // primero traemos la informacion de los productos finales
                $sql_detalle_productos_finales =
                    "SELECT
                        DISTINCT
                        ppf.id,
                        ppf.idProdcProdtFinEst,
                        ppf.idProdt,
                        ppfe.desProProFinEst,
                        pd.nomProd,
                        me.simMed,
                        cl.desCla,
                        ppf.canTotProgProdFin,
                        ppf.canTotIngProdFin,
                        pd.codProd2,
                        ppf.idProdc,
                        ppf.esTerIngProFin
                    FROM produccion_producto_final ppf
                    JOIN producto as pd on pd.id = ppf.idProdt
                    JOIN medida as me on me.id = pd.idMed
                    JOIN clase as cl on cl.id = pd.idCla
                    JOIN produccion_producto_final_estado as ppfe on ppfe.id = ppf.idProdcProdtFinEst
                    WHERE ppf.idProdc = ?";
                try {
                    $stmt_detalle_productos_finales = $pdo->prepare($sql_detalle_productos_finales);
                    $stmt_detalle_productos_finales->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle_productos_finales->execute();

                    while ($row_detalle_producto_final = $stmt_detalle_productos_finales->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row["prodDetProdc"], $row_detalle_producto_final);
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO SERVER";
                    $description_error = $e->getMessage();
                }

                // ahora traemos la informacion de las requisiciones de agregacion
                $sql_requisicion_agregacion =
                    "SELECT 
                    ra.id,
                    ra.idProdFin,
                    ra.canTotUndReqAgr,
                    ra.canTotKlgReqAgr,
                    ra.idProdt,
                    p.nomProd,
                    ra.idProdcMot,
                    pam.desProdAgrMot,
                    ra.idReqEst,
                    re.desReqEst,
                    ra.fecCreReqAgr,
                    ra.fecActReqAgr
                FROM requisicion_agregacion AS ra
                JOIN producto AS p ON p.id = ra.idProdt
                JOIN produccion_agregacion_motivo AS pam ON pam.id = ra.idProdcMot
                JOIN requisicion_estado AS re ON re.id = ra.idReqEst
                WHERE ra.idProdc = ?";
                $stmt_requisicion_agregacion = $pdo->prepare($sql_requisicion_agregacion);
                $stmt_requisicion_agregacion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                $stmt_requisicion_agregacion->execute();
                while ($row_requisicion_agregacion = $stmt_requisicion_agregacion->fetch(PDO::FETCH_ASSOC)) {
                    $idReqAgr = $row_requisicion_agregacion["id"]; // id de requisicion de agregacion
                    $row_requisicion_agregacion["detReqAgr"] = []; // detalle de requisicion de agregacion

                    $sql_requisicion_agregacion_detalle =
                        "SELECT 
                        rad.id,
                        rad.idReqAgr,
                        rad.idProdt,
                        p.nomProd,
                        rad.esComReqAgrDet,
                        rad.canReqAgrDet,
                        rad.fecCreReqAgrDet,
                        rad.fecActReqAgrDet
                    FROM requisicion_agregacion_detalle AS rad
                    JOIN producto AS p ON p.id = rad.idProdt
                    WHERE rad.idReqAgr = ?";
                    $stmt_requisicion_agregacion_detalle = $pdo->prepare($sql_requisicion_agregacion_detalle);
                    $stmt_requisicion_agregacion_detalle->bindParam(1, $idReqAgr, PDO::PARAM_INT);
                    $stmt_requisicion_agregacion_detalle->execute();
                    while ($row_requisicion_agregacion_detalle = $stmt_requisicion_agregacion_detalle->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row_requisicion_agregacion["detReqAgr"], $row_requisicion_agregacion_detalle);
                    }
                    array_push($row["prodDetAgr"], $row_requisicion_agregacion);
                }
                array_push($result, $row);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
            $description_error = $e->getMessage();
        }
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
