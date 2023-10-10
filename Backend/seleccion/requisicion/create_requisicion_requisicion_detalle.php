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
    $idReqSelEst = 1; // Estado de requerido
    $codLotSel = $data["codLotSel"]; // codigo de lote
    $canReqSel = 1; // cantidad de 1
    $reqSelDet = $data["reqSelDet"]; // requisicion detalle
    $idLastInsertion = 0;
    $fecPedReqSel = $data["fecPedReqSel"];

    if ($pdo) {
        // PARA COMPLETAR EL CODIGO NUMERICO PRIMERO DEBEMOS CONSULTAR LA ULTIMA INSERCION
        $sql_consult_requisicion =
            "SELECT SUBSTR(codReqSel,5,8) AS numberCodReq FROM requisicion_seleccion ORDER BY id DESC LIMIT 1";
        $stmt_consult_requisicion =  $pdo->prepare($sql_consult_requisicion);
        $stmt_consult_requisicion->execute();

        $numberRequisicion = 0;
        $codReqSel = ""; // codigo de requisicion molienda

        if ($stmt_consult_requisicion->rowCount() !== 1) {
            // nueva insercion
            $codReqSel = "RQSL" . "00000001";
        } else {
            while ($row = $stmt_consult_requisicion->fetch(PDO::FETCH_ASSOC)) {
                $numberRequisicion = (intval($row["numberCodReq"]) + 1);
            }
            $codReqSel = "RQSL" . str_pad(strval($numberRequisicion), 8, "0", STR_PAD_LEFT);
        }

        $sql =
            "INSERT INTO
                requisicion_seleccion
                (idReqSelEst, codLotSel, canReqSel, codReqSel, fecPedReqSel)
                VALUES (?,?,$canReqSel,?, ?);
                ";
        // PREPARAMOS LA CONSULTA
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(1, $idReqSelEst, PDO::PARAM_INT);
        $stmt->bindParam(2, $codLotSel, PDO::PARAM_INT);
        $stmt->bindParam(3, $codReqSel, PDO::PARAM_STR);
        $stmt->bindParam(4, $fecPedReqSel);

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
            $idReqSelDetEst = 1; // ESTADO REQUERIDO
            try {
                // COMENZAMOS LA TRANSACCION
                $pdo->beginTransaction();
                foreach ($reqSelDet as $fila) {
                    // EXTRAEMOS LOS VALORES
                    $idMatPri = $fila["idMatPri"];
                    $canMatPriReq = $fila["canMatPriFor"];
                    $fechaRequisicion = $fila["fechaRequisicion"];

                    // CREAMOS LA SENTENCIA
                    $sql_detalle = "INSERT INTO 
                            requisicion_seleccion_detalle (idReqSel, idMatPri, idReqSelDetEst, canReqSelDet, fecCreReqSelDet) 
                            VALUES (?, ?, ?, $canMatPriReq, ?);";
                    // PREPARAMOS LA CONSULTA
                    $stmt_detalle = $pdo->prepare($sql_detalle);
                    $stmt_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                    $stmt_detalle->bindParam(2, $idMatPri, PDO::PARAM_INT);
                    $stmt_detalle->bindParam(3, $idReqSelDetEst, PDO::PARAM_INT);
                    $stmt_detalle->bindParam(4, $fechaRequisicion);
                    // EJECUTAMOS LA CONSULTA
                    $stmt_detalle->execute();
                    $sql_detalle = "";
                }
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
