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

    $fechaToday = getTodayDateNow();
    $fechaInicio = $fechaToday[0]; // inicio del mes
    $fechaFin = $fechaToday[1]; // fin del mes

    if (isset($data)) {
        if (!empty($data["fechaInicio"])) {
            $fechaInicio = $data["fechaInicio"];
        }
        if (!empty($data["fechaFin"])) {
            $fechaFin = $data["fechaFin"];
        }
    }

    if ($pdo) {
        $sql_select_ordenes_irradiacion =
            "SELECT 
        oi.id,
        oi.invSerFac,
        oi.invNumFac,
        oi.idOrdIrraEst,
        oie.desOrdIrraEst,
        oi.fecCreOrdIrra
        FROM orden_irradiacion AS oi
        JOIN orden_irradiacion_estado AS oie ON oie.id = oi.idOrdIrraEst
        WHERE DATE(oi.fecCreOrdIrra) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY oi.fecCreOrdIrra DESC";

        $stmt_select_ordenes_irradiacion = $pdo->prepare($sql_select_ordenes_irradiacion);
        $stmt_select_ordenes_irradiacion->execute();
        $result = $stmt_select_ordenes_irradiacion->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $message_error = "No se pudo conectar con la base de datos";
        $description_error = "No se pudo conectar con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
