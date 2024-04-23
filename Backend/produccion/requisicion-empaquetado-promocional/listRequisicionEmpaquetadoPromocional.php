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
        if (!empty($data["fechaInicio"])) {
            $fechaInicio = $data["fechaInicio"];
        }
        if (!empty($data["fechaFin"])) {
            $fechaFin = $data["fechaFin"];
        }
    }

    if ($pdo) {
        $sql_requisiciones_empaquetado_promocional = 
        "SELECT 
        rep.id,
        rep.correlativo,
        rep.idProdt,
        p.nomProd,
        me.simMed,
        rep.canReqEmpPro,
        rep.idReqEst,
        re.desReqEst,
        rep.fecCreReqEmpProm,
        rep.fecActReqEmpProm
        FROM requisicion_empaquetado_promocional AS rep
        JOIN producto AS p ON p.id = rep.idProdt
        JOIN medida AS me ON me.id = p.idMed
        JOIN requisicion_estado AS re ON re.id = rep.idReqEst
        WHERE (DATE(rep.fecCreReqEmpProm) BETWEEN ? AND ?)";
        $stmt_requisiciones_empaquetado_promocional = $pdo->prepare($sql_requisiciones_empaquetado_promocional);
        $stmt_requisiciones_empaquetado_promocional->bindParam(1, $fechaInicio, PDO::PARAM_STR);
        $stmt_requisiciones_empaquetado_promocional->bindParam(2, $fechaFin, PDO::PARAM_STR);
        $stmt_requisiciones_empaquetado_promocional->execute();

        $result = $stmt_requisiciones_empaquetado_promocional->fetchAll(PDO::FETCH_ASSOC);

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