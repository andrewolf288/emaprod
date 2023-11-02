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

    $codArea = "PD"; // codigo de area
    $detReqMat = $data["detReqMat"]; // detalle de requisicion
    $idLastInsertion = 0; // id de ultima insercion

    if ($pdo) {

        $idReqEst = 1; // estado de requerido
        $idAre = 4; // area molienda
        $idReqTip = 3; // requisicion de producto intermedio

        $sql_consult_requisicion =
            "SELECT SUBSTR(codReq,5,8) AS numCodReq 
            FROM requisicion 
            WHERE idAre = ? AND codReq IS NOT NULL 
            ORDER BY id DESC LIMIT 1";
        $stmt_consult_requisicion =  $pdo->prepare($sql_consult_requisicion);
        $stmt_consult_requisicion->bindParam(1, $idAre, PDO::PARAM_INT);
        $stmt_consult_requisicion->execute();

        $numberRequisicion = 0;
        $codReq = "";

        if ($stmt_consult_requisicion->rowCount() !== 1) {
            $codReq = "RQ" . $codArea . "00000001"; // la primera requisicion del sistema
        } else {
            while ($row = $stmt_consult_requisicion->fetch(PDO::FETCH_ASSOC)) {
                $numberRequisicion = (intval($row["numCodReq"]) + 1);
            }
            $codReq = "RQ" . $codArea . str_pad(strval($numberRequisicion), 8, "0", STR_PAD_LEFT);
        }

        // una vez obtenido el codigo, procedemos a crear la requisicion
        $sql =
            "INSERT INTO
            requisicion
            (idReqEst, codReq, idAre, idReqTip)
            VALUES (?,?,?,?)";
        try {
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            //$stmt->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt->bindParam(1, $idReqEst, PDO::PARAM_INT); // estaod de requisicion
            $stmt->bindParam(2, $codReq, PDO::PARAM_STR); // codigo de requisicon
            $stmt->bindParam(3, $idAre, PDO::PARAM_STR); // area de requisicion
            $stmt->bindParam(4, $idReqTip, PDO::PARAM_INT); // requisicion de producto intermedio

            $pdo->beginTransaction();
            $stmt->execute();
            $idLastInsertion = $pdo->lastInsertId();

            if ($idLastInsertion != 0) {
                $sql_detalle = "";
                $idReqDetEst = 1; // ESTADO REQUERIDO
                try {
                    foreach ($detReqMat as $fila) {
                        // EXTRAEMOS LOS VALORES
                        $idMatPri = $fila["idMatPri"];
                        $canMatPriReq = $fila["canMatPriFor"];

                        // CREAMOS LA SENTENCIA
                        $sql_detalle = "INSERT INTO 
                                    requisicion_detalle (idReq, idProdt, idReqDetEst, canReqDet) 
                                    VALUES (?, ?, ?, $canMatPriReq);";
                        // PREPARAMOS LA CONSULTA
                        $stmt_detalle = $pdo->prepare($sql_detalle);
                        $stmt_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                        $stmt_detalle->bindParam(2, $idMatPri, PDO::PARAM_INT);
                        $stmt_detalle->bindParam(3, $idReqDetEst, PDO::PARAM_INT);
                        // EJECUTAMOS LA CONSULTA
                        $stmt_detalle->execute();
                        $sql_detalle = "";
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO SERVER: fallo en inserción de detalles formula";
                    $description_error = $e->getMessage();
                }
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER: fallo en insercion de maestro requisicion molienda";
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
