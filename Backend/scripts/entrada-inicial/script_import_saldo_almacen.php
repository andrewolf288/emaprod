<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();

// este script sirve para resetear las entradas existentes

// primero leemos el archivo csv
// luego debemos buscar su codigo en la base de datos
// formamos el codigo de ingreso
if ($pdo) {

    // $file = 'almacen-desmedro.csv'; // Nombre del archivo CSV
    $file = 'almacen-principal.csv'; // Nombre del archivo CSV
    if (($handle = fopen($file, 'r')) !== false) {
        // Iterar sobre cada línea del archivo
        while (($data = fgetcsv($handle, 1000, ',')) !== false) {
            $codigo = $data[0]; // Valor en la columna 'codigo'
            $saldo = $data[1]; // Valor en la columna 'saldo'

            $sql_consult_id_producto = "SELECT id FROM producto WHERE codProd2 = ?";
            $stmt_consult_id_producto = $pdo->prepare($sql_consult_id_producto);
            $stmt_consult_id_producto->bindParam(1, $codigo, PDO::PARAM_STR);
            $stmt_consult_id_producto->execute();
            $result = $stmt_consult_id_producto->fetch(PDO::FETCH_ASSOC);

            $idProd = $result["id"];
            // $idAlm = 7; // desmedro
            $idAlm = 1; // principal

            $sqlinsertEntrada =
                "INSERT INTO almacen_stock(idProd, idAlm, canSto, canStoDis) VALUES($idProd,$idAlm,$saldo,$saldo);";
            echo $sqlinsertEntrada . "\n";
        }
        fclose($handle); // Cerrar el archivo
    } else {
        echo "No se pudo abrir el archivo.";
    }
}
