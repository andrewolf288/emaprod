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
        $sql_select_nota_credito =
            "SELECT 
            id, 
            sale_id, 
            invoice_serie, 
            invoice_number, 
            reason_id
        FROM credit_notes
        WHERE invoice_serie = ? AND invoice_number = ?";
        $stmt_select_nota_credito = $pdo->prepare($sql_select_nota_credito);
        $stmt_select_nota_credito->bindParam(1, $invoice_serie, PDO::PARAM_STR);
        $stmt_select_nota_credito->bindParam(2, $invoice_number, PDO::PARAM_STR);
        $stmt_select_nota_credito->execute();

        $row_nota_credito = $stmt_select_nota_credito->fetch(PDO::FETCH_ASSOC);
        if ($row_nota_credito) {
            $idCredNot = $row_nota_credito["id"];
            $idSale = $row_nota_credito["sale_id"];
            $invoice_serie = $row_nota_credito["invoice_serie"]; // serie
            $invoice_number = $row_nota_credito["invoice_number"]; // numero
            $idMot = $row_nota_credito["reason_id"];
            $idRefGui = 0;
            $items = array();

            // consultamos la guia de remision de salida
            $sql_select_guia_remision =
                "SELECT id 
            FROM referral_guides
            WHERE sale_id = ?";
            $stmt_select_guia_remision = $pdo->prepare($sql_select_guia_remision);
            $stmt_select_guia_remision->bindParam(1, $idSale, PDO::PARAM_INT);
            $stmt_select_guia_remision->execute();
            $row_select_guia_remision = $stmt_select_guia_remision->fetch(PDO::FETCH_ASSOC);

            if ($row_select_guia_remision) {
                $idRefGui = $row_select_guia_remision["id"];
            }

            // consultamos el detalle de nota de credito
            $sql_select_nota_credito_detalle =
                "SELECT 
            p.reference AS product_reference, cnd.quantity 
            FROM credit_note_details AS cnd
            JOIN products AS p ON p.id = cnd.product_id
            WHERE credit_note_id = ?";
            $stmt_select_nota_credito_detalle = $pdo->prepare($sql_select_nota_credito_detalle);
            $stmt_select_nota_credito_detalle->bindParam(1, $idCredNot, PDO::PARAM_INT);
            $stmt_select_nota_credito_detalle->execute();

            $items = $stmt_select_nota_credito_detalle->fetchAll(PDO::FETCH_ASSOC);

            $result = array(
                "idRefGui" => $idRefGui,
                "idCredNot" => $idCredNot,
                "idMot" => $idMot,
                "invoice_serie" => $invoice_serie,
                "invoice_number" => $invoice_number,
                "items" => $items
            );
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
