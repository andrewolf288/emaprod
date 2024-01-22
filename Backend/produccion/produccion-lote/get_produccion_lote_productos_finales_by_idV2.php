<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $idLotProdc = $data["id"];

    if ($pdo) {
        $sql =
            "SELECT
            pd.id,
            pd.numop,
            pd.idProdt,
            p.nomProd,
            p.idSubCla,
            pd.idProdEst,
            pe.desEstPro,
            pd.idProdTip,
            pt.desProdTip,
            pd.codLotProd,
            pd.klgLotProd,
            pd.canLotProd,
            pd.fecVenLotProd, 
            pd.canIng,
            regProFin
        FROM produccion pd
        JOIN producto as p ON p.id = pd.idProdt
        JOIN produccion_estado as pe ON pe.id = pd.idProdEst
        JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
        WHERE pd.id = ?";

        try {
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idLotProdc, PDO::PARAM_INT);
            $stmt->execute();
            // recorremos los resultados
            $sql_detalle = "";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["proFinProdDet"] = [];

                $sql_detalle =
                    "SELECT
                        DISTINCT
                        ppf.id,
                        ppf.idProdcProdtFinEst,
                        ppf.idProdt,
                        ppfe.desProProFinEst,
                        pd.nomProd,
                        me.simMed,
                        cl.desCla,
                        ppf.canTotProgProdFin,
                        ppf.canTotIngProdFin,
                        pd.codProd2,
                        ppf.idProdc,
                        ppf.esTerIngProFin
                    FROM produccion_producto_final ppf
                    JOIN producto as pd on pd.id = ppf.idProdt
                    JOIN medida as me on me.id = pd.idMed
                    JOIN clase as cl on cl.id = pd.idCla
                    JOIN produccion_producto_final_estado as ppfe on ppfe.id = ppf.idProdcProdtFinEst
                    WHERE ppf.idProdc = ?";
                try {
                    $stmt_detalle = $pdo->prepare($sql_detalle);
                    $stmt_detalle->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle->execute();

                    while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                        $idProdFin = $row_detalle["idProdt"]; // producto final
                        $row_detalle["entradas_parciales"] = []; // detalle de las entradas
                        $row_detalle["cantidad_ingresada"] = 0; // cantidad total ingresada

                        // primero tenemos que buscar si se han registrado entradas
                        $sql_select_entradas_parciales =
                            "SELECT
                        pip.id,
                        pip.idProdt,
                        p.nomProd,
                        pip.refProdtProg,
                        pip.canProdIng,
                        pip.fecProdIng,
                        pip.fecProdVen,
                        pip.fecProdIngAlm,
                        pip.esComProdIng,
                        pip.fecCreProdIng,
                        pip.fecActProdIng
                        FROM produccion_ingreso_producto AS pip
                        JOIN producto AS p ON p.id = pip.idProdt
                        WHERE pip.idProdc = ? AND pip.idProdt = ?";
                        $stmt_select_entradas_parciales = $pdo->prepare($sql_select_entradas_parciales);
                        $stmt_select_entradas_parciales->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                        $stmt_select_entradas_parciales->bindParam(2, $idProdFin, PDO::PARAM_INT);
                        $stmt_select_entradas_parciales->execute();

                        // recorremos las entradas y las agregamos al detalle de entradas parciales
                        while ($row_detalle_entrada = $stmt_select_entradas_parciales->fetch(PDO::FETCH_ASSOC)) {
                            $canTotEnt = $row_detalle_entrada["canProdIng"];
                            $row_detalle["cantidad_ingresada"] += $canTotEnt; // sumamos la cantidad ingresada
                            array_push($row_detalle["entradas_parciales"], $row_detalle_entrada);
                        }

                        // Agregamos el detalle de producto final
                        array_push($row["proFinProdDet"], $row_detalle);
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO SERVER";
                    $description_error = $e->getMessage();
                }
                array_push($result, $row);
            }
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
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
