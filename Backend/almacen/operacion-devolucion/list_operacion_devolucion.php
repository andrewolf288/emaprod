<?php
// EN ESTE SCRIPT DEBE LISTAR TODAS LAS OPERACIONES DE DEVOLUCION
// TIPO: SOLO EMAPROD
/*
    1. SE CONSULTA TODAS LAS OPERACIONES DE DEVOLUCION REALIZADAS EN EL DIA
    2. CADA UNA TENDRA UN ICONO DE VISTA DONDE SE PODRA VISUALIZAR EL DETALLE DE LAS MISMAS
*/
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

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
        $sql_list_operaciones_devolucion =
            "SELECT 
        od.id,
        od.idReqEst,
        re.desReqEst,
        od.invSerFac,
        od.invNumFac,
        od.idOpeFacMot,
        ofm.desOpeFacMot,
        od.fecCreOpeDev
        FROM operacion_devolucion AS od
        JOIN requisicion_estado AS re ON re.id = od.idReqEst
        JOIN operacion_facturacion_motivo AS ofm ON ofm.id = od.idOpeFacMot
        WHERE DATE(od.fecCreOpeDev) BETWEEN '$fechaInicio' AND '$fechaFin'";
        $stmt_list_operaciones_devolucion = $pdo->prepare($sql_list_operaciones_devolucion);
        $stmt_list_operaciones_devolucion->execute();
        $result = $stmt_list_operaciones_devolucion->fetchAll(PDO::FETCH_ASSOC);
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
