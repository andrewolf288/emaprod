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
            "Documento de entrada", "Guia remisión", "Código entrada", "Almacen", "SIIGO", "EMPAROD",
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

        // $auxEnt = [$docEntSto, $guiRem, $codEntSto, $nomAlm, $codProd, $codProd2, $nomProd, $simMed, "", "", $fecVenEntSto, $fecEntSto, "", "Entrada", $canTotEnt, "", $canTotDis];
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

            // $aux_salida = [$docEntSto, $guiRem, $codEntSto, $nomAlm, $codProd, $codProd2, $nomProd, $simMed, $codLotProd, $numop, $fecVenEntSto, "", $fecSalStoReq, "Salida", "", $canSalStoReq, ""];
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

            // $aux_agregacion = [$docEntSto, $guiRem, $codEntSto, $nomAlm, $codProd, $codProd2, $nomProd, $simMed, $codLotProd, $numopAgr, $fecVenEntSto, "", $fecSalStoReq, "AG - " . $desProdAgrMot, "", $canSalStoReq, ""];
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

            // $aux_devolucion = [$docEntSto, $guiRem, $codEntSto, $nomAlm, $codProd, $codProd2, $nomProd, $simMed, $codLotProd, $numopDev, "", $fechaEntradaDevolucion, "", "DE - " . $motivo_devolucion, $canReqDevDet, "", ""];
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
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}2:{$columnLetter}1000")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}2:{$columnLetter}1000")->getNumberFormat()->setFormatCode('0.000');
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
