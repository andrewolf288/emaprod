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

    $file = 'importaciones-2024-mercancias.csv'; // Nombre del archivo CSV

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
            $idProv = 1;
            $idEntStoEst = 1;
            $idAlm = 1;
            $idEntStoTip = 1;
            $letAniEntSto = "D";
            $diaJulEntSto = "004";
            $refNumIngEntSto = "001";
            $codEntSto = $codigo . "00" . $letAniEntSto . $diaJulEntSto . $refNumIngEntSto;
            $docEntSto = "SALDO INICIAL";

            $sqlinsertEntrada =
                "INSERT INTO entrada_stock(idProd, idProv, idEntStoEst, idAlm, idEntStoTip, codEntSto, letAniEntSto, diaJulEntSto, refNumIngEntSto, canTotEnt, canTotDis, docEntSto) VALUES($idProd, $idProv, $idEntStoEst, $idAlm, $idEntStoTip, '$codEntSto', '$letAniEntSto', '$diaJulEntSto', '$refNumIngEntSto', $saldo, $saldo, '$docEntSto');";
            echo $sqlinsertEntrada . "\n";
        }
        fclose($handle); // Cerrar el archivo
    } else {
        echo "No se pudo abrir el archivo.";
    }
}
