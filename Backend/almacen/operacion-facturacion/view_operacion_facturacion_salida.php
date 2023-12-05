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
            of.idOpeFacMot,
            ofm.desOpeFacMot,
            of.fueAfePorDev,
            of.fecCreOpeFac
            FROM operacion_facturacion AS of
            JOIN operacion_facturacion_motivo AS ofm ON ofm.id = of.idOpeFacMot
            WHERE of.id = ?";
            $stmt_select_operacion_facturacion = $pdo->prepare($sql_select_operacion_facturacion);
            $stmt_select_operacion_facturacion->bindParam(1, $idOpeFac, PDO::PARAM_INT);
            $stmt_select_operacion_facturacion->execute();

            while ($row_operacion_facturacion = $stmt_select_operacion_facturacion->fetch(PDO::FETCH_ASSOC)) {
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
                    $row_operacion_facturacion_detalle["detSal"] = [];
                    $array_entradas_disponibles = [];

                    // tenemos que traer informacion de los lotes necesarios para cumplir con el detalle
                    $sql_consult_entradas_disponibles =
                        "SELECT
                    es.id,
                    es.codEntSto,
                    es.refNumIngEntSto,
                    es.fecVenEntSto,
                    es.codLot,
                    es.refProdc,
                    DATE(es.fecEntSto) AS fecEntSto,
                    es.canTotDis
                    FROM entrada_stock AS es
                    WHERE idProd = ? AND idEntStoEst = ? AND canTotDis > 0
                    ORDER BY es.fecEntSto ASC";

                    $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
                    $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
                    $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
                    $stmt_consult_entradas_disponibles->execute();

                    // AÑADIMOS AL ARRAY
                    while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                        array_push($array_entradas_disponibles, $row);
                    }

                    if (!empty($array_entradas_disponibles)) {
                        $entradasUtilizadas = []; // entradas utilizadas
                        $cantidad_faltante = $cantidad; // cantidad total faltante

                        foreach ($array_entradas_disponibles as $row_entrada_dispomible) {
                            if ($cantidad_faltante > 0) {

                                $idEntStoUti = $row_entrada_dispomible["id"]; // id entrada
                                $canDisEnt = $row_entrada_dispomible["canTotDis"]; // cantidad disponible
                                $codEntSto = $row_entrada_dispomible["codEntSto"]; // codigo de entrada
                                $fecVenEntSto = $row_entrada_dispomible["fecVenEntSto"]; // fecha de vencimiento
                                $codLot = $row_entrada_dispomible["codLot"]; // codigo de lote
                                $refProdc = $row_entrada_dispomible["refProdc"]; // referencia a produccion
                                $fecEntSto = $row_entrada_dispomible["fecEntSto"]; // fecha de entrada stock

                                if ($canDisEnt >= $cantidad_faltante) {
                                    // añadimos a entradas utilizadas
                                    array_push(
                                        $entradasUtilizadas,
                                        array(
                                            "idEntSto" => $idEntStoUti,
                                            "canSalStoReq" => $cantidad_faltante, // la cantidad de la requisicion detalle
                                            "codEntSto" => $codEntSto,
                                            "fecVenEntSto" => $fecVenEntSto,
                                            "fecEntSto" => $fecEntSto,
                                            "codLot" => $codLot,
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
                                            "codEntSto" => $codEntSto,
                                            "fecVenEntSto" => $fecVenEntSto,
                                            "fecEntSto" => $fecEntSto,
                                            "codLot" => $codLot,
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
                            $row_operacion_facturacion_detalle["detSal"] = $entradasUtilizadas;
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
