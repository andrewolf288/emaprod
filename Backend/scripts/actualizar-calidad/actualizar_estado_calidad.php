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
    $nomProdAtr = "Conformidad";
    $sql_select_entradas_evaluadas =
        "SELECT 
    eca.id,
    eca.idEntCal,
    eca.idProdtAtrCal,
    eca.valEntCalAtr,
    pac.id AS idProdAtrCal
    FROM entrada_calidad_atributos AS eca
    JOIN producto_atributo_calidad AS pac ON pac.id = eca.idProdtAtrCal
    WHERE pac.nomProdAtr = ?";
    $stmt_select_entradas_evaluadas = $pdo->prepare($sql_select_entradas_evaluadas);
    $stmt_select_entradas_evaluadas->bindParam(1, $nomProdAtr, PDO::PARAM_STR);
    $stmt_select_entradas_evaluadas->execute();

    while ($row_entrada_calidad = $stmt_select_entradas_evaluadas->fetch(PDO::FETCH_ASSOC)) {
    }
}
