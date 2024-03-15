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

    $idProdt = $data["idProdt"];
    $canLotProd = $data["canLotProd"];
    $detalleCambiosRegistrados = $data["detalleCambiosRegistrados"];
    $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS

    // debemos buscar las entradas disponibles para recomendar el cambio
    $idAlmacenPrincipal = 1;
    $sql_consult_entradas_disponibles =
        "SELECT
        es.id,
        es.refProdc,
        DATE(es.fecEntSto) AS fecEntSto,
        es.canTotDis
        FROM entrada_stock AS es
        WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0 AND idAlm = ?
        ORDER BY es.fecEntSto ASC";

    $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
    $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
    $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
    $stmt_consult_entradas_disponibles->bindParam(3, $idAlmacenPrincipal, pdo::PARAM_INT);
    $stmt_consult_entradas_disponibles->execute();
    $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

    // print_r($array_entradas_disponibles);

    if (!empty($array_entradas_disponibles)) {
        // DEBEMOS VERIFICAR SI YA HAY DETALLE DE SALIDA Y DESCONTAR
        $array_aux = $array_entradas_disponibles;
        foreach ($detalleCambiosRegistrados as $item) {
            $refProc = $item["refProdc"];
            $canSalLotProd = $item["canSalLotProd"];

            // Recorremos el arreglo 1 modificado
            foreach ($array_aux as $key => $item_1) {
                if ($item_1["refProdc"] == $refProc) {
                    // Si la cantidad a descontar es menor o igual a la cantidad disponible
                    if ($canSalLotProd < $item_1["canTotDis"]) {
                        // Descontamos la cantidad
                        $array_aux[$key]["canTotDis"] -= $canSalLotProd;
                        break;
                    } else {
                        // Si la cantidad a descontar es mayor que la cantidad disponible
                        $canSalLotProd -= $item_1["canTotDis"];
                        // Eliminamos el elemento del arreglo 1 modificado
                        unset($array_aux[$key]);
                    }
                }
            }
        }
        // print_r($array_aux);

        $entradasUtilizadas = []; // entradas utilizadas
        $cantidad_faltante = $canLotProd; // cantidad total faltante

        foreach ($array_aux as $row_entrada_disponible) {
            if ($cantidad_faltante > 0) {

                $idEntStoUti = $row_entrada_disponible["id"]; // id entrada
                $canDisEnt = $row_entrada_disponible["canTotDis"]; // cantidad disponible
                $refProdc = $row_entrada_disponible["refProdc"]; // referencia a produccion

                if ($canDisEnt >= $cantidad_faltante) {
                    // añadimos a entradas utilizadas
                    array_push(
                        $entradasUtilizadas,
                        array(
                            "idEntSto" => $idEntStoUti,
                            "canSalStoReq" => $cantidad_faltante, // la cantidad de la requisicion detalle
                            "refProdc" => $refProdc,
                        )
                    );

                    $cantidad_faltante = 0;

                    break; // termina el flujo
                } else {
                    $cantidad_faltante -= $canDisEnt;
                    array_push(
                        $entradasUtilizadas,
                        array(
                            "idEntSto" => $idEntStoUti,
                            "canSalStoReq" => $canDisEnt, // la cantidad disponible de la entrada
                            "refProdc" => $refProdc,
                        )
                    );
                }
            } else {
                break; // salimos del flujo
            }
        }

        if ($cantidad_faltante == 0) {
            // entonces le asignamos las entrada utilizadas
            // Primero tenemos que juntar aquellas entradas que corresponden a la misma produccion
            $totalPorLoteProduccion = [];
            foreach ($entradasUtilizadas as $fila) {
                $refProdc = $fila['refProdc'];
                $cantidad = intval($fila['canSalStoReq']); // Convertir a número si es necesario

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

            $totalConInformacionProduccion = array();
            // ahora debemos traer informacion de la produccion
            foreach ($totalPorLoteProduccion as $fila) {
                $row_data = array();
                $row_data["refProdc"] = $fila["refProdc"];
                $row_data["canSalLotProd"] = $fila["canSalLotProd"];

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
            // agregamos el detalle de salidas de lote
            $result = $totalConInformacionProduccion;
        }
    } else {
        $message_error = "No hay entradas disponbiles";
        $description_error = "No hay stock suficiente para generar el detalle de cambio";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
