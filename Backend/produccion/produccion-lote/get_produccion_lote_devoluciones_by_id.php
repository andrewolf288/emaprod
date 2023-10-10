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

        $idLotProdc = $data["id"];

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
        pd.numop, 
        p.codProd2
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
            $sql_detalle_devoluciones_lote_produccion = "";
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["detDev"] = [];
                $row["requisiciones"] = [];

                $sql_detalle_devoluciones_lote_produccion =
                    "SELECT 
                pdv.id,
                pdv.idProdc,
                pdv.idProdt,
                p.nomProd,
                me.simMed,
                pdv.idAlm,
                al.nomAlm,
                pdv.idProdDevMot,
                pdm.desProdDevMot,
                pdv.canProdDev, p.codProd2
                FROM produccion_devolucion as pdv
                JOIN producto as p ON p.id = pdv.idProdt
                JOIN medida as me ON me.id = p.idMed
                JOIN almacen as al ON al.id = pdv.idAlm
                JOIN produccion_devolucion_motivo as pdm ON pdm.id = pdv.idProdDevMot
                WHERE pdv.idProdc = ?";

                try {
                    $stmt_detalle_devoluciones_lote_produccion = $pdo->prepare($sql_detalle_devoluciones_lote_produccion);
                    $stmt_detalle_devoluciones_lote_produccion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle_devoluciones_lote_produccion->execute();

                    while ($row_detalle_agregacion_lote_produccion = $stmt_detalle_devoluciones_lote_produccion->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row["detDev"], $row_detalle_agregacion_lote_produccion);
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO EN LA CONSULTA DE AGREGACIONES";
                    $description_error = $e->getMessage();
                }
                $row = getRequisiciones($pdo, $idLotProdc, $row);
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


function getRequisiciones($pdo, $idLotProdc, $row)
{


    #SELECT 
    #pc.id as idProdc,
    #p.nomProd,
    #p.id as idProdt
    #FROM  producto as p 
    #JOIN produccion as pc ON pc.idProdt = p.id
    #JOIN requisicion as r ON r.idProdc = pc.id
    #RIGHT JOIN requisicion_detalle as rq ON rq.idReq = r.id
    #WHERE pc.id = ?
    $sql_detalle_devoluciones_lote_produccion =
        "SELECT 
                r.idProdc ,
                r.idAre,
                rd.id as idReq,
                p.id,
                rd.idProdt,
                rd.idReq,
                rd.idReqDetEst,
                rd.canReqDet,
                rd.fecCreReqDet,
                rd.fecActReqDet,
                rd.estReg,
                rd.idProdFin,
                p.nomProd FROM requisicion r 
                join `requisicion_detalle` as rd on r.id = rd.idReq 
                join producto p ON rd.idProdt = p.id 
                left join produccion_agregacion pa on pa.idProdc = r.idProdc
                where r.idProdc  =  ?  and r.idAre != 2 ORDER BY rd.id DESC";

    try {
        $stmt_detalle_devoluciones_lote_produccion = $pdo->prepare($sql_detalle_devoluciones_lote_produccion);
        $stmt_detalle_devoluciones_lote_produccion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
        $stmt_detalle_devoluciones_lote_produccion->execute();

        while ($row_detalle_agregacion_lote_produccion = $stmt_detalle_devoluciones_lote_produccion->fetch(PDO::FETCH_ASSOC)) {
            array_push($row["requisiciones"], $row_detalle_agregacion_lote_produccion);
        }
    } catch (PDOException $e) {
        $message_error = "ERROR INTERNO EN LA CONSULTA DE AGREGACIONES";
        $description_error = $e->getMessage();
        $row["requisiciones"] = $description_error;
    }
    return $row;
}
