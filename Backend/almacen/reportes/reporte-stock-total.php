<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idCla = $data["clase"];
    $idAlm = $data["almacen"];

    $result["data"] = [];
    $result["header"] = ["Clase", "Sub Clase", "Almacen", "SIGO", "EMAPROD", "Nombre", "Medida", "Cantidad"];
    $result["columnWidths"] = [18, 32, 25, 9, 11, 90, 8, 13];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "texto", "numero"];

    $sql =
        "SELECT
    cl.desCla,
    scl.desSubCla,
    al.nomAlm,
    p.codProd,
    p.codProd2,
    p.nomProd,
    me.simMed,
    als.canSto
    FROM almacen_stock AS als
    JOIN producto AS p ON p.id = als.idProd
    JOIN medida AS me ON me.id = p.idMed
    JOIN clase AS cl ON cl.id = p.idCla
    JOIN sub_clase AS scl ON scl.id = p.idSubCla
    JOIN almacen AS al ON al.id = als.idAlm
    WHERE als.idAlm = $idAlm
    ";
    if ($idCla !== 0) {
        $sql = $sql . " AND p.idCla = $idCla";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $result["data"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
        $row++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
