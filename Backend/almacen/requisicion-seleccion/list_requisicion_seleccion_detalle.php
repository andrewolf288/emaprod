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

    $fechasMes = getStartEndDateNow();
    $fechaInicio = $fechasMes[0]; // inicio del mes
    $fechaFin = $fechasMes[1]; // fin del mes

    if (isset($data)) {
        if (!empty($data["fecReqMolIni"])) {
            $fechaInicio = $data["fecReqMolIni"];
        }
        if (!empty($data["fecReqMolFin"])) {
            $fechaFin = $data["fecReqMolFin"];
        }
    }


    //die(json_encode( $fechaInicio));
    $data_requisicion_seleccion = [];

    if ($pdo) {
        $sql =
            "SELECT
            rs.id,
            rs.codReqSel,
            rs.idReqSelEst,
            rse.desReqSelEst,
            rs.codLotSel,
            rs.fecPedReqSel,
            rs.fecTerReqSel
            FROM requisicion_seleccion rs
            JOIN requisicion_seleccion_estado as rse on rse.id = rs.idReqSelEst
            WHERE DATE(rs.fecPedReqSel) BETWEEN '$fechaInicio' AND '$fechaFin'
            ORDER BY rs.fecPedReqSel DESC";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }
        $sql_detalle = "";

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $idReqSel = $row["id"];
            $row["reqSelDet"] = [];

            $sql_detalle =
                "SELECT
            rsd.id,
            rsd.idReqSel,
            rsd.idMatPri,
            p.nomProd,
            p.codProd,
            rsd.idReqSelDetEst,
            rsde.desReqSelDetEst,
            rsd.canReqSelDet,
            rsd.fecCreReqSelDet
            FROM requisicion_seleccion_detalle AS rsd
            JOIN requisicion_seleccion_detalle_estado as rsde on rsde.id = rsd.idReqSelDetEst
            JOIN producto AS p ON p.id = rsd.idMatPri
            WHERE rsd.idReqSel = ?";
            try {
                $stmt_detalle = $pdo->prepare($sql_detalle);
                $stmt_detalle->bindParam(1, $idReqSel, PDO::PARAM_INT);
                $stmt_detalle->execute();
                $row["reqSelDet"] = $stmt_detalle->fetchAll(PDO::FETCH_ASSOC);
                //AÑADIMOS TODA LA DATA FORMATEADA
            } catch (Exception $e) {
                $message_error = "ERROR INTERNO SERVER";
                $description_error = $e->getMessage();
            }
            array_push($data_requisicion_seleccion, $row);
        }
        // DESCOMENTAR PARA VER LA DATA
        $result = $data_requisicion_seleccion;
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
