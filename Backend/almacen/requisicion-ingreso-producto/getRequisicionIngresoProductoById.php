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

        $idLotProdc = $data["id"]; // id de produccion

        // en primer lugar traemos la informacion de produccion
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

            //recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // ahora traemos la informacion de las requisiciones de devolucion
                $sql_requisicion_ingreso =
                    "SELECT 
                pip.id,
                pip.idProdc,
                pip.codLot,
                pip.idProdt,
                p.nomProd,
                p.codProd2,
                pip.refProdtProg,
                pip.canProdIng,
                pip.fecProdIng,
                pip.fecProdVen,
                pip.esComProdIng
                FROM produccion_ingreso_producto AS pip
                JOIN producto AS p ON p.id = pip.idProdt
                WHERE pip.idProdc = ?";

                $stmt_requisicion_ingreso = $pdo->prepare($sql_requisicion_ingreso);
                $stmt_requisicion_ingreso->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                $stmt_requisicion_ingreso->execute();

                $row["prodDetIng"] = $stmt_requisicion_ingreso->fetchAll(PDO::FETCH_ASSOC); // detalle de agregacion

                array_push($result, $row);
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
