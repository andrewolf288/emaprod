<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReq = $data["idReq"]; // ide de requesicion
    $idReqDet = $data["id"]; // id requisicion detalle

    if ($pdo) {
        try {
            // primero eliminamos el detalle de la requisicion
            $sql_delete_detalle_requisicion =
                "DELETE FROM requisicion_detalle
            WHERE id = ?";
            $stmt_delete_detalle_requisicion = $pdo->prepare($sql_delete_detalle_requisicion);
            $stmt_delete_detalle_requisicion->bindParam(1, $idReqDet, PDO::PARAM_INT);
            $stmt_delete_detalle_requisicion->execute();

            $total_requisiciones = 0; // total de requisiciones
            $requisiciones_pendientes = 0;
            $requisicion_completas = 0;

            // luego verificamos cuantos se encuentran en estado completo o pendientes
            $sql_consult_estado_requisicion =
                "SELECT
            COUNT(*) AS total_requisiciones,
            SUM(CASE WHEN idReqDetEst = 1 THEN 1 ELSE 0 END) AS requisiciones_pendientes,
            SUM(CASE WHEN idReqDetEst = 2 THEN 1 ELSE 0 END) AS requisicion_completas
            FROM requisicion_detalle
            WHERE idReq = ?";
            $stmt_consult_estado_requisicion = $pdo->prepare($sql_consult_estado_requisicion);
            $stmt_consult_estado_requisicion->bindParam(1, $idReq, PDO::PARAM_INT);
            $stmt_consult_estado_requisicion->execute();

            while ($row_consult_estado_requisicion = $stmt_consult_estado_requisicion->fetch(PDO::FETCH_ASSOC)) {
                $requisiciones_pendientes = $row_consult_estado_requisicion["requisiciones_pendientes"];
                $requisicion_completas = $row_consult_estado_requisicion["requisicion_completas"];
                $total_requisiciones = $row_consult_estado_requisicion["total_requisiciones"];
            }

            $idReqEst = 2; // estado en proceso
            // si existen requisiciones pendientes o en proceso
            if ($total_requisiciones == $requisiciones_pendientes) {
                $idReqEst = 1; // estado pendiente
            }
            if ($total_requisiciones == $requisicion_completas) {
                $idReqEst = 3; // estado completo
            }
            // LUEGO ACTUALIZAMOS EL MAESTRO
            if ($idReqEst == 3) {
                // obtenemos la fecha actual
                $fecEntReq = date('Y-m-d H:i:s');
                $sql_update_requisicion_completo =
                    "UPDATE requisicion
                SET idReqEst = ?, fecEntReq = ?
                WHERE id = ?";
                $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion_completo->bindParam(2, $fecEntReq);
                $stmt_update_requisicion_completo->bindParam(3, $idReq, PDO::PARAM_INT);
                $stmt_update_requisicion_completo->execute();
            } else {
                $sql_update_requisicion =
                    "UPDATE requisicion
                SET idReqEst = ?
                WHERE id = ?";
                $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion->bindParam(2, $idReq, PDO::PARAM_INT);
                $stmt_update_requisicion->execute();
            }
        } catch (PDOException $e) {
            $message_error = "Error con las operaciones";
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
