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

    $idReqDevMat = $data["idReqDevMat"]; // requisicion agregacion
    $idReqDevMatDet = $data["id"]; // requisicion agregacion detalle

    if ($pdo) {

        $sql_delete_detalle_requisicion_devolucion =
            "DELETE FROM requisicion_devolucion_materiales_detalle
            WHERE id = ?";
        try {
            $stmt_delete_detalle_requisicion_devolucion = $pdo->prepare($sql_delete_detalle_requisicion_devolucion);
            $stmt_delete_detalle_requisicion_devolucion->bindParam(1, $idReqDevMatDet, PDO::PARAM_INT);
            $stmt_delete_detalle_requisicion_devolucion->execute();
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en insercion de salidas";
            $description_error = $e->getMessage();
        }

        // ACTUALIZAMOS LOS ESTADOS DE LA REQUISICION AGREGACION
        if (empty($message_error)) {
            try {
                // Iniciamos una transaccion
                $pdo->beginTransaction();
                // ACTUALIZAMOS EL ESTADO DE LA REQUISICION MOLIENDA DETALLE

                $esComReqDevMatDet = 1; // ESTADO DE COMPLETADO
                $total_requisiciones_detalle_no_completadas = 0;
                $sql_consulta_requisicion_detalle =
                    "SELECT * FROM requisicion_devolucion_materiales_detalle
                WHERE idReqDevMat = ? AND esComReqDevMatDet <> ?";
                $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
                $stmt_consulta_requisicion_detalle->bindParam(1, $idReqDevMat, PDO::PARAM_INT);
                $stmt_consulta_requisicion_detalle->bindParam(2, $esComReqDevMatDet, PDO::PARAM_BOOL);
                $stmt_consulta_requisicion_detalle->execute();

                $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

                $idReqEst = 0; // inicializacion

                if ($total_requisiciones_detalle_no_completadas === 0) { // si no hay requisiciones detalle pendientes
                    $idReqEst = 3; // COMPLETADO
                } else {
                    $idReqEst = 2; // EN PROCESO
                }

                // LUEGO ACTUALIZAMOS EL MAESTRO
                if ($idReqEst == 3) {
                    // obtenemos la fecha actual
                    $fecComReqDevMat = date('Y-m-d H:i:s');
                    $sql_update_requisicion_completo =
                        "UPDATE requisicion_devolucion_materiales
                    SET idReqEst = ?, fecComReqDevMat = ?
                    WHERE id = ?";
                    $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                    $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                    $stmt_update_requisicion_completo->bindParam(2, $fecComReqDevMat);
                    $stmt_update_requisicion_completo->bindParam(3, $idReqDevMat, PDO::PARAM_INT);
                    $stmt_update_requisicion_completo->execute();
                } else {
                    $sql_update_requisicion =
                        "UPDATE requisicion_devolucion_materiales
                    SET idReqEst = ?
                    WHERE id = ?";
                    $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                    $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                    $stmt_update_requisicion->bindParam(2, $idReqDevMat, PDO::PARAM_INT);
                    $stmt_update_requisicion->execute();
                }

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
                $description_error = $e->getMessage();
            }
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
