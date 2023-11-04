<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $producto = $data["producto"];
    // $fecha_inicio = $data["fecha_inicio"];
    // $fecha_fin = $data["fecha_fin"];

    $result["header"] =
        [
            "Código entrada", "SIIGO", "EMPAROD",
            "Producto", "Medida", "Fecha Entrada",
            "Fecha Vencimiento", "Fecha Salida",
            "Lote", "Ingreso", "Salida", "Disponible"
        ];
    $result["columnWidths"] = [17.88, 8, 9, 66, 5.75, 10, 10, 10, 5.75, 10, 10, 10];
    $result["data"] = [];

    // vamos a recibir información del producto y de las fechas que se quiere el reporte
    $sql_entradas =
        "SELECT
        es.id,
        es.codEntSto,
        es.idProd,
        p.codProd,
        p.codProd2,
        p.nomProd,
        me.simMed,
        DATE(es.fecEntSto) AS fecEntSto,
        DATE(es.fecVenEntSto) AS fecVenEntSto,
        es.canTotEnt,
        es.canTotDis
        FROM entrada_stock AS es
        JOIN producto AS p ON p.id = es.idProd
        JOIN medida AS me ON me.id = p.idMed
        WHERE es.idProd = ?";

    $stmt_entradas = $pdo->prepare($sql_entradas);
    $stmt_entradas->bindParam(1, $producto, PDO::PARAM_INT);
    $stmt_entradas->execute();

    while ($row_entrada = $stmt_entradas->fetch(PDO::FETCH_ASSOC)) {
        $idEntSto = $row_entrada["id"];
        $codEntSto = $row_entrada["codEntSto"];
        $idProd = $row_entrada["idProd"];
        $codProd = $row_entrada["codProd"];
        $codProd2 = $row_entrada["codProd2"];
        $nomProd = $row_entrada["nomProd"];
        $simMed = $row_entrada["simMed"];
        $fecEntSto = $row_entrada["fecEntSto"];
        $fecVenEntSto = $row_entrada["fecVenEntSto"];
        $canTotEnt = $row_entrada["canTotEnt"];
        $canTotDis = $row_entrada["canTotDis"];

        $auxEnt = [$codEntSto, $codProd, $codProd2, $nomProd, $simMed, $fecEntSto, $fecVenEntSto, "", "", $canTotEnt, "", $canTotDis];
        array_push($result["data"], $auxEnt);

        $sql_salida =
            "SELECT 
        ss.idReq,
        r.codLotProd,
        ss.canSalStoReq,
        DATE(ss.fecSalStoReq) AS fecSalStoReq
        FROM salida_stock ss
        JOIN requisicion AS r ON r.id = ss.idReq
        WHERE ss.idEntSto = $idEntSto";
        $stmt_salida = $pdo->prepare($sql_salida);
        $stmt_salida->execute();
        while ($row_salida = $stmt_salida->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_salida["codLotProd"];
            $canSalStoReq = $row_salida["canSalStoReq"];
            $fecSalStoReq = $row_salida["fecSalStoReq"];

            $aux_salida = [$codEntSto, $codProd, $codProd2, $nomProd, $simMed, "", "", $fecSalStoReq, $codLotProd, "", $canSalStoReq, ""];
            array_push($result["data"], $aux_salida);
        }
    }




    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
