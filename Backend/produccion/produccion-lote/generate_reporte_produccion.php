<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$pdo = getPDO();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idLotProd = $data["idLotProd"];

    $spreadsheet = new Spreadsheet();
    // generamos hoja de calculo de datos de produccion
    sheetDatosProduccion($pdo, $idLotProd, $spreadsheet);
    // generamos hoja de calculo de datos de requerimientos
    // sheetDatosRequerimientosEnvEncProduccion($spreadsheet);
    // generamos hoja de calculo de datos de ingreso
    // generamos hoja de calculo de datos de devoluciones
    // generamos hoja de calculo de datos de agregaciones

    // Guardamos el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}



// funcion para mostrar datos de produccion
function sheetDatosProduccion(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    // realizamos las consultas
    $sql_produccion =
        "SELECT
    pd.codLotProd,
    pd.numop,
    pt.nomProd,
    pdt.desProdTip,
    pipe.desProdIniProgEst,
    pfpe.desProdFinProgEst,
    pd.fecProdIni,
    pd.fecProdIniProg,
    pd.fecProdFin,
    pd.fecProdFinProg,
    pd.fecVenLotProd,
    pd.obsProd
    FROM produccion AS pd
    JOIN producto AS pt ON pt.id = pd.idProdt
    JOIN produccion_tipo AS pdt ON pdt.id = pd.idProdTip
    JOIN produccion_fin_programado_estado AS pfpe ON pfpe.id = pd.idProdFinProgEst
    JOIN produccion_inicio_programado_estado AS pipe ON pipe.id =  pd.idProdIniProgEst
    WHERE pd.id = ?";

    $stmt_produccion = $pdo->prepare($sql_produccion);
    $stmt_produccion->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_produccion->execute();
    $row_produccion = $stmt_produccion->fetch(PDO::FETCH_ASSOC);
    // extraemos la data de interes
    $desProdTip = $row_produccion["desProdTip"];
    $nomProd = $row_produccion["nomProd"];
    $desProdFinProgEst = $row_produccion["desProdFinProgEst"];
    $desProdIniProgEst = $row_produccion["desProdIniProgEst"];
    $codLotProd = $row_produccion["codLotProd"];
    $obsProd = $row_produccion["obsProd"];
    $fecProdIni = $row_produccion["fecProdIni"];
    $fecProdIniProg = $row_produccion["fecProdIniProg"];
    $fecProdFin = $row_produccion["fecProdFin"];
    $fecProdFinProg = $row_produccion["fecProdFinProg"];
    $fecVenLotProd = $row_produccion["fecVenLotProd"];
    $numop = $row_produccion["numop"];

    // data
    $result = array(
        "header" => [],
        "columnWidths" => [],
        "tipoDato" => [],
        "data" => []
    );

    $result["header"] = [
        "Lote", "Operacion", "Producto intermedio", "Tipo produccion",
        "Inicio producción", "Inicio programado", "Estado inicio", "Fin producción",
        "Fin programado", "Estado fin", "Fecha vencimiento", "Observaciones"
    ];

    $result["data"] = array(
        "codLotProd" => $codLotProd,
        "numop" => $numop,
        "nomProd" => $nomProd,
        "desProdTip" => $desProdTip,
        "fecProdIni" => $fecProdIni,
        "fecProdIniProg" => $fecProdIniProg,
        "desProdIniProgEst" => $desProdIniProgEst,
        "fecProdFin" => $fecProdFin ?? "Aun no finalizada",
        "fecProdFinProg" => $fecProdFinProg,
        "desProdFinProgEst" => $desProdFinProgEst,
        "fecVenLotProd" => $fecVenLotProd,
        "obsProd" => $obsProd ?? "Sin observaciones",
    );
    // creamos la hoja de calculo
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Datos produccion');

    // establecemos ancho de columna
    $MAX_WIDTH_COLUM_LABEL = 21;
    $MAX_WIDTH_COLUM_VALUE = 35;
    $indexRow = 2;
    $sheet->getColumnDimensionByColumn(1)->setWidth($MAX_WIDTH_COLUM_LABEL);
    $sheet->getColumnDimensionByColumn(2)->setWidth($MAX_WIDTH_COLUM_VALUE);

    // ESCRIBIMOS LOS HEADERS
    foreach ($result["header"] as $rowHeader) {
        // Dar color al fondo del encabezado
        $sheet->getStyle("A{$indexRow}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');
        $sheet->getStyle("A{$indexRow}")->getFont()->setBold(true);
        $sheet->setCellValue("A{$indexRow}", $rowHeader);
        $indexRow++;
    }
    $indexRow = 2;
    // ESCRIBIMOS LOS VALORES
    foreach ($result["data"] as $rowData => $value) {
        $sheet->getStyle("B{$indexRow}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        $sheet->setCellValue("B{$indexRow}", $value);
        $indexRow++;
    }

    // -------------- AHORA CONSULTAMOS LOS PRODCUTOS PROGRAMADOS ---------------
    $result = array(
        "header" => [],
        "columnWidths" => [],
        "tipoDato" => [],
        "data" => []
    );

    $sql_consult_productos_finales =
        "SELECT
    ppf.id,
    pt.nomProd,
    ppfe.desProProFinEst,
    ppf.canTotProgProdFin,
    (
        SELECT SUM(canProdIng)
        FROM produccion_ingreso_producto
        WHERE idProdt = ppf.idProdt AND idProdc = $idLotProd
    ) AS canTotIngProdFin,
    CASE 
        WHEN ppf.esTerIngProFin = 0 THEN 'NO'
        ELSE 'SI'
    END AS esTerIngProFin,
    CASE 
        WHEN ppf.esProdcProdtProg = 0 THEN 'NO'
        ELSE 'SI'
    END AS esProdcProdtProg
    FROM produccion_producto_final AS ppf
    JOIN producto AS pt ON pt.id = ppf.idProdt
    JOIN produccion_producto_final_estado AS ppfe ON ppfe.id = ppf.idProdcProdtFinEst
    WHERE ppf.idProdc = ?";
    $stmt_consult_productos_finales = $pdo->prepare($sql_consult_productos_finales);
    $stmt_consult_productos_finales->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_consult_productos_finales->execute();
    // $rows_productos_programados = array();
    $rows_productos_programados = $stmt_consult_productos_finales->fetchAll(PDO::FETCH_ASSOC);

    $result["data"] = $rows_productos_programados;
    $result["header"] = [
        "ID", "Presentación",  "Estado de programado",
        "Cantidad programada", "Cantidad ingresada",
        "Esta terminado", "Es programado"
    ];
    $result["tipoDato"] = ["texto", "texto", "texto", "numero", "numero", "texto", "texto"];
    $result["columnWidths"] = [10, 70, 23, 20, 20, 18, 18];

    $DESPLAZAMIENTO = 4;
    // Establecer anchos de columna
    foreach ($result["columnWidths"] as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + $DESPLAZAMIENTO)->setWidth($width);
    }

    // Establecer encabezados con formato
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + $DESPLAZAMIENTO);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}2")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}2")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}2", $header);
    }

    // Establecer tipos de datos
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + $DESPLAZAMIENTO);
        $sheet->getStyle("{$columnLetter}3:{$columnLetter}1000")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}3:{$columnLetter}1000")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    // Agregar datos y aplicar estilos condicionales
    $row = 3;
    $columnIndex = 0;
    foreach ($result["data"] as $rowData) {
        $columnNames = array_keys($rowData);
        foreach ($columnNames as $columnIndex => $value) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + $DESPLAZAMIENTO);
            $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
        }
        $row++;
    }
}


