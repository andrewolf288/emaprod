<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idLotProdc = $data["id"];

        $sql =
            "SELECT
        pd.id,
        pd.idProdt,
        p.nomProd,
        pd.idProdEst,
        pe.desEstPro,
        pd.idProdTip,
        pt.desProdTip,
        pd.codLotProd,
        pd.klgLotProd,
        pd.canLotProd,
        pd.fecVenLotProd,
        p.idSubCla,
        pd.numop 
    FROM produccion pd
    JOIN producto as p ON p.id = pd.idProdt
    JOIN produccion_estado as pe ON pe.id = pd.idProdEst
    JOIN produccion_tipo as pt ON pt.id = pd.idProdTip 
    WHERE pd.id = ?";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idLotProdc, PDO::PARAM_INT);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            $sql_detalle_agregaciones_lote_produccion = "";
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["detAgr"] = [];
                $row["finalProducts"] = [];

                $sql_detalle_agregaciones_lote_produccion =
                    "SELECT 
                pa.id,
                pa.idProdc,
                pa.idProdt,
                p.nomProd,
                me.simMed,
                pa.idAlm,
                al.nomAlm,
                pa.idProdAgrMot,
                pam.desProdAgrMot,
                pa.canProdAgr,
                pa.fechaInicio,
                pa.fechaFin,
                pa.flag

                FROM produccion_agregacion as pa
                JOIN producto as p ON p.id = pa.idProdt
                JOIN medida as me ON me.id =  p.idMed
                JOIN almacen as al ON al.id = pa.idAlm
                LEFT JOIN produccion_agregacion_motivo as pam ON pam.id = pa.idProdAgrMot
                WHERE pa.idProdc = ?";

                try {
                    $stmt_detalle_agregaciones_lote_produccion = $pdo->prepare($sql_detalle_agregaciones_lote_produccion);
                    $stmt_detalle_agregaciones_lote_produccion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle_agregaciones_lote_produccion->execute();

                    while ($row_detalle_agregacion_lote_produccion = $stmt_detalle_agregaciones_lote_produccion->fetch(PDO::FETCH_ASSOC)) {
                        array_push($row["detAgr"], $row_detalle_agregacion_lote_produccion);
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO EN LA CONSULTA DE AGREGACIONES";
                    $description_error = $e->getMessage();
                }
                $row = getProductsFinal($pdo, $idLotProdc, $row);
                array_push($result, $row);
                //die(json_encode($test));
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
            $description_error = $e->getMessage();
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}

function getProductsFinal($pdo, $idLotProdc, $row)
{
    try {

        $sql_produccion_producto_final = "";
        //$sql_produccion_producto_final =
        //    "SELECT 
        //pf.id as idProFin,
        //p.id,
        //p.codProd2 as 'value',
        //p.nomProd as label
        //FROM produccion as pd
        //JOIN produccion_producto_final as pf ON pf.idProdc = pd.id
        //JOIN producto as p ON p.id = pf.idProdt
        //WHERE pd.id = ?";
        $idLotProdc = $row["idSubCla"];
        $sql_produccion_producto_final =
            "SELECT 
            p.id as idProFin,
            p.id,
            p.codProd2 as 'value',
            p.nomProd as label
            FROM producto  as p
            WHERE p.idSubCla = ? OR p.idCla = 2";

        //$sql_produccion_producto_final = "
        //SELECT * FROM `producto` 
        //WHERE idSubCla = 51 
        //OR idCla = 2";
        $stmt_produccion_producto_final = $pdo->prepare($sql_produccion_producto_final);
        $stmt_produccion_producto_final->bindParam(1, $idLotProdc, PDO::PARAM_INT);
        $stmt_produccion_producto_final->execute();

        while ($row_detalle  = $stmt_produccion_producto_final->fetch(PDO::FETCH_ASSOC)) {
            array_push($row["finalProducts"], $row_detalle);
        }
        return $row;
    } catch (PDOException $e) {
        $message_error = "ERROR INTERNO EN LA CONSULTA DE produccion_producto_final";
        $description_error = $e->getMessage();
        $error[0] = $message_error;
        $error[1] = $description_error;
        return $error[0];
    }
}
