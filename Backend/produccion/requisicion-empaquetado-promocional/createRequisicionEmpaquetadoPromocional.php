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

    $idProdtReq = $data["idProdt"];
    $canReqEmpPro = $data["canReqEmpPro"];
    $detReqEmpProm = $data["detReqEmpProm"];
    $idLastInsertion = 0;
    $correlativo = "";
    $idReqEst = 1;
    $fechaActual = date('Y-m-d H:i:s');

    if ($pdo) {
        try {
            $pdo->beginTransaction();
            // debemos encontrar el siguiente correlativo
            $sql_consult_requisicion_empaquetado_promocional = 
            "SELECT SUBSTR(rep.correlativo,6,12) AS numCodReq
            FROM requisicion_empaquetado_promocional AS rep
            WHERE rep.correlativo IS NOT NULL 
            ORDER BY rep.id DESC LIMIT 1";
            $stmt_consult_requisicion_empaquetado_promocional = $pdo->prepare($sql_consult_requisicion_empaquetado_promocional);
            $stmt_consult_requisicion_empaquetado_promocional->execute();
            $row_consult_requisicion_empaquetado_promocional = $stmt_consult_requisicion_empaquetado_promocional->fetch(PDO::FETCH_ASSOC);
    
            if(!$row_consult_requisicion_empaquetado_promocional){
                $correlativo = "RQEP" . "0000001";
            } else {
                $numberRequisicion = (intval($row_consult_requisicion_empaquetado_promocional["numCodReq"]) + 1);
                $codReqMat = "RQEP" . str_pad(strval($numberRequisicion), 7, "0", STR_PAD_LEFT);
            }
    
            // debemos registrar el detalle de la requisicion de presentaciones finales
            $sql_insert_requisicion_empaquetado_promocional = 
            "INSERT INTO requisicion_empaquetado_promocional
            (correlativo, idProdt, idReqEst, canReqEmpPro)
            VALUES(?, ?, ?, $canReqEmpPro)";
            $stmt_insert_requisicion_empaquetado_promocional = $pdo->prepare($sql_insert_requisicion_empaquetado_promocional);
            $stmt_insert_requisicion_empaquetado_promocional->bindParam(1, $correlativo, PDO::PARAM_STR);
            $stmt_insert_requisicion_empaquetado_promocional->bindParam(2, $idProdtReq, PDO::PARAM_INT);
            $stmt_insert_requisicion_empaquetado_promocional->bindParam(3, $idReqEst, PDO::PARAM_INT);
            $stmt_insert_requisicion_empaquetado_promocional->execute();
            $idLastInsertion = $pdo->lastInsertId();
    
            // debemos registrar el detalle de la requisicion de materiales
            foreach($detReqEmpProm as $detalle){
                $idProdt = $detalle["idProdt"];
                $canReqEmpPromDet = $detalle["canReqEmpPromDet"];
                $esMatReq = $detalle["esMatReq"];
                $esProdFin = $detalle["esProdFin"];

                $sql_create_requisicion_empaquetado_promocional = 
                "INSERT INTO requisicion_empaquetado_promocional_detalle 
                (idReqEmpProm, idProdt, canReqEmpPromDet, esProdFin, esMatReq)
                VALUES(?, ?, $canReqEmpPromDet, ?, ?)";
                $stmt_create_requisicion_empaquetado_promocional = $pdo->prepare($sql_create_requisicion_empaquetado_promocional);
                $stmt_create_requisicion_empaquetado_promocional->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                $stmt_create_requisicion_empaquetado_promocional->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_create_requisicion_empaquetado_promocional->bindParam(3, $esProdFin, PDO::PARAM_BOOL);
                $stmt_create_requisicion_empaquetado_promocional->bindParam(4, $esMatReq, PDO::PARAM_BOOL);
                $stmt_create_requisicion_empaquetado_promocional->execute();
            }

            // debemos registrar el detalle de los ingresos
            $sql_create_requisicion_empaquetado_promocional_ingreso = 
            "INSERT INTO requisicion_empaquetado_promocional_ingreso
            (idReqEmpProm, idProdt, canProdIng, fecProdIng)
            VALUES(?, ?, $canReqEmpPro, ?)";
            $stmt_create_requisicion_empaquetado_promocional_ingreso = $pdo->prepare($sql_create_requisicion_empaquetado_promocional_ingreso);
            $stmt_create_requisicion_empaquetado_promocional_ingreso->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
            $stmt_create_requisicion_empaquetado_promocional_ingreso->bindParam(2, $idProdtReq, PDO::PARAM_INT);
            $stmt_create_requisicion_empaquetado_promocional_ingreso->bindParam(3, $fechaActual, PDO::PARAM_STR);
            $stmt_create_requisicion_empaquetado_promocional_ingreso->execute();

            $pdo->commit();
        } catch(PDOException $e){
            $pdo->rollBack();
            $message_error = "Error en la operación";
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
