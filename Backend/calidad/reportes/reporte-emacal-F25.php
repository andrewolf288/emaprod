<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

$pdo = getPDO();
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

    $fechaDesde = $data["fechaDesde"];
    $fechaHasta = $data["fechaHasta"];

    if (empty($fechaDesde)) {
        // inicio de mes
        $fechaDesde = date('Y-m-01');
    }
    if (empty($fechaHasta)) {
        // fin de mes
        $fechaHasta = date('Y-m-t');
    }

    // Crear el libro de trabajo
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}