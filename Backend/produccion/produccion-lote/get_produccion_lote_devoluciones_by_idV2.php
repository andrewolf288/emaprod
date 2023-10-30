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
        $esTerIngProFin = 1; // el ingreso ha terminado

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
                $row["prodDetDev"] = []; // detalle de agregacion
                $row["prodDetProdc"] = []; // detalle de productos finales terminados

                // primero traemos la informacion de los productos finales terminados
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
                        WHERE ppf.idProdc = ? AND ppf.esTerIngProFin = ?";
                try {
                    $stmt_detalle_productos_finales = $pdo->prepare($sql_detalle_productos_finales);
                    $stmt_detalle_productos_finales->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle_productos_finales->bindParam(2, $esTerIngProFin, PDO::PARAM_BOOL);
                    $stmt_detalle_productos_finales->execute();

                    while ($row_detalle_producto_final = $stmt_detalle_productos_finales->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row["prodDetProdc"], $row_detalle_producto_final);
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO SERVER";
                    $description_error = $e->getMessage();
                }

                // ahora traemos la informacion de las requisiciones de devolucion
                $sql_requisicion_devolucion =
                    "SELECT 
                rd.id,
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
                WHERE rd.idProdc = ?";

                $stmt_requisicion_devolucion = $pdo->prepare($sql_requisicion_devolucion);
                $stmt_requisicion_devolucion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
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
                        rdd.idMotDev,
                        pdm.desProdDevMot,
                        rdd.canReqDevDet,
                        rdd.esComReqDevDet,
                        rdd.fecCreReqDevDet,
                        rdd.fecActReqDevDet,
                        rdd.estReg
                        FROM requisicion_devolucion_detalle AS rdd
                        JOIN producto AS p ON p.id = rdd.idProdt
                        JOIN produccion_devolucion_motivo AS pdm.id = rdd.idMotDev
                        WHERE rdd.idReqDev = ?";
                    $stmt_requisicion_devolucion_detalle = $pdo->prepare($sql_requisicion_devolucion_detalle);
                    $stmt_requisicion_devolucion_detalle->bindParam(1, $idReqDev, PDO::PARAM_INT);
                    $stmt_requisicion_devolucion_detalle->execute();
                    while ($row_requisicion_devolucion_detalle = $stmt_requisicion_devolucion_detalle->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row_requisicion_devolucion["detReqDev"], $row_requisicion_devolucion_detalle);
                    }
                    array_push($row["prodDetDev"], $row_requisicion_devolucion);
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
