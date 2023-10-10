<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($pdo) {
        $sql =
            "SELECT
            f.id,
            f.idProd,
            f.idTipFor,
            ft.desForTip,
            p.nomProd,
            f.nomFor,
            f.desFor,
            f.lotKgrFor,
            f.fecCreFor,
            f.fecActFor
            FROM formula f
            JOIN producto as p on p.id = f.idProd
            JOIN formula_tipo as ft on ft.id = f.idTipFor 
            ORDER BY f.fecCreFor DESC
            ";
        try {
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $sql_detalle = "";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $idFor = $row["id"];
                $row["forDet"] = [];

                $sql_detalle =
                    "SELECT
                fd.id,
                fd.idMatPri,
                fd.idAre,
                a.desAre,
                p.nomProd,
                c.desCla,
                fd.canMatPriFor,
                fd.fecCreFor,
                fd.fecActFor
                FROM formula_detalle fd
                JOIN producto as p on p.id = fd.idMatPri
                JOIN area as a on a.id = fd.idAre
                JOIN clase as c on p.idCla = c.id
                WHERE fd.idFor = ?
                ";

                $stmt_detalle = $pdo->prepare($sql_detalle);
                $stmt_detalle->bindParam(1, $idFor, PDO::PARAM_INT);
                $stmt_detalle->execute();

                while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["forDet"], $row_detalle);
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
