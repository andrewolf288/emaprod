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

    $producto = $data["producto"];
    $fechaDesde = $data["fechaDesde"];
    $fechaHasta = $data["fechaHasta"];

    if (empty($fechaDesde)) {
        // inicio de año
        $fechaDesde = date('Y-01-01');
    }
    if (empty($fechaHasta)) {
        // fin de año
        $fechaHasta = date('Y-12-31');
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
    // $grupos_plantilla = array_values(array_unique(array_column($plantilla_producto, 'labGruAtr')));
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
            "ancho" => 72,
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
                        // "columnas" => array($nomProdAtr)
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
                        // "columnas" => $arrOpcProdAtr
                        "columnas" => $formatOpciones
                    );
                }
            } else {
                // si no es de opcion multiple
                if ($idTipProdAtr != 6) {
                    $grupos_plantilla[$grupo] = array(
                        "tipo" => "grupo",
                        "numero_columnas" => 1,
                        // "columnas" => array($nomProdAtr)
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
                        // "columnas" => $arrOpcProdAtr
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
                    // array_push($grupos_plantilla[$grupo]["columnas"], array($opcion => array(
                    //     "formato" => "texto"
                    // )));
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

    print_r($grupos_plantilla);

    /* ************************* MAÑANA CORREGIMOS ESTO ***************************** */

    // DIBUJAMOS EL ENCABEZADO
    // $columnIndex = 1;
    // $filaInicio = 1;
    // $anchoFijo = 14;

    // foreach ($grupos_plantilla as $clave => $valor) {
    //     $tipo = $valor["tipo"];
    //     $numero_columnas = $valor["numero_columnas"];
    //     $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex);
    //     $nextFila = $filaInicio + 1;

    //     if ($tipo === "individual") {
    //         $ancho = $valor["ancho"];
    //         $sheet->mergeCells("{$columnLetter}{$filaInicio}:{$columnLetter}{$nextFila}");
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setWrapText(true);
    //         $sheet->getColumnDimensionByColumn($columnIndex)->setWidth($ancho);
    //         // Dar color al fondo del encabezado
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('BFBFBF');
    //         // Poner el texto en negrita
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFont()->setBold(true);
    //         // Poner borde
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}:{$columnLetter}{$nextFila}")->applyFromArray($styleArray);
    //         // Establecer el valor en la celda
    //         $sheet->setCellValue("{$columnLetter}{$filaInicio}", $clave);
    //         $columnIndex++;
    //     } else {
    //         $ancho = $valor["numero_columnas"] * $anchoFijo;
    //         $columnLetterMerge = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex + $valor["numero_columnas"] - 1);
    //         $sheet->mergeCells("{$columnLetter}{$filaInicio}:{$columnLetterMerge}{$filaInicio}");
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getAlignment()->setWrapText(true);
    //         $sheet->getColumnDimensionByColumn($columnIndex)->setWidth($ancho);
    //         // Dar color al fondo del encabezado
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('BFBFBF');
    //         // Poner el texto en negrita
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}")->getFont()->setBold(true);
    //         // Poner borde
    //         $sheet->getStyle("{$columnLetter}{$filaInicio}:{$columnLetterMerge}{$filaInicio}")->applyFromArray($styleArray);
    //         // Establecer el valor en la celda
    //         $sheet->setCellValue("{$columnLetter}{$filaInicio}", $clave);

    //         foreach ($valor["columnas"] as $valorColumna) {
    //             $sheet->getStyle("{$columnLetter}{$nextFila}")->getAlignment()->setHorizontal(PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    //             $sheet->getStyle("{$columnLetter}{$nextFila}")->getAlignment()->setVertical(PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
    //             $sheet->getStyle("{$columnLetter}{$nextFila}")->getAlignment()->setWrapText(true);
    //             $sheet->getColumnDimensionByColumn($columnIndex)->setWidth($anchoFijo);
    //             // Dar color al fondo del encabezado
    //             $sheet->getStyle("{$columnLetter}{$nextFila}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setRGB('BFBFBF');
    //             // Poner el texto en negrita
    //             $sheet->getStyle("{$columnLetter}{$nextFila}")->getFont()->setBold(true);
    //             // Poner borde
    //             $sheet->getStyle("{$columnLetter}{$nextFila}")->applyFromArray($styleArray);
    //             // Establecer el valor en la celda
    //             $sheet->setCellValue("{$columnLetter}{$nextFila}", $valorColumna);
    //             $columnIndex++;
    //             $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnIndex);
    //         }
    //     }
    // }

    /* ****************************************************** */

    // debemos traer todas las entradas de calidad correspondientes
    // $sql_entradas_calidad =
    //     "SELECT
    // ec.id,
    // ec.idEnt,
    // DATE(es.fecEntSto) AS fecEntSto,
    // pt.nomProd,
    // pt.codProd2,
    // es.canTotEnt,
    // DATE(es.fecvenEntSto) AS fecvenEntSto,
    // ec.idEntCalEst,
    // ece.desEntCalEst,
    // ec.idResEntCal,
    // enc.nomEncCal,
    // ec.obsAccEntCal,
    // ec.fecCreEntCal,
    // ec.fecActEntCal
    // FROM entrada_calidad AS ec
    // JOIN entrada_stock AS es ON es.id = ec.idEnt
    // JOIN proveedor AS pv ON pv.id = es.idProv
    // JOIN producto AS pt ON pt.id = es.idProd
    // LEFT JOIN entrada_calidad_estado AS ece ON ece.id = ec.idEntCalEst
    // LEFT JOIN encargado_calidad AS enc ON enc.id = ec.idResEntCal
    // WHERE es.idProd = ? AND es.fecEntSto BETWEEN '$fechaDesde' AND '$fechaHasta'";
    // $stmt_entradas_calidad = $pdo->prepare($sql_entradas_calidad);
    // $stmt_entradas_calidad->bindParam(1, $producto, PDO::PARAM_INT);
    // $stmt_entradas_calidad->execute();

    // Guardar el archivo Excel
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
