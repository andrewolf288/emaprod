<?php
// CON ESTE SCRIPT DEBEMOS TRAER LA INFORMACION DE LA OPERACION DEVOLUCION CALIDAD POR ID
header('Content-Type: application/json; charset=utf-8');
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
    $idOpeDevCal = $data["idOpeDevCal"];

    if ($pdo) {
        $sql_select_operacion_devolucion_calidad =
            "SELECT
        odc.id,
        odc.idOpeDev,
        od.invSerFac,
        od.invNumFac,
        od.fecCreOpeDev,
        odc.idOpeDevDet,
        odd.idProdt,
        p.nomProd,
        p.codProd,
        p.codProd2,
        odd.canOpeDevDet,
        odc.idMotDevCal,
        mdc.desMotDevCal,
        odc.numLots,
        odc.fueCom,
        odc.fecComOpeDevCal,
        odc.fecCreOpeDevCal 
        FROM operacion_devolucion_calidad AS odc
        LEFT JOIN motivo_devolucion_calidad AS mdc ON mdc.id = odc.idMotDevCal
        JOIN operacion_devolucion AS od ON od.id = odc.idOpeDev
        JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
        JOIN producto AS p ON p.id = odd.idProdt
        WHERE odc.id = ?";
        $stmt_select_operacion_devolucion_calidad = $pdo->prepare($sql_select_operacion_devolucion_calidad);
        $stmt_select_operacion_devolucion_calidad->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
        $stmt_select_operacion_devolucion_calidad->execute();

        $result = $stmt_select_operacion_devolucion_calidad->fetch(PDO::FETCH_ASSOC);
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
