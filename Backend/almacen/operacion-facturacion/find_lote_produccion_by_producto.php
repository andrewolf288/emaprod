<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $lotesUsados = $data["lotUsa"]; // lotes utilizados
    $idProdt = $data["idProdt"]; // producto

    $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
    $array_entradas_disponibles = array();

    $sql_consult_entradas_disponibles =
        "SELECT
    es.id,
    es.refProdc,
    DATE(es.fecEntSto) AS fecEntSto,
    es.canTotDis
    FROM entrada_stock AS es
    WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0
    AND es.fecEntSto BETWEEN DATE_SUB(NOW(), INTERVAL 4 YEAR) AND NOW()
    ORDER BY es.fecEntSto ASC";

    $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
    $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
    $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
    $stmt_consult_entradas_disponibles->execute();
    $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($array_entradas_disponibles)) {
        // entonces le asignamos las entrada utilizadas
        // Primero tenemos que juntar aquellas entradas que corresponden a la misma produccion
        $totalPorLoteProduccion = [];
        foreach ($array_entradas_disponibles as $fila) {
            $refProdc = $fila['refProdc'];
            $cantidad = floatval($fila['canTotDis']); // Convertir a número si es necesario

            // Verificar si ya existe la referencia en el arreglo de totales
            $indice = -1;
            foreach ($totalPorLoteProduccion as $key => $item) {
                if ($item['refProdc'] === $refProdc) {
                    $indice = $key;
                    break;
                }
            }

            if ($indice !== -1) {
                // Si existe, sumar la cantidad
                $totalPorLoteProduccion[$indice]['canSalLotProd'] += $cantidad;
            } else {
                // Si no existe, crear una nueva entrada en el arreglo
                $totalPorLoteProduccion[] = [
                    'refProdc' => $refProdc,
                    'canSalLotProd' => $cantidad,
                ];
            }
        }
        // $row_operacion_facturacion_detalle["detSal"] = $totalPorLoteProduccion;
        $totalConInformacionProduccion = array();
        // ahora debemos traer informacion de la produccion
        foreach ($totalPorLoteProduccion as $fila) {
            $row_data = array();
            $row_data["refProdc"] = $fila["refProdc"];
            $row_data["canSalLotProd"] = $fila["canSalLotProd"];
            $row_data["canSalLotProdAct"] = 0;

            $sql_consult_lote_produccion =
                "SELECT codProd, codLotProd, fecProdIni, fecVenLotProd
                FROM produccion
                WHERE id = ?";
            $stmt_consult_lote_produccion = $pdo->prepare($sql_consult_lote_produccion);
            $stmt_consult_lote_produccion->bindParam(1, $fila["refProdc"], PDO::PARAM_INT);
            $stmt_consult_lote_produccion->execute();
            $row_produccion = $stmt_consult_lote_produccion->fetch(PDO::FETCH_ASSOC);

            $row_data["codProd"] = $row_produccion["codProd"];
            $row_data["codLotProd"] = $row_produccion["codLotProd"];
            $row_data["fecProdIni"] = $row_produccion["fecProdIni"];
            $row_data["fecVenLotProd"] = $row_produccion["fecVenLotProd"];
            array_push($totalConInformacionProduccion, $row_data);
        }
        $refNoDeseados = array_map(function ($elemento) {
            return $elemento['refProdc'];
        }, $lotesUsados);

        // Filtrar los elementos sugeridos
        $filtroLotesDisponibles = array_filter($totalConInformacionProduccion, function ($elemento) use ($refNoDeseados) {
            return !in_array($elemento['refProdc'], $refNoDeseados);
        });

        $result = array_values($filtroLotesDisponibles);
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
