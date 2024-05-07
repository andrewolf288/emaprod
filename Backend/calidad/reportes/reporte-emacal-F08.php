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

    $fechaDesde = $data["fechaInicio"];
    $fechaHasta = $data["fechaFin"];
    $producto=138;

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

    // Hacemos una consulta de los atributos de calidad del producto en especifico
    $sql_select_atributos_calidad_producto =
        "SELECT
    pac.id,
    pac.idProdt,
    pac.nomProdAtr,
    pac.idTipProdAtr,
    tpa.nomTipAtrCal,
    pac.opcProdAtr,
    pac.codGruAtr,
    pac.labGruAtr
    FROM producto_atributo_calidad AS pac
    JOIN tipo_producto_atributo AS tpa ON tpa.id = pac.idTipProdAtr
    WHERE pac.idProdt = ?";
    $stmt_select_atributos_calidad_producto = $pdo->prepare($sql_select_atributos_calidad_producto);
    $stmt_select_atributos_calidad_producto->bindParam(1, $producto, PDO::PARAM_INT);
    $stmt_select_atributos_calidad_producto->execute();

    $plantilla_producto = $stmt_select_atributos_calidad_producto->fetchAll(PDO::FETCH_ASSOC);

    // debemos identificar los grupos
    $grupos_plantilla = array(
        "FECHA ENTRADA" => array(
            "tipo" => "individual",
            "numero_columnas" => 1,
            "ancho" => 17,
            "formato" => "Texto"
        ),
        "PRODUCTO" => array(
            "tipo" => "individual",
            "numero_columnas" => 1,
            "ancho" => 47,
            "formato" => "Texto"
        ),
        "PROVEEDOR" => array(
            "tipo" => "individual",
            "numero_columnas" => 1,
            "ancho" => 35,
            "formato" => "Texto"
        ),
        "CODIGO DE PRODUCTO" => array(
            "tipo" => "individual",
            "numero_columnas" => 1,
            "ancho" => 18,
            "formato" => "Texto"
        ),
        "CANTIDAD" => array(
            "tipo" => "individual",
            "numero_columnas" => 1,
            "ancho" => 14,
            "formato" => "Numerico"
        ),
        "FECHA VENCIMIENTO" => array(
            "tipo" => "individual",
            "numero_columnas" => 1,
            "ancho" => 17,
            "formato" => "Texto"
        )
    );

    // recorremos los atributos de calidad
    foreach ($plantilla_producto as $plantilla) {
        $grupo = $plantilla['labGruAtr'];
        $idTipProdAtr = $plantilla['idTipProdAtr']; // para evaluar si es un 6
        $nomProdAtr = $plantilla['nomProdAtr'];
        $nomTipAtrCal = $plantilla['nomTipAtrCal'];

        // si no fue agregado al diccionario
        if (!isset($grupos_plantilla[$grupo])) {
            if ($grupo === null) {
                if ($idTipProdAtr != 6) {
                    $grupos_plantilla["GENERAL"] = array(
                        "tipo" => "grupo",
                        "numero_columnas" => 1,
                        "columnas" => array(
                            $nomProdAtr => array(
                                "formato" => $nomTipAtrCal,
                            )
                        )
                    );
                }
                // si es de opcion multiple
                else {
                    $arrOpcProdAtr = explode(",", $plantilla['opcProdAtr']);
                    $formatOpciones = array();
                    foreach ($arrOpcProdAtr as $valorOpcionArr) {
                        $formatOpciones[$valorOpcionArr] = array(
                            "formato" => "Texto"
                        );
                    }
                    $grupos_plantilla["GENERAL"] = array(
                        "tipo" => "grupo",
                        "numero_columnas" => count($arrOpcProdAtr),
                        "columnas" => $formatOpciones
                    );
                }
            } else {
                // si no es de opcion multiple
                if ($idTipProdAtr != 6) {
                    $grupos_plantilla[$grupo] = array(
                        "tipo" => "grupo",
                        "numero_columnas" => 1,
                        "columnas" => array(
                            $nomProdAtr => array(
                                "formato" => $nomTipAtrCal,
                            )
                        )
                    );
                }
                // si es de opcion multiple
                else {
                    $arrOpcProdAtr = explode(",", $plantilla['opcProdAtr']);
                    $formatOpciones = array();
                    foreach ($arrOpcProdAtr as $valorOpcionArr) {
                        $formatOpciones[$valorOpcionArr] = array(
                            "formato" => "Texto"
                        );
                    }
                    $grupos_plantilla[$grupo] = array(
                        "tipo" => "grupo",
                        "numero_columnas" => count($arrOpcProdAtr),
                        "columnas" => $formatOpciones
                    );
                }
            }
        }
        // si fue agregado al diccionario
        else {
            // si no es de opcion multiple
            if ($idTipProdAtr != 6) {
                $grupos_plantilla[$grupo]["numero_columnas"] = $grupos_plantilla[$grupo]["numero_columnas"] + 1;
                $grupos_plantilla[$grupo]["columnas"][$nomProdAtr] = array(
                    "formato" => $nomTipAtrCal
                );
            }
            // si es de opcion multiple
            else {
                $arrOpcProdAtr = explode(",", $plantilla['opcProdAtr']);
                $grupos_plantilla[$grupo]["numero_columnas"] = $grupos_plantilla[$grupo]["numero_columnas"] + count($arrOpcProdAtr);
                foreach ($arrOpcProdAtr as $opcion) {
                    $grupos_plantilla[$grupo]["columnas"][$opcion] = array(
                        "formato" => "Texto"
                    );
                }
            }
        }
    }

    // agregamos finalmente los datos de entrada de calidad
    $grupos_plantilla["CONFORMIDAD"] =  array(
        "tipo" => "individual",
        "numero_columnas" => 1,
        "ancho" => 21,
        "formato" => "Texto"
    );
    $grupos_plantilla["RESPONSABLE DE LA EVALUACION"] =  array(
        "tipo" => "individual",
        "numero_columnas" => 1,
        "ancho" => 30,
        "formato" => "Texto"
    );
    $grupos_plantilla["OBSERVACIONES/ACCIONES CORRECTIVAS"] =  array(
        "tipo" => "individual",
        "numero_columnas" => 1,
        "ancho" => 50,
        "formato" => "Texto"
    );

    // ************ PRIMERO DEBEMOS DIBUJAR EL ENCABEZADO ***************
    // informacion dle producto
    $sql_datos_producto =
        "SELECT idCla, idSubCla, nomProd 
    FROM producto WHERE id = $producto";
    $stmt_datos_producto = $pdo->prepare($sql_datos_producto);
    $stmt_datos_producto->execute();
    $row_datos_producto = $stmt_datos_producto->fetch(PDO::FETCH_ASSOC);
    $idCla = $row_datos_producto["idCla"];
    $idSubCla = $row_datos_producto["idSubCla"];
    $nomProd = $row_datos_producto["nomProd"];
    // informacion de reporte de calidad
    $sql_atributos_reporte_calidad =
        "SELECT 
    rc.codRepCal,
    rc.titRepCal,
    rc.fecEmRepCal,
    rc.ediReqCal,
    rc.fecRevReqCal
    FROM reporte_calidad_categoria AS rcc
    JOIN reporte_calidad AS rc ON rc.id = rcc.idRepCal
    WHERE rcc.idCla = $idCla";
    if ($idSubCla == 1) {
        $sql_atributos_reporte_calidad .= " AND idSubCla = $idSubCla";
    }
    $stmt_atrbiutos_reporte_calidad = $pdo->prepare($sql_atributos_reporte_calidad);
    $stmt_atrbiutos_reporte_calidad->execute();
    $row_atrbiutos_reporte_calidad = $stmt_atrbiutos_reporte_calidad->fetch(PDO::FETCH_ASSOC);
    if ($row_atrbiutos_reporte_calidad) {
        $codRepCal = $row_atrbiutos_reporte_calidad["codRepCal"];
        $titRepCal = $row_atrbiutos_reporte_calidad["titRepCal"];
        $fecEmRepCal = "Emisión: " . $row_atrbiutos_reporte_calidad["fecEmRepCal"];
        $ediReqCal = "Edición: " . $row_atrbiutos_reporte_calidad["ediReqCal"];
        $fecRevReqCal = "Revisión: " . $row_atrbiutos_reporte_calidad["fecRevReqCal"];
        $array_leyenda = array($codRepCal, $fecEmRepCal, $ediReqCal, $fecRevReqCal, "Página 1 de 1");
    }

    $filaInicio = 1;
    $filaFinEncabezado = 5;
    $totalColumnas = 0;
    foreach ($grupos_plantilla as $grupo) {
        $totalColumnas += $grupo["numero_columnas"];
    }

    // IMAGEN DEL LOGO
    $sheet->mergeCells("A{$filaInicio}:B{$filaFinEncabezado}");
    $sheet->getStyle("A{$filaInicio}:B{$filaFinEncabezado}")->applyFromArray($styleArray);
    $imagePath = './logo-oficial.png';
    $drawing = new Drawing();
    $drawing->setName('Logo EMARANSAC');
    $drawing->setDescription('Logo de la empresa EMARANSAC');
    $drawing->setPath($imagePath);
    $drawing->setCoordinates('A1');
    $drawing->setHeight(100);
    $drawing->setWorksheet($sheet);

    // TITULO DEL REPORTE
    $letterFinTitulo = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($totalColumnas - 1);
    $sheet->mergeCells("C{$filaInicio}:$letterFinTitulo{$filaFinEncabezado}");
    $sheet->getStyle("C{$filaInicio}:$letterFinTitulo{$filaFinEncabezado}")->applyFromArray($styleArray);
    $sheet->setCellValue("C{$filaInicio}", $titRepCal);
    $sheet->getStyle('C1')->getFont()->setName('Arial')->setSize(16)->setBold(true);
    $sheet->getStyle('C1')->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle('C1')->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

    // INFORMACION DE REPORTE EMACAL
    $letterFinLeyenda = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($totalColumnas);
    for ($i = 0; $i < count($array_leyenda); $i++) {
        $valueRow = $i + 1;
        $sheet->mergeCells("$letterFinLeyenda{$valueRow}");
        $sheet->getStyle("$letterFinLeyenda{$valueRow}")->applyFromArray($styleArray);
        $sheet->setCellValue("$letterFinLeyenda{$valueRow}", $array_leyenda[$i]);
        if ($valueRow == 1) {
            $sheet->getStyle("$letterFinLeyenda{$valueRow}")->getFont()->setBold(true);
        }
    }

    // **************** COLOCAMOS LA DESCRIPCION DE REVISION *************
    $sql_descripcion_revision_producto =
        "SELECT desRevCalDet, porAprRevCalDet
    FROM revision_calidad_detalle_producto
    WHERE idProdt = $producto";
    $stmt_descripcion_revision_producto = $pdo->prepare($sql_descripcion_revision_producto);
    $stmt_descripcion_revision_producto->execute();
    $row_descripcion_revision_producto = $stmt_descripcion_revision_producto->fetch(PDO::FETCH_ASSOC);
    if ($row_descripcion_revision_producto) {
        $filaFinEncabezado = $filaFinEncabezado + 2;
        $desRevCalDet = $row_descripcion_revision_producto["desRevCalDet"];
        $porAprRevCalDet = $row_descripcion_revision_producto["porAprRevCalDet"];

        // colocamos el nombre del producto
        $sheet->setCellValue("A{$filaFinEncabezado}", "PRODUCTO:");
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
        $sheet->setCellValue("B{$filaFinEncabezado}", $nomProd);
        // colocamos la descripcion
        $filaFinEncabezado++;
        $sheet->setCellValue("A{$filaFinEncabezado}", "DESCRIPCIÓN:");
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
        $sheet->setCellValue("B{$filaFinEncabezado}", $desRevCalDet);
        // colocamos el porcentaje de aprobacion
        $filaFinEncabezado++;
        $sheet->setCellValue("A{$filaFinEncabezado}", "PORCENTAJE DE APROBACION:");
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
        $sheet->getStyle("A{$filaFinEncabezado}")->getAlignment()->setWrapText(true);
        $sheet->setCellValue("B{$filaFinEncabezado}", $porAprRevCalDet);
        $sheet->getStyle("B{$filaFinEncabezado}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
    }

    // ******************* DIBUJAMOS EL HEADER DEL REPORTE ***************
    $columnIndex = 1;
    $filaInicio = $filaFinEncabezado + 2;
    $anchoFijo = 14;

    foreach ($grupos_plantilla as $clave => $valor) {
        $tipo = $valor["tipo"];
        $numero_columnas = $valor["numero_columnas"];
        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex);
        $nextFila = $filaInicio + 1;

        if ($tipo === "individual") {
            $ancho = $valor["ancho"];
            $sheet->mergeCells("{$columnLetter}{$filaInicio}:{$columnLetter}{$nextFila}");
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setWrapText(true);
            $sheet->getColumnDimensionByColumn($columnIndex)->setWidth($ancho);
            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('BFBFBF');
            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFont()->setBold(true);
            // Poner borde
            $sheet->getStyle("{$columnLetter}{$filaInicio}:{$columnLetter}{$nextFila}")->applyFromArray($styleArray);
            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}{$filaInicio}", $clave);
            $grupos_plantilla[$clave]["columna"] = $columnLetter;
            $columnIndex++;
        } else {
            $ancho = $valor["numero_columnas"] * $anchoFijo;
            $columnLetterMerge = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + $valor["numero_columnas"] - 1);
            $sheet->mergeCells("{$columnLetter}{$filaInicio}:{$columnLetterMerge}{$filaInicio}");
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setWrapText(true);
            $sheet->getColumnDimensionByColumn($columnIndex)->setWidth($ancho);
            // Dar color al fondo del encabezado
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('BFBFBF');
            // Poner el texto en negrita
            $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFont()->setBold(true);
            // Poner borde
            $sheet->getStyle("{$columnLetter}{$filaInicio}:{$columnLetterMerge}{$filaInicio}")->applyFromArray($styleArray);
            // Establecer el valor en la celda
            $sheet->setCellValue("{$columnLetter}{$filaInicio}", $clave);

            foreach ($valor["columnas"] as $claveColumna => $valueColumna) {
                $sheet->getStyle("{$columnLetter}{$nextFila}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("{$columnLetter}{$nextFila}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                $sheet->getStyle("{$columnLetter}{$nextFila}")->getAlignment()->setWrapText(true);
                $sheet->getColumnDimensionByColumn($columnIndex)->setWidth($anchoFijo);
                // Dar color al fondo del encabezado
                $sheet->getStyle("{$columnLetter}{$nextFila}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('BFBFBF');
                // Poner el texto en negrita
                $sheet->getStyle("{$columnLetter}{$nextFila}")->getFont()->setBold(true);
                // Poner borde
                $sheet->getStyle("{$columnLetter}{$nextFila}")->applyFromArray($styleArray);
                // Establecer el valor en la celda
                $sheet->setCellValue("{$columnLetter}{$nextFila}", $claveColumna);
                $grupos_plantilla[$clave]["columnas"][$claveColumna]["columna"] = $columnLetter;
                $columnIndex++;
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex);
            }
        }
    }

    // *********** RECORREMOS LOS DATOS DE CALIDAD PARA COMPLETAR EL REPORTE ************
    $filaIndex = $filaInicio + 2;

    // debemos traer todas las entradas de calidad correspondientes
    $esMatPri = 1; // es materia prima
    $idAjiPanca = 127;
    $idAjiVerde = 128;
    $idAjo = 129;
    $idTomate = 130;
    $idCulantro = 131;
    $idEspinaca = 132;
    $idPerejil = 133;
    $idAlbahaca = 134;
    $idRocoto = 135;

    $sql_entradas_calidad =
        "SELECT
    ec.id,
    ec.idEnt,
    DATE_FORMAT(es.fecEntSto, '%d/%m/%Y') AS fecEntSto,
    pt.nomProd,
    es.canTotEnt,
    pv.nomProv,
    es.codEntSto,
    DATE_FORMAT(es.fecvenEntSto, '%d/%m/%Y') AS fecvenEntSto,
    ec.idEntCalEst,
    ece.desEntCalEst,
    ec.idResEntCal,
    enc.nomEncCal,
    ec.obsAccEntCal,
    ec.fecCreEntCal,
    ec.fecActEntCal
    FROM entrada_calidad AS ec
    JOIN entrada_stock AS es ON es.id = ec.idEnt
    JOIN proveedor AS pv ON pv.id = es.idProv
    JOIN producto AS pt ON pt.id = es.idProd
    LEFT JOIN entrada_calidad_estado AS ece ON ece.id = ec.idEntCalEst
    LEFT JOIN encargado_calidad AS enc ON enc.id = ec.idResEntCal
    WHERE pt.esMatPri = ? 
    AND (pt.id <> ? AND pt.id <> ? AND pt.id <> ? AND pt.id <> ?
    AND pt.id <> ? AND pt.id <> ? AND pt.id <> ? AND pt.id <> ? 
    AND pt.id <> ?) AND es.fecEntSto BETWEEN '$fechaDesde' AND '$fechaHasta'
    ORDER BY es.fecEntSto DESC";
    $stmt_entradas_calidad = $pdo->prepare($sql_entradas_calidad);
    $stmt_entradas_calidad->bindParam(1, $esMatPri, PDO::PARAM_BOOL);
    $stmt_entradas_calidad->bindParam(2, $idAjiPanca, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(3, $idAjiVerde, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(4, $idAjo, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(5, $idTomate, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(6, $idCulantro, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(7, $idEspinaca, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(8, $idPerejil, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(9, $idAlbahaca, PDO::PARAM_INT);
    $stmt_entradas_calidad->bindParam(10, $idRocoto, PDO::PARAM_INT);
    $stmt_entradas_calidad->execute();

    while ($row_entradas_calidad = $stmt_entradas_calidad->fetch(PDO::FETCH_ASSOC)) {
        $idEntCal = $row_entradas_calidad["id"];
        $fecEntSto = $row_entradas_calidad["fecEntSto"];
        $nomProd = $row_entradas_calidad["nomProd"];
        $nomProv = $row_entradas_calidad["nomProv"];
        $codEntSto = $row_entradas_calidad["codEntSto"];
        $canTotEnt = $row_entradas_calidad["canTotEnt"];
        $fecvenEntSto = $row_entradas_calidad["fecvenEntSto"];
        $desEntCalEst = $row_entradas_calidad["desEntCalEst"];
        $nomEncCal = $row_entradas_calidad["nomEncCal"];
        $obsAccEntCal = $row_entradas_calidad["obsAccEntCal"];

        // fecha de entrada
        $columnLetter = $grupos_plantilla["FECHA ENTRADA"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $fecEntSto);
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getNumberFormat()->setFormatCode('dd/mm/yyyy');
        // producto
        $columnLetter = $grupos_plantilla["PRODUCTO"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $nomProd);
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setWrapText(true);
        // proveedor
        $columnLetter = $grupos_plantilla["PROVEEDOR"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $nomProv);
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setWrapText(true);
        // codigo de entrada
        $columnLetter = $grupos_plantilla["CODIGO DE PRODUCTO"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $codEntSto);
        // cantidad
        $columnLetter = $grupos_plantilla["CANTIDAD"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $canTotEnt);
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getNumberFormat()->setFormatCode('0.000');
        // fecha vencimiento
        $columnLetter = $grupos_plantilla["FECHA VENCIMIENTO"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $fecvenEntSto);
        // conformidad
        $columnLetter = $grupos_plantilla["CONFORMIDAD"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", strtoupper($desEntCalEst));
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setWrapText(true);
        // responsable
        $columnLetter = $grupos_plantilla["RESPONSABLE DE LA EVALUACION"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", strtoupper($nomEncCal));
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setWrapText(true);
        // observaciones
        $columnLetter = $grupos_plantilla["OBSERVACIONES/ACCIONES CORRECTIVAS"]["columna"];
        $sheet->setCellValue("{$columnLetter}{$filaIndex}", $obsAccEntCal);
        $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setWrapText(true);

        $sql_select_atributos_calidad_entrada =
            "SELECT 
        eca.id,
        eca.idProdtAtrCal,
        eca.valEntCalAtr,
        pac.id AS idProAtrCal,
        pac.nomProdAtr,
        pac.idTipProdAtr,
        pac.opcProdAtr,
        pac.codGruAtr,
        pac.labGruAtr
        FROM entrada_calidad_atributos AS eca
        JOIN producto_atributo_calidad AS pac ON pac.id = eca.idProdtAtrCal
        WHERE eca.idEntCal = ?";
        $stmt_select_atrbituos_calidad_entrada = $pdo->prepare($sql_select_atributos_calidad_entrada);
        $stmt_select_atrbituos_calidad_entrada->bindParam(1, $idEntCal, PDO::PARAM_INT);
        $stmt_select_atrbituos_calidad_entrada->execute();

        while ($row_entrada_calidad_atributo = $stmt_select_atrbituos_calidad_entrada->fetch(PDO::FETCH_ASSOC)) {
            $labGruAtr = is_null($row_entrada_calidad_atributo["labGruAtr"]) ? "GENERAL" : $row_entrada_calidad_atributo["labGruAtr"];
            $idTipProdAtr = $row_entrada_calidad_atributo["idTipProdAtr"];
            $nomProdAtr = $row_entrada_calidad_atributo["nomProdAtr"];
            $valEntCalAtr = $row_entrada_calidad_atributo["valEntCalAtr"];

            if ($idTipProdAtr != 6) {
                $columnLetter = $grupos_plantilla[$labGruAtr]["columnas"][$nomProdAtr]["columna"];
                $format = $grupos_plantilla[$labGruAtr]["columnas"][$nomProdAtr]["formato"];

                if ($format == "Numerico") {
                    $sheet->getStyle("{$columnLetter}{$filaIndex}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_NUMBER_00);
                }
                if ($format == "Fecha") {
                    $fecha_datetime = date_create_from_format('Y-m-d H:i:s', $valEntCalAtr);
                    $fecha_formateada = $fecha_datetime->format('d/m/Y');
                    $valEntCalAtr = $fecha_formateada;
                    $sheet->getStyle("{$columnLetter}{$filaIndex}")->getNumberFormat()->setFormatCode('dd/mm/yyyy');
                } else {
                    $sheet->getStyle("{$columnLetter}{$filaIndex}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
                }

                $sheet->setCellValue("{$columnLetter}{$filaIndex}", $valEntCalAtr);
            } else {
                $opciones = explode(",", $valEntCalAtr);
                foreach ($opciones as $opcion) {
                    $columnLetter = $grupos_plantilla[$labGruAtr]["columnas"][$opcion]["columna"];
                    $sheet->setCellValue("{$columnLetter}{$filaIndex}", "X");
                    $sheet->getStyle("{$columnLetter}{$filaIndex}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
                    $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("{$columnLetter}{$filaIndex}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                }
            }
        }

        // actualizamos el index
        $filaIndex++;
    }

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
