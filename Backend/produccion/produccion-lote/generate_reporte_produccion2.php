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
    // generamos hoja de calculo de salidas de materias primas
    sheetDatosRequisicionMateriasPrimas($pdo, $idLotProd, $spreadsheet);
    // generamos hoja de calculo de datos de requerimientos
    sheetDatosRequerimientosEnvEncProduccion($pdo, $idLotProd, $spreadsheet);
    // generamos hoja de calculo de datos de ingreso
    sheetDatosIngresosProduccion($pdo, $idLotProd, $spreadsheet);
    // generamos hoja de calculo de datos de devoluciones
    sheetDatosDevolucionesProduccion($pdo, $idLotProd, $spreadsheet);
    // generamos hoja de calculo de datos de agregaciones
    sheetDatosAgregacionesProduccion($pdo, $idLotProd, $spreadsheet);

    // Guardamos el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}

// funcion para mostrar datos de produccion
function sheetDatosProduccion(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    // creamos la hoja de calculo
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Datos produccion');

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
    $SIZE_DATA = sizeof($result["data"]) + 2;
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + $DESPLAZAMIENTO);
        $sheet->getStyle("{$columnLetter}3:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}3:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
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
    // creamos la hoja de calculo
    $sheet = $spreadsheet->createSheet();
    $sheet->setTitle('Datos requisiciones');

    $result = array(
        "header" => [],
        "columnWidths" => [],
        "tipoDato" => [],
        "data" => []
    );
    // $result["header"] = ["ID", "Cod. Entrada", "EMAPROD", "Producto", "Medida", "Estado", "Cantidad", "Fecha creación"];
    $result["header"] = ["ID", "Cod. Entrada", "EMAPROD", "Producto", "Medida", "Estado", "Cantidad", "Fecha salida"];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "numero", "texto"];
    $result["columnWidths"] = [10, 25, 12, 80, 10, 15, 12, 20];

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
        // $sql_requisicion_detalle =
        //     "SELECT
        // rd.idProdFin,
        // pt.codProd2,
        // pt.nomProd,
        // me.simMed,
        // rde.desReqDetEst,
        // rd.canReqDet,
        // rd.fecCreReqDet
        // FROM requisicion_detalle AS rd
        // JOIN producto AS pt ON pt.id = rd.idProdt
        // JOIN medida AS me ON me.id = pt.idMed
        // JOIN requisicion_detalle_estado AS rde ON rde.id = rd.idReqDetEst
        // WHERE rd.idReq = ?";
        // $stmt_requisicion_detalle = $pdo->prepare($sql_requisicion_detalle);
        // $stmt_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
        // $stmt_requisicion_detalle->execute();

        $sql_requisicion_detalle = 
        "SELECT
        rd.idProdFin,
        es.codEntSto,
        p.codProd2,
        p.nomProd,
        me.simMed,
        rde.desReqDetEst,
        ss.canSalStoReq,
        ss.fecSalStoReq
        FROM salida_stock AS ss
        JOIN entrada_stock AS es ON es.id = ss.idEntSto
        JOIN producto AS p ON p.id = ss.idProdt
        JOIN medida AS me ON me.id = p.idMed
        JOIN requisicion_detalle AS rd ON rd.id = ss.idReqDet
        JOIN requisicion_detalle_estado AS rde ON rde.id = rd.idReqDetEst
        WHERE ss.idReq = ?";
        $stmt_requisicion_detalle = $pdo->prepare($sql_requisicion_detalle);
        $stmt_requisicion_detalle->bindParam(1, $idReq, PDO::PARAM_INT);
        $stmt_requisicion_detalle->execute();

        if ($idAre == 5) {
            $requisicion_envasado = $stmt_requisicion_detalle->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $requisicion_encajado = $stmt_requisicion_detalle->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    // ---ESTABLECEMOS EL ANCHO DE LAS COLUMNAS---
    foreach ($result["columnWidths"] as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    // ----MANEJAMOS EL ENCABEZADO DE REQUISICION DE ENVASADO----
    $START_MERGE_ENVASADO = 2;
    $START_LETTER = "A";
    $FINAL_LETTER = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($result["header"]));
    $sheet->mergeCells(("{$START_LETTER}{$START_MERGE_ENVASADO}:{$FINAL_LETTER}{$START_MERGE_ENVASADO}"));
    $START_FILA_ENVASADO = 3;
    // establecer el texto centrado en el grupo de celdas fusionadas
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENVASADO}:{$FINAL_LETTER}{$START_MERGE_ENVASADO}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENVASADO}:{$FINAL_LETTER}{$START_MERGE_ENVASADO}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

    // establecer un color de fondo específico para el grupo de celdas fusionadas
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENVASADO}:{$FINAL_LETTER}{$START_MERGE_ENVASADO}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENVASADO}:{$FINAL_LETTER}{$START_MERGE_ENVASADO}")->getFill()->getStartColor()->setARGB('67e088'); // Color naranja como ejemplo

    // establecer el texto en el grupo de celdas fusionadas
    $sheet->setCellValue("{$START_LETTER}{$START_MERGE_ENVASADO}", "REQUISICION ENVASADO");

    // ----ESTABLECEMOS ENCABEZADOS CON FORMATOS----
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}{$START_FILA_ENVASADO}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}{$START_FILA_ENVASADO}")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}{$START_FILA_ENVASADO}", $header);
    }

    // ----ESTABLECEMOS TIPOS DE DATOS----
    $START_TYPE_VARIABLE_ENVASADO = $START_FILA_ENVASADO + 1;
    $END_TYPE_VARIABLE_ENVASADO = $START_FILA_ENVASADO + sizeof($requisicion_envasado);
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}{$START_TYPE_VARIABLE_ENVASADO}:{$columnLetter}{$END_TYPE_VARIABLE_ENVASADO}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}{$START_TYPE_VARIABLE_ENVASADO}:{$columnLetter}{$END_TYPE_VARIABLE_ENVASADO}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    // ----MOSTRAMOS LOS DATOS DE REQUISICION DE ENVASADO----
    $row = 4;
    $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
    foreach ($requisicion_envasado as $rowData) {
        $columnNames = array_keys($rowData);
        foreach ($columnNames as $columnIndex => $value) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
        }
        $row++;
    }

    // ----MANEJAMOS EL ENCABEZADO DE REQUISICION DE ENVASADO----
    $START_MERGE_ENCAJADO = $row + 1;
    $sheet->mergeCells(("{$START_LETTER}{$START_MERGE_ENCAJADO}:{$FINAL_LETTER}{$START_MERGE_ENCAJADO}"));
    $START_FILA_ENVASADO = 3;
    // establecer el texto centrado en el grupo de celdas fusionadas
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENCAJADO}:{$FINAL_LETTER}{$START_MERGE_ENCAJADO}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENCAJADO}:{$FINAL_LETTER}{$START_MERGE_ENCAJADO}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

    // establecer un color de fondo específico para el grupo de celdas fusionadas
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENCAJADO}:{$FINAL_LETTER}{$START_MERGE_ENCAJADO}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
    $sheet->getStyle("{$START_LETTER}{$START_MERGE_ENCAJADO}:{$FINAL_LETTER}{$START_MERGE_ENCAJADO}")->getFill()->getStartColor()->setARGB('e0d267');

    // establecer el texto en el grupo de celdas fusionadas
    $sheet->setCellValue("{$START_LETTER}{$START_MERGE_ENCAJADO}", "REQUISICION ENCAJADO");

    // ----ESTABLECEMOS ENCABEZADOS CON FORMATOS----
    $START_FILA_ENCAJADO = $row + 2;
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}{$START_FILA_ENCAJADO}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}{$START_FILA_ENCAJADO}")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}{$START_FILA_ENCAJADO}", $header);
    }

    // ----ESTABLECEMOS LOS TIPOS DE DATOS----
    $START_TYPE_VARIABLE_ENCAJADO = $START_FILA_ENCAJADO + 1;
    $END_TYPE_VARIABLE_ENCAJADO = $START_FILA_ENCAJADO + sizeof($requisicion_encajado);
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}{$START_TYPE_VARIABLE_ENCAJADO}:{$columnLetter}{$END_TYPE_VARIABLE_ENCAJADO}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}{$START_TYPE_VARIABLE_ENCAJADO}:{$columnLetter}{$END_TYPE_VARIABLE_ENCAJADO}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    // ----MOSTRAMOS LOS DATOS DE REQUISICION DE ENCAJADO----
    $row = $START_FILA_ENCAJADO + 1;
    $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
    foreach ($requisicion_encajado as $rowData) {
        $columnNames = array_keys($rowData);
        foreach ($columnNames as $columnIndex => $value) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
        }
        $row++;
    }
}
// funcion para mostrar datos de ingresos
function sheetDatosIngresosProduccion(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    // creamos la hoja de calculo
    $sheet = $spreadsheet->createSheet();
    $sheet->setTitle('Datos ingresos');

    $result = array(
        "header" => [],
        "columnWidths" => [],
        "tipoDato" => [],
        "data" => []
    );

    $result["header"] = ["ID", "EMAPROD", "Producto", "Medida", "Ing. Almacen", "Cantidad", "Fecha ingreso"];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "numero", "texto"];
    $result["columnWidths"] = [10, 12, 80, 10, 18, 12, 20];

    $sql_select_ingresos_produccion =
        "SELECT 
    pip.refProdtProg,
    pt.codProd2,
    pt.nomProd,
    me.simMed,
    CASE 
        WHEN pip.esComProdIng = 0 THEN 'NO'
        ELSE 'SI'
    END AS esComProdIng,
    pip.canProdIng,
    pip.fecProdIng
    FROM produccion_ingreso_producto AS pip
    JOIN producto AS pt ON pt.id = pip.idProdt
    JOIN medida AS me ON me.id = pt.idMed
    WHERE pip.idProdc = ?";
    $stmt_select_ingresos_produccion = $pdo->prepare($sql_select_ingresos_produccion);
    $stmt_select_ingresos_produccion->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_select_ingresos_produccion->execute();

    $result["data"] = $stmt_select_ingresos_produccion->fetchAll(PDO::FETCH_ASSOC);

    //----ESTABLECEMOS EL ANCHO DE LAS COLUMNAS----
    foreach ($result["columnWidths"] as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    // ----ESTABLECEMOS EL HEADER CON FORMATO----
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}2")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}2")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}2", $header);
    }

    // ----ESTABLECEMOS LOS TIPOS DE DATOS----
    $SIZE_DATA = sizeof($result["data"]) + 2;
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}3:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}3:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    // ----MOSTRAMOS LA DATA----
    $row = 3;
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
// funcion para mostrar datos de devolucion
function sheetDatosDevolucionesProduccion(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    // creamos la hoja de calculo
    $sheet = $spreadsheet->createSheet();
    $sheet->setTitle('Datos devoluciones');

    $columnWidths = [10, 20, 12, 80, 10, 15, 20, 20];

    $sql_requisiciones_devoluciones =
        "SELECT
        rqd.id,
    rqd.idProdFin,
    rqd.correlativo,
    pt.codProd2,
    pt.nomProd,
    me.simMed,
    rqe.desReqEst,
    rqd.fecComReqDev,
    rqd.fecCreReqDev
    FROM requisicion_devolucion AS rqd
    JOIN producto AS pt ON pt.id = rqd.idProdt
    JOIN medida AS me ON me.id = pt.idMed
    JOIN requisicion_estado AS rqe ON rqe.id = rqd.idReqEst
    WHERE rqd.idProdc = ?";
    $stmt_requisiciones_devoluciones = $pdo->prepare($sql_requisiciones_devoluciones);
    $stmt_requisiciones_devoluciones->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_requisiciones_devoluciones->execute();

    // ---ESTABLECEMOS EL ANCHO DE LAS COLUMNAS---
    foreach ($columnWidths as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    $INDEX = 2;
    while ($row_requisicion_devolucion = $stmt_requisiciones_devoluciones->fetch(PDO::FETCH_ASSOC)) {
        $idReqDev = $row_requisicion_devolucion["id"];
        $idProdFin = $row_requisicion_devolucion["idProdFin"];

        unset($row_requisicion_devolucion['id']);

        $resultRequisicion = array(
            "header" => [],
            "tipoDato" => [],
            "data" => []
        );
        array_push($resultRequisicion["data"], $row_requisicion_devolucion);
        $resultRequisicion["header"] = [
            "ID", "Correlativo", "EMAPROD",
            "Presentación", "Medida", "Estado",
            "Fecha completo", "Fecha creado"
        ];
        $resultRequisicion["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto"];

        // ----HEADER CON FORMATO DE LA REQUISICION----
        foreach ($resultRequisicion["header"] as $columnIndex => $header) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}{$INDEX}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('eab676');

            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}{$INDEX}")->getFont()->setBold(true);

            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}{$INDEX}", $header);
        }

        // ----TIPO DE DATOS PARA LA REQUISICION----
        $SIZE_DATA = sizeof($resultRequisicion["data"]) + $INDEX;
        $START_TYPE = $INDEX + 1;
        foreach ($resultRequisicion["tipoDato"] as $columnIndex => $tipoDato) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
            if ($tipoDato === "numero") {
                $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
            }
        }

        //----MOSTRAMOS LA DATA----
        $row = $INDEX + 1;
        $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
        foreach ($resultRequisicion["data"] as $rowData) {
            $columnNames = array_keys($rowData);
            foreach ($columnNames as $columnIndex => $value) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
                $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
            }
            $row++;
        }

        //----MOSTRAMOS INFORMACION DEL DETALLE----
        $resultRequisicionDetalle = array(
            "header" => [],
            "tipoDato" => [],
            "data" => []
        );
        $resultRequisicionDetalle["header"] = ["ID", "Motivo", "EMAPROD", "Producto", "Medida", "Cantidad", "Completo", "Fecha creación"];
        $resultRequisicionDetalle["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "numero", "texto", "texto"];

        $sql_select_requisicion_devolucion_detalle =
            "SELECT
        $idProdFin AS idProdFin,
        pdm.desProdDevMot,
        pt.codProd2,
        pt.nomProd,
        me.simMed,
        rdd.canReqDevDet,
        CASE 
            WHEN rdd.esComReqDevDet = 0 THEN 'NO'
            ELSE 'SI'
        END AS esComReqDevDet,
        rdd.fecCreReqDevDet
        FROM requisicion_devolucion_detalle AS rdd
        JOIN produccion_devolucion_motivo AS pdm ON pdm.id = rdd.idMotDev
        JOIN producto AS pt ON pt.id = rdd.idProdt
        JOIN medida AS me ON me.id = pt.idMed
        WHERE rdd.idReqDev = ?";
        $stmt_select_requisicion_devolucion_detalle = $pdo->prepare($sql_select_requisicion_devolucion_detalle);
        $stmt_select_requisicion_devolucion_detalle->bindParam(1, $idReqDev, PDO::PARAM_INT);
        $stmt_select_requisicion_devolucion_detalle->execute();
        $resultRequisicionDetalle["data"] = $stmt_select_requisicion_devolucion_detalle->fetchAll(PDO::FETCH_ASSOC);

        //----ESTABLECEMOS EL HEADER DEL DETALLE----
        foreach ($resultRequisicionDetalle["header"] as $columnIndex => $header) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}{$row}")->getFont()->setBold(true);

            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}{$row}", $header);
        }

        //----ESTABLECEMOS LOS TIPOS DE DATOS----
        $SIZE_DATA_DETALLE = sizeof($resultRequisicionDetalle["data"]) + $row;
        $START_TYPE = $row + 1;
        foreach ($resultRequisicionDetalle["tipoDato"] as $columnIndex => $tipoDato) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA_DETALLE}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
            if ($tipoDato === "numero") {
                $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA_DETALLE}")->getNumberFormat()->setFormatCode('0.000');
            }
        }

        $row_detalle = $row + 1;
        //----MOSTRAMOS LA DATA DEL DETALLE----
        foreach ($resultRequisicionDetalle["data"] as $rowData) {
            $columnNames = array_keys($rowData);
            foreach ($columnNames as $columnIndex => $value) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
                $sheet->setCellValue("{$columnLetter}{$row_detalle}", $rowData[$value]);
            }
            $row_detalle++;
        }

        $INDEX = $row_detalle + 1;
    }
}
// funcion para mostrar datos de agregaciones
function sheetDatosAgregacionesProduccion(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    // creamos la hoja de calculo
    $sheet = $spreadsheet->createSheet();
    $sheet->setTitle('Datos agregaciones');

    $columnWidths = [10, 22, 22, 12, 80, 10, 15, 20, 20];

    $sql_requisiciones_agregaciones =
        "SELECT
    rqa.id,
    rqa.idProdFin,
    rqa.correlativo,
    pam.desProdAgrMot,
    pt.codProd2,
    pt.nomProd,
    me.simMed,
    rqe.desReqEst,
    rqa.fecEntReqAgr,
    rqa.fecCreReqAgr
    FROM requisicion_agregacion AS rqa
    JOIN producto AS pt ON pt.id = rqa.idProdt
    JOIN medida AS me ON me.id = pt.idMed
    JOIN requisicion_estado AS rqe ON rqe.id = rqa.idReqEst
    JOIN produccion_agregacion_motivo AS pam ON pam.id = rqa.idProdcMot
    WHERE rqa.idProdc = ?";
    $stmt_requisiciones_agregaciones = $pdo->prepare($sql_requisiciones_agregaciones);
    $stmt_requisiciones_agregaciones->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_requisiciones_agregaciones->execute();

    // ---ESTABLECEMOS EL ANCHO DE LAS COLUMNAS---
    foreach ($columnWidths as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    $INDEX = 2;
    while ($row_requisicion_devolucion = $stmt_requisiciones_agregaciones->fetch(PDO::FETCH_ASSOC)) {
        $idReqAgr = $row_requisicion_devolucion["id"];
        $idProdFin = $row_requisicion_devolucion["idProdFin"];
        $desProdAgrMot = $row_requisicion_devolucion["desProdAgrMot"];

        unset($row_requisicion_devolucion['id']);

        $resultRequisicion = array(
            "header" => [],
            "tipoDato" => [],
            "data" => []
        );
        array_push($resultRequisicion["data"], $row_requisicion_devolucion);
        $resultRequisicion["header"] = [
            "ID", "Correlativo", "Motivo", "EMAPROD",
            "Presentación", "Medida", "Estado",
            "Fecha completo", "Fecha creado"
        ];
        $resultRequisicion["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto", "texto"];

        // ----HEADER CON FORMATO DE LA REQUISICION----
        foreach ($resultRequisicion["header"] as $columnIndex => $header) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}{$INDEX}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('eab676');

            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}{$INDEX}")->getFont()->setBold(true);

            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}{$INDEX}", $header);
        }

        // ----TIPO DE DATOS PARA LA REQUISICION----
        $SIZE_DATA = sizeof($resultRequisicion["data"]) + $INDEX;
        $START_TYPE = $INDEX + 1;
        foreach ($resultRequisicion["tipoDato"] as $columnIndex => $tipoDato) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
            if ($tipoDato === "numero") {
                $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA}")->getNumberFormat()->setFormatCode('0.000');
            }
        }

        //----MOSTRAMOS LA DATA----
        $row = $INDEX + 1;
        $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
        foreach ($resultRequisicion["data"] as $rowData) {
            $columnNames = array_keys($rowData);
            foreach ($columnNames as $columnIndex => $value) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
                $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
            }
            $row++;
        }

        //----MOSTRAMOS INFORMACION DEL DETALLE----
        $resultRequisicionDetalle = array(
            "header" => [],
            "tipoDato" => [],
            "data" => []
        );
        $resultRequisicionDetalle["header"] = ["ID", "Motivo", "SIIGO", "EMAPROD", "Producto", "Medida", "Cantidad", "Completo", "Fecha creación"];
        $resultRequisicionDetalle["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "texto", "numero", "texto", "texto"];

        $sql_select_requisicion_agregacion_detalle =
            "SELECT
        $idProdFin AS idProdFin,
        '$desProdAgrMot' AS desProdAgrMot,
        pt.codProd,
        pt.codProd2,
        pt.nomProd,
        me.simMed,
        rad.canReqAgrDet,
        CASE 
            WHEN rad.esComReqAgrDet = 0 THEN 'NO'
            ELSE 'SI'
        END AS esComReqAgrDet,
        rad.fecCreReqAgrDet
        FROM requisicion_agregacion_detalle AS rad
        JOIN producto AS pt ON pt.id = rad.idProdt
        JOIN medida AS me ON me.id = pt.idMed
        WHERE rad.idReqAgr = ?";
        $stmt_select_requisicion_agregacion_detalle = $pdo->prepare($sql_select_requisicion_agregacion_detalle);
        $stmt_select_requisicion_agregacion_detalle->bindParam(1, $idReqAgr, PDO::PARAM_INT);
        $stmt_select_requisicion_agregacion_detalle->execute();
        $resultRequisicionDetalle["data"] = $stmt_select_requisicion_agregacion_detalle->fetchAll(PDO::FETCH_ASSOC);

        //----ESTABLECEMOS EL HEADER DEL DETALLE----
        foreach ($resultRequisicionDetalle["header"] as $columnIndex => $header) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}{$row}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}{$row}")->getFont()->setBold(true);

            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}{$row}", $header);
        }

        //----ESTABLECEMOS LOS TIPOS DE DATOS----
        $SIZE_DATA_DETALLE = sizeof($resultRequisicionDetalle["data"]) + $row;
        $START_TYPE = $row + 1;
        foreach ($resultRequisicionDetalle["tipoDato"] as $columnIndex => $tipoDato) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA_DETALLE}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
            if ($tipoDato === "numero") {
                $sheet->getStyle("{$columnLetter}{$START_TYPE}:{$columnLetter}{$SIZE_DATA_DETALLE}")->getNumberFormat()->setFormatCode('0.000');
            }
        }

        $row_detalle = $row + 1;
        //----MOSTRAMOS LA DATA DEL DETALLE----
        foreach ($resultRequisicionDetalle["data"] as $rowData) {
            $columnNames = array_keys($rowData);
            foreach ($columnNames as $columnIndex => $value) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
                $sheet->setCellValue("{$columnLetter}{$row_detalle}", $rowData[$value]);
            }
            $row_detalle++;
        }

        $INDEX = $row_detalle + 1;
    }
}
// funcion para mostrar detalle de salida de materia prima
function sheetDatosRequisicionMateriasPrimas(PDO $pdo, int $idLotProd, Spreadsheet $spreadsheet)
{
    // primero debemos consultar la requisicion de lote origen
    // creamos la hoja de calculo
    $sheet = $spreadsheet->createSheet();
    $sheet->setTitle('Datos materias primas');

    $result = array(
        "header" => [],
        "columnWidths" => [],
        "tipoDato" => [],
        "data" => []
    );
    $result["header"] = ["Cod. Entrada", "EMAPROD", "Producto", "Medida", "Estado", "Cantidad", "Fecha salida"];
    $result["tipoDato"] = ["texto", "texto", "texto", "texto", "texto", "numero", "texto"];
    $result["columnWidths"] = [25, 12, 80, 10, 15, 12, 20];

    $sql_select_produccion = 
    "SELECT idReqLot FROM produccion
    WHERE id = ?";
    $stmt_select_produccion = $pdo->prepare($sql_select_produccion);
    $stmt_select_produccion->bindParam(1, $idLotProd, PDO::PARAM_INT);
    $stmt_select_produccion->execute();

    $row_requisicion_lote = $stmt_select_produccion->fetch(PDO::FETCH_ASSOC);

    $detalle_salidas = array();
    $sql_salida_stock = 
    "SELECT
    es.codEntSto,
    p.codProd2,
    p.nomProd,
    me.simMed,
    rde.desReqDetEst,
    ss.canSalStoReq,
    ss.fecSalStoReq
    FROM salida_stock AS ss
    JOIN entrada_stock AS es ON es.id = ss.idEntSto
    JOIN producto AS p ON p.id = ss.idProdt
    JOIN medida AS me ON me.id = p.idMed
    JOIN requisicion_detalle AS rd ON rd.id = ss.idReqDet
    JOIN requisicion_detalle_estado AS rde ON rde.id = rd.idReqDetEst
    WHERE ss.idReq = ?";
    $stmt_salida_stock = $pdo->prepare($sql_salida_stock);
    $stmt_salida_stock->bindParam(1, $row_requisicion_lote["idReqLot"], PDO::PARAM_INT);
    $stmt_salida_stock->execute();
    $detalle_salidas = $stmt_salida_stock->fetchAll(PDO::FETCH_ASSOC);
    // print_r($detalle_salidas);

    // ---ESTABLECEMOS EL ANCHO DE LAS COLUMNAS---
    foreach ($result["columnWidths"] as $columnIndex => $width) {
        $sheet->getColumnDimensionByColumn($columnIndex + 1)->setWidth($width);
    }

    $START_FILA_REQUISICION_MATERIA_PRIMA = 2;
    // ----ESTABLECEMOS ENCABEZADOS CON FORMATOS----
    foreach ($result["header"] as $columnIndex => $header) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);

        // Dar color al fondo del encabezado
        $sheet->getStyle("{$columnLetter}{$START_FILA_REQUISICION_MATERIA_PRIMA}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('c7cdd6');

        // Poner el texto en negrita
        $sheet->getStyle("{$columnLetter}{$START_FILA_REQUISICION_MATERIA_PRIMA}")->getFont()->setBold(true);

        // Establecer el valor en la celda
        $sheet->setCellValue("{$columnLetter}{$START_FILA_REQUISICION_MATERIA_PRIMA}", $header);
    }

    // ----ESTABLECEMOS TIPOS DE DATOS----
    $START_TYPE_VARIABLE_REQUISICION = $START_FILA_REQUISICION_MATERIA_PRIMA + 1;
    $END_TYPE_VARIABLE_REQUISICION = $START_FILA_REQUISICION_MATERIA_PRIMA + sizeof($detalle_salidas);
    foreach ($result["tipoDato"] as $columnIndex => $tipoDato) {
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
        $sheet->getStyle("{$columnLetter}{$START_TYPE_VARIABLE_REQUISICION}:{$columnLetter}{$END_TYPE_VARIABLE_REQUISICION}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
        if ($tipoDato === "numero") {
            $sheet->getStyle("{$columnLetter}{$START_TYPE_VARIABLE_REQUISICION}:{$columnLetter}{$END_TYPE_VARIABLE_REQUISICION}")->getNumberFormat()->setFormatCode('0.000');
        }
    }

    // ----MOSTRAMOS LOS DATOS DE REQUISICION DE MATERIA PRIMA----
    $row = 3;
    $columnIndex = 0;  // Asegurémonos de que $columnIndex se inicialice en algún lugar
    foreach ($detalle_salidas as $rowData) {
        $columnNames = array_keys($rowData);
        foreach ($columnNames as $columnIndex => $value) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->setCellValue("{$columnLetter}{$row}", $rowData[$value]);
        }
        $row++;
    }

}