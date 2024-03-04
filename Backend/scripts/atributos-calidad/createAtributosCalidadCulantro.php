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
    $idProdt = 131; // CULANTRO FRESCO
    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_materias_primas = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_materias_primas = $pdo->prepare($sql_create_atributos_calidad_materias_primas);

    // Ejecutar la consulta preparada para la inserción con los valores específicos
    $atributos_calidad = [
        ['% FRESCA', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% MACHITEZ', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% CON FLORES', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['% DE IMPUREZAS', 1, '', 1, 'ANALISIS POSTCOSECHA'],
        ['TAMAÑO (MAX. 25 CM)', 4, 'C,LI,I', 1, 'ANALISIS POSTCOSECHA'],
        ['GROSOR DE TALLO', 6, '1er corte (1-2 mm),2do corte (2-3 mm),3er corte (>5 mm)', 2, "GROSOR DE TALLO"],
        ['% TALLOS', 1, '', 3, 'COMPOSICION'],
        ['% HOJAS', 1, '', 3, 'COMPOSICION'],
        ['% HUMEDAD', 1, '', 4, 'ANALISIS FISICOQUIMICOS'],
        ['ST (°Brix)', 1, '', 4, 'ANALISIS FISICOQUIMICOS'],
        ['V°B PROD.', 4, 'Vilma,Carlos', NULL, NULL]
    ];

    foreach ($atributos_calidad as $atributo) {
        $stmt_create_atributos_calidad_materias_primas->execute(array_merge([$idProdt], $atributo));
    }
}
