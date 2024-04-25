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
        $sql_select_ordenes_transformacion =
            "SELECT 
        ot.id,
        ot.correlativo,
        ot.idProdtInt,
        ot.idProdc,
        ot.codLotProd,
        ot.idProdtOri,
        p1.nomProd AS nomProd1,
        ot.canUndProdtOri,
        ot.idProdtDes,
        p2.nomProd AS nomProd2,
        ot.canUndProdtDes,
        ot.fecCreOrdTrans
        FROM orden_transformacion AS ot
        JOIN producto AS p1 ON p1.id = ot.idProdtOri
        JOIN producto AS p2 ON p2.id = ot.idProdtDes
        WHERE DATE(ot.fecCreOrdTrans) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY ot.fecCreOrdTrans DESC";

        $stmt_select_ordenes_transformacion = $pdo->prepare($sql_select_ordenes_transformacion);
        $stmt_select_ordenes_transformacion->execute();
        while ($row_orden_transformacion = $stmt_select_ordenes_transformacion->fetch(PDO::FETCH_ASSOC)) {
            $idOrdTrans = $row_orden_transformacion["id"];
            $row_orden_transformacion["trazabilidadRequisicion"] = array();
            $row_orden_transformacion["trazabilidadDevolucion"] = array();

            // consultamos trazabilidad de requisicion
            $sql_consult_trazabilidad_requisicion =
                "SELECT * FROM trazabilidad_transformacion_requisicion
            WHERE idOrdTrans = ?";
            $stmt_consult_trazabilidad_requisicion = $pdo->prepare($sql_consult_trazabilidad_requisicion);
            $stmt_consult_trazabilidad_requisicion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
            $stmt_consult_trazabilidad_requisicion->execute();
            $row_orden_transformacion["trazabilidadRequisicion"] = $stmt_consult_trazabilidad_requisicion->fetch(PDO::FETCH_ASSOC);

            // consultamos trazabilidad de devolucion
            $sql_consult_trazabilidad_devolucion =
                "SELECT * FROM trazabilidad_transformacion_devolucion
            WHERE idOrdTrans = ?";
            $stmt_consult_trazabilidad_devolucion = $pdo->prepare($sql_consult_trazabilidad_devolucion);
            $stmt_consult_trazabilidad_devolucion->bindParam(1, $idOrdTrans, PDO::PARAM_INT);
            $stmt_consult_trazabilidad_devolucion->execute();
            $row_orden_transformacion["trazabilidadDevolucion"] = $stmt_consult_trazabilidad_devolucion->fetch(PDO::FETCH_ASSOC);
            array_push($result, $row_orden_transformacion);
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
