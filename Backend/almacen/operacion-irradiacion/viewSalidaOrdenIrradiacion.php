<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeIrra = $data["idOpeIrra"];
    $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS

    if ($pdo) {
        try {
            // primero traemos la informacion de la operacion facturacion con su detalle
            $sql_select_orden_irradiacion =
                "SELECT 
                oi.id,
                oi.idGuiRem,
                oi.idOrdIrraEst,
                oie.desOrdIrraEst,
                oi.invSerFac,
                oi.invNumFac,
                oi.fecCreOrdIrra
            FROM orden_irradiacion AS oi
            JOIN orden_irradiacion_estado AS oie ON oie.id = oi.idOrdIrraEst
            WHERE of.id = ?";
            $stmr_select_orden_irradiacion = $pdo->prepare($sql_select_orden_irradiacion);
            $stmr_select_orden_irradiacion->bindParam(1, $idOpeIrra, PDO::PARAM_INT);
            $stmr_select_orden_irradiacion->execute();

            while ($row_orden_irradiacion = $stmr_select_orden_irradiacion->fetch(PDO::FETCH_ASSOC)) {
                $row_orden_irradiacion["detOrdIrra"] = [];

                $sql_select_orden_irradiacion_detalle =
                    "SELECT
                oid.id,
                oid.idOpeIrra,
                oid.idProdt,
                p.nomProd,
                oid.refProdt,
                oid.canOpeIrra,
                oid.fueComSal,
                oid.fecSalOrdIrra,
                oid.fecCreOpeFacDet,
                oid.fecActOpeFacDet
                FROM operacion_facturacion_detalle AS oid
                JOIN producto AS p ON p.id = oid.idProdt
                WHERE oid.idOpeIrra = ?";
                $stmr_select_orden_irradiacion_detalle = $pdo->prepare($sql_select_orden_irradiacion_detalle);
                $stmr_select_orden_irradiacion_detalle->bindParam(1, $idOpeIrra, PDO::PARAM_INT);
                $stmr_select_orden_irradiacion_detalle->execute();

                while ($row_orden_irradiacion_detalle = $stmr_select_orden_irradiacion_detalle->fetch(PDO::FETCH_ASSOC)) {
                    $idOpeIrraDet = $row_orden_irradiacion_detalle["id"];
                    $idProdt = $row_orden_irradiacion_detalle["idProdt"];
                    $cantidad = $row_orden_irradiacion_detalle["canOpeIrra"];
                    $fueComSal = $row_orden_irradiacion_detalle["fueComSal"];
                    $row_orden_irradiacion_detalle["canOpeIrraAct"] = 0;
                    $row_orden_irradiacion_detalle["detSal"] = array();
                    $array_entradas_disponibles = [];

                    if ($fueComSal == 1) {

                        $sql_select_movimiento_orden_irradiacion =
                            "SELECT 
                        moi.id,
                        moi.idOpeIrra,
                        moi.idOpeIrraDet,
                        moi.idProdt,
                        moi.idEntSto,
                        moi.idProdc,
                        pc.fecVenLotProd,
                        pc.fecProdIni,
                        pc.codProd,
                        moi.codLotProd,
                        moi.canMovOpeIrra
                        FROM movimiento_orden_irradiacion AS moi
                        JOIN produccion AS pc ON pc.id = moi.idProdc
                        WHERE moi.idOpeIrraDet = ?";

                        $stmt_select_movimiento_orden_irradiacion = $pdo->prepare($sql_select_movimiento_orden_irradiacion);
                        $stmt_select_movimiento_orden_irradiacion->bindParam(1, $idOpeIrraDet, PDO::PARAM_INT);
                        $stmt_select_movimiento_orden_irradiacion->execute();

                        $movimientos_orden_irradiacion = $stmt_select_movimiento_orden_irradiacion->fetchAll(PDO::FETCH_ASSOC);

                        $totalPorLoteProduccion = [];
                        foreach ($movimientos_orden_irradiacion as $fila) {
                            $refProdc = $fila['idProdc'];
                            $cantidad = intval($fila['canMovOpeIrra']); // Convertir a número si es necesario
                            $codLotProd = $fila['codLotProd'];
                            $codProd = $fila["codProd"];
                            $fecProdIni = $fila["fecProdIni"];
                            $fecVenLotProd = $fila["fecVenLotProd"];
                            $row_orden_irradiacion_detalle["canOpeIrraAct"] += $cantidad;

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
                                    'codProd' => $codProd,
                                    'codLotProd' => $codLotProd,
                                    'fecProdIni' => $fecProdIni,
                                    'fecVenLotProd' => $fecVenLotProd
                                ];
                            }
                        }

                        // agregamos el detalle de salidas de lote
                        $row_orden_irradiacion_detalle["detSal"] = $totalPorLoteProduccion;
                    } else {
                        // tenemos que traer informacion de los lotes necesarios para cumplir con el detalle
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

                        if (!empty($array_entradas_disponibles)) {
                            $entradasUtilizadas = []; // entradas utilizadas
                            $cantidad_faltante = $cantidad; // cantidad total faltante

                            foreach ($array_entradas_disponibles as $row_entrada_disponible) {
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
                                    $row_orden_irradiacion_detalle["canOpeIrraAct"] += $cantidad;

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
                                // $row_orden_irradiacion_detalle["detSal"] = $totalPorLoteProduccion;
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
                                $row_orden_irradiacion_detalle["detSal"] = $totalConInformacionProduccion;
                            }
                        }
                    }
                    array_push($row_orden_irradiacion["detOrdIrra"], $row_orden_irradiacion_detalle);
                }
                array_push($result, $row_orden_irradiacion);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR EN LA CONSULTA";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error en la coneccion con la base de datos";
        $description_error = "Error en la coneccion con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
