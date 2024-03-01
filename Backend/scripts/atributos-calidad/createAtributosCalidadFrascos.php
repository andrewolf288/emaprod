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
        1. Peso promedio (1) -> 3 -> EVALUACION
        2. Altura (1) -> 3 -> EVALUACION
        3. Boca externa (1) -> 3 -> EVALUACION
        4. Boca interna (1) -> 3 -> EVALUACION
        5. % Burbujas (1) -> 4 -> DEFECTOS
        6. % Rugocidades (1) -> 4 -> DEFECTOS
        7. % Puntos negros (1) -> 4 -> DEFECTOS
        8. % Deforme (1) -> 4 -> DEFECTOS
    */
    $productoA = "260801";
    $productoB = "260802";
    $productoC = "260805";

    $sql_select_producto =
        "SELECT id, codProd2 FROM producto 
    WHERE codProd2 = ? OR codProd2 = ? OR codProd2 = ?";
    $stmt_select_producto = $pdo->prepare($sql_select_producto);
    $stmt_select_producto->bindParam(1, $productoA, PDO::PARAM_INT);
    $stmt_select_producto->bindParam(2, $productoB, PDO::PARAM_INT);
    $stmt_select_producto->bindParam(3, $productoC, PDO::PARAM_INT);
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
            ['Peso promedio', 1, '', 3, 'EVALUACION'],
            ['Altura', 1, '', 3, 'EVALUACION'],
            ['Boca externa', 1, '', 3, 'EVALUACION'],
            ['Boca interna', 1, '', 3, 'EVALUACION'],
            ['% Burbujas', 1, '', 4, 'DEFECTOS'],
            ['% Rugocidades', 1, '', 4, 'DEFECTOS'],
            ['% Puntos negros', 1, '', 4, 'DEFECTOS'],
            ['% Deforme', 1, '', 4, 'DEFECTOS'],
        ];

        foreach ($atributos_calidad as $atributo) {
            $stmt_create_atributos_calidad->execute(array_merge([$idProdt], $atributo));
        }
    }
}
