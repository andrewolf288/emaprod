<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeEnStock = $data["idOpeEnStock"];

    if ($pdo) {
        $sql_encuadre_operacion_encuadre =
            "SELECT
        oe.id,
        oe.idAlm,
        al.nomAlm,
        al.codAlm,
        oe.fecCreOpeEnc
        FROM operacion_encuadre AS oe
        JOIN almacen AS al ON al.id = oe.idAlm
        WHERE oe.id = ?";
        $stmt_encuadre_operacion_encuadre = $pdo->prepare($sql_encuadre_operacion_encuadre);
        $stmt_encuadre_operacion_encuadre->bindParam(1, $idOpeEnStock, PDO::PARAM_INT);
        $stmt_encuadre_operacion_encuadre->execute();

        while ($row_operacion_encuadre = $stmt_encuadre_operacion_encuadre->fetch(PDO::FETCH_ASSOC)) {
            $sql_operacion_encuadre_stock_detalle =
                "SELECT
            oed.id,
            oed.idOpeEnc,
            oed.idProdt,
            pd.nomProd,
            pd.codProd2,
            oed.canStock,
            oed.canStockEnc,
            oed.canVarEnc,
            oed.idProdc,
            pc.codLotProd,
            DATE(pc.fecVenLotProd) AS fecVenLotProd
            FROM operacion_encuadre_detalle AS oed
            JOIN producto AS pd ON pd.id = oed.idProdt
            LEFT JOIN produccion AS pc ON pc.id = oed.idProdc
            WHERE oed.idOpeEnc = ?";
            $stmt_view_operacion_encuadre_detalle = $pdo->prepare($sql_operacion_encuadre_stock_detalle);
            $stmt_view_operacion_encuadre_detalle->bindParam(1, $idOpeEnStock, PDO::PARAM_INT);
            $stmt_view_operacion_encuadre_detalle->execute();
            $row_operacion_encuadre["detOpeEncStockDet"] = $stmt_view_operacion_encuadre_detalle->fetchAll(PDO::FETCH_ASSOC);
            $result = $row_operacion_encuadre;
        }
    } else {
        $message_error = "No se pudo conectar con la base de datos";
        $description_error = "No se pudo conectar con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
