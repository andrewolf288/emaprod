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
    $idProdt = 128; // aji verde fresco
    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_materias_primas = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_materias_primas = $pdo->prepare($sql_create_atributos_calidad_materias_primas);

    // Ejecutar la consulta preparada para la inserción con los valores específicos
    $atributos_calidad = [
        ['% MADUROS', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% VERDES', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% PUNTA VERDE', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% APLASTADOS O PODRIDOS', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['PICOR', 4, '1 (poco picante),2,3,4,5 (muy picante),No corresponte', 2, "ANALISIS FISICOQUIMICOS"],
        ['TAMAÑO MIN 7 CM', 4, 'C,LI,I', 2, 'ANALISIS FISICOQUIMICOS'],
        ['ST (°Brix)', 1, '', 2, 'ANALISIS FISICOQUIMICOS'],
        ['V°B PROD.', 4, 'Vilma,Carlos', NULL, NULL]
    ];

    foreach ($atributos_calidad as $atributo) {
        $stmt_create_atributos_calidad_materias_primas->execute(array_merge([$idProdt], $atributo));
    }
}
