<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

$message_error = "";
$description_error = "";
$result = array();
$pdo = getPDO();
$tolerancia = 0.0001;
$data = array();

if (isset($_FILES['encuadre_excel']) && $_FILES['encuadre_excel']['error'] === UPLOAD_ERR_OK) {
    //obtenemos la informacion de almacen
    $idAlmacen = isset($_POST['idAlm']) ? $_POST['idAlm'] : 0;
    // Ruta temporal del archivo subido
    $archivo_temporal = $_FILES['encuadre_excel']['tmp_name'];
    // Cargar el archivo con PhpSpreadsheet
    $archivo_excel = IOFactory::load($archivo_temporal);
    readDataEncuadre($data, $archivo_excel, "Materia Prima", $tolerancia);
    readDataEncuadre($data, $archivo_excel, "Embalajes-Auxiliares", $tolerancia);
    readDataEncuadre($data, $archivo_excel, "Promociones", $tolerancia);
    // readDataEncuadre($data, $archivo_excel, "Producto final", $tolerancia);
    print_r($data);

    // luego queda recorrer los encuadres y hacer las operaciones correspondientes

} else {
    $message_error = "Error al recibir el archivo";
    $description_error = "Error al recibir el archivo";
}

// Retornamos el resultado
$return['message_error'] = $message_error;
$return['description_error'] = $description_error;
$return['result'] = $result;
echo json_encode($return);

function readDataEncuadre(array &$datos, Spreadsheet $archivo_excel, string $nameSheet, $tolerancia){
    $hoja = $archivo_excel->getSheetByName($nameSheet);

    if ($hoja) {
        $ultima_fila = $hoja->getHighestRow();
        // Iterar sobre las filas desde la fila 2 hasta la última fila con datos
        for ($fila = 2; $fila <= $ultima_fila; $fila++) {
            $valor_G = (float) $hoja->getCell('G' . $fila)->getValue();
            $valor_H = (float) $hoja->getCell('H' . $fila)->getValue();
            $valor_G_redondeado = round($valor_G, 3);
            $valor_H_redondeado = round($valor_H, 3);

            if (abs($valor_G_redondeado - $valor_H_redondeado) > $tolerancia) {
                // Si las diferencias son mayores que la tolerancia, añadir a $diferencias
                array_push($datos, array(
                    'codProd2' => $hoja->getCell('B' . $fila)->getValue(),
                    'valorG' => $valor_G_redondeado,
                    'valorH' => $valor_H_redondeado,
                    'diferencia' => $valor_H_redondeado - $valor_G_redondeado
                ));
            }
        }
    }
}
