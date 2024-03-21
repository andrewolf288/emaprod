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

    $idAre = $data["idAre"];

    if ($pdo) {
        $sql_select_requisicion_materiales =
            "SELECT 
        rm.id,
        rm.idReqEst,
        re.desReqEst,
        rm.idMotReqMat,
        mrm.desMotReqMat,
        rm.idAre,
        ar.desAre,
        rm.codReqMat,
        rm.notReqMat,
        rm.fecCreReqMat
        FROM requisicion_materiales AS rm
        JOIN requisicion_estado AS re ON re.id = rm.idReqEst
        JOIN motivo_requisicion_materiales AS mrm ON mrm.id = rm.idMotReqMat
        JOIN area AS ar ON ar.id = rm.idAre
        WHERE rm.idAre = ? AND (DATE(rm.fecCreReqMat) BETWEEN ? AND ?)";
        $stmt_select_requisicion_materiales = $pdo->prepare($sql_select_requisicion_materiales);
        $stmt_select_requisicion_materiales->bindParam(1, $idAre, PDO::PARAM_INT);
        $stmt_select_requisicion_materiales->bindParam(2, $fechaInicio, PDO::PARAM_STR);
        $stmt_select_requisicion_materiales->bindParam(3, $fechaFin, PDO::PARAM_STR);

        $stmt_select_requisicion_materiales->execute();

        $result = $stmt_select_requisicion_materiales->fetchAll(PDO::FETCH_ASSOC);
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
