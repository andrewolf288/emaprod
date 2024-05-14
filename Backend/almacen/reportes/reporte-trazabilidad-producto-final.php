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
    $almacenPrincipal = 1; // almacen principal
    $fechaDesde = $data["fechaDesde"];
    $fechaHasta = $data["fechaHasta"];

    if (empty($fechaDesde)) {
        // inicio de año
        $fechaDesde = date('Y-01-01', strtotime('-4 years'));
    }
    if (empty($fechaHasta)) {
        // fin de año
        $fechaHasta = date('Y-12-31');
    }

    $result["header"] =
        [
            "Documento de entrada", "Código entrada", "Almacen", "SIIGO", "EMAPROD",
            "Producto", "Medida", "Lote", "Fecha Vencimiento", "Fecha Ingreso",
            "Fecha Salida", "Motivo", "Ingreso", "Salida", "Disponible"
        ];
    $result["columnWidths"] = [22, 17.88, 20, 12, 12, 80, 8, 7, 19, 19, 19, 30, 12, 12, 12];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "numero", "numero", "numero"];
    $result["data"] = [];

    $idEntStoTipProdFin = 3;
    $idEntStoTipOrdIrra = 5;
    $idEntStoTipOrdTran = 6;

    $sql_select_entradas_producto_final =
        "SELECT
    es.id,
    es.docEntSto,
    est.desEntStoTip,
    al.nomAlm,
    es.codEntSto,
    es.idProd,
    es.codLot,
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
    WHERE (es.idEntStoTip = ? OR es.idEntStoTip = ? OR es.idEntStoTip = ?) 
    AND (DATE(es.fecEntSto) BETWEEN '$fechaDesde' AND '$fechaHasta') 
    AND es.idProd = ? AND es.idAlm = ? ORDER BY fecEntSto ASC";
    $stmt_select_entradas_producto_final = $pdo->prepare($sql_select_entradas_producto_final);
    $stmt_select_entradas_producto_final->bindParam(1, $idEntStoTipProdFin, PDO::PARAM_INT);
    $stmt_select_entradas_producto_final->bindParam(2, $idEntStoTipOrdTran, PDO::PARAM_INT);
    $stmt_select_entradas_producto_final->bindParam(3, $idEntStoTipOrdIrra, PDO::PARAM_INT);
    $stmt_select_entradas_producto_final->bindParam(4, $producto, PDO::PARAM_INT);
    $stmt_select_entradas_producto_final->bindParam(5, $almacenPrincipal, PDO::PARAM_INT);
    $stmt_select_entradas_producto_final->execute();

    while ($row_entrada = $stmt_select_entradas_producto_final->fetch(PDO::FETCH_ASSOC)) {
        $idEntSto = $row_entrada["id"]; // id entrada stokc
        $docEntSto = $row_entrada["docEntSto"]; // documento de entrada
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
        $codLotProd = $row_entrada["codLot"];

        $auxEnt = array(
            "docEntSto" => $docEntSto,
            "codEntSto" => $codEntSto,
            "nomAlm" => $nomAlm,
            "codProd" => $codProd,
            "codProd2" => $codProd2,
            "nomProd" => $nomProd,
            "simMed" => $simMed,
            "codLotProd" => $codLotProd,
            "fecVenEntSto" => $fecVenEntSto,
            "fecEntSto" => $fecEntSto,
            "fecSalSto" => "",
            "motOpe" => "ET-" . $desEntStoTip,
            "canTotEnt" => $canTotEnt,
            "canSalSto" => "",
            "canTotDis" => $canTotDis
        );
        array_push($result["data"], $auxEnt);

        //----SALIDA POR VENTAS----
        $esSal = 1;
        $fueAfePorAnul = 0;
        $sql_salida_venta =
            "SELECT 
        mof.idOpeFac,
        CONCAT(of.invSerFac, '-', of.invNumFac) AS docSalVen,
        mof.canMovOpeFac,
        mof.fecCreMovOpeFac
        FROM movimiento_operacion_facturacion AS mof
        JOIN operacion_facturacion AS of ON of.id = mof.idOpeFac
        WHERE mof.idEntSto = ? AND mof.esSal = ? AND of.fueAfePorAnul = ?";
        $stmt_salida_venta = $pdo->prepare($sql_salida_venta);
        $stmt_salida_venta->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_venta->bindParam(2, $esSal, PDO::PARAM_INT);
        $stmt_salida_venta->bindParam(3, $fueAfePorAnul, PDO::PARAM_BOOL);
        $stmt_salida_venta->execute();

        while ($row_salida_venta = $stmt_salida_venta->fetch(PDO::FETCH_ASSOC)) {
            $docSalVen = $row_salida_venta["docSalVen"];
            $canMovOpeFac = $row_salida_venta["canMovOpeFac"];
            $fecCreMovOpeFac = $row_salida_venta["fecCreMovOpeFac"];

            $aux_salida = array(
                "docEntSto" => $docSalVen,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreMovOpeFac,
                "motOpe" => "SL-VENTAS",
                "canTotEnt" => "",
                "canSalSto" => $canMovOpeFac,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }

        //----SALIDA POR ORDEN DE IRRADIACION----
        $sql_salida_orden_irradiacion =
            "SELECT
        moi.idOrdIrra,
        CONCAT(oi.invSerFac, '-', oi.invNumFac) AS docSalOrdIrra,
        moi.canMovOpeIrra,
        moi.fecCreMovOpeIrra
        FROM movimiento_orden_irradiacion AS moi
        JOIN orden_irradiacion AS oi ON oi.id = moi.idOrdIrra
        WHERE moi.idEntSto = ? AND moi.esSal = ?";
        $smt_salida_orden_irradiacion = $pdo->prepare($sql_salida_orden_irradiacion);
        $smt_salida_orden_irradiacion->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $smt_salida_orden_irradiacion->bindParam(2, $esSal, PDO::PARAM_INT);
        $smt_salida_orden_irradiacion->execute();

        while ($row_salida_orden_irradiacion = $smt_salida_orden_irradiacion->fetch(PDO::FETCH_ASSOC)) {
            $docSalOrdIrra = $row_salida_orden_irradiacion["docSalOrdIrra"];
            $canMovOpeIrra = $row_salida_orden_irradiacion["canMovOpeIrra"];
            $fecCreMovOpeIrra = $row_salida_orden_irradiacion["fecCreMovOpeIrra"];

            $aux_salida = array(
                "docEntSto" => $docSalOrdIrra,
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreMovOpeIrra,
                "motOpe" => "SL-IRRADIACION",
                "canTotEnt" => "",
                "canSalSto" => $canMovOpeIrra,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }

        //----SALIDA POR TRANSFORMACION----
        $sql_salida_transformacion =
            "SELECT 
        sot.canSalOrdTrans,
        sot.fecCreSalOrdTrans
        FROM salida_orden_transformacion AS sot
        WHERE sot.idEntSto = ?";
        $stmt_salida_transformacion = $pdo->prepare($sql_salida_transformacion);
        $stmt_salida_transformacion->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_transformacion->execute();

        while ($row_salida_transformacion = $stmt_salida_transformacion->fetch(PDO::FETCH_ASSOC)) {
            $canSalOrdTrans = $row_salida_transformacion["canSalOrdTrans"];
            $fecCreSalOrdTrans = $row_salida_transformacion["fecCreSalOrdTrans"];

            $aux_salida = array(
                "docEntSto" => "TRANSFORMACION",
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalOrdTrans,
                "motOpe" => "SL-TRANSFORMACION",
                "canTotEnt" => "",
                "canSalSto" => $canSalOrdTrans,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }

        // salidas por reproceso masivo (pendiente)

        // ----salidas por empaquetado promocional----
        $sql_salida_requisicion_empaquetado_promocional =
            "SELECT 
        srep.canSalReqEmpProm,
        srep.fecCreSalReqEmpProm
        FROM salida_requisicion_empaquetado_promocional AS srep
        WHERE srep.idEntSto = ?";
        $stmt_salida_requisicion_empaquetado_promocional = $pdo->prepare($sql_salida_requisicion_empaquetado_promocional);
        $stmt_salida_requisicion_empaquetado_promocional->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_requisicion_empaquetado_promocional->execute();

        while ($row_salida_requisicion_empaquetado_promocional = $stmt_salida_requisicion_empaquetado_promocional->fetch(PDO::FETCH_ASSOC)) {
            $canSalReqEmpProm = $row_salida_requisicion_empaquetado_promocional["canSalReqEmpProm"];
            $fecCreSalReqEmpProm = $row_salida_requisicion_empaquetado_promocional["fecCreSalReqEmpProm"];

            $aux_salida = array(
                "docEntSto" => "EMPAQUETADO PROMOCIONAL",
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalReqEmpProm,
                "motOpe" => "SL-EMPAQUETADO-PROMOCIONAL",
                "canTotEnt" => "",
                "canSalSto" => $canSalReqEmpProm,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }

        // ----salidas por requisicion general----
        $sql_salida_requisicion_materiales =
            "SELECT 
        srm.canSalReqMatDet,
        srm.fecCreSalReqMat
        FROM salida_requisicion_materiales AS srm
        WHERE srm.idEntSto = ?";
        $stmt_salida_requisicion_materiales = $pdo->prepare($sql_salida_requisicion_materiales);
        $stmt_salida_requisicion_materiales->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_requisicion_materiales->execute();

        while ($row_salida_requisicion_materiales = $stmt_salida_requisicion_materiales->fetch(PDO::FETCH_ASSOC)) {
            $canSalReqMatDet = $row_salida_requisicion_materiales["canSalReqMatDet"];
            $fecCreSalReqMat = $row_salida_requisicion_materiales["fecCreSalReqMat"];

            $aux_salida = array(
                "docEntSto" => "REQUISICION GENERAL",
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalReqMat,
                "motOpe" => "SL-REQUISICION-GENERAL",
                "canTotEnt" => "",
                "canSalSto" => $canSalReqMatDet,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }

        // ----salidas por encuadre stock----
        $sql_salida_operacion_encuadre_detalle =
            "SELECT 
        soed.canSalOpeEncDet,
        soed.fecCreSalOpeEncDet
        FROM salida_operacion_encuadre_detalle AS soed
        WHERE soed.idEntSto = ?";
        $stmt_salida_operacion_encuadre_detalle = $pdo->prepare($sql_salida_operacion_encuadre_detalle);
        $stmt_salida_operacion_encuadre_detalle->bindParam(1, $idEntSto, PDO::PARAM_INT);
        $stmt_salida_operacion_encuadre_detalle->execute();

        while ($row_salida_operacion_encuadre_detalle = $stmt_salida_operacion_encuadre_detalle->fetch(PDO::FETCH_ASSOC)) {
            $canSalOpeEncDet = $row_salida_operacion_encuadre_detalle["canSalOpeEncDet"];
            $fecCreSalOpeEncDet = $row_salida_operacion_encuadre_detalle["fecCreSalOpeEncDet"];

            $aux_salida = array(
                "docEntSto" => "OPERACION ENCUADRE",
                "codEntSto" => $codEntSto,
                "nomAlm" => $nomAlm,
                "codProd" => $codProd,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "simMed" => $simMed,
                "codLotProd" => $codLotProd,
                "fecVenEntSto" => $fecVenEntSto,
                "fecEntSto" => "",
                "fecSalSto" => $fecCreSalOpeEncDet,
                "motOpe" => "SL-OPERACION-ENCUADRE",
                "canTotEnt" => "",
                "canSalSto" => $canSalOpeEncDet,
                "canTotDis" => ""
            );
            array_push($result["data"], $aux_salida);
        }
    }

    // Crear el libro de trabajo
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    //----Establecer anchos de columna----
    foreach ($result["columnWidths"] as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    //----Establecer encabezados con formato----
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}1")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}1")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}1", $header);
    }

    //----Establecer tipos de datos----
    $SIZE_DATA = sizeof($result["data"]) + 1;
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    //----Agregar datos y aplicar estilos condicionales----
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
            $sheet->getStyle("A{$row}:O{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00'); // Amarillo
        } elseif ($indice == "SL") {
            if ($description == "VENTAS") {
                $sheet->getStyle("A{$row}:O{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('d67e78'); // Rojo
            } elseif ($description == "IRRADIACION") {
                $sheet->getStyle("A{$row}:O{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('f7b034'); // Rojo brito
            } else {
                $sheet->getStyle("A{$row}:O{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('faa884'); // Rojo sau
            }
        }

        $row++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
