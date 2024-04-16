<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

$idReqEst = 3;
$idMotReqMat = 2;
$idAre = 4;
$codReqMat = "RMPRO";
$index = 1;
$notReqMat = "";
$idLastInsertion = 0;
$idLastInsertion2 = 0;
$idAlmDes = 11;

$fueCom = 1;

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $idReqTip = 3;
    $fecha_actual = date('Y-m-d');
    try {
        $pdo->beginTransaction();

        $sql_select_requisicion_materiales =
            "SELECT * FROM requisicion 
        WHERE idReqTip = ?";
        $stmt_select_requisicion_materiales = $pdo->prepare($sql_select_requisicion_materiales);
        $stmt_select_requisicion_materiales->bindParam(1, $idReqTip, PDO::PARAM_INT);
        $stmt_select_requisicion_materiales->execute();

        while ($row_requisicion_seleccion = $stmt_select_requisicion_materiales->fetch(PDO::FETCH_ASSOC)) {
            $idReqMat = $row_requisicion_seleccion["id"];
            $auxCod = $codReqMat . str_pad(strval($index), 7, "0", STR_PAD_LEFT);
            // insercion en la tabla de requisicion materiales
            $sql_insert_requisicion_materiales =
                "INSERT INTO requisicion_materiales
            (idReqEst, idMotReqMat, idAre, codReqMat, notReqMat, fecComReqMat)
            VALUES(?, ?, ?, ?, ?, ?)";
            $stmt_insert_requisicion_materiales = $pdo->prepare($sql_insert_requisicion_materiales);
            $stmt_insert_requisicion_materiales->bindParam(1, $idReqEst, PDO::PARAM_INT);
            $stmt_insert_requisicion_materiales->bindParam(2, $idMotReqMat, PDO::PARAM_INT);
            $stmt_insert_requisicion_materiales->bindParam(3, $idAre, PDO::PARAM_INT);
            $stmt_insert_requisicion_materiales->bindParam(4, $auxCod, PDO::PARAM_STR);
            $stmt_insert_requisicion_materiales->bindParam(5, $notReqMat, PDO::PARAM_STR);
            $stmt_insert_requisicion_materiales->bindParam(6, $fecha_actual, PDO::PARAM_STR);
            $stmt_insert_requisicion_materiales->execute();
            $idLastInsertion = $pdo->lastInsertId();

            $sql_requisicion_materiales_detalle =
                "SELECT * FROM requisicion_detalle
            WHERE idReq = ?";
            $stmt_requisicion_materiales_detalle = $pdo->prepare($sql_requisicion_materiales_detalle);
            $stmt_requisicion_materiales_detalle->bindParam(1, $idReqMat, PDO::PARAM_INT);
            $stmt_requisicion_materiales_detalle->execute();

            while ($row_requisicion_materiales_detalle = $stmt_requisicion_materiales_detalle->fetch(PDO::FETCH_ASSOC)) {
                $idReqMatDet = $row_requisicion_materiales_detalle["id"];
                $idProdt = $row_requisicion_materiales_detalle["idProdt"];
                $canReqDet = $row_requisicion_materiales_detalle["canReqDet"];

                $sql_insert_requisicion_materiales_detalle =
                    "INSERT INTO requisicion_materiales_detalle
                 (idReqMat, idProdt, canReqMatDet, fueCom, fecComReqMatDet)
                 VALUES(?, ?, ?, ?, ?)";
                $stmt_insert_requisicion_materiales_detalle = $pdo->prepare($sql_insert_requisicion_materiales_detalle);
                $stmt_insert_requisicion_materiales_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                $stmt_insert_requisicion_materiales_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_insert_requisicion_materiales_detalle->bindParam(3, $canReqDet, PDO::PARAM_STR);
                $stmt_insert_requisicion_materiales_detalle->bindParam(4, $fueCom, PDO::PARAM_BOOL);
                $stmt_insert_requisicion_materiales_detalle->bindParam(5, $fecha_actual, PDO::PARAM_STR);
                $stmt_insert_requisicion_materiales_detalle->execute();
                $idLastInsertion2 = $pdo->lastInsertId();

                $sql_salida_stock = 
                "SELECT * FROM salida_stock
                WHERE idReqDet = ?";
                $stmt_salida_stock = $pdo->prepare($sql_salida_stock);
                $stmt_salida_stock->bindParam(1, $idReqMatDet, PDO::PARAM_INT);
                $stmt_salida_stock->execute();

                while($row_salida_stock = $stmt_salida_stock->fetch(PDO::FETCH_ASSOC)){
                    $canSalStoReq = $row_salida_stock["canSalStoReq"];
                    $idEntSto = $row_salida_stock["idEntSto"];

                    $sql_insert_salida_stock_materiales =
                    "INSERT INTO salida_requisicion_materiales
                    (idReqMat, idReqMatDet, canSalReqMatDet, idEntSto, idAlmDes)
                    VALUES(?, ?, ?, ?, ?)";
                    $stmt_insert_salida_stock_materiales = $pdo->prepare($sql_insert_salida_stock_materiales);
                    $stmt_insert_salida_stock_materiales->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                    $stmt_insert_salida_stock_materiales->bindParam(2, $idLastInsertion2, PDO::PARAM_INT);
                    $stmt_insert_salida_stock_materiales->bindParam(3, $canSalStoReq, PDO::PARAM_STR);
                    $stmt_insert_salida_stock_materiales->bindParam(4, $idEntSto, PDO::PARAM_INT);
                    $stmt_insert_salida_stock_materiales->bindParam(5, $idAlmDes, PDO::PARAM_INT);
                    $stmt_insert_salida_stock_materiales->execute();
                }
            }

            $index++;
        }

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "Error al realizar las operaciones";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
