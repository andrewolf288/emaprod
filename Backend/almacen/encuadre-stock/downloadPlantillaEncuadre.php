<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;

$pdo = getPDO();
$result = array(
    "header" => [],
    "columnWidths" => [],
    "tipoDato" => [],
    "data" => []
);

$header = [
    "SIIGO", "EMAPROD", "Clase", "Sub clase", "Nombre producto", "U.M",
     "Cantidad disponible", "Cantidad encuadre"
];
$headerProductoFinal = [
    "SIIGO", "EMAPROD", "Clase", "Sub clase", "Nombre producto", "U.M",
     "Cantidad disponible", "Cantidad encuadre", "Lote", "Fecha Vencimiento"
];
$widthColumn = [12, 12, 30, 30, 80, 7, 17, 17];
$widthColumnProductoFinal = [12, 12, 30, 30, 80, 7, 17, 17, 10, 17];
$typeData = [
    "texto", "texto", "texto", "texto", 
    "texto", "texto", "numero", "numero"];
$typeDataProductoFinal = [
    "texto", "texto", "texto", "texto", "texto", 
    "texto", "numero", "numero", "texto", "texto"
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idAlm = $data["idAlm"];
    $idEntStoEst = 1;

    $esMatPriData = array();
    $esEnvEncData = array();
    $esMerPromData = array();

    $sql_almacen_principal =
        "SELECT
    als.idProd,
    pd.nomProd,
    pd.codProd,
    pd.codProd2,
    cl.desCla,
    scl.desSubCla,
    me.simMed,
    pd.esMatPri,
    pd.esEnvEnc,
    pd.esMerProm
    FROM almacen_stock AS als
    JOIN producto AS pd ON pd.id = als.idProd
    LEFT JOIN clase AS cl ON cl.id = pd.idCla
    LEFT JOIN sub_clase AS scl ON scl.id = pd.idSubCla
    LEFT JOIN medida AS me ON me.id = pd.idMed
    WHERE als.idAlm = ?";
    $stmt_almacen_principal = $pdo->prepare($sql_almacen_principal);
    $stmt_almacen_principal->bindParam(1, $idAlm, PDO::PARAM_INT);
    $stmt_almacen_principal->execute();

    while ($row_almacen_producto = $stmt_almacen_principal->fetch(PDO::FETCH_ASSOC)) {
        $idProdt = $row_almacen_producto["idProd"];
        $nomProd = $row_almacen_producto["nomProd"];
        $codProd = $row_almacen_producto["codProd"];
        $codProd2 = $row_almacen_producto["codProd2"];
        $desCla = $row_almacen_producto["desCla"];
        $desSubCla = $row_almacen_producto["desSubCla"];
        $simMed = $row_almacen_producto["simMed"];
        $esMatPri = $row_almacen_producto["esMatPri"];
        $esEnvEnc = $row_almacen_producto["esEnvEnc"];
        $esMerProm = $row_almacen_producto["esMerProm"];

        // consultamos los saldos de las entradas
        $sql_count_stock_entradas =
            "SELECT SUM(es.canTotDis) AS canTotDis
        FROM entrada_stock AS es
        WHERE es.idProd = ? AND es.idEntStoEst = ? AND es.canTotDis > 0 AND es.idAlm = ?";
        $stmt_count_stock_entradas = $pdo->prepare($sql_count_stock_entradas);
        $stmt_count_stock_entradas->bindParam(1, $idProdt, PDO::PARAM_INT);
        $stmt_count_stock_entradas->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
        $stmt_count_stock_entradas->bindParam(3, $idAlm, PDO::PARAM_INT);
        $stmt_count_stock_entradas->execute();
        $count_total_entrada_stock = $stmt_count_stock_entradas->fetch(PDO::FETCH_ASSOC);

        $total_stock = 0;
        if(empty($count_total_entrada_stock['canTotDis'])){
            $total_stock = 0;
        } else {
            $total_stock = $count_total_entrada_stock['canTotDis'];
        }

        $array_data = array(
            "codProd" => $codProd,
            "codProd2" => $codProd2,
            "descla" => $desCla,
            "desSubCla" => $desSubCla,
            "nomProd" => $nomProd,
            "simMed" => $simMed,
            "canDis" =>  $total_stock,
            "canDisEnc" => $total_stock,
        );

        if ($esMatPri == 1) {
            array_push($esMatPriData, $array_data);
        }
        if ($esEnvEnc == 1) {
            array_push($esEnvEncData, $array_data);
        }
        if ($esMerProm == 1) {
            array_push($esMerPromData, $array_data);
        }
    }

    $spreadsheet = new Spreadsheet();
    // reporte de materia prima
    if(!empty($esMatPriData)){
        generateSheetByName($spreadsheet, "Materia Prima", $esMatPriData, true, $header, $widthColumn, $typeData);
    }
    // reporte de embalajes y auxiliares
    if(!empty($esEnvEncData)){
        generateSheetByName($spreadsheet, "Embalajes-Auxiliares", $esEnvEncData, false, $header, $widthColumn, $typeData);
    }
    // reporte de promociones
    if(!empty($esMerPromData)){
        generateSheetByName($spreadsheet, "Promociones", $esMerPromData, false, $header, $widthColumn, $typeData);
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}

function generateSheetByName(Spreadsheet $spreadsheet, String $nameSheet, array $data, bool $isFirstSheet, array $header, array $widthColumn, array $typeData)
{
    if ($isFirstSheet) {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($nameSheet);
    } else {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle($nameSheet);
    }

    // // Establecer anchos de columna
    foreach ($widthColumn as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    // // Establecer encabezados con formato
    foreach ($header as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}1")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}1")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}1", $header);
    }

    $SIZE_DATA = sizeof($data) + 1;
    foreach ($typeData as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    $row = 2;
    $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
    foreach ($data as $rowData) {
        $columnNames = array_keys($rowData);
        $valueG = 0;
        foreach ($columnNames as $columnIndex => $value) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            if ($columnLetter == "G") {
                $valueG = $rowData[$value];
            }
            $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
            if ($columnLetter == "H") {
                $conditional = new Conditional();
                $conditional->setConditionType(Conditional::CONDITION_CELLIS);
                $conditional->setOperatorType(Conditional::OPERATOR_NOTEQUAL);
                $conditional->addCondition($valueG);
                $conditional->getStyle()->getFill()->getEndColor()->setARGB(Color::COLOR_DARKRED);
                $conditional->getStyle()->getFill()->setFillType(Fill::FILL_SOLID);
                $conditional->getStyle()->getFont()->getColor()->setARGB(\PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE);
                $conditionalStylesH = $spreadsheet->getActiveSheet()->getStyle("{$columnLetter}{$row}")->getConditionalStyles();
                // Agregar el estilo condicional
                $conditionalStylesH[] = $conditional;
                // Establecer los estilos condicionales para las celdas en la columna H
                $spreadsheet->getActiveSheet()->getStyle("H{$row}")->setConditionalStyles($conditionalStylesH);
            }
        }
        $row++;
    }
}
