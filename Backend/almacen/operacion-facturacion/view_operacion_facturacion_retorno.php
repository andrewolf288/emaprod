<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeFac = $data["idOpeFac"];
    if ($pdo) {
        try {
            $idGuiRem = 0;
            $idOpeFacMot = 0;
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
            of.fecCreOpeFac
            FROM operacion_facturacion AS of
            JOIN operacion_facturacion_motivo AS ofm ON ofm.id = of.idOpeFacMot
            JOIN requisicion_estado AS re ON re.id = of.idReqEst
            WHERE of.id = ?";
            $stmt_select_operacion_facturacion = $pdo->prepare($sql_select_operacion_facturacion);
            $stmt_select_operacion_facturacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
            $stmt_select_operacion_facturacion->execute();

            while ($row_operacion_facturacion = $stmt_select_operacion_facturacion->fetch(PDO::FETCH_ASSOC)) {
                $idGuiRem = $row_operacion_facturacion["idGuiRem"];
                $idOpeFacMot = $row_operacion_facturacion["idOpeFacMot"];
                $row_operacion_facturacion["detOpeFac"] = [];

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
                    $row_operacion_facturacion_detalle["canOpeFacDetAct"] = $idOpeFacMot === 5 ? 0 : $cantidad;
                    $row_operacion_facturacion_detalle["detSal"] = array();
                    $array_entradas_disponibles = [];

                    if ($fueComDet == 1 && $esMerProm == 0) {
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
                            $cantidad = floatval($fila['canMovOpeFac']); // Convertir a número si es necesario
                            $codLotProd = $fila['codLotProd'];
                            $codProd = $fila["codProd"];
                            $fecProdIni = $fila["fecProdIni"];
                            $fecVenLotProd = $fila["fecVenLotProd"];

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
                        $esSal = 1;
                        // primero buscamos la referencia a su salida
                        $sql_find_operacion_facturacion =
                            "SELECT * FROM operacion_facturacion
                        WHERE idGuiRem = ? AND esSal = ?";
                        $stmt_find_operacion_facturacion = $pdo->prepare($sql_find_operacion_facturacion);
                        $stmt_find_operacion_facturacion->bindParam(1, $idGuiRem, PDO::PARAM_INT);
                        $stmt_find_operacion_facturacion->bindParam(2, $esSal, PDO::PARAM_BOOL);
                        $stmt_find_operacion_facturacion->execute();

                        $row_find_operacion_facturacion = $stmt_find_operacion_facturacion->fetch(PDO::FETCH_ASSOC);
                        // print_r($row_find_operacion_facturacion);

                        if ($row_find_operacion_facturacion) {
                            $idOpeFacAux = $row_find_operacion_facturacion["id"];
                            // si no es una mercancia de promocion
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
                                WHERE mof.idOpeFac = ? AND mof.idProdt = ?";

                                $stmt_select_movimiento_operacion = $pdo->prepare($sql_select_movimiento_operacion);
                                $stmt_select_movimiento_operacion->bindParam(1, $idOpeFacAux, PDO::PARAM_INT);
                                $stmt_select_movimiento_operacion->bindParam(2, $idProdt, PDO::PARAM_INT);
                                $stmt_select_movimiento_operacion->execute();

                                $movimientos_operacion_facturacion = $stmt_select_movimiento_operacion->fetchAll(PDO::FETCH_ASSOC);

                                $totalPorLoteProduccion = [];
                                foreach ($movimientos_operacion_facturacion as $fila) {
                                    $refProdc = $fila['idProdc'];
                                    $cantidad = floatval($fila['canMovOpeFac']); // Convertir a número si es necesario
                                    $codLotProd = $fila['codLotProd'];
                                    $codProd = $fila["codProd"];
                                    $fecProdIni = $fila["fecProdIni"];
                                    $fecVenLotProd = $fila["fecVenLotProd"];

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

                                // si es una devolucion por items, debemos quitar los totales
                                if ($idOpeFacMot == 5) {
                                    foreach ($totalPorLoteProduccion as &$item) {
                                        $item["canSalLotProd"] = 0;
                                    }
                                }
                                // agregamos el detalle de salidas de lote
                                $row_operacion_facturacion_detalle["detSal"] = $totalPorLoteProduccion;
                            }
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
