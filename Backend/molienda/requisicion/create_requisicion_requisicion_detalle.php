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
    $idProdt = $data["idProdt"]; // id de producto
    $klgLotProd = $data["klgLotProd"]; // peso de requisicion
    $codLotProd = $data["codLotProd"]; // codigo de lote de produccion
    $canLotProd = $data["canLotProd"]; // cantidad de lote de produccion
    $esSubProd = $data["esSubProd"]; // signal si es subproducto

    $codArea = "ML"; // codigo de area
    $reqMolDet = $data["reqMolDet"]; // detalle de requisicion
    $idLastInsertion = 0; // id de ultima insercion

    if ($pdo) {
        // primero debemos verificar que el codigo de lote no se encuentre utilizado en la actualidad
        // del año
        $anio_actual = date('Y'); // obtenemos año actual
        $sql_consult_codigo_lote =
            "SELECT * FROM requisicion WHERE codLotProd = ? AND YEAR(fecPedReq) = ? LIMIT 1";
        $stmt_consult_codigo_lote = $pdo->prepare($sql_consult_codigo_lote);
        $stmt_consult_codigo_lote->bindParam(1, $codLotProd, PDO::PARAM_INT);
        $stmt_consult_codigo_lote->bindParam(2, $anio_actual, PDO::PARAM_STR);
        $stmt_consult_codigo_lote->execute();

        if ($stmt_consult_codigo_lote->rowCount() == 0) {

            $idReqEst = 1; // estado de requerido
            $idAre = 2; // area molienda
            $idReqTip = 1; // requisicion de producto intermedio

            $sql_consult_requisicion =
                "SELECT SUBSTR(codReq,5,8) AS numCodReq FROM requisicion WHERE idAre = ? AND codReq IS NOT NULL ORDER BY id DESC LIMIT 1";
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
                    (idReqEst, idProdt, codReq, idAre, cantProg, codLotProd, canLotProd, idReqTip, esSubProd)
                    VALUES (?,?,?,?,?,?,?,?,?)";
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idReqEst, PDO::PARAM_INT); // estaod de requisicion
            $stmt->bindParam(2, $idProdt, PDO::PARAM_INT); // id de producto
            $stmt->bindParam(3, $codReq, PDO::PARAM_STR); // codigo de requisicon
            $stmt->bindParam(4, $idAre, PDO::PARAM_STR); // area de requisicion
            $stmt->bindParam(5, $klgLotProd, PDO::PARAM_STR); // peso de requisicion
            $stmt->bindParam(6, $codLotProd, PDO::PARAM_STR); // codigo de lote de produccion
            $stmt->bindParam(7, $canLotProd, PDO::PARAM_STR); // cantidad de lote de produccion
            $stmt->bindParam(8, $idReqTip, PDO::PARAM_INT); // requisicion de producto intermedio
            $stmt->bindParam(9, $esSubProd, PDO::PARAM_BOOL); // es sub producto

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

                    // TERMINAMOS LA TRANSACCION
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollback();
                    $message_error = "ERROR INTERNO SERVER: fallo en inserción de detalles formula";
                    $description_error = $e->getMessage();
                }
            }
        } else {
            $message_error = "ERROR INTERNO SERVER: ya existe el codigo de lote";
            $description_error = "El código de lote proporcionado ya fué utilizado en el actual año";
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
