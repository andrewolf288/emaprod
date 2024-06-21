<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require('../../common/conexion_integracion.php');

require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$pdo = getPDO();
$pdoCONTANET = getPDOContanet(); // Esta función debe devolver una conexión PDO a SQL Server

$result = array(
    "header" => [],
    "columnWidths" => [],
    "tipoDato" => [],
    "data" => []
);

$message_error = "";
$description_error = "";
$styleArray = [
    'borders' => [
        'allBorders' => [
            'borderStyle' => PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, // Estilo de borde
            'color' => ['rgb' => '000000'] // Color del borde (en este caso, negro)
        ],
    ],
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $fechaDesde = $data["fechaInicio"] ?? date('Y-m-01'); // Inicio de mes si está vacío
    $fechaHasta = $data["fechaFin"] ?? date('Y-m-t'); // Fin de mes si está vacío

    $result["header"] = ["FECHA", "CANTIDAD", "REFERENCIA", "PRODUCTO", "NACIONAL", "EXTRANJERA", "PROVEEDOR", "DOCUMENTO", "FECHA", "CANTIDAD", "DESCRIPCION", "USD", "PEN"];
    $result["columnWidths"] = [12, 12, 10, 50, 12, 12, 40, 12, 12, 12, 40, 12, 12];
    $result["tipoDato"] = ["texto", "numero", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "numero", "texto", "numero", "numero"];
    $result["data"] = [];

    $idAlm = 1;
    $idEntStoTip = 1;
    $idProd = 418; // AGUA POTABLE
    $esMerProm = 0; // NO MERCANCIA PROMOCIONAL
    $docEntSto = "SALDO INICIAL";

    $sql_entradas_stock =
        "SELECT
    es.id,
    DATE(es.fecEntSto) AS fecEntSto,
    es.canTotEnt,
    p.codProd,
    p.codProd2,
    p.nomProd,
    pv.nomProv,
    es.codComCon
    FROM entrada_stock AS es
    LEFT JOIN producto AS p ON p.id = es.idProd
    LEFT JOIN proveedor AS pv ON pv.id = es.idProv
    WHERE DATE(es.fecEntSto) BETWEEN :fechaDesde AND :fechaHasta
    AND es.idEntStoTip = :idEntStoTip
    AND es.idAlm = :idAlm
    AND p.id <> :idProd
    AND es.docEntSto <> :docEntSto
    AND p.esMerProm = :esMerProm
    ORDER BY es.fecEntSto ASC";
    $stmt_entradas_stock = $pdo->prepare($sql_entradas_stock);
    $stmt_entradas_stock->bindParam(':fechaDesde', $fechaDesde, PDO::PARAM_STR);
    $stmt_entradas_stock->bindParam(':fechaHasta', $fechaHasta, PDO::PARAM_STR);
    $stmt_entradas_stock->bindParam(':idEntStoTip', $idEntStoTip, PDO::PARAM_INT);
    $stmt_entradas_stock->bindParam(':idAlm', $idAlm, PDO::PARAM_INT);
    $stmt_entradas_stock->bindParam(':idProd', $idProd, PDO::PARAM_INT);
    $stmt_entradas_stock->bindParam(':docEntSto', $docEntSto, PDO::PARAM_STR);
    $stmt_entradas_stock->bindParam(':esMerProm', $esMerProm, PDO::PARAM_BOOL);
    $stmt_entradas_stock->execute();

    while ($row_entrada_stock = $stmt_entradas_stock->fetch(PDO::FETCH_ASSOC)) {
        $codComCon = $row_entrada_stock["codComCon"];
        $codProd2 = $row_entrada_stock["codProd2"];
        $codProd = $row_entrada_stock["codProd"];
        $nomProd = $row_entrada_stock["nomProd"];
        $nomProv = $row_entrada_stock["nomProv"];
        $canTotEnt = $row_entrada_stock["canTotEnt"];
        $fecEntSto = $row_entrada_stock["fecEntSto"];

        // inicializacion de variables
        $Cd_Com = $FecED = $NroSre = $NroDoc = $Cant = $ValorTotal = $Igv = $Total = $Descrip = null;

        // Consultar el registro de compra
        $sql_compra_contanet =
            "SELECT cm.RegCtb, cm.Cd_Com, CONVERT(VARCHAR, cm.FecED, 103) AS FecED, cm.NroSre, cm.NroDoc
        FROM dbo.Compra2 AS cm
        WHERE cm.RegCtb = :codComCon";
        $stmt_compra_contanet = $pdoCONTANET->prepare($sql_compra_contanet);
        $stmt_compra_contanet->bindParam(':codComCon', $codComCon, PDO::PARAM_STR);
        $stmt_compra_contanet->execute();

        if ($compra_contanet = $stmt_compra_contanet->fetch(PDO::FETCH_ASSOC)) {
            $Cd_Com = $compra_contanet["Cd_Com"];
            $FecED = $compra_contanet["FecED"];
            $NroSre = $compra_contanet["NroSre"];
            $NroDoc = $compra_contanet["NroDoc"];

            $sql_compra_detalle_contanet =
                "SELECT cmd.Cant, cmd.Descrip, cmd.ValorTotal, cmd.Igv, cmd.Total
            FROM dbo.CompraDet2 AS cmd
            JOIN dbo.Producto2 AS prd ON prd.Cd_Prod = cmd.Cd_Prod
            WHERE cmd.Cd_Com = :codComCon AND prd.CodCo2_ = :codProd2";
            $stmt_compra_detalle_contanet = $pdoCONTANET->prepare($sql_compra_detalle_contanet);
            $stmt_compra_detalle_contanet->bindParam(':codComCon', $Cd_Com, PDO::PARAM_STR);
            $stmt_compra_detalle_contanet->bindParam(':codProd2', $codProd2, PDO::PARAM_STR);
            $stmt_compra_detalle_contanet->execute();

            if ($compra_detalle_contanet = $stmt_compra_detalle_contanet->fetch(PDO::FETCH_ASSOC)) {
                $Cant = $compra_detalle_contanet["Cant"];
                $ValorTotal = $compra_detalle_contanet["ValorTotal"];
                $Igv = $compra_detalle_contanet["Igv"];
                $Total = $compra_detalle_contanet["Total"];
                $Descrip = $compra_detalle_contanet["Descrip"];
            }
        }

        $array_element = [
            "FechaIngresoEMAPROD" => $fecEntSto,
            "CantidadIngresoEMAPROD" => $canTotEnt,
            "CodigoProductoEMAPROD" => $codProd,
            "ProductoEMAPROD" => $nomProd,
            "ProcedenciaNacionalCONTANET" => "",
            "ProcedenciaExtranjeraCONTANET" => "",
            "ProveedorEMAPROD" => $nomProv,
            "DocumentoCONTANET" => $NroSre . " - " . $NroDoc,
            "FechaEmisionCONTANET" => $FecED,
            "CantidadCompraCONTANET" => $Cant ?? 0, // Valor por defecto si no se encuentra
            "DescripcionCompraCONTANET" => $Descrip ?? "", // Valor por defecto si no se encuentra
            "TotalDolarCONTANET" => 0,
            "TotalSolesCONTANET" => $ValorTotal ?? 0 // Valor por defecto si no se encuentra
        ];

        array_push($result["data"], $array_element);
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
        $row++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
