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
    $idProdc = $data["id"];

    if ($pdo) {
        $sql =
            "SELECT
            pc.id,
            pc.codLotProd,
            pc.klgLotProd,
            pc.idProdt,
            pd.nomProd,
            pc.idProdEst,
            pe.desEstPro,
            pc.idProdTip,
            pt.desProdTip
            FROM produccion pc
            JOIN producto as pd on pd.id = pc.idProdt
            JOIN produccion_estado as pe on pe.id = pc.idProdEst
            JOIN produccion_tipo as pt on pt.id = pc.idProdTip
            WHERE pc.id = ?
            ";
        try {
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt->execute();
            $sql_detalle = "";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $row["proFinProdDet"] = [];

                $sql_detalle =
                    "SELECT
                ppf.id,
                ppf.idProProFinEst,
                ppfe.desProProFinEst,
                ppf.idProdt,
                pd.nomProd,
                ppf.canDis
                FROM produccion_productos_finales ppf
                JOIN producto as pd on pd.id = ppf.idProdt
                JOIN produccion_producto_final_estado as ppfe on ppfe.id = ppf.idProProFinEst
                WHERE ppf.idProdc = ?
                ";

                $stmt_detalle = $pdo->prepare($sql_detalle);
                $stmt_detalle->bindParam(1, $idProdc, PDO::PARAM_INT);
                $stmt_detalle->execute();

                while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["proFinProdDet"], $row_detalle);
                }
                //AÑADIMOS TODA LA DATA FORMATEADA
                array_push($result, $row);

                // DESCOMENTAR PARA VER LA DATA
                //print_r($data_formula);
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
