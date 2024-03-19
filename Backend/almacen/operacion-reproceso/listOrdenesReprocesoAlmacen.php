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

    if ($pdo) {
        // primero consultamos las operaciones de devolucion calidad
        $sql_select_operacion_devolucion_calidad =
            "SELECT
        odc.id,
        odc.fueCom,
        odc.numLots,
        p.nomProd,
        me.simMed,
        p.codProd2,
        odd.canOpeDevDet,
        odc.fecCreOpeDevCal
        FROM operacion_devolucion_calidad AS odc
        JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
        JOIN producto AS p ON p.id = odd.idProdt
        JOIN medida AS me ON me.id = p.idMed
        WHERE DATE(odc.fecCreOpeDevCal) BETWEEN ? AND ? 
        ORDER BY odc.fecCreOpeDevCal DESC";
        $stmt_select_operacion_devolucion_calidad = $pdo->prepare($sql_select_operacion_devolucion_calidad);
        $stmt_select_operacion_devolucion_calidad->bindParam(1, $fechaInicio, PDO::PARAM_STR);
        $stmt_select_operacion_devolucion_calidad->bindParam(2, $fechaFin, PDO::PARAM_STR);
        $stmt_select_operacion_devolucion_calidad->execute();

        while ($row_operacion_devolucion_calidad = $stmt_select_operacion_devolucion_calidad->fetch(PDO::FETCH_ASSOC)) {
            $idOpeDevCal = $row_operacion_devolucion_calidad["id"];
            $row_operacion_devolucion_calidad["requeridas"] = 0;
            $row_operacion_devolucion_calidad["en_proceso"] = 0;
            $row_operacion_devolucion_calidad["completadas"] = 0;

            // debemos ver que requisiciones de devolucion estan pendientes
            $sql_select_operacion_devolucion_calidad =
                "SELECT trd.idReqDev
            FROM trazabilidad_reproceso_devolucion AS trd
            JOIN operacion_devolucion_calidad_detalle AS odcd ON odcd.id = trd.idOpeDevCalDet
            WHERE odcd.idOpeDevCal = ?";
            $stmt_selet_operacion_devolucion_calidad = $pdo->prepare($sql_select_operacion_devolucion_calidad);
            $stmt_selet_operacion_devolucion_calidad->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
            $stmt_selet_operacion_devolucion_calidad->execute();

            while ($row_trazabilidad_reproceso_devolucion = $stmt_selet_operacion_devolucion_calidad->fetch(PDO::FETCH_ASSOC)) {
                $idReqDev = $row_trazabilidad_reproceso_devolucion["idReqDev"];
                $sql_select_requisicion_devolucion =
                    "SELECT idReqEst 
                FROM requisicion_devolucion
                WHERE id = ?";
                $stmt_select_requisicion_devolucion = $pdo->prepare($sql_select_requisicion_devolucion);
                $stmt_select_requisicion_devolucion->bindParam(1, $idReqDev, PDO::PARAM_INT);
                $stmt_select_requisicion_devolucion->execute();
                $row_requisicion_devolucion = $stmt_select_requisicion_devolucion->fetch(PDO::FETCH_ASSOC);

                $idReqEst = $row_requisicion_devolucion["idReqEst"];

                // requeridas
                if ($idReqEst == 1) {
                    $row_operacion_devolucion_calidad["requeridas"]++;
                }
                // en proceso
                if ($idReqEst == 2) {
                    $row_operacion_devolucion_calidad["en_proceso"]++;
                }
                // completadas
                if ($idReqEst == 3) {
                    $row_operacion_devolucion_calidad["completadas"]++;
                }
            }

            // debemos que detalle de desmedro estan
            $esReproceso = 0;
            $sql_operacion_devolucion_detalle_desmedro =
                "SELECT 
            fueComOpeDes
            FROM operacion_devolucion_calidad_detalle AS odcd
            WHERE odcd.idOpeDevCal = ? AND odcd.esReproceso = ?";
            $stmt_operacion_devolucion_detalle_desmedro = $pdo->prepare($sql_operacion_devolucion_detalle_desmedro);
            $stmt_operacion_devolucion_detalle_desmedro->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
            $stmt_operacion_devolucion_detalle_desmedro->bindParam(2, $esReproceso, PDO::PARAM_BOOL);
            $stmt_operacion_devolucion_detalle_desmedro->execute();

            while ($row_operacion_devolucion_detalle_desmedro = $stmt_operacion_devolucion_detalle_desmedro->fetch(PDO::FETCH_ASSOC)) {
                $fueComOpeDes = $row_operacion_devolucion_detalle_desmedro["fueComOpeDes"];
                if ($fueComOpeDes == 0) {
                    $row_operacion_devolucion_calidad["requeridas"]++;
                } else {
                    $row_operacion_devolucion_calidad["completadas"]++;
                }
            }

            array_push($result, $row_operacion_devolucion_calidad);
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
