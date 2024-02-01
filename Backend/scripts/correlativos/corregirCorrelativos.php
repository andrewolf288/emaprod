<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if ($pdo) {
        $flag = "LOTE ANTERIOR";
        $select_produccion =
            "SELECT * FROM produccion
        WHERE obsProd <> ?";
        $stmt_select_produccion = $pdo->prepare($select_produccion);
        $stmt_select_produccion->bindParam(1, $flag, PDO::PARAM_STR);
        $stmt_select_produccion->execute();
        // $result = $stmt_select_produccion->fetchAll(PDO::FETCH_ASSOC);

        while ($row_produccion = $stmt_select_produccion->fetch(PDO::FETCH_ASSOC)) {
            $idProdc = $row_produccion["id"];
            $numop = $row_produccion["numop"];
            $index = 1;

            // empezamos con las agregaciones
            $select_agregaciones =
                "SELECT * FROM requisicion_agregacion
            WHERE idProdc = ? ORDER BY id ASC";
            $stmt_select_agregaciones = $pdo->prepare($select_agregaciones);
            $stmt_select_agregaciones->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt_select_agregaciones->execute();

            while ($row_agregacion = $stmt_select_agregaciones->fetch(PDO::FETCH_ASSOC)) {
                $idAgre = $row_agregacion["id"];
                $correlativoAgregacion = $numop . " - A" . str_pad($index, 2, '0', STR_PAD_LEFT);
                // actualizamos el correlativo
                $sql_update_correlativo_agregacion =
                    "UPDATE requisicion_agregacion SET correlativo = ? WHERE id = ?";
                $stmt_update_correlativo_agregacion = $pdo->prepare($sql_update_correlativo_agregacion);
                $stmt_update_correlativo_agregacion->bindParam(1, $correlativoAgregacion, PDO::PARAM_STR);
                $stmt_update_correlativo_agregacion->bindParam(2, $idAgre, PDO::PARAM_INT);
                $stmt_update_correlativo_agregacion->execute();
                $index += 1;
            }

            $index = 1;
            // seguimos con las devoluciones
            $select_devoluciones =
                "SELECT * FROM requisicion_devolucion
            WHERE idProdc = ? ORDER BY id ASC";
            $stmt_select_devoluciones = $pdo->prepare($select_devoluciones);
            $stmt_select_devoluciones->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt_select_devoluciones->execute();

            while ($row_devolucion = $stmt_select_devoluciones->fetch(PDO::FETCH_ASSOC)) {
                $idDev = $row_devolucion["id"];
                $correlativoDevolucion = $numop . " - D" . str_pad($index, 2, '0', STR_PAD_LEFT);
                // actualizamos el correlativo
                $sql_update_correlativo_devolucion =
                    "UPDATE requisicion_devolucion SET correlativo = ? WHERE id = ?";
                $stmt_update_correlativo_devolucion = $pdo->prepare($sql_update_correlativo_devolucion);
                $stmt_update_correlativo_devolucion->bindParam(1, $correlativoDevolucion, PDO::PARAM_STR);
                $stmt_update_correlativo_devolucion->bindParam(2, $idDev, PDO::PARAM_INT);
                $stmt_update_correlativo_devolucion->execute();
                $index += 1;
            }
        }
    } else {
        $message_error = "ERROR EN LA CONECCION";
        $description_error = "ERROR EN LA CONECCION";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
