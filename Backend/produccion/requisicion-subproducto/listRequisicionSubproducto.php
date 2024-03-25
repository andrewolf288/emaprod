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

    $esSubProd = 1;
    if ($pdo) {
        $sql_select_requisicion_subproducto =
            "SELECT
        r.id,
        r.idProdc,
        r.idReqEst,
        r.idProdt,
        r.idAre,
        a.desAre,
        r.codLotProd,
        r.cantProg AS canLotProd,
        re.desReqEst,
        p.nomProd,
        r.fecPedReq,
        r.fecEntReq,
        r.codReq
        FROM requisicion r
        JOIN producto AS p ON p.id = r.idProdt
        JOIN area AS a ON a.id = r.idAre
        JOIN requisicion_estado AS re ON re.id = r.idReqEst
        WHERE r.esSubProd = ? AND
        DATE(r.fecPedReq) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY r.fecPedReq DESC";
        $stmt = $pdo->prepare($sql_select_requisicion_subproducto);
        $stmt->bindParam(1, $esSubProd, PDO::PARAM_BOOL);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
