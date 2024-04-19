<?php
// CON ESTE SCRIPT DEBEMOS TRAER LA INFORMACION DE LA OPERACION DEVOLUCION CALIDAD POR ID
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdt = $data["idProdt"]; // producto
    $codLotProd = $data["codLotProd"];
    $fecProdIni = $data["fecProdIni"];
    $fecVenLotProd = $data["fecVenLotProd"];
    $sensibleMes = $data["sensibleMes"];
    $formatCodLotProd = strlen($codLotProd) === 3 ? $codLotProd : STR_PAD($codLotProd, 3, "0", STR_PAD_LEFT);
    $year = "";
    $month = "";
    $flagTypeDate = "";

    // debemos comprobar que fecha ha sido proporcionada
    if (!empty($fecProdIni)) {
        $year = date('Y', strtotime($fecProdIni));
        $month = date('m', strtotime($fecProdIni));
        $flagTypeDate = "I";
    }

    if (!empty($fecVenLotProd)) {
        $year = date('Y', strtotime($fecVenLotProd));
        $month = date('m', strtotime($fecVenLotProd));
        $flagTypeDate = "V";
    }

    // ahora debemos hacer la respectiva búsqueda
    $sql_consult_produccion =
        "SELECT * FROM produccion
    WHERE codLotProd = ? AND";

    if ($flagTypeDate == "I") {
        $sql_consult_produccion .= " YEAR(fecProdIni) = '$year'";
        if ($sensibleMes) {
            $sql_consult_produccion .= " AND MONTH(fecProdIni) = '$month'";
        }
    }
    if ($flagTypeDate == "V") {
        $sql_consult_produccion .= " YEAR(fecVenLotProd) = '$year'";
        if ($sensibleMes) {
            $sql_consult_produccion .= " AND MONTH(fecVenLotProd) = '$month'";
        }
    }

    $stmt_consult_produccion = $pdo->prepare($sql_consult_produccion);
    $stmt_consult_produccion->bindParam(1, $formatCodLotProd, PDO::PARAM_STR);
    $stmt_consult_produccion->execute();
    $row_produccion = $stmt_consult_produccion->fetch(PDO::FETCH_ASSOC);

    // SI EXISTE LA PRODUCCION
    if ($row_produccion) {
        // si es un producto final debemos hacer una evaluacion mas detallada
        $sql_consult_product =
            "SELECT proRef, esProFin FROM producto
        WHERE id = ?";
        $stmt_consult_product = $pdo->prepare($sql_consult_product);
        $stmt_consult_product->bindParam(1, $idProdt, PDO::PARAM_INT);
        $stmt_consult_product->execute();
        $row_consult_producto = $stmt_consult_product->fetch(PDO::FETCH_ASSOC);

        if ($row_consult_producto) {
            $proRef = $row_consult_producto["proRef"];
            $esProFin = $row_consult_producto["esProFin"];
            $idProdtInt = $row_produccion["idProdt"];

            if($esProFin == 1){
                // toma el lote como origen
                if($proRef != 0){
                    if($proRef == $idProdtInt){
                        $result = $row_produccion;
                    } else {
                        $message_error = "El producto no pertenece al subproducto";
                        $description_error = "El lote encontrado no es del subproducto del producto";
                    }
                } else {
                    $message_error = "El producto no tiene referencia";
                    $description_error = "El producto no tiene referencia a subproducto";
                }
            } else {
                // toma el lote como destino
                $result = $row_produccion;
            }
        } else {
            $message_error = "No se encontró el producto";
            $description_error = "No se encontró el producto ingresado";
        }
    } else {
        $message_error = "No se encontró el lote";
        $description_error = "No se encontró el lote especificado";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}

function obtenerFechaLoteProduccion($action, $date, $idSubCla)
{
    $fecha_objeto = new DateTime($date);
    $cantidad_anios = $idSubCla == 50 ? 1 : 4;
    $cantidad_anios = $action == "DISMINUIR" ? -$cantidad_anios : $cantidad_anios;
    $fecha_objeto->modify("$cantidad_anios years");
    return $fecha_objeto->format('Y-m-d H:i:s');
}
