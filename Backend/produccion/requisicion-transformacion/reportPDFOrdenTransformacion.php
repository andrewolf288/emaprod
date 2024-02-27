<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = array();
$result["requisicion"] = array();
$result["requisicionMateriales"] = array();
$result["requisicionDevolucion"] = array();

$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $idOrdTrans = $data["idOrdTrans"];

    if ($pdo) {
        //----REQUISICION DE TRANSFORMACION----
        $sql_requisicion_transformacion =
            "SELECT
        ot.id,
        ot.idProdtInt,
        ot.idProdc,
        ot.codLotProd,
        ot.idProdtOri,
        p1.nomProd AS nomProd1,
        ot.canUndProdtOri,
        ot.idProdtDes,
        p2.nomProd AS nomProd2,
        ot.canUndProdtDes,
        ot.fecCreOrdTrans
        FROM orden_transformacion AS ot
        JOIN producto AS p1 ON p1.id = ot.idProdtOri
        JOIN producto AS p2 ON p2.id = ot.idProdtDes
        WHERE ot.id = ?";
        $stmt_requisicion_transformacion = $pdo->prepare($sql_requisicion_transformacion);
        $stmt_requisicion_transformacion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
        $stmt_requisicion_transformacion->execute();
        $row_requisicion_transformacion = $stmt_requisicion_transformacion->fetch(PDO::FETCH_ASSOC);

        $result["requisicion"] = $row_requisicion_transformacion;

        //----REQUISICION DE MATERIALES----
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
                $sql_requisicion_detalle =
                    "SELECT
                rd.id,
                rd.idProdt,
                p.codProd,
                p.codProd2,
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

                $row_requisicion["reqDet"] = $stmt_requisicion_detalle->fetchAll(PDO::FETCH_ASSOC);
                array_push($result["requisicionMateriales"], $row_requisicion);
            }
        }
        //----REQUISICION DE DEVOLUCION----
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
                    p.codProd2,
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

                $row_requisicion_devolucion["detReqDev"] = $stmt_requisicion_devolucion_detalle->fetchAll(PDO::FETCH_ASSOC);
                array_push($result["requisicionDevolucion"], $row_requisicion_devolucion);
            }
        }
    } else {
        $message_error = "ERROR EN LA CONEXION";
        $description_error = "ERROR: Error en la conexión con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
