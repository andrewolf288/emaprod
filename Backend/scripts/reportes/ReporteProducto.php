<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require('../../common/conexion_emafact.php');
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

$pdo = getPDO();
$pdo_emafact = getPDOEMAFACT();

$result = array(
    "header" => [],
    "columnWidths" => [],
    "tipoDato" => [],
    "data" => []
);
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $result["header"] = ["Fecha", "Documento", "Cliente", "Producto", "Lote", "Cantidad", "UND", "Destino", "Nombre transportista", "Placa"];
    $result["columnWidths"] = [13, 13, 40, 67, 10, 17, 7, 14, 35, 20];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "numero", "texto", "texto", "texto", "texto"];

    $idProdc = 156;

    $sql_select_movimientos =
        "SELECT
    mof.id,
    mof.idOpeFac,
    of.invSerFac,
    of.invNumFac,
    of.idGuiRem,
    mof.idProdt,
    pt.nomProd,
    me.simMed,
    mof.canMovOpeFac
    FROM movimiento_operacion_facturacion AS mof
    LEFT JOIN operacion_facturacion AS of ON of.id = mof.idOpeFac
    LEFT JOIN producto AS pt ON pt.id = mof.idProdt
    LEFT JOIN medida AS me ON me.id = pt.idMed
    WHERE mof.idProdc = ?";
    $stmt_select_movimientos = $pdo->prepare($sql_select_movimientos);
    $stmt_select_movimientos->bindParam(1, $idProdc, PDO::PARAM_INT);
    $stmt_select_movimientos->execute();
    $movimientos_lote = $stmt_select_movimientos->fetchAll(PDO::FETCH_ASSOC);

    $nuevo_arreglo = array();
    // Recorremos el arreglo original
    foreach ($movimientos_lote as $movimiento) {
        $idOpeFac = $movimiento['idOpeFac'];
        $cantidad = $movimiento['canMovOpeFac'];

        // Verificamos si ya tenemos una entrada con este idOpeFac en el nuevo arreglo
        $encontrado = false;
        foreach ($nuevo_arreglo as &$elemento) {
            if ($elemento['idOpeFac'] == $idOpeFac) {
                // Si encontramos una coincidencia, sumamos la cantidad y marcamos como encontrado
                $elemento['canMovOpeFac'] += $cantidad;
                $encontrado = true;
                break;
            }
        }

        // Si no encontramos una coincidencia, agregamos un nuevo elemento al nuevo arreglo
        if (!$encontrado) {
            $nuevo_arreglo[] = array(
                'id' => $movimiento['id'],
                'idOpeFac' => $idOpeFac,
                'invSerFac' => $movimiento['invSerFac'],
                'invNumFac' => $movimiento['invNumFac'],
                'idGuiRem' => $movimiento['idGuiRem'],
                'idProdt' => $movimiento['idProdt'],
                'nomProd' => $movimiento['nomProd'],
                'canMovOpeFac' => $cantidad,
                'simMed' => $movimiento['simMed'],
            );
        }
    }

    foreach ($nuevo_arreglo as $movimiento) {
        $invSerFac = $movimiento["invSerFac"];
        $invNumFac = $movimiento["invNumFac"];
        $idGuiRem = $movimiento["idGuiRem"];
        $nomProd = $movimiento["nomProd"];
        $canMovOpeFac = $movimiento["canMovOpeFac"];
        $simMed = $movimiento["simMed"];

        $sql_select_guia_remisiion = 
        "SELECT 
        rg.id,
        DATE_FORMAT(rg.invoice_date, '%d/%m/%Y') AS invoice_date,
        cu.company,
        cu.firstname,
        cu.lastname,
        de.name AS deparment_name,
        ve.plate,
        car.name AS carrier_name
        FROM referral_guides as rg
        LEFT JOIN customers AS cu ON cu.id = rg.customer_id
        LEFT JOIN addresses_referral_guide AS arg ON arg.id = rg.address_destination_id
        LEFT JOIN departments AS de ON de.id = arg.department_id
        LEFT JOIN vehicles AS ve ON ve.id = rg.vehicle_id
        LEFT JOIN carriers AS car ON car.id = rg.carrier_id
        WHERE rg.id = ?";
        $stmt_select_guia_remision = $pdo_emafact->prepare($sql_select_guia_remisiion);
        $stmt_select_guia_remision->bindParam(1, $idGuiRem, PDO::PARAM_INT);
        $stmt_select_guia_remision->execute();
        $row_guia_remision = $stmt_select_guia_remision->fetch(PDO::FETCH_ASSOC);

        $auxRow = array(
            "invoice_date" => $row_guia_remision["invoice_date"],
            "document" => $invSerFac . "-" . $invNumFac,
            "cliente" => empty($row_guia_remision["company"]) ? $row_guia_remision["firstname"] . " " . $row_guia_remision["lastname"]: $row_guia_remision["company"],
            "producto" => $nomProd,
            "codLotProd" => 'LT512D3',
            "cantidad" => $canMovOpeFac,
            "unidad" => $simMed,
            "destino" => $row_guia_remision["deparment_name"],
            "nombre_transportista" => $row_guia_remision["carrier_name"],
            "placa" => $row_guia_remision["plate"]

        );
        array_push($result["data"], $auxRow);
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
