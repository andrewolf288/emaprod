<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require('../../common/conexion_emafact.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$pdoEmafact = getPDOEMAFACT();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeFac = $data["idOpeFac"];
    $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
    if ($pdo) {
        try {
            // primero traemos la informacion de la operacion facturacion con su detalle
            $sql_select_operacion_facturacion =
                "SELECT 
            of.id,
            of.invSerFac,
            of.invNumFac,
            of.idGuiRem,
            of.idOpeFacMot,
            of.idReqEst,
            re.desReqEst,
            ofm.desOpeFacMot,
            of.fueAfePorDev,
            of.fueAfePorAnul,
            of.fecCreOpeFac
            FROM operacion_facturacion AS of
            JOIN operacion_facturacion_motivo AS ofm ON ofm.id = of.idOpeFacMot
            JOIN requisicion_estado AS re ON re.id = of.idReqEst
            WHERE of.id = ?";
            $stmt_select_operacion_facturacion = $pdo->prepare($sql_select_operacion_facturacion);
            $stmt_select_operacion_facturacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
            $stmt_select_operacion_facturacion->execute();

            while ($row_operacion_facturacion = $stmt_select_operacion_facturacion->fetch(PDO::FETCH_ASSOC)) {
                $row_operacion_facturacion["detOpeFac"] = [];
                $idGuiRem = $row_operacion_facturacion["idGuiRem"];
                // consultamos su cliente
                $sql_select_referral_guide =
                    "SELECT 
                rg.customer_id,
                cu.contact
                FROM referral_guides AS rg
                LEFT JOIN customers AS cu ON cu.id = rg.customer_id
                WHERE rg.id = ?";
                $stmt_select_referral_guide = $pdoEmafact->prepare($sql_select_referral_guide);
                $stmt_select_referral_guide->bindParam(1, $idGuiRem, PDO::PARAM_INT);
                $stmt_select_referral_guide->execute();
                $row_referral_guide = $stmt_select_referral_guide->fetch(PDO::FETCH_ASSOC);

                if ($row_referral_guide) {
                    $row_operacion_facturacion["customer"] = $row_referral_guide["contact"];
                } else {
                    $row_operacion_facturacion["customer"] = "SIN CLIENTE";
                }

                $sql_select_operacion_facturacion_detalle =
                    "SELECT
                ofd.id,
                ofd.idOpeFac,
                ofd.idProdt,
                p.nomProd,
                ofd.refProdt,
                ofd.canOpeFacDet,
                ofd.esMerProm,
                ofd.esProFin,
                ofd.fueComDet,
                ofd.fueAnulDet,
                ofd.fecComOpeFacDet,
                ofd.fecCreOpeFacDet,
                ofd.fecActOpeFacDet
                FROM operacion_facturacion_detalle AS ofd
                JOIN producto AS p ON p.id = ofd.idProdt
                WHERE ofd.idOpeFac = ?";
                $stmt_select_operacion_facturacion_detalle = $pdo->prepare($sql_select_operacion_facturacion_detalle);
                $stmt_select_operacion_facturacion_detalle->bindParam(1, $idOpeFac, PDO::PARAM_INT);
                $stmt_select_operacion_facturacion_detalle->execute();

                while ($row_operacion_facturacion_detalle = $stmt_select_operacion_facturacion_detalle->fetch(PDO::FETCH_ASSOC)) {
                    $idOpeFacDet = $row_operacion_facturacion_detalle["id"];
                    $idProdt = $row_operacion_facturacion_detalle["idProdt"];
                    $cantidad = $row_operacion_facturacion_detalle["canOpeFacDet"];
                    $esMerProm = $row_operacion_facturacion_detalle["esMerProm"];
                    $fueComDet = $row_operacion_facturacion_detalle["fueComDet"];
                    // $row_operacion_facturacion_detalle["canOpeFacDetAct"] = $cantidad;
                    $row_operacion_facturacion_detalle["canOpeFacDetAct"] = 0;
                    $row_operacion_facturacion_detalle["detSal"] = array();
                    $array_entradas_disponibles = [];

                    if ($fueComDet == 1) {
                        if ($esMerProm == 0) {

                            $sql_select_movimiento_operacion =
                                "SELECT 
                            mof.id,
                            mof.idOpeFac,
                            mof.idOpeFacDet,
                            mof.idProdt,
                            mof.idEntSto,
                            mof.idProdc,
                            pc.fecVenLotProd,
                            pc.fecProdIni,
                            pc.codProd,
                            mof.codLotProd,
                            mof.canMovOpeFac
                            FROM movimiento_operacion_facturacion AS mof
                            JOIN produccion AS pc ON pc.id = mof.idProdc
                            WHERE mof.idOpeFacDet = ?";

                            $stmt_select_movimiento_operacion = $pdo->prepare($sql_select_movimiento_operacion);
                            $stmt_select_movimiento_operacion->bindParam(1, $idOpeFacDet, PDO::PARAM_INT);
                            $stmt_select_movimiento_operacion->execute();

                            $movimientos_operacion_facturacion = $stmt_select_movimiento_operacion->fetchAll(PDO::FETCH_ASSOC);

                            $totalPorLoteProduccion = [];
                            foreach ($movimientos_operacion_facturacion as $fila) {
                                $refProdc = $fila['idProdc'];
                                $cantidad = intval($fila['canMovOpeFac']); // Convertir a número si es necesario
                                $codLotProd = $fila['codLotProd'];
                                $codProd = $fila["codProd"];
                                $fecProdIni = $fila["fecProdIni"];
                                $fecVenLotProd = $fila["fecVenLotProd"];
                                $row_operacion_facturacion_detalle["canOpeFacDetAct"] += $cantidad;

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
                            $row_operacion_facturacion_detalle["detSal"] = $totalPorLoteProduccion;
                        } else {
                            $row_operacion_facturacion_detalle["canOpeFacDetAct"] = $row_operacion_facturacion_detalle["canOpeFacDet"];
                        }
                    } else {
                        // si no es una mercancia de promocion
                        if ($esMerProm == 0) {
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
                                        $row_operacion_facturacion_detalle["canOpeFacDetAct"] += $cantidad;

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
                                    $row_operacion_facturacion_detalle["detSal"] = $totalConInformacionProduccion;
                                }
                            }
                        } else {
                            //  $row_operacion_facturacion_detalle["canOpeFacDetAct"] = $row_operacion_facturacion_detalle["canOpeFacDet"];
                        }
                    }
                    array_push($row_operacion_facturacion["detOpeFac"], $row_operacion_facturacion_detalle);
                }
                array_push($result, $row_operacion_facturacion);
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