// funcion para mostrar requerimientos de env. y enc.
function sheetDatosRequerimientosEnvEncProduccion(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    $result = array(
        "header" => [],
        "columnWidths" => [],
        "tipoDato" => [],
        "data" => []
    );
    $result["header"] = ["ID", "EMAPROD", "Producto", "Medida", "Estado", "Cantidad", "Fecha creación"];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "numero", "texto"];
    $result["columnWidths"] = [10, 12, 80, 7, 15, 12, 17];

    $requisicion_envasado = array();
    $requisicion_encajado = array();
    // traemos informacion de las requisiciones
    $sql_select_requisiciones_produccion =
        "SELECT
    rq.id,
    rq.idAre
    FROM requisicion AS rq
    WHERE rq.idProdc = ?";
    $stmt_select_requisiciones_produccion = $pdo->prepare($sql_select_requisiciones_produccion);
    $stmt_select_requisiciones_produccion->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_select_requisiciones_produccion->execute();

    while ($row_requisicion = $stmt_select_requisiciones_produccion->fetch(PDO::FETCH_ASSOC)) {
        $idReq = $row_requisicion["id"];
        $idAre = $row_requisicion["idAre"];
        $sql_requisicion_detalle =
            "SELECT
        rd.idProdFin,
        rd.codProd2,
        rd.nomProd,
        me.simMed,
        rde.desReqDetEst,
        rd.canReqDet,
        rd.fecCreReqDet
        FROM requisicion_detalle AS rd
        JOIN producto AS pt ON pt.id = rd.idProdt
        JOIN medida AS me ON me.id = pt.idMed
        JOIN requisicion_detalle_estado AS rde ON rde.id = rd.idReqDetEst
        WHERE rd.id = ?";
        $stmt_requisicion_detalle = $pdo->prepare($sql_requisicion_detalle);
        $stmt_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
        $stmt_requisicion_detalle->execute();

        if ($idAre == 5) {
            $requisicion_envasado = $stmt_requisicion_detalle->fetchAll();
        } else {
            $requisicion_envasado = $stmt_requisicion_detalle->fetchAll();
        }
    }

    $index = 2;
}
// funcion para mostrar datos de ingresos
function sheetDatosIngresosProduccion(Spreadsheet $spreadsheet, $dataIngresos)
{
}
// funcion para mostrar datos de devolucion
function sheetDatosDevolucionesProduccion(Spreadsheet $spreadsheet, $dataDevoluciones)
{
}
// funcion para mostrar datos de agregaciones
function sheetDatosAgregacionesProduccion(Spreadsheet $spreadsheet, $dataAgregaciones)
{
}
