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

    $fechasMes = getStartEndDateNow();
    $fechaInicio = $fechasMes[0]; // inicio del mes
    $fechaFin = $fechasMes[1]; // fin del mes

    if (isset($data)) {
        if (!empty($data["fechaInicio"])) {
            $fechaInicio = $data["fechaInicio"];
        }
        if (!empty($data["fechaFin"])) {
            $fechaFin = $data["fechaFin"];
        }
    }

    $esReproceso = 1;
    $sql_select_requisicion_reproceso =
        "SELECT 
    odcd.id,
    odcd.idProdc,
    odcd.codLotProd,
    DATE(pd.fecVenLotProd) AS fecVenLotProd,
    odcd.canLotProd,
    p.nomProd,
    odcd.fueComOpeRep,
    DATE(odcd.fecCreOpeDevCalDet) AS fecCreOpeDevCalDet
    FROM operacion_devolucion_calidad_detalle AS odcd
    JOIN produccion AS pd ON pd.id = odcd.idProdc
    JOIN operacion_devolucion_calidad AS odc ON odc.id = odcd.idOpeDevCal
    JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
    JOIN producto AS p ON p.id = odd.idProdt
    WHERE (odcd.esReproceso = ?) AND DATE(odcd.fecCreOpeDevCalDet) BETWEEN ? AND ?
    ORDER BY odcd.fecCreOpeDevCalDet DESC";
    $stmt_select_requisicion_reproceso = $pdo->prepare($sql_select_requisicion_reproceso);
    $stmt_select_requisicion_reproceso->bindParam(1, $esReproceso, PDO::PARAM_BOOL);
    $stmt_select_requisicion_reproceso->bindParam(2, $fechaInicio, PDO::PARAM_STR);
    $stmt_select_requisicion_reproceso->bindParam(3, $fechaFin, PDO::PARAM_STR);
    $stmt_select_requisicion_reproceso->execute();

    while ($row_requisicion_reproceso = $stmt_select_requisicion_reproceso->fetch(PDO::FETCH_ASSOC)) {
        $idReqRep = $row_requisicion_reproceso["id"];
        $sql_select_trazabilidad_reproceso =
            "SELECT id 
        FROM trazabilidad_reproceso_devolucion
        WHERE idOpeDevCalDet = ?";
        $stmt_select_trazabilidad_reproceso = $pdo->prepare($sql_select_trazabilidad_reproceso);
        $stmt_select_trazabilidad_reproceso->bindParam(1, $idReqRep, PDO::PARAM_INT);
        $stmt_select_trazabilidad_reproceso->execute();
        $numero_requisiciones = $stmt_select_trazabilidad_reproceso->rowCount();
        $row_requisicion_reproceso["numero_requisicion_devolucion"] = $numero_requisiciones;
        array_push($result, $row_requisicion_reproceso);
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
