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
    $idProdt = 129; // AJO FRESCO
    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_materias_primas = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_materias_primas = $pdo->prepare($sql_create_atributos_calidad_materias_primas);

    // Ejecutar la consulta preparada para la inserción con los valores específicos
    $atributos_calidad = [
        ['% MADUROS', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% CON PUNTA VERDE O RAICILLA', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% APLASTADOS, PICADOS O PODRIDOS', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% IMPUREZAS (CASCARA)', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['ST (°Brix)', 1, '', 2, 'ANALISIS FISICOQUIMICOS'],
        ['PRUEBA DE ESCALDADO', 4, 'C,I,No corresponde', 2, 'ANALISIS FISICOQUIMICOS'],
        ['V°B PROD.', 4, 'Vilma,Carlos', NULL, NULL]
    ];

    foreach ($atributos_calidad as $atributo) {
        $stmt_create_atributos_calidad_materias_primas->execute(array_merge([$idProdt], $atributo));
    }
}
