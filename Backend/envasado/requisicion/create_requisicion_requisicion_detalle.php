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
    $idProdc = $data["idProdc"]; // id produccion
    $idProdt = $data["idProdt"]; // id producto
    $codArea = "EV"; // ESTO REPRESENTA QUE ES UN REQUISICION DE FRESCOS
    $reqMolDet = $data["reqMolDet"];
    $idLastInsertion = 0;

    if ($pdo) {

        // PARA COMPLETAR EL CODIGO NUMERICO PRIMERO DEBEMOS CONSULTAR LA ULTIMA INSERCION
        $sql_consult_requisicion =
            "SELECT SUBSTR(codReq,5,8) AS numCodReq FROM requisicion ORDER BY id DESC LIMIT 1";
        $stmt_consult_requisicion =  $pdo->prepare($sql_consult_requisicion);
        $stmt_consult_requisicion->execute();

        $numberRequisicion = 0;
        $codReq = ""; // codigo de requisicion molienda

        if ($stmt_consult_requisicion->rowCount() !== 1) {
            // nueva insercion
            $codReq = "RQ" . $codArea . "00000001";
        } else {
            while ($row = $stmt_consult_requisicion->fetch(PDO::FETCH_ASSOC)) {
                $numberRequisicion = (intval($row["numCodReq"]) + 1);
            }
            $codReq = "RQ" . $codArea . str_pad(strval($numberRequisicion), 8, "0", STR_PAD_LEFT);
        }

        $idReqEst = 1; // estado de requerido

        // insertamos la requisicion
        $sql =
            "INSERT INTO
                requisicion
                (idProdc, idReqEst, idProdt, codReq)
                VALUES (?,?,?,?);
                ";
        // PREPARAMOS LA CONSULTA
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $idProdc, PDO::PARAM_INT);
        $stmt->bindParam(2, $idReqEst, PDO::PARAM_INT);
        $stmt->bindParam(3, $idProdt, PDO::PARAM_INT);
        $stmt->bindParam(4, $codReq, PDO::PARAM_STR);

        try {
            $pdo->beginTransaction();
            $stmt->execute();
            $idLastInsertion = $pdo->lastInsertId();
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER: fallo en insercion de maestro requisicion molienda";
            $description_error = $e->getMessage();
        }

        if ($idLastInsertion != 0) {
            $sql_detalle = "";
            $idReqDetEst = 1; // ESTADO REQUERIDO
            try {
                // COMENZAMOS LA TRANSACCION
                $pdo->beginTransaction();
                foreach ($reqMolDet as $fila) {
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

                /* ******************** FALTA EVALUAR ESTA PARTE **************** */

                // ACTUALIZAMOS EL ESTADO DE LA PRODUCCION
                // $idProdEst = 2; // requisicion completa
                // $sql_update_produccion =
                //     "UPDATE produccion SET idProdEst = ?";
                // $stmt_update_produccion = $pdo->prepare($sql_update_produccion);
                // $stmt_update_produccion->bindParam(1, $idProdEst, PDO::PARAM_INT);
                // $stmt_update_produccion->execute();

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en inserción de detalles formula";
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
