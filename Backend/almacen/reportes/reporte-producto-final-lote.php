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
    $almacen = $data["almacen"];

    $result["header"] = ["Almacen", "EMAPROD", "Producto", "Saldo producto", "Medida", "Lote", "Saldo lote"];
    $result["columnWidths"] = [25, 13, 90, 13, 8, 11, 13];
    $result["tipoDato"] = ["texto", "texto", "texto", "numero", "texto", "texto", "numero"];

    $claseProductoFinal = 2;
    $sql_select_productos_finales =
        "SELECT p.id, p.nomProd, p.codProd2, me.simMed, p.idCla
        FROM producto AS p 
        JOIN medida AS me ON me.id = p.idMed
        WHERE p.idCla = ?";
    $stmt_select_productos_finales = $pdo->prepare($sql_select_productos_finales);
    $stmt_select_productos_finales->bindParam(1, $claseProductoFinal, PDO::PARAM_INT);
    $stmt_select_productos_finales->execute();

    while ($row_producto_final = $stmt_select_productos_finales->fetch(PDO::FETCH_ASSOC)) {
        $idProd = $row_producto_final["id"]; // id producto
        $nomProd = $row_producto_final["nomProd"]; // nombre del producto
        $codProd2 = $row_producto_final["codProd2"]; // codigo EMPAROD
        $simMed = $row_producto_final["simMed"]; // medida
        $nomAlm = "";
        $canSto = 0.0;

        // primero consultamos su stock en el almacen indicado
        $select_stock_almacen =
            "SELECT ast.idProd, ast.idProd, ast.idAlm, ast.canSto, al.nomAlm 
        FROM almacen_stock AS ast
        JOIN almacen AS al ON al.id = ast.idAlm
        WHERE ast.idAlm = ? AND ast.idProd = ?";
        $stmt_select_stock_almacen = $pdo->prepare($select_stock_almacen);
        $stmt_select_stock_almacen->bindParam(1, $almacen, PDO::PARAM_INT);
        $stmt_select_stock_almacen->bindParam(2, $idProd, PDO::PARAM_INT);
        $stmt_select_stock_almacen->execute();

        $data_almacen_stock = $stmt_select_stock_almacen->fetch(PDO::FETCH_ASSOC);
        if ($data_almacen_stock) {
            $nomAlm = $data_almacen_stock["nomAlm"];
            $canSto = $data_almacen_stock["canSto"];

            $auxStockTotal = array(
                "nomAlm" => $nomAlm,
                "codProd2" => $codProd2,
                "nomProd" => $nomProd,
                "canSto" => $canSto,
                "simMed" => $simMed,
                "codLotProd" => "",
                "salLotProd" => ""
            );

            array_push($result["data"], $auxStockTotal);
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
        $row++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
