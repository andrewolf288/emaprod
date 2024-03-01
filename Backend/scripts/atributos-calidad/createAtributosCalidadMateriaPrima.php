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
    // para las materias primas
    /* 
        1. Certificado de calidad (3), (C,F)
        2. Lote (2)
        3. Fecha de producción (5)
        4. Fecha de vencimiento (5)
        5. % Humedad (1)
        6. Conformidad (3) (C,I)
    */

    $idClaMatPri = 1;
    $sql_select_materias_primas = "SELECT * FROM producto WHERE idCla = ?";
    $stmt_select_materias_primas = $pdo->prepare($sql_select_materias_primas);
    $stmt_select_materias_primas->bindParam(1, $idClaMatPri, PDO::PARAM_INT);
    $stmt_select_materias_primas->execute();

    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_materias_primas = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_materias_primas = $pdo->prepare($sql_create_atributos_calidad_materias_primas);

    while ($row_materia_prima = $stmt_select_materias_primas->fetch(PDO::FETCH_ASSOC)) {
        $idProdt = $row_materia_prima["id"];
        echo $idProdt . "\n";

        // Ejecutar la consulta preparada para la inserción con los valores específicos
        $atributos_calidad = [
            ['Certificado de calidad', 3, 'C,F', 1, 'DATOS DEL PRODUCTO'],
            ['Lote', 2, '', 1, 'DATOS DEL PRODUCTO'],
            ['Fecha de producción', 5, '', 1, 'DATOS DEL PRODUCTO'],
            ['Fecha de vencimiento', 5, '', 1, 'DATOS DEL PRODUCTO'],
            ['% Humedad', 1, '', 2, 'EVALUACIÓN FÍSICO QUÍMICO'],
        ];

        foreach ($atributos_calidad as $atributo) {
            $stmt_create_atributos_calidad_materias_primas->execute(array_merge([$idProdt], $atributo));
        }
    }
}
