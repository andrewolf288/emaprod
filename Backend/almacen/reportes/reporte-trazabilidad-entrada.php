<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$pdo = getPDO();
$result = array(
    "header" => [],
    "columnWidths" => [],
    "tipoDato" => [],
    "data" => []
);
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $producto = $data["producto"];
    $almacen = $data["almacen"];
    $fechaDesde = $data["fechaDesde"];
    $fechaHasta = $data["fechaHasta"];

    if (empty($fechaDesde)) {
        // inicio de año
        $fechaDesde = date('Y-01-01');
    }
    if (empty($fechaHasta)) {
        // fin de año
        $fechaHasta = date('Y-12-31');
    }

    $result["header"] =
        [
            "Documento de entrada", "Guia remisión", "Código entrada", "Almacen", "SIIGO", "EMAPROD",
            "Producto", "Medida", "Lote", "Documento de operacion", "Fecha Vencimiento", "Fecha Ingreso",
            "Fecha Salida", "Motivo", "Ingreso", "Salida", "Disponible"
        ];
    $result["columnWidths"] = [22, 22, 17.88, 20, 12, 12, 80, 8, 7, 24, 19, 19, 19, 30, 12, 12, 12];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "numero", "numero", "numero"];
    $result["data"] = [];

    // vamos a recibir información del producto y de las fechas que se quiere el reporte
    $sql_entradas =
        "SELECT
    es.id,
    es.docEntSto,
    est.desEntStoTip,
    es.guiRem,
    al.nomAlm,
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
    JOIN almacen AS al ON al.id = es.idAlm
    JOIN entrada_stock_tipo AS est ON est.id = es.idEntStoTip
    WHERE es.idProd = ? AND es.idAlm = ? AND es.fecEntSto BETWEEN '$fechaDesde' AND '$fechaHasta'";

    $stmt_entradas = $pdo->prepare($sql_entradas);
    $stmt_entradas->bindParam(1, $producto, PDO::PARAM_INT);
    $stmt_entradas->bindParam(2, $almacen, PDO::PARAM_INT);
    $stmt_entradas->execute();

    while ($row_entrada = $stmt_entradas->fetch(PDO::FETCH_ASSOC)) {
        $idEntSto = $row_entrada["id"]; // id entrada stokc
        $docEntSto = $row_entrada["docEntSto"]; // documento de entrada
        $guiRem = $row_entrada["guiRem"]; // guia de remision
        $nomAlm = $row_entrada["nomAlm"]; // almacen
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
        $desEntStoTip = $row_entrada["desEntStoTip"]; // tipo de entrada

        $auxEnt = array(
            "docEntSto" => $docEntSto,
            "guiRem" => $guiRem,
            "codEntSto" => $codEntSto,
            "nomAlm" => $nomAlm,
            "codProd" => $codProd,
            "codProd2" => $codProd2,
            "nomProd" => $nomProd,
            "simMed" => $simMed,
            "codLotProd" => "",
            "numope" => "",
            "fecVenEntSto" => $fecVenEntSto,
            "fecEntSto" => $fecEntSto,
            "fecSalSto" => "",
            "motOpe" => "ET-" . $desEntStoTip,
            "canTotEnt" => $canTotEnt,
            "canSalSto" => "",
            "canTotDis" => $canTotDis
        );
        array_push($result["data"], $auxEnt);

        // salidas realizadas por requisicion
        $sql_salida =
            "SELECT 
        ss.idReq,
        r.codLotProd,
        rt.desReqTip,
        ss.canSalStoReq,
        p.numop,
        DATE(ss.fecSalStoReq) AS fecSalStoReq
        FROM salida_stock ss
        LEFT JOIN requisicion AS r ON r.id = ss.idReq
        JOIN requisicion_tipo AS rt ON rt.id = r.idReqTip
        LEFT JOIN produccion AS p ON p.id = r.idProdc
        WHERE ss.idEntSto = $idEntSto AND ss.idAgre IS NULL";
        $stmt_salida = $pdo->prepare($sql_salida);
        $stmt_salida->execute();

        while ($row_salida = $stmt_salida->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_salida["codLotProd"]; // codigo lote produccion
            $canSalStoReq = $row_salida["canSalStoReq"]; // cantidad salida
            $fecSalStoReq = $row_salida["fecSalStoReq"];  // fecha de salida de requisicion
            $numop = $row_salida["numop"]; // numero de operacion
            $desReqTip = $row_salida["desReqTip"];

            $aux_salida = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $numop,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecSalStoReq,
                "motOpe" => "SL-" . $desReqTip,
                "canTotEnt" => "",
                "canSalSto" => $canSalStoReq,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }

        // agregaciones realizadas
        $sql_salida =
            "SELECT 
        ss.idAgre,
        ra.correlativo,
        p.codLotProd,
        p.numop,
        pam.desProdAgrMot,
        ss.canSalStoReq,
        DATE(ss.fecSalStoReq) AS fecSalStoReq
        FROM salida_stock ss
        JOIN requisicion_agregacion AS ra ON ra.id = ss.idAgre
		JOIN produccion AS p ON p.id = ra.idProdc
        JOIN produccion_agregacion_motivo AS pam ON pam.id = ra.idProdcMot
        WHERE ss.idEntSto = $idEntSto";
        $stmt_salida = $pdo->prepare($sql_salida);
        $stmt_salida->execute();

        while ($row_agregacion = $stmt_salida->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_agregacion["codLotProd"]; // codigo lote produccion
            $canSalStoReq = $row_agregacion["canSalStoReq"]; // cantidad salida
            $fecSalStoReq = $row_agregacion["fecSalStoReq"];  // fecha de salida
            $desProdAgrMot = $row_agregacion["desProdAgrMot"]; // motivo agregacion
            $numopAgr = $row_agregacion["correlativo"]; // numero operacion agregacion

            $aux_agregacion = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $numopAgr,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecSalStoReq,
                "motOpe" => "AG-" . $desProdAgrMot,
                "canTotEnt" => "",
                "canSalSto" => $canSalStoReq,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_agregacion);
        }

        // ---- transformacion salida ----
        $sql_transformacion_salida =
            "SELECT 
        ot.correlativo,
        pc.codLotProd,
        sot.canSalOrdTrans,
        DATE(sot.fecCreSalOrdTrans) AS fecCreSalOrdTrans
        FROM salida_orden_transformacion AS sot
        JOIN orden_transformacion AS ot ON ot.id = sot.idOrdTrans
        JOIN produccion AS pc ON pc.id = ot.idProdc
        WHERE sot.idEntSto = ?";
        $stmt_transformacion_salida = $pdo->prepare($sql_transformacion_salida);
        $stmt_transformacion_salida->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_transformacion_salida->execute();

        while ($row_salida_orden_transformacion = $stmt_transformacion_salida->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_salida_orden_transformacion["codLotProd"];
            $fechaSalidaOperacionTransformacion = $row_salida_orden_transformacion["fecCreSalOrdTrans"];
            $canSalOrdTrans = $row_salida_orden_transformacion["canSalOrdTrans"];
            $correlativo = $row_salida_orden_transformacion["correlativo"];

            $aux_salida_transformacion = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $correlativo,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fechaSalidaOperacionTransformacion,
                "motOpe" => "SL-TRANSFORMACION",
                "canTotEnt" => "",
                "canSalSto" => $canSalOrdTrans,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida_transformacion);
        }

        // ---- requisicion empaquetado salida ----
        $sql_requisicion_empaquetado_promocional =
            "SELECT
        pc.codLotProd,
        srep.canSalReqEmpProm,
        DATE(srep.fecCreSalReqEmpProm) AS fecCreSalReqEmpProm
        FROM salida_requisicion_empaquetado_promocional AS srep
        JOIN requisicion_empaquetado_promocional_detalle AS repd ON srep.idReqEmpPromDet = repd.id
        LEFT JOIN produccion AS pc ON repd.idProdc = pc.id
        WHERE srep.idEntSto = ?";
        $stmt_requisicion_empaquetado_promocional = $pdo->prepare($sql_requisicion_empaquetado_promocional);
        $stmt_requisicion_empaquetado_promocional->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_requisicion_empaquetado_promocional->execute();

        while ($row_salida_empaquetado_promocional = $stmt_requisicion_empaquetado_promocional->fetch(PDO::FETCH_ASSOC)) {
            $correlativo = "E. PROMOCIONAL";
            $fecCreSalReqEmpProm = $row_salida_empaquetado_promocional["fecCreSalReqEmpProm"];
            $canSalReqEmpProm = $row_salida_empaquetado_promocional["canSalReqEmpProm"];
            $codLotProd = $row_salida_empaquetado_promocional["codLotProd"];

            $aux_salida_empaquetado_promocional = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $correlativo,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalReqEmpProm,
                "motOpe" => "SL-R.EMPAQUETADO",
                "canTotEnt" => "",
                "canSalSto" => $canSalReqEmpProm,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida_empaquetado_promocional);
        }

        // ---- requisicion general salida ----
        $sql_salida_requisicion_general =
            "SELECT 
        rm.codReqMat,
        pc.codLotProd,
        srm.canSalReqMatDet,
        DATE(srm.fecCreSalReqMat) AS fecCreSalReqMat
        FROM salida_requisicion_materiales AS srm
        JOIN requisicion_materiales AS rm ON rm.id = srm.idReqMat
        JOIN requisicion_materiales_detalle AS rmd ON rmd.id = srm.idReqMatDet
        LEFT JOIN produccion AS pc ON pc.id = rmd.idProdc
        WHERE srm.idEntSto = ?";
        $stmt_salida_requisicion_general = $pdo->prepare($sql_salida_requisicion_general);
        $stmt_salida_requisicion_general->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_requisicion_general->execute();

        while ($row_salida_requisicion_general = $stmt_salida_requisicion_general->fetch(PDO::FETCH_ASSOC)) {
            $correlativo = $row_salida_requisicion_general["codReqMat"];
            $fecCreSalReqMat = $row_salida_requisicion_general["fecCreSalReqMat"];
            $canSalReqMatDet = $row_salida_requisicion_general["canSalReqMatDet"];
            $codLotProd = $row_salida_requisicion_general["codLotProd"];

            $aux_salida_requisicion_general = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $correlativo,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalReqMat,
                "motOpe" => "SL-R.GENERAL",
                "canTotEnt" => "",
                "canSalSto" => $canSalReqMatDet,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida_requisicion_general);
        }

        // ---- encuadre salida ----
        $sql_encuadre_salida =
            "SELECT
        pc.codLotProd,
        soed.canSalOpeEncDet,
        DATE(soed.fecCreSalOpeEncDet) AS fecCreSalOpeEncDet
        FROM salida_operacion_encuadre_detalle AS soed
        JOIN operacion_encuadre_detalle AS oed ON oed.id = soed.idOpeEncDet
        JOIN produccion AS pc ON pc.id = oed.idProdc
        JOIN operacion_encuadre AS oe ON oe.id = oed.idOpeEnc
        WHERE soed.idEntSto = ?";
        $stmt_encuadre_salida = $pdo->prepare($sql_encuadre_salida);
        $stmt_encuadre_salida->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_encuadre_salida->execute();

        while ($row_salida_encuadre = $stmt_encuadre_salida->fetch(PDO::FETCH_ASSOC)) {
            $correlativo = "SALIDA ENCUADRE";
            $canSalOpeEncDet = $row_salida_encuadre["canSalOpeEncDet"];
            $fecCreSalOpeEncDet = $row_salida_encuadre["fecCreSalOpeEncDet"];
            $codLotProd = $row_salida_encuadre["codLotProd"];

            $aux_salida_encuadre = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $correlativo,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalOpeEncDet,
                "motOpe" => "SL-OP.ENCUADRE",
                "canTotEnt" => "",
                "canSalSto" => $canSalOpeEncDet,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida_encuadre);
        }

        // salida de venta
        $sql_salida_venta = 
        "SELECT
        msf.canMovOpeFac,
        DATE(msf.fecCreMovOpeFac) AS fecCreMovOpeFac,
        of.invSerFac,
        of.invNumFac
        FROM movimiento_operacion_facturacion AS msf
        JOIN operacion_facturacion AS of ON of.id = msf.idOpeFac
        WHERE msf.idEntSto = ?";
        $stmt_salida_venta = $pdo->prepare($sql_salida_venta);
        $stmt_salida_venta->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_venta->execute();

        while($row_salida_venta = $stmt_salida_venta->fetch(PDO::FETCH_ASSOC)){
            $canMovOpeFac = $row_salida_venta["canMovOpeFac"];
            $fecCreMovOpeFac = $row_salida_venta["fecCreMovOpeFac"];
            $correlativo = $row_salida_venta["invSerFac"] . " - " . $row_salida_venta["invNumFac"];

            $aux_salida_venta = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => "",
                "numope" => $correlativo,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreMovOpeFac,
                "motOpe" => "SL-MOVIMIENTO VENTA",
                "canTotEnt" => "",
                "canSalSto" => $canMovOpeFac,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida_venta);
        }

        // devoluciones realizadas
        $sql_devoluciones =
            "SELECT
        rd.correlativo,
        tde.idReqDevDet,
        tde.canReqDevDet,
        pdm.desProdDevMot,
        p.codLotProd,
        p.numop,
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
            $numopDev = $row_devolucion["correlativo"]; // numero operacion devolucion

            $aux_devolucion = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $numopDev,
                "fecVenEntSto" => "",
                "fecEntSto" => $fechaEntradaDevolucion,
                "fecSalSto" => "",
                "motOpe" => "DV-" . $motivo_devolucion,
                "canTotEnt" => $canReqDevDet,
                "canSalSto" => "",
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_devolucion);
        }

        // ---- requisicion general devolucion (trazabilidad_requisicion_devolucion_materiales) ----
        $sql_requisicion_general_devolucion =
            "SELECT 
        rm.codReqMat,
        trdm.canReqDevMatDet,
        DATE(trdm.fecCreTraReqDev) AS fecCreTraReqDev
        FROM trazabilidad_requisicion_devolucion_materiales AS trdm
        JOIN requisicion_devolucion_materiales_detalle AS rdmd ON rdmd.id = trdm.idReqDevMatDet
        JOIN requisicion_devolucion_materiales AS rdm ON rdm.id = rdmd.idReqDevMat
        JOIN requisicion_materiales AS rm ON rm.id = rdm.idReqMat
        WHERE trdm.idEntSto = ?";
        $stmt_requisicion_general_devolucion = $pdo->prepare($sql_requisicion_general_devolucion);
        $stmt_requisicion_general_devolucion->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_requisicion_general_devolucion->execute();

        while ($row_requisicion_general_devolucion = $stmt_requisicion_general_devolucion->fetch(PDO::FETCH_ASSOC)) {
            $canReqDevMatDet = $row_requisicion_general_devolucion["canReqDevMatDet"];
            $fecCreTraReqDev = $row_requisicion_general_devolucion["fecCreTraReqDev"];
            $correlativo = $row_requisicion_general_devolucion["codReqMat"];

            $aux_encuadre_entrada = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $correlativo,
                "fecVenEntSto" => "",
                "fecEntSto" => $fecCreTraReqDev,
                "fecSalSto" => "",
                "motOpe" => "DV-R.GENERAL",
                "canTotEnt" => $canReqDevMatDet,
                "canSalSto" => "",
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_encuadre_entrada);
        }

        // ---- encuadre entrada (trazabilidad_entrada_operacion_encuadre_detalle) ----
        $sql_encuadre_entrada =
            "SELECT
        pc.codLotProd,
        teoed.canEntOpeEncDet,
        DATE(teoed.fecCreTraEntOpeEncDet) AS fecCreTraEntOpeEncDet
        FROM trazabilidad_entrada_operacion_encuadre_detalle AS teoed
        JOIN operacion_encuadre_detalle AS oed ON oed.id = teoed.idOpeEncDet
        LEFT JOIN produccion AS pc ON pc.id = oed.idProdc
        WHERE teoed.idEntSto = ?";
        $stmt_encuadre_entrada = $pdo->prepare($sql_encuadre_entrada);
        $stmt_encuadre_entrada->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_encuadre_entrada->execute();

        while ($row_encuadre_entrada = $stmt_encuadre_entrada->fetch(PDO::FETCH_ASSOC)) {
            $codLotProd = $row_encuadre_entrada["codLotProd"];
            $canEntOpeEncDet = $row_encuadre_entrada["canEntOpeEncDet"];
            $fecCreTraEntOpeEncDet = $row_encuadre_entrada["fecCreTraEntOpeEncDet"];
            $correlativo = "ENCUADRE ENTRADA";

            $aux_encuadre_entrada = array(
                "docEntSto" => $docEntSto,
                "guiRem" => $guiRem,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "numope" => $correlativo,
                "fecVenEntSto" => "",
                "fecEntSto" => $fecCreTraEntOpeEncDet,
                "fecSalSto" => "",
                "motOpe" => "DV-ENCUADRE",
                "canTotEnt" => $canEntOpeEncDet,
                "canSalSto" => "",
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_encuadre_entrada);
        }
    }

    // Crear el libro de trabajo
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // // Establecer anchos de columna
    foreach ($result["columnWidths"] as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    // // Establecer encabezados con formato
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}1")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}1")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}1", $header);
    }

    // // Establecer tipos de datos
    $SIZE_DATA = sizeof($result["data"]) + 1;
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    // Agregar datos y aplicar estilos condicionales
    $row = 2;
    $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
    foreach ($result["data"] as $rowData) {
        $columnNames = array_keys($rowData);
        foreach ($columnNames as $columnIndex => $value) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
        }

        // Obtener el valor en el key "motOpe"
        $partes = explode("-",  $rowData["motOpe"]);
        $indice = $partes[0];
        $description = $partes[1];

        // Aplicar estilos condicionales
        if ($indice == "ET") {
            if ($description == "Devolucion de transformacion") {
                $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('F5E772'); // Amarillo opaco
            } else {
                $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00'); // Amarillo
            }
        } elseif ($indice == "SL") {
            if ($description == "Transformacion") {
                $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('D3665E'); // Rojo
            } else {
                $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('e39f9f'); // Rojo
            }
        } elseif ($indice == "AG") {
            $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('ffad95'); // Rojo Opaco
        } elseif ($indice == "DV") {
            if ($description == "Transformacion") {
                $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('f3c57a'); // Verde
            } else {
                $sheet->getStyle("A{$row}:Q{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('93d98d'); // Verde
            }
        }
        $row++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
