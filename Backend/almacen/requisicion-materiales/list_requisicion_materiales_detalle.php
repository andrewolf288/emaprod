<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $idAre = $data["idAre"];
    //die(json_encode($idAre));

    $data_requsicion_molienda = [];

    if ($pdo) {
        $sql =
            "SELECT
            r.id,
            r.idReqEst,
            re.desReqEst,
            r.idAre,
            a.desAre,
            r.codReq,
            r.fecPedReq,
            r.fecEntReq
            FROM requisicion r
            JOIN area a on a.id = r.idAre
            JOIN requisicion_estado as re on re.id = r.idReqEst
            WHERE r.idAre = ?
            ORDER BY r.fecPedReq DESC
            ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idAre, PDO::PARAM_INT);
            $stmt->execute();
            $sql_detalle = "";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $idReq = $row["id"];
                $row["reqDet"] = [];

                $sql_detalle =
                    "SELECT
                    rd.id,
                    rd.idProdt,
                    rd.idReq,
                    rd.idReqDetEst,
                    p.nomProd,
                    me.simMed,
                    p.codProd,
                    p.codProd2,
                    rde.desReqDetEst,
                    rd.canReqDet
                    FROM requisicion_detalle rd
                    JOIN producto as p on p.id = rd.idProdt
                    JOIN medida as me on me.id = p.idMed
                    JOIN requisicion_detalle_estado as rde on rde.id = rd.idReqDetEst
                    WHERE rd.idReq = ?
                ";

                try {
                    $stmt_detalle = $pdo->prepare($sql_detalle);
                    $stmt_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
                    $stmt_detalle->execute();
                } catch (Exception $e) {
                    $message_error = "ERROR INTERNO SERVER";
                    $description_error = $e->getMessage();
                }
                while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["reqDet"], $row_detalle);
                }
                //AÑADIMOS TODA LA DATA FOrATEADA
                array_push($data_requsicion_molienda, $row);
            }
            // DESCOMENTAR PARA VER LA DATA
            //print_r($data_requsicion_molienda);

            $result = $data_requsicion_molienda;
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
