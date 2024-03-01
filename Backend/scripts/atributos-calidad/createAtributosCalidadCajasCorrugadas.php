<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes
// empieza en el indice 3
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    /*
        1. Ancho (1) -> 3 -> EVALUACION
        2. Largo (1) -> 3 -> EVALUACION
        3. Alto (1) -> 3 -> EVALUACION
        4. Gramaje (1) -> 3 -> EVALUACION
    */
    $codSubClaA = "2612";

    $sql_select_producto =
        "SELECT pt.id, pt.codProd2 FROM producto AS pt
        JOIN sub_clase AS sc ON sc.id = pt.idSubCla
    WHERE sc.codSubCla = ?";
    $stmt_select_producto = $pdo->prepare($sql_select_producto);
    $stmt_select_producto->bindParam(1, $codSubClaA, PDO::PARAM_STR);
    $stmt_select_producto->execute();

    // consulta de insercion de atributo
    $sql_create_atributos_calidad = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad = $pdo->prepare($sql_create_atributos_calidad);

    while ($row = $stmt_select_producto->fetch(PDO::FETCH_ASSOC)) {
        $idProdt = $row["id"];

        // Ejecutar la consulta preparada para la inserción con los valores específicos
        $atributos_calidad = [
            ['Ancho', 1, '', 3, 'EVALUACION'],
            ['Largo', 1, '', 3, 'EVALUACION'],
            ['Alto', 1, '', 3, 'EVALUACION'],
            ['Gramaje', 1, '', 3, 'EVALUACION'],
        ];

        foreach ($atributos_calidad as $atributo) {
            $stmt_create_atributos_calidad->execute(array_merge([$idProdt], $atributo));
        }
    }
}
