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
    $fueUtiOrdProd = 0; // estado de requisicion no usada aun para produccion

    if ($pdo) {
        $sql_select_requisicion_lote =
            "SELECT
            re.id,
            re.idProdc,
            re.idReqEst,
            re.idAre,
            re.idReqTip,
            re.codReq,
            re.fecPedReq,
            re.fecEntReq,
            re.fecCreReq,
            re.fecActReq,
            re.estReg,
            re.idProdt,
            pt.idSubCla,
            re.cantProg,
            re.canIng,
            re.reqFinEst,
            re.variacion,
            re.codLotProd,
            re.canLotProd,
            re.fueUtiOrdProd
            FROM requisicion as re
        JOIN producto AS pt ON pt.id = re.idProdt
        WHERE re.idProdt = ? AND re.fueUtiOrdProd = ?
        ORDER BY re.fecPedReq DESC";
        // se quito condicion de producto intermedio ingresado
        try {
            $stmt_select_requisicion_lote = $pdo->prepare($sql_select_requisicion_lote);
            $stmt_select_requisicion_lote->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_select_requisicion_lote->bindParam(2, $fueUtiOrdProd, PDO::PARAM_BOOL);
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
