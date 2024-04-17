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

    $idAre = $data["idAre"];
    $idMotReqMat = $data["idMotReqMat"];
    $notReqMat = $data["notReqMat"];
    $detReqMat = $data["detReqMat"];
    $idReqEst = 1; // requisicion requerida
    $codReqMat = "";
    $idLastInsertion = 0;

    if($pdo){
        // debemos formar el codigo
        $sql_consult_requisicion_materiales = 
        "SELECT SUBSTR(rm.codReqMat,6,12) AS numCodReq,
        LEFT(ar.desAre, 3) AS desAre
        FROM requisicion_materiales AS rm
        JOIN area AS ar ON ar.id = rm.idAre
        WHERE rm.idAre = ? AND rm.codReqMat IS NOT NULL 
        ORDER BY rm.id DESC LIMIT 1";
        $stmt_consult_requisicion_materiales = $pdo->prepare($sql_consult_requisicion_materiales);
        $stmt_consult_requisicion_materiales->bindParam(1, $idAre, PDO::PARAM_INT);
        $stmt_consult_requisicion_materiales->execute();
        $row_requisicion_materiales = $stmt_consult_requisicion_materiales->fetch(PDO::FETCH_ASSOC);

        if (!$row_requisicion_materiales) {
            $sql_select_area = 
            "SELECT 
             LEFT(desAre, 3) AS desAre
            FROM area WHERE id = ?";
            $stmt_select_area = $pdo->prepare($sql_select_area);
            $stmt_select_area->bindParam(1, $idAre, PDO::PARAM_INT);
            $stmt_select_area->execute();
            $row_area = $stmt_select_area->fetch(PDO::FETCH_ASSOC);

            $codReqMat = "RM" . strtoupper($row_area["desAre"]) . "0000001";
        } else {
            $numberRequisicion = (intval($row_requisicion_materiales["numCodReq"]) + 1);
            $codReqMat = "RM" . strtoupper($row_requisicion_materiales["desAre"]) . str_pad(strval($numberRequisicion), 7, "0", STR_PAD_LEFT) ;
        }

        try {
            $pdo->beginTransaction();
            $sql_create_requisicion_materiales = 
            "INSERT INTO requisicion_materiales
            (idReqEst, idMotReqMat, idAre, codReqMat, notReqMat)
            VALUES(?, ?, ?, ?, ?)";
            $stmt_create_requisicion_materiales = $pdo->prepare($sql_create_requisicion_materiales);
            $stmt_create_requisicion_materiales->bindParam(1, $idReqEst, PDO::PARAM_INT);
            $stmt_create_requisicion_materiales->bindParam(2, $idMotReqMat, PDO::PARAM_INT);
            $stmt_create_requisicion_materiales->bindParam(3, $idAre, PDO::PARAM_INT);
            $stmt_create_requisicion_materiales->bindParam(4, $codReqMat, PDO::PARAM_STR);
            $stmt_create_requisicion_materiales->bindParam(5, $notReqMat, PDO::PARAM_STR);
            $stmt_create_requisicion_materiales->execute();
    
            $idLastInsertion = $pdo->lastInsertId();

            foreach($detReqMat as $row_detalle_requisicion_materiales){
                $idProdt = $row_detalle_requisicion_materiales["idProdt"];
                $idProdc = $row_detalle_requisicion_materiales["idProdc"];
                $canReqMatDet = $row_detalle_requisicion_materiales["canMatPriFor"];
                
                $sql_create_requisicion_materiales_detalle = 
                "INSERT INTO requisicion_materiales_detalle
                (idReqMat, idProdt, canReqMatDet, idProdc)
                VALUES(?, ?, $canReqMatDet, ?)";
                $stmt_create_requisicion_materiales_detalle = $pdo->prepare($sql_create_requisicion_materiales_detalle);
                $stmt_create_requisicion_materiales_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                $stmt_create_requisicion_materiales_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_create_requisicion_materiales_detalle->bindParam(3, $idProdc, PDO::PARAM_INT);
                $stmt_create_requisicion_materiales_detalle->execute();
            }

            $pdo->commit();
        } catch(PDOException $e){
            $pdo->rollBack();
            $message_error = "Ocurrio un error en las operaciones";
            $description_error = $e->getMessage();
        } catch(Exception $e){
            $pdo->rollBack();
            $message_error = "Ocurrio un error en el codigo";
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