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
    //$reqFinEst = 1; // estado de ingreso de producto intermedio
    $idReqEst = 3; // estado de requisicion completado
    $fueUtiOrdProd = 0; // estado de requisicion no usada aun para produccion

    if ($pdo) {
        $sql_select_requisicion_lote =
            "SELECT * FROM requisicion
        WHERE idProdt = ? AND idReqEst = ? AND fueUtiOrdProd = ?
        ORDER BY fecPedReq DESC";
        // se quito condicion de producto intermedio ingresado
        try {
            $stmt_select_requisicion_lote = $pdo->prepare($sql_select_requisicion_lote);
            $stmt_select_requisicion_lote->bindParam(1, $idProdt, PDO::PARAM_INT);
            // $stmt_select_requisicion_lote->bindParam(2, $reqFinEst, PDO::PARAM_INT);
            $stmt_select_requisicion_lote->bindParam(2, $idReqEst, PDO::PARAM_INT);
            $stmt_select_requisicion_lote->bindParam(3, $fueUtiOrdProd, PDO::PARAM_BOOL);
            $stmt_select_requisicion_lote->execute();
            while ($row = $stmt_select_requisicion_lote->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en la consulta de requisiciones disponibles";
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
