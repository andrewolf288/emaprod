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

        // Extraemos los datos
        $idLotProdc = $data["id"];
        $idProdt = $data["idProdt"];
        $result = [];

        $sql_detalle_devoluciones_lote_produccion =
            "SELECT 
                pdv.id,
                pdv.idProdc,
                pdv.idProdt,
                p.nomProd,
                me.simMed,
                pdv.idAlm,
                al.nomAlm,
                pdv.idProdDevMot,
                pdm.desProdDevMot,
                pdv.canProdDev, p.codProd2
                FROM produccion_devolucion as pdv
                JOIN producto as p ON p.id = pdv.idProdt
                JOIN medida as me ON me.id = p.idMed
                JOIN almacen as al ON al.id = pdv.idAlm
                JOIN produccion_devolucion_motivo as pdm ON pdm.id = pdv.idProdDevMot
                WHERE pdv.idProdc = ? AND pdv.idProdt = ?";

        try {
            $stmt_detalle_devoluciones_lote_produccion = $pdo->prepare($sql_detalle_devoluciones_lote_produccion);
            $stmt_detalle_devoluciones_lote_produccion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
            $stmt_detalle_devoluciones_lote_produccion->bindParam(2, $idProdt, PDO::PARAM_INT);
            $stmt_detalle_devoluciones_lote_produccion->execute();

            while ($row_detalle_agregacion_lote_produccion = $stmt_detalle_devoluciones_lote_produccion->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row_detalle_agregacion_lote_produccion);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE AGREGACIONES";
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
