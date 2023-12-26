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
    // para materiales de empaque
    /* 
        1. Certificado de calidad (3), (C,F)
        2. Lote (2)
        3. Condiciones del transporte (3) (C,I)
        4. Embalaje (4) (C,I,NC)
        5. Buen estado (4) (C,I,NC)
        6. Legibilidad (4) (C,I,NC)
    */
    $idClaEnvEnc = 26;
    $idClaAux = 25;

    $sql_select_materiales_empaque = "SELECT * FROM producto WHERE idCla = ? OR idCla = ?";
    $stmt_select_materiales_empaque = $pdo->prepare($sql_select_materiales_empaque);
    $stmt_select_materiales_empaque->bindParam(1, $idClaEnvEnc, PDO::PARAM_INT);
    $stmt_select_materiales_empaque->bindParam(2, $idClaAux, PDO::PARAM_INT);
    $stmt_select_materiales_empaque->execute();

    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_materiales_empaque = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_materiales_empaque = $pdo->prepare($sql_create_atributos_calidad_materiales_empaque);

    while ($row_materiales_empaque = $stmt_select_materiales_empaque->fetch(PDO::FETCH_ASSOC)) {
        $idProdt = $row_materiales_empaque["id"];
        echo $idProdt . "\n";

        // Ejecutar la consulta preparada para la inserción con los valores específicos
        $atributos_calidad = [
            ['Certificado de calidad', 3, 'C,F', NULL, NULL],
            ['Lote', 2, '', NULL, NULL],
            ['Condiciones del transporte', 3, 'C,I', NULL, NULL],
            ['Embalaje', 4, 'C,I,NC', 1, 'CONDICIONES DEL PRODUCTO'],
            ['Buen estado', 4, 'C,I,NC', 1, 'CONDICIONES DEL PRODUCTO'],
            ['Legibilidad', 4, 'C,I,NC', 1, 'CONDICIONES DEL PRODUCTO']
        ];

        foreach ($atributos_calidad as $atributo) {
            $stmt_create_atributos_calidad_materiales_empaque->execute(array_merge([$idProdt], $atributo));
        }
    }
}
