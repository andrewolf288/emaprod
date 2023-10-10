<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $idReq = $data["id"];

    if ($pdo) {
        $idReqEst = 4; //verificado
        $idReqEstCom = 3; // completado pero no verificado
        $fecEntReq = date('Y-m-d H:i:s'); // fecha de entregado la requisicion
        $sql =
            "UPDATE
            requisicion
            SET idReqEst = ?, fecEntReq = ?
            WHERE id = ? AND idReqEst = ?
            ";
        try {
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idReqEst, PDO::PARAM_INT);
            $stmt->bindParam(2, $fecEntReq);
            $stmt->bindParam(3, $idReq, PDO::PARAM_INT);
            $stmt->bindParam(4, $idReqEstCom, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() !== 1) {
                $message_error = "Esta requisicion no tiene un estado de completo";
                $description_error = "Esta requisicion no tiene un estado de completo por lo tanto no se puede verificar";
            }

            // AHORA DEBEMOS ACTUALIZAR LA PRODUCCION
            // primero consultamos el id de produccion de la requisicion molienda
            // $id_produccion_requisicion = 0; // inicializacion

            // $sql_consult_requisicion_molienda =
            //     "SELECT idProdc
            // FROM requisicion 
            // WHERE id = ?";
            // $stmt_consult_requisicion_molienda = $pdo->prepare($sql_consult_requisicion_molienda);
            // $stmt_consult_requisicion_molienda->bindParam(1, $idReq, PDO::PARAM_INT);
            // $stmt_consult_requisicion_molienda->execute();

            // while ($row = $stmt_consult_requisicion_molienda->fetch(PDO::FETCH_ASSOC)) {
            //     $id_produccion_requisicion = $row["idProdc"];
            // }

            // // ahora actualizamos la produccion
            // $idProdEst = 3; // estado de requisicion completa
            // $idProdEstBefore = 2; // estado de requisicion realizada
            // $sql_update_produccion =
            //     "UPDATE produccion 
            // SET idProdEst = ? 
            // WHERE id = ? AND idProdEst = ?";
            // $stmt_update_produccion = $pdo->prepare($sql_update_produccion);
            // $stmt_update_produccion->bindParam(1, $idProdEst, PDO::PARAM_INT);
            // $stmt_update_produccion->bindParam(2, $id_produccion_requisicion, PDO::PARAM_INT);
            // $stmt_update_produccion->bindParam(3, $idProdEstBefore, PDO::PARAM_INT);
            // $stmt_update_produccion->execute();
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
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
