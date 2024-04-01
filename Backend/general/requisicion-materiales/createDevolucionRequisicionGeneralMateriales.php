<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReqMat = $data["idReqMat"];
    $correlativo = $data["correlativo"];
    $devoluciones = $data["devoluciones"];
    $idReqEst = 1;

    try {
        $pdo->beginTransaction();
        $sql_create_requisicion_devolucion_materiales =
            "INSERT INTO requisicion_devolucion_materiales
        (idReqMat, correlativo, idReqEst)
        VALUES(?, ?, ?)";
        $stmt_create_requisicion_devolucion_materiales = $pdo->prepare($sql_create_requisicion_devolucion_materiales);
        $stmt_create_requisicion_devolucion_materiales->bindParam(1, $idReqMat, PDO::PARAM_INT);
        $stmt_create_requisicion_devolucion_materiales->bindParam(2, $correlativo, PDO::PARAM_STR);
        $stmt_create_requisicion_devolucion_materiales->bindParam(3, $idReqEst, PDO::PARAM_INT);
        $stmt_create_requisicion_devolucion_materiales->execute();

        $idLastInsertion = $pdo->lastInsertId();

        foreach ($devoluciones as $devoluciones) {
            $idProdt = $devoluciones["idProdt"];
            $canProdDev = $devoluciones["canProdDev"];
            $idProdDevMot = $devoluciones["idProdDevMot"];

            $sql_create_requisicion_devolucion_materiales_detalle =
                "INSERT INTO requisicion_devolucion_materiales_detalle
            (idReqDevMat, idProdt, idMotDev, canReqDevMatDet)
            VALUES(?, ?, ?, $canProdDev)";
            $stmt_create_requisicion_devolucion_materiales_detalle = $pdo->prepare($sql_create_requisicion_devolucion_materiales_detalle);
            $stmt_create_requisicion_devolucion_materiales_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
            $stmt_create_requisicion_devolucion_materiales_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
            $stmt_create_requisicion_devolucion_materiales_detalle->bindParam(3, $idProdDevMot, PDO::PARAM_INT);
            $stmt_create_requisicion_devolucion_materiales_detalle->execute();
        }
        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "Error en las operaciones";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
