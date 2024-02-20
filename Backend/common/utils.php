<?php
function getStartEndDateNow()
{
    $inicio = date("Y-m-01");
    $fin =  date("Y-m-t");
    return [$inicio, $fin];
}

function getTodayDateNow()
{
    $inicio = date("Y-m-d");
    $fin =  date("Y-m-d");
    return [$inicio, $fin];
}

function esBisiesto($year)
{
    $yearValue = intval($year);
    return $yearValue % 400 === 0
        ? true
        : ($yearValue % 100 === 0
            ? false
            : $yearValue % 4 === 0);
}

function letraAnio($fecha)
{
    $fechaExtraida = explode(" ", $fecha, 2)[0];
    $fechaExtraida = explode("-", $fechaExtraida);
    $anio = intval($fechaExtraida[0]);
    $mes = intval($fechaExtraida[1]);
    $dia = intval($fechaExtraida[2]);

    $unidades = $anio % 10;
    $letraAlfabeto = "";
    switch ($unidades) {
        case 1:
            $letraAlfabeto = "A";
            break;
        case 2:
            $letraAlfabeto = "B";
            break;
        case 3:
            $letraAlfabeto = "C";
            break;
        case 4:
            $letraAlfabeto = "D";
            break;
        case 5:
            $letraAlfabeto = "E";
            break;
        case 6:
            $letraAlfabeto = "F";
            break;
        case 7:
            $letraAlfabeto = "G";
            break;
        case 8:
            $letraAlfabeto = "H";
            break;
        case 9:
            $letraAlfabeto = "I";
            break;
        case 0:
            $letraAlfabeto = "J";
            break;
    }
    return $letraAlfabeto;
}

function DiaJuliano($fecha)
{
    $fechaExtraida = explode(" ", $fecha, 2)[0];
    $fechaExtraida = explode("-", $fechaExtraida);
    $anio = intval($fechaExtraida[0]);
    $mes = intval($fechaExtraida[1]);
    $dia = intval($fechaExtraida[2]);

    // Comprobamos si es año bisiesto
    $feb = 28;
    if (esBisiesto($anio)) {
        $feb = 29;
    }

    $meses = [31, $feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    $diaJuliano = 0;
    for ($i = 1; $i <= $mes; $i++) {
        if ($i === $mes) {
            $diaJuliano += $dia;
        } else {
            $diaJuliano += $meses[$i - 1];
        }
    }

    $diaJulianoToString = strval($diaJuliano);

    return strlen($diaJulianoToString) === 1
        ? "00{$diaJulianoToString}"
        : (strlen($diaJulianoToString) === 2
            ? "0{$diaJulianoToString}"
            : $diaJulianoToString);
}

function obtenerDiaJulianoDynamic($fecha = "")
{
    if (empty($fecha)) {
        $fecha = date('Y-m-d');
    }

    $timestamp = strtotime($fecha);  // Convierte la fecha a un timestamp Unix
    $numeroDelDia = date('z', $timestamp) + 1;  // 'z' devuelve el día del año (0-365), sumamos 1 porque queremos que sea 1-366.
    return $numeroDelDia;
}

// obtener dia juliano de la fecha actual
function obtenerDiaJulianoActual()
{
    // Obtener el día del año (de 0 a 365) para la fecha actual
    $dia_del_anio = date('z');
    // Agregar ceros a la izquierda si es necesario
    $dia_juliano = sprintf('%03d', $dia_del_anio + 1); // Sumar 1 porque el conteo empieza desde 0
    return $dia_juliano;
}

// obtener letra correspondiente al año actual
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
