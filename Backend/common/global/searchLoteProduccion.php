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

    $codLotProd = $data["codLotProd"];
    $fecProdIni = $data["fecProdIni"];
    $sensibleMes = $data["sensibleMes"];
    $fecVenLotProd = $data["fecVenLotProd"];
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
        $result = $row_produccion;
    } else {
        $message_error = "No se encontro";
        $description_error = "No se encontro un lote de producción con los datos proporcionados";
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
