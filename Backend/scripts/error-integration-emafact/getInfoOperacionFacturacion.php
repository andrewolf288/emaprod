<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion_emafact.php');

$pdo = getPDOEMAFACT();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $invoice_serie = $data["invoice_serie"];
    $invoice_number = $data["invoice_number"];

    if ($pdo) {
        $sql_select_referral_guide =
            "SELECT id AS idRefGui, invoice_serie, invoice_number, address_destination_id
        FROM referral_guides 
        WHERE invoice_serie=? AND invoice_number=?";

        $stmt_select_referral_guide = $pdo->prepare($sql_select_referral_guide);
        $stmt_select_referral_guide->bindParam(1, $invoice_serie, PDO::PARAM_STR);
        $stmt_select_referral_guide->bindParam(2, $invoice_number, PDO::PARAM_STR);
        $stmt_select_referral_guide->execute();

        $row_referral_guide = $stmt_select_referral_guide->fetch(PDO::FETCH_ASSOC);
        if ($row_referral_guide) {
            $result["idRefGui"] = $row_referral_guide["idRefGui"];
            $result["invoice_serie"] = $row_referral_guide["invoice_serie"];
            $result["invoice_number"] = $row_referral_guide["invoice_number"];
            $result["address_destination_id"] = $row_referral_guide["address_destination_id"];

            $sql_select_referral_guide_detail =
                "SELECT p.reference AS product_reference, rgd.quantity 
            FROM referral_guide_details AS rgd
            JOIN products AS p ON p.id = rgd.product_id
            WHERE rgd.referral_guide_id = ?";
            $stmt_select_referral_guide_detail = $pdo->prepare($sql_select_referral_guide_detail);
            $stmt_select_referral_guide_detail->bindParam(1, $row_referral_guide["idRefGui"], PDO::PARAM_INT);
            $stmt_select_referral_guide_detail->execute();
            $result["items"] = $stmt_select_referral_guide_detail->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $message_error = "NO SE ENCONTRO LA GUIA DE REMISION";
            $description_error = "NO SE ENCONTRO LA GUIA DE REMISION";
        }
    } else {
        $message_error = "ERROR EN LA CONECCION";
        $description_error = "ERROR EN LA CONECCION";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
