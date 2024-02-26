<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require '../../vendor/autoload.php';
require_once('../../common/utils.php');

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

    $fechasMes = getStartEndDateNow();
    $fechaInicio = $fechasMes[0]; // inicio del mes
    $fechaFin = $fechasMes[1]; // fin del mes

    if (isset($data)) {
        if (!empty($data["fecReqIni"])) {
            $fechaInicio = $data["fecReqIni"];
        }
        if (!empty($data["fecReqFin"])) {
            $fechaFin = $data["fecReqFin"];
        }
    }

    $result["header"] = ["Lote", "EMAPROD", "Producto", "Medida", "Cantidad", "Estado", "Fecha pedido", "Fecha terminado"];
    $result["columnWidths"] = [10, 12, 80, 10, 15, 20, 20, 20];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "numero", "texto", "texto", "texto"];
    $result["data"] = [];

    if ($pdo) {
        $sql_select_requisicion_seleccion =
            "SELECT
        rs.id,
        rs.codLotSel,
        rs.fecPedReqSel,
        rs.fecTerReqSel
        FROM requisicion_seleccion AS rs
        JOIN requisicion_seleccion_estado AS rse
        WHERE rs.fecPedReqSel BETWEEN '$fechaInicio' AND '$fechaFin'";
        $stmt_select_requisicion_seleccion = $pdo->prepare($sql_select_requisicion_seleccion);
        $stmt_select_requisicion_seleccion->execute();

        while ($row_requisicion_seleccion = $stmt_select_requisicion_seleccion->fetch(PDO::FETCH_ASSOC)) {
            $idReqSel = $row_requisicion_seleccion["id"];
            $codLotSel = $row_requisicion_seleccion["codLotSel"];
            $fecPedReqSel = $row_requisicion_seleccion["fecPedReqSel"];
            $fecTerReqSel = $row_requisicion_seleccion["fecTerReqSel"];

            $sql_select_requisicion_seleccion_detalle =
                "SELECT 
            '$codLotSel' AS codLotSel,
            pt.codProd2,
            pt.nomProd,
            me.simMed,
            rsd.canReqSelDet,
            rsde.desReqSelDetEst,
            '$fecPedReqSel' AS fecPedReqSel,
            '$fecTerReqSel' AS fecTerReqSel
            FROM requisicion_seleccion_detalle AS rsd
            JOIN requisicion_seleccion_detalle_estado AS rsde ON rsde.id = rsd.idReqSelDetEst
            JOIN producto AS pt ON pt.id = rsd.idMatPri
            JOIN medida AS me ON me.id = pt.idMed
            WHERE rsd.idReqSel = ?";
            $stmt_select_requisicion_seleccion_detalle = $pdo->prepare($sql_select_requisicion_seleccion_detalle);
            $stmt_select_requisicion_seleccion_detalle->bindParam(1, $idReqSel, PDO::PARAM_INT);
            $stmt_select_requisicion_seleccion_detalle->execute();
            array_push($result["data"], $stmt_select_requisicion_seleccion_detalle->fetch(PDO::FETCH_ASSOC));
        }

        // Crear el libro de trabajo
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("Requisiciones selección");

        //----ESTABLECER ANCHO DE COLUMNAS----
        foreach ($result["columnWidths"] as $columnIndex => $width) {
            $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
        }

        //----ESTABLECER HEADER CON FORMATO----
        foreach ($result["header"] as $columnIndex => $header) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}1")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}1")->getFont()->setBold(true);

            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}1", $header);
        }

        //----ESTABLECER TIPO DE DATOS----
        $SIZE_DATA = sizeof($result["data"]) + 1;
        foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
            if ($tipoDato === "numero") {
                $sheet->getStyle("{$columnLetter}2:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
            }
        }

        //----MOSTRAR DATOS----
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
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
