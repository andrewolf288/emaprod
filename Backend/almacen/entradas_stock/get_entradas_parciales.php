<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        // datos extraidos del frontend
        $idProd = $data["idProd"]; // id de producto
        $ordCom = $data["ordCom"]; // id de orden de compra
        $esEntPar = true; // es entrada parcial

        $cantAcuIngPar = 0;

        $sql_select_entradas_parciales = "SELECT es.id, es.idProv, p.codProv, es.codEntSto, es.canTotDis, es.fecEntSto, es.refNumIngEntSto, es.ordCom, es.canTotCom, es.docEntSto FROM entrada_stock AS es JOIN proveedor AS p ON p.id = es.idProv  WHERE es.idProd = ? AND es.ordCom = ? AND es.esEntPar = ?";
        $stmt_select_entradas_parciales = $pdo->prepare($sql_select_entradas_parciales);
        $stmt_select_entradas_parciales->bindParam(1, $idProd, PDO::PARAM_INT);
        $stmt_select_entradas_parciales->bindParam(2, $ordCom, PDO::PARAM_STR);
        $stmt_select_entradas_parciales->bindParam(3, $esEntPar, PDO::PARAM_BOOL);
        $stmt_select_entradas_parciales->execute();

        $result["detEntPar"] = []; // declaramos el detalle de entradas parciales

        while ($row_entrada_parcial = $stmt_select_entradas_parciales->fetch(PDO::FETCH_ASSOC)) {
            $canTotDis = $row_entrada_parcial["canTotDis"];
            $cantAcuIngPar +=  $canTotDis;
            array_push($result["detEntPar"], $row_entrada_parcial);
        }

        if (!empty($result["detEntPar"])) {
            $result["cantAcuIngPar"] = $cantAcuIngPar; // cantidad de ingresos parciales acumulado
            $result["refNumIngEntSto"] = $result["detEntPar"][0]["refNumIngEntSto"]; // numero de referencia del ingreos
            $result["idProv"] = $result["detEntPar"][0]["idProv"];
            $result["codProv"] = $result["detEntPar"][0]["codProv"];
            $result["canTotCom"] = $result["detEntPar"][0]["canTotCom"];
            $result["docEntSto"] = $result["detEntPar"][0]["docEntSto"];
            $result["ordCom"] = $result["detEntPar"][0]["ordCom"];
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
