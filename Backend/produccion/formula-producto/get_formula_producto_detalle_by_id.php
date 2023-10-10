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
    $idForProd = $data["id"];

    if ($pdo) {
        $sql =
            "SELECT
            fpt.id,
            fpt.idProdFin,
            p.nomProd,
            cl.desCla,
            me.simMed,
            fpt.fecActForProTer
            FROM formula_producto_terminado fpt
            JOIN producto as p on p.id = fpt.idProdFin
            JOIN medida as me on me.id = p.idMed
            JOIN clase as cl on cl.id = p.idCla
            WHERE fpt.id = ?
            ";
        try {
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idForProd, PDO::PARAM_INT);
            $stmt->execute();
            $sql_detalle = "";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $idForProdFin = $row["id"];
                $row["reqDet"] = [];

                $sql_detalle =
                    "SELECT
                fptd.id,
                fptd.idForProdFin,
                fptd.idProd,
                p.nomProd,
                cl.desCla,
                me.simMed,
                fptd.idAre,
                ar.desAre,
                fptd.idAlm,
                al.nomAlm,
                fptd.canForProDet
                FROM formula_producto_terminado_detalle fptd
                JOIN producto as p on p.id = fptd.idProd
                JOIN medida as me on me.id = p.idMed
                JOIN clase as cl on cl.id = p.idCla
                JOIN area as ar on ar.id = fptd.idAre
                JOIN almacen as al on al.id = fptd.idAlm
                WHERE fptd.idForProdFin = ?
                ";

                $stmt_detalle = $pdo->prepare($sql_detalle);
                $stmt_detalle->bindParam(1, $idForProdFin, PDO::PARAM_INT);
                $stmt_detalle->execute();

                while ($row_detalle = $stmt_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["reqDet"], $row_detalle);
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
