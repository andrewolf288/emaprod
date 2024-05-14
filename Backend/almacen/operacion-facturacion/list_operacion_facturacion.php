<?php
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
        $sql_select_operaciones_facturacion =
            "SELECT 
        of.id,
        of.idGuiRem,
        of.invSerFac,
        of.invNumFac,
        of.idOpeFacMot,
        of.idReqEst,
        re.desReqEst,
        ofm.desOpeFacMot,
        of.fueAfePorDev,
        of.fueAfePorAnul,
        of.fecCreOpeFac
        FROM operacion_facturacion AS of
        JOIN operacion_facturacion_motivo AS ofm ON ofm.id = of.idOpeFacMot
        JOIN requisicion_estado AS re ON re.id = of.idReqEst
        WHERE DATE(of.fecCreOpeFac) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY of.fecCreOpeFac DESC";

        $stmt_select_operaciones_facturacion = $pdo->prepare($sql_select_operaciones_facturacion);
        $stmt_select_operaciones_facturacion->execute();
        while ($row_operacion_facturacion = $stmt_select_operaciones_facturacion->fetch(PDO::FETCH_ASSOC)) {
            $idGuiRem = $row_operacion_facturacion["idGuiRem"];

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
                $row_operacion_facturacion["customer"] = $row_referral_guide["contact"];
                array_push($result, $row_operacion_facturacion);
            } else {
                $row_operacion_facturacion["customer"] = "SIN CLIENTE";
                array_push($result, $row_operacion_facturacion);
            }
        }
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
