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
require('../../common/conexion_emafact.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$pdoEmafact = getPDOEMAFACT();

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
        idGuiRem,
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

        while ($row_operacopm_devolucion = $stmt_list_operaciones_devolucion->fetch(PDO::FETCH_ASSOC)) {
            $idGuiRem = $row_operacopm_devolucion["idGuiRem"];

            $sql_select_referral_guide =
                "SELECT 
            rg.customer_id,
            cu.contact
            FROM referral_guides AS rg
            LEFT JOIN customers AS cu ON cu.id = rg.customer_id
            WHERE rg.id = ?";
            $stmt_select_referral_guide = $pdoEmafact->prepare($sql_select_referral_guide);
            $stmt_select_referral_guide->bindParam(1, $idGuiRem, PDO::PARAM_INT);
            $stmt_select_referral_guide->execute();
            $row_referral_guide = $stmt_select_referral_guide->fetch(PDO::FETCH_ASSOC);

            if ($row_referral_guide) {
                $row_operacopm_devolucion["customer"] = $row_referral_guide["contact"];
                array_push($result, $row_operacopm_devolucion);
            } else {
                $row_operacopm_devolucion["customer"] = "SIN CLIENTE";
                array_push($result, $row_operacopm_devolucion);
            }
        }

        // $result = $stmt_list_operaciones_devolucion->fetchAll(PDO::FETCH_ASSOC);
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
