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
    $producto = $data["producto"];
    $idEntStoEst = 1;

    $result["header"] = ["Almacen", "SIIGO", "EMAPROD", "Producto", "Saldo producto", "Medida", "Lote", "Saldo lote", "Fecha vencimiento"];
    $result["columnWidths"] = [25, 13, 13, 67, 14, 8, 10, 14, 18];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "numero", "texto", "texto", "numero", "texto"];

    $claseProductoFinal = 2;
    $sql_select_productos_finales =
        "SELECT p.id, p.nomProd, p.codProd2, p.codProd, me.simMed, p.idCla
        FROM producto AS p 
        JOIN medida AS me ON me.id = p.idMed
        WHERE p.idCla = ?";

    if ($producto != 0) {
        $sql_select_productos_finales = $sql_select_productos_finales . " AND p.id = $producto";
    }

    $stmt_select_productos_finales = $pdo->prepare($sql_select_productos_finales);
    $stmt_select_productos_finales->bindParam(1, $claseProductoFinal, PDO::PARAM_INT);
    $stmt_select_productos_finales->execute();

    while ($row_producto_final = $stmt_select_productos_finales->fetch(PDO::FETCH_ASSOC)) {
        $idProd = $row_producto_final["id"]; // id producto
        $nomProd = $row_producto_final["nomProd"]; // nombre del producto
        $codProd2 = $row_producto_final["codProd2"]; // codigo EMPAROD
        $codProd = $row_producto_final["codProd"]; // codigo SIIGO
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
            // si la cantidad de stock es igual a 0, no lo agregamos en el reporte
            if ($canSto != 0) {
                $auxStockTotal = array(
                    "nomAlm" => $nomAlm,
                    "codProd" => $codProd,
                    "codProd2" => $codProd2,
                    "nomProd" => $nomProd,
                    "canSto" => $canSto,
                    "simMed" => $simMed,
                    "codLotProd" => "",
                    "salLotProd" => "",
                    "fecVenEntSto" => ""
                );

                array_push($result["data"], $auxStockTotal);

                //ahora recorremos las entradas en busca de los lotes
                $select_entradas_producto_final =
                    "SELECT es.codLot, es.canTotDis, DATE(es.fecVenEntSto) AS fecVenEntSto, es.refProdc 
                FROM entrada_stock AS es
                WHERE es.idAlm = ? AND es.idProd = ? AND es.idEntStoEst = ? AND es.canTotDis > 0";
                $stmt_select_entradas_producto_final = $pdo->prepare($select_entradas_producto_final);
                $stmt_select_entradas_producto_final->bindParam(1, $almacen, PDO::PARAM_INT);
                $stmt_select_entradas_producto_final->bindParam(2, $idProd, PDO::PARAM_INT);
                $stmt_select_entradas_producto_final->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
                $stmt_select_entradas_producto_final->execute();

                $rows_entradas_producto_final = $stmt_select_entradas_producto_final->fetchAll(PDO::FETCH_ASSOC);

                // Array asociativo para almacenar las sumas por refProdc
                $sumas_por_refProdc = array();

                // Recorrer los registros y realizar la suma
                foreach ($rows_entradas_producto_final as $registro) {
                    $refProdc = $registro['refProdc'];
                    $canTotDis = $registro['canTotDis'];

                    // Utilizar el operador de fusión de null (??) para manejar el caso cuando no existe la clave
                    $sumas_por_refProdc[$refProdc] = ($sumas_por_refProdc[$refProdc] ?? 0) + $canTotDis;
                }

                // Construir un nuevo array con un solo registro por refProdc y la cantidad total sumada
                $nuevos_registros = array();

                foreach ($rows_entradas_producto_final as $registro) {
                    $refProdc = $registro['refProdc'];

                    // Utilizar el operador de fusión de null (??) para manejar el caso cuando no existe la clave
                    $registro['canTotDis'] = $sumas_por_refProdc[$refProdc] ?? 0;

                    // Agregar el registro al nuevo array solo si aún no ha sido agregado
                    if (!isset($nuevos_registros[$refProdc])) {
                        $nuevos_registros[$refProdc] = $registro;
                    }
                }

                // Ahora $nuevos_registros contiene un solo registro por refProdc con la cantidad total sumada
                $nuevos_registros = array_values($nuevos_registros); // Reindexar el array si es necesario
                // print_r($nuevos_registros);

                foreach ($nuevos_registros as $registro) {
                    $canLoteStockTotal = $registro["canTotDis"];
                    $codLot = $registro["codLot"];
                    $fecVenEntSto = $registro["fecVenEntSto"];
                    $auxLoteStockTotal = array(
                        "nomAlm" => "",
                        "codProd" => "",
                        "codProd2" => "",
                        "nomProd" => "",
                        "canSto" => "",
                        "simMed" => $simMed,
                        "codLotProd" => $codLot,
                        "salLotProd" => $canLoteStockTotal,
                        "fecVenEntSto" => $fecVenEntSto
                    );
                    array_push($result["data"], $auxLoteStockTotal);
                }
            }
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
            if ($value == "fecVenEntSto") {
                $sheet->getStyle("{$columnLetter}{$row}")->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);
            }
        }

        // Obtener el valor en el key "motOpe"
        $nomProd = $rowData["nomProd"];
        if (empty($nomProd)) {
            $sheet->getStyle("A{$row}:I{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('93d98d'); // Verde
        } else {
            $sheet->getStyle("A{$row}:I{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00'); // amarillo
        }

        $row++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
