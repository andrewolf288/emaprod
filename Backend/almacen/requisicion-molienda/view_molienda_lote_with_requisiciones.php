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

        $idProdLot = $data["idProdc"];
        $idReq = $data["idReq"];

        //die(json_encode($idProdLot));


        if (true ||  $idProdLot == "-1") {
            $row["prodLotReq"] = [];
            $sql_requisicion =
                "SELECT
                r.id,
                r.idProdc,
                r.idReqEst,
                re.desReqEst,
                r.idAre,
                ar.desAre,
                r.fecPedReq,
                r.fecEntReq, 
                r.codReq, 
                r.cantProg,
                r.canIng,
                p.nomProd, 
                p.id as idProdt,
                r.reqFinEst,
                r.variacion,
                r.codLotProd,
                r.canLotProd,
                r.cantProg as klgLotProd
                FROM requisicion r
                JOIN producto as p ON p.id = r.idProdt
                JOIN requisicion_estado as re on re.id = r.idReqEst
                JOIN area as ar on ar.id = r.idAre
                WHERE  r.id = ? ORDER BY id ASC";
            //r.idProdc = ?
            $stmt_requisicion = $pdo->prepare($sql_requisicion);
            //$stmt_requisicion->bindParam(1, $idProdLot, PDO::PARAM_INT);
            $stmt_requisicion->bindParam(1, $idReq, PDO::PARAM_INT);
            $stmt_requisicion->execute();

            while ($row_requisicion = $stmt_requisicion->fetch(PDO::FETCH_ASSOC)) {
                $idReq = $row_requisicion["id"]; // requisicion
                $row_requisicion["reqDet"] = [];
                $sql_requisicion_detalle =
                    "SELECT
                        rd.id,
                        rd.idProdt,
                        p.nomProd,
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
                    array_push($row_requisicion["reqDet"], $row_requisicion_detalle);
                }
                array_push($row["prodLotReq"], $row_requisicion);
                array_push($result, $row);
            }
        } else {
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
                pd.numop
            FROM produccion pd
            JOIN producto as p ON p.id = pd.idProdt
            JOIN produccion_estado as pe ON pe.id = pd.idProdEst
            JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
            WHERE pd.id = ?";

            try {
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $idProdLot, PDO::PARAM_INT);
                $stmt->execute(); // ejecutamos

                // Recorremos los resultados
                $sql_requisicion = "";
                if ($stmt->rowCount() == 1) {
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $row["prodLotReq"] = [];
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
                        JOIN requisicion_estado as re on re.id = r.idReqEst
                        JOIN area as ar on ar.id = r.idAre
                        WHERE  r.id = ? ORDER BY id ASC";
                        //r.idProdc = ?
                        $stmt_requisicion = $pdo->prepare($sql_requisicion);
                        //$stmt_requisicion->bindParam(1, $idProdLot, PDO::PARAM_INT);
                        $stmt_requisicion->bindParam(1, $idReq, PDO::PARAM_INT);
                        $stmt_requisicion->execute();

                        while ($row_requisicion = $stmt_requisicion->fetch(PDO::FETCH_ASSOC)) {
                            $idReq = $row_requisicion["id"];  
                            $row_requisicion["reqDet"] = [];
                            $sql_requisicion_detalle =
                                "SELECT
                                rd.id,
                                rd.idProdt,
                                p.nomProd,
                                me.simMed,
                                rd.idReq,
                                rd.idReqDetEst,
                                rde.desReqDetEst,
                                rd.canReqDet
                                FROM requisicion_detalle rd
                                JOIN producto as p on p.id = rd.idProdt
                                JOIN medida as me on me.id = p.idMed
                                JOIN requisicion_detalle_estado as rde on rde.id = rd.idReqDetEst
                                WHERE rd.idReq = ? ORDER BY  rd.id ASC";

                            $stmt_requisicion_detalle = $pdo->prepare($sql_requisicion_detalle);
                            $stmt_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
                            $stmt_requisicion_detalle->execute();

                            // AÑADIMOS LAS REQUISICIONES
                            while ($row_requisicion_detalle = $stmt_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
                                array_push($row_requisicion["reqDet"], $row_requisicion_detalle);
                            }
                            array_push($row["prodLotReq"], $row_requisicion);
                        }
                        array_push($result, $row);
                    }
                } else {
                    $message_error = "No se encontro el lote de produccion";
                    $description_error = "No se encontro el lote de produccion con el id proporcionado";
                }
            } catch (PDOException $e) {
                $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
                $description_error = $e->getMessage();
            }
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
