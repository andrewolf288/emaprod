<?php
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

    $idOpeDev = $data["idOpeDev"];

    if ($pdo) {
        try {
            $idGuiRem = 0;
            $idOpeFacMot = 0;
            // primero traemos la informacion de la operacion facturacion con su detalle
            $sql_select_operacion_devolucion =
                "SELECT 
            od.id,
            od.invSerFac,
            od.invNumFac,
            od.idGuiRem,
            od.idOpeFacMot,
            od.idReqEst,
            re.desReqEst,
            od.esRet,
            od.esOpeFacExi,
            ofm.desOpeFacMot,
            od.fecCreOpeDev
            FROM operacion_devolucion AS od
            JOIN operacion_facturacion_motivo AS ofm ON ofm.id = od.idOpeFacMot
            JOIN requisicion_estado AS re ON re.id = od.idReqEst
            WHERE od.id = ?";
            $stmt_select_operacion_devolucion = $pdo->prepare($sql_select_operacion_devolucion);
            $stmt_select_operacion_devolucion->bindParam(1, $idOpeDev, PDO::PARAM_INT);
            $stmt_select_operacion_devolucion->execute();
            $row_operacion_devolucion = $stmt_select_operacion_devolucion->fetch(PDO::FETCH_ASSOC);

            if ($row_operacion_devolucion) {
                $sql_select_operacion_devolucion_detalle =
                    "SELECT
                odd.id,
                odd.idOpeDev,
                odd.idProdt,
                p.nomProd,
                odd.refProdt,
                odd.canOpeDevDet,
                odd.esMerProm,
                odd.esProFin,
                odd.fueComDet,
                odd.fecComOpeDevDet,
                odd.fecCreOpeDevDet,
                odd.fecActOpeDevDet
                FROM operacion_devolucion_detalle AS odd
                JOIN producto AS p ON p.id = odd.idProdt
                WHERE odd.idOpeDev = ?";
                $stmt_select_operacion_devolucion_detalle = $pdo->prepare($sql_select_operacion_devolucion_detalle);
                $stmt_select_operacion_devolucion_detalle->bindParam(1, $idOpeDev, PDO::PARAM_INT);
                $stmt_select_operacion_devolucion_detalle->execute();

                $row_operacion_devolucion["detOpeDev"] = $stmt_select_operacion_devolucion_detalle->fetchAll(PDO::FETCH_ASSOC);
                $result = $row_operacion_devolucion;
            }
        } catch (PDOException $e) {
            $message_error = "ERROR EN LA CONSULTA";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error en la coneccion con la base de datos";
        $description_error = "Error en la coneccion con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
