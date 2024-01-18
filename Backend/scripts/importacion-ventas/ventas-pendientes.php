<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require('../../common/conexion_emafact.php');

$pdo = getPDO();
$pdoEmafact = getPDOEMAFACT();
$result = array();

// este script sirve para resetear las entradas existentes

// primero leemos el archivo csv
// luego debemos buscar su codigo en la base de datos
// formamos el codigo de ingreso
if ($pdo && $pdoEmafact) {
    $sql_select_referrall_guides =
        "SELECT rg.id AS idRefGui, rg.invoice_serie, rg.invoice_number
        FROM referral_guides as rg
        WHERE DATE(rg.issue_date) = '2024-01-05';";
    $stmt_select_referrall_guides = $pdoEmafact->prepare($sql_select_referrall_guides);
    $stmt_select_referrall_guides->execute();
    $referrall_guides = $stmt_select_referrall_guides->fetchAll(PDO::FETCH_ASSOC);

    foreach ($referrall_guides as $referrall_guide) {
        $referrall_guide_id = $referrall_guide["idRefGui"];

        $sql_select_referrall_guide_details =
            "SELECT p.reference AS product_reference, rgd.quantity 
        FROM referral_guide_details AS rgd
        JOIN products AS p ON p.id = rgd.product_id
        WHERE rgd.referral_guide_id = $referrall_guide_id";

        $stmt_select_referrall_guide_details = $pdoEmafact->prepare($sql_select_referrall_guide_details);
        $stmt_select_referrall_guide_details->execute();
        $referrall_guide_details = $stmt_select_referrall_guide_details->fetchAll(PDO::FETCH_ASSOC);

        $referrall_guide["items"] = $referrall_guide_details;
        array_push($result, $referrall_guide);
    }
    print_r(json_encode($result));
}
