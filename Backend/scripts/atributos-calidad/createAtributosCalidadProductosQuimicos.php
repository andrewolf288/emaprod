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
    // para producto químicos
    /*
        1. Integridad (3) (C,I)
        2. Buen estado (3) (C,I)
    */

    $idClaProdQui = 7;
    $sql_select_productos_quimicos = "SELECT * FROM producto WHERE idCla = ?";
    $stmt_select_productos_quimicos = $pdo->prepare($sql_select_productos_quimicos);
    $stmt_select_productos_quimicos->bindParam(1, $idClaProdQui, PDO::PARAM_INT);
    $stmt_select_productos_quimicos->execute();

    // Preparar la consulta de inserción una sola vez fuera del bucle
    $sql_create_atributos_calidad_productos_quimicos = "INSERT INTO 
    producto_atributo_calidad (idProdt, nomProdAtr, idTipProdAtr, opcProdAtr, codGruAtr, labGruAtr)
    VALUES (?, ?, ?, ?, ?, ?)";

    $stmt_create_atributos_calidad_productos_quimicos = $pdo->prepare($sql_create_atributos_calidad_productos_quimicos);

    while ($row_productos_quimicos = $stmt_select_productos_quimicos->fetch(PDO::FETCH_ASSOC)) {
        $idProdt = $row_productos_quimicos["id"];
        echo $idProdt . "\n";

        // Ejecutar la consulta preparada para la inserción con los valores específicos
        $atributos_calidad = [
            ['Integridad', 3, 'C,I', 1, 'CONDICIONES DEL PRODUCTO'],
            ['Buen estado', 3, 'C,I', 1, 'CONDICIONES DEL PRODUCTO']
        ];

        foreach ($atributos_calidad as $atributo) {
            $stmt_create_atributos_calidad_productos_quimicos->execute(array_merge([$idProdt], $atributo));
        }
    }
}
