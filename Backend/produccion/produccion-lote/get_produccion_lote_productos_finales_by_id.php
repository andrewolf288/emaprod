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
                        #ppfe.desProProFinEst,
                        ppf.idProdt,
                        pd.nomProd,
                        me.scanToimMed,
                        cl.desCla,
                        ppf.canTotProgProdFin,
                        ppf.tIngProdFin,
                        pa.idProdFin,
                        pd.codProd2,
                        CASE WHEN pa.idProdFin is null THEN false
                        ELSE true
                        END AS isAgregation,
                        ppf.idProdc  

                    FROM produccion_producto_final ppf
                    JOIN producto as pd on pd.id = ppf.idProdt
                    JOIN medida as me on me.id = pd.idMed
                    JOIN clase as cl on cl.id = pd.idCla
                    JOIN produccion_producto_final_estado as ppfe on ppfe.id = ppf.idProdcProdtFinEst
                    LEFT JOIN produccion_agregacion as pa on pa.idProdFin = ppf.id
                    WHERE ppf.idProdc = ?";
                try {
                    $stmt_detalle = $pdo->prepare($sql_detalle);
                    $stmt_detalle->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                    $stmt_detalle->execute();

                    while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                        $row_detalle["insumos"] = [];
                        $row_detalle = getInsumosByProdFinal($pdo, $row_detalle);
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


function getInsumosByProdFinal($pdo, $row)
{
    try {

        $query = "";

        $idProdFinal = $row["id"];

        if ($row["isAgregation"]) {
            $query =
                "SELECT ppf.id as idProdFin, pa.idProdt, pa.canProdAgr as canReqDet  from produccion_producto_final  ppf 
            left join produccion_agregacion pa on pa.idProdFin = ppf.id
            WHERE ppf.id = ?";
        } else {
            $query =
                "SELECT ppf.id as idProdFin,rd.idProdt, rd.canReqDet  from requisicion_detalle  rd 
            join produccion_producto_final  ppf ON ppf.id = rd.idProdFin
            WHERE ppf.id = ?";
        }



        $stmt  = $pdo->prepare($query);
        $stmt->bindParam(1, $idProdFinal, PDO::PARAM_INT);
        $stmt->execute();

        while ($row_detalle  = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($row["insumos"], $row_detalle);
        }
        return $row;
    } catch (PDOException $e) {
        $message_error = "ERROR INTERNO EN LA CONSULTA DE requisiciones y agregaciones";
        $description_error = $e->getMessage();
        $error[0] = $message_error;
        $error[1] = $description_error;
        return $error[0];
    }
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
