<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $idProdt = 130;
    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_materias_primas = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_materias_primas = $pdo->prepare($sql_create_atributos_calidad_materias_primas);

    // Ejecutar la consulta preparada para la inserción con los valores específicos
    $atributos_calidad = [
        ['Calibre', 6, 'Calibre GG (82 - 102 mm),Calibre GG (67 - 82 mm),Calibre GG (57 - 67 mm),Calibre GG (47 - 57 mm)', 1, "CALIBRE"],
        ['% Maduros', 1, '', 2, 'ANALISIS POSTCOSECHA'],
        ['% Pintones', 1, '', 2, 'ANALISIS POSTCOSECHA'],
        ['% Verdes', 1, '', 2, 'ANALISIS POSTCOSECHA'],
        ['% Cicatrisados', 1, '', 2, 'ANALISIS POSTCOSECHA'],
        ['% Sobremaduros, picados, aplastados', 1, '', 2, 'ANALISIS POSTCOSECHA'],
        ['pH', 1, '', 3, 'ANALISIS FISICOQUIMICOS'],
        ['ST (°Brix)', 1, '', 3, 'ANALISIS FISICOQUIMICOS'],
        ['V°B PROD.', 4, 'Vilma,Carlos', null, null]
    ];

    foreach ($atributos_calidad as $atributo) {
        $stmt_create_atributos_calidad_materias_primas->execute(array_merge([$idProdt], $atributo));
    }
}
