<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdt = $data["idProdt"];

    if ($pdo) {

        // SELECCION DE FORMULA EMPAQUETADO PROMOCIONAL
        $sql_select_formula_empaquetado_promocional =
            "SELECT
        fep.id,
        fep.idProdt
        FROM formula_empaquetado_promocional AS fep
        WHERE fep.idProdt = ?";
        $stmt_select_formula_empaquetado_promocional = $pdo->prepare($sql_select_formula_empaquetado_promocional);
        $stmt_select_formula_empaquetado_promocional->bindParam(1, $idProdt, PDO::PARAM_INT);
        $stmt_select_formula_empaquetado_promocional->execute();

        $row_formula_empaquetado_promocional = $stmt_select_formula_empaquetado_promocional->fetch(PDO::FETCH_ASSOC);

        if ($row_formula_empaquetado_promocional) {
            $idForEmpPro = $row_formula_empaquetado_promocional["id"];

            // SELECCION DE DETALLE DE PRODUCTOS FINALES
            $sql_select_detalle_productos_finales =
                "SELECT
            fepd.id,
            fepd.idProdt,
            p.nomProd,
            p.codProd2,
            me.simMed,
            cl.desCla,
            fepd.canEmpPromDet
            FROM formula_empaquetado_promocional_detalle AS fepd
            JOIN producto AS p ON p.id = fepd.idProdt
            JOIN clase AS cl ON cl.id = p.idCla
            JOIN medida AS me ON me.id = p.idMed
            WHERE fepd.idForEmpProm = ?";
            $stmt_select_detalle_productos_finales = $pdo->prepare($sql_select_detalle_productos_finales);
            $stmt_select_detalle_productos_finales->bindParam(1, $idForEmpPro, PDO::PARAM_INT);
            $stmt_select_detalle_productos_finales->execute();

            $row_formula_empaquetado_promocional["detForEmpProm"] = $stmt_select_detalle_productos_finales->fetchAll(PDO::FETCH_ASSOC);

            // SELECCION DE DETALLE DE REQUISICION MATERIALES
            $sql_select_detalle_requisicion_materiales =
                "SELECT
            fepr.id,
            fepr.idProdt,
            p.nomProd,
            p.codProd2,
            me.simMed,
            cl.desCla,
            fepr.canForEmpPromReq
            FROM formula_empaquetado_promocional_requisicion AS fepr
            JOIN producto AS p ON p.id = fepr.idProdt
            JOIN clase AS cl ON cl.id = p.idCla
            JOIN medida AS me ON me.id = p.idMed
            WHERE fepr.idForEmpProm = ?";
            $stmt_select_detalle_requisicion_materiales = $pdo->prepare($sql_select_detalle_requisicion_materiales);
            $stmt_select_detalle_requisicion_materiales->bindParam(1, $idForEmpPro, PDO::PARAM_INT);
            $stmt_select_detalle_requisicion_materiales->execute();

            $row_formula_empaquetado_promocional["detForEmpPromReq"] = $stmt_select_detalle_requisicion_materiales->fetchAll(PDO::FETCH_ASSOC);

            $result = $row_formula_empaquetado_promocional;
        } else {
            $message_error = "No se encontro la fórmula";
            $description_error = "No se encontró ninguna fórmula relacionada";
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
