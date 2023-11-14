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
            "Producto", "Medida", "Lote",
            "Fecha Vencimiento", "Fecha Ingreso", "Fecha Salida",
            "Motivo", "Ingreso", "Salida", "Disponible"
        ];
    $result["columnWidths"] = [17.88, 8, 9, 66, 5.75, 6, 10, 10, 10, 20, 10, 10, 10];
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
        $idEntSto = $row_entrada["id"]; // id entrada stokc
        $codEntSto = $row_entrada["codEntSto"]; // codigo de entrada de stock
        $idProd = $row_entrada["idProd"]; // producto
        $codProd = $row_entrada["codProd"]; // codigo SIIGO
        $codProd2 = $row_entrada["codProd2"]; // codigo EMAPROD
        $nomProd = $row_entrada["nomProd"]; // nombre de producto
        $simMed = $row_entrada["simMed"]; // simbolo de medida
        $fecEntSto = $row_entrada["fecEntSto"]; // fecha de entrada
        $fecVenEntSto = $row_entrada["fecVenEntSto"]; // fecha de vencimiento
        $canTotEnt = $row_entrada["canTotEnt"]; // cantidad ingresada
        $canTotDis = $row_entrada["canTotDis"]; // cantidad disponible

        $auxEnt = [$codEntSto, $codProd, $codProd2, $nomProd, $simMed, "", $fecVenEntSto, $fecEntSto, "", "Entrada", $canTotEnt, "", $canTotDis];
        array_push($result["data"], $auxEnt);

        // salidas realizadas por requisicion
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
            $codLotProd = $row_salida["codLotProd"]; // codigo lote produccion
            $canSalStoReq = $row_salida["canSalStoReq"]; // cantidad salida
            $fecSalStoReq = $row_salida["fecSalStoReq"];  //

            $aux_salida = [$codEntSto, $codProd, $codProd2, $nomProd, $simMed, $codLotProd, $fecVenEntSto, "", $fecSalStoReq, "Salida", "", $canSalStoReq, ""];
            array_push($result["data"], $aux_salida);
        }

        // agregaciones realizadas
        $sql_salida =
            "SELECT 
        ss.idReq,
        r.codLotProd,
        pam.desProdAgrMot,
        ss.canSalStoReq,
        DATE(ss.fecSalStoReq) AS fecSalStoReq
        FROM salida_stock ss
        JOIN requisicion AS r ON r.id = ss.idAgre
        JOIN requisicion_agregacion AS ra ON ra.id = ss.idAgre
        JOIN produccion_agregacion_motivo AS pam ON pam.id = ra.idProdcMot
        WHERE ss.idEntSto = $idEntSto";
        $stmt_salida = $pdo->prepare($sql_salida);
        $stmt_salida->execute();
        while ($row_agregacion = $stmt_salida->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_agregacion["codLotProd"]; // codigo lote produccion
            $canSalStoReq = $row_agregacion["canSalStoReq"]; // cantidad salida
            $fecSalStoReq = $row_agregacion["fecSalStoReq"];  // fecha de salida
            $desProdAgrMot = $row_agregacion["desProdAgrMot"]; // motivo agregacion

            $aux_agregacion = [$codEntSto, $codProd, $codProd2, $nomProd, $simMed, $codLotProd, $fecVenEntSto, "", $fecSalStoReq, $desProdAgrMot, "", $canSalStoReq, ""];
            array_push($result["data"], $aux_agregacion);
        }

        // devoluciones realizadas
        $sql_devoluciones =
            "SELECT
            tde.idReqDevDet,
            tde.canReqDevDet,
            pdm.desProdDevMot,
            p.codLotProd,
            DATE(tde.fecCreTraDevEnt) AS fecCreTraDevEnt
            FROM trazabilidad_devolucion_entrada AS tde
            JOIN requisicion_devolucion_detalle AS rdd ON rdd.id = tde.idReqDevDet
            JOIN produccion_devolucion_motivo AS pdm ON rdd.idMotDev = pdm.id
            JOIN requisicion_devolucion AS rd ON rd.id = rdd.idReqDev
            JOIN produccion AS p ON p.id = rd.idProdc
            WHERE idEntSto = ?";
        $stmt_devoluciones = $pdo->prepare($sql_devoluciones);
        $stmt_devoluciones->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_devoluciones->execute();
        while ($row_devolucion = $stmt_devoluciones->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_devolucion["codLotProd"]; // codigo lote produccion
            $fechaEntradaDevolucion = $row_devolucion["fecCreTraDevEnt"]; // fec. entrada devolucion
            $canReqDevDet = $row_devolucion["canReqDevDet"]; // cantidad entrada
            $motivo_devolucion = $row_devolucion["desProdDevMot"]; // motivo de devolucion
            $aux_devolucion = [$codEntSto, $codProd, $codProd2, $nomProd, $simMed, $codLotProd, $fecVenEntSto, $fechaEntradaDevolucion, "", $motivo_devolucion, $canReqDevDet, "", ""];
            array_push($result["data"], $aux_devolucion);
        }
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
