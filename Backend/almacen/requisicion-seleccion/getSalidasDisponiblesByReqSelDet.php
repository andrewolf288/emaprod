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

    $idReqSel = $data["idReqSel"]; // ID DE LA REQ SEL
    $idMatPri = $data["idMatPri"]; // ID DE LA MATERIA PRIMA

    if ($pdo) {
        $sql =
            "SELECT
            ses.id,
            ses.idEntSto,
            ses.idMatPri,
            es.codEntSto,
            es.idAlm,
            es.canTotDis,
            es.canPorSel,
            es.canSel,
            es.refNumIngEntSto,
            DATE(ses.fecSalStoReqSel) AS fecSalStoReqSel,
            ses.canSalStoReqSel,
            ses.canEntStoReqSel,
            ses.merReqSel
        FROM salida_entrada_seleccion AS ses
        JOIN entrada_stock AS es ON es.id = ses.idEntSto
        WHERE ses.idReqSel = ? AND ses.idMatPri = ? AND ses.idSalEntSelEst = ? AND ses.canSalStoReqSel > 0
        ";
        //Preparamos la consulta
        $stmt = $pdo->prepare($sql);

        $idSalEntSelEst = 1; // ESTADO DE SALIDA COMPLETA

        $stmt->bindParam(1, $idReqSel, PDO::PARAM_INT);
        $stmt->bindParam(2, $idMatPri, PDO::PARAM_INT);
        $stmt->bindParam(3, $idSalEntSelEst, PDO::PARAM_INT);

        // Comprobamos la respuesta
        try {
            $stmt->execute();

            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
