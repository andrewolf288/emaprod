<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    echo obtenerDiaJulianoActual();
    echo "\n";
    echo obtenerLetraCorrespondiente();
    echo "\n";

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}

function obtenerDiaJulianoActual()
{
    // Obtener el día del año (de 0 a 365) para la fecha actual
    $dia_del_anio = date('z');
    // Agregar ceros a la izquierda si es necesario
    $dia_juliano = sprintf('%03d', $dia_del_anio + 1); // Sumar 1 porque el conteo empieza desde 0
    return $dia_juliano;
}

function obtenerLetraCorrespondiente()
{
    // Obtener el último dígito del año actual
    $ultimo_digito = substr(date('Y'), -1);

    // Definir el mapeo de dígitos a letras
    $mapeo = [
        '1' => 'A',
        '2' => 'B',
        '3' => 'C',
        '4' => 'D',
        '5' => 'E',
        '6' => 'F',
        '7' => 'G',
        '8' => 'H',
        '9' => 'I',
        '0' => 'J'
    ];

    // Obtener la letra correspondiente al último dígito del año actual
    $letra_correspondiente = $mapeo[$ultimo_digito];

    return $letra_correspondiente;
}
