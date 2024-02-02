<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $idProdt = 407;
    $idProdFin = 41;

    // primero debemos identificar si el producto final no fue programado
    $esProdcProdtProg = 1;
    $salidasEmpleadas = []; // salidas empleadas

    $sql_select_presentacion_final =
        "SELECT esProdcProdtProg 
    FROM produccion_producto_final
    WHERE id = ?";
    $stmt_select_presentacion_final = $pdo->prepare($sql_select_presentacion_final);
    $stmt_select_presentacion_final->bindParam(1, $idProdFin, PDO::PARAM_INT);
    $stmt_select_presentacion_final->execute();

    $row_select = $stmt_select_presentacion_final->fetch(PDO::FETCH_ASSOC);
    if ($row_select !== false) {
        // Comprueba si es true o false (asumiendo que es un booleano en la base de datos)
        if ($row_select['esProdcProdtProg'] == 0) {
            $esProdcProdtProg = 0;
        }
    }

    print_r($esProdcProdtProg);

    $sql_salidas_empleadas_requisicion_detalle = "";

    // si fue un producto programado
    if ($esProdcProdtProg == 1) {
        print_r("Entro aqui");
        // primero debemos averiguar cual fue su requisicion
        $sql_select_requisicion_detalle =
            "SELECT * FROM requisicion_detalle
                WHERE idProdFin = ? AND idProdt = ?";
        $stmt_select_requisicion_detalle = $pdo->prepare($sql_select_requisicion_detalle);
        $stmt_select_requisicion_detalle->bindParam(1, $idProdFin, PDO::PARAM_INT);
        $stmt_select_requisicion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
        $stmt_select_requisicion_detalle->execute();
        $row_requisicion_detalle = $stmt_select_requisicion_detalle->fetch(PDO::FETCH_ASSOC);

        // AHORA BUSCAMOS LAS SALIDAS CORRESPONDIENTE AL DETALLE
        $sql_salidas_empleadas_requisicion_detalle =
            "SELECT st.id, st.idEntSto, st.canSalStoReq, et.idAlm FROM salida_stock st
                JOIN entrada_stock AS et ON et.id = st.idEntSto
                WHERE st.idReqDet = ? ORDER BY st.id DESC";
        $stmt_salidas_empleadas_requisicion_detalle = $pdo->prepare($sql_salidas_empleadas_requisicion_detalle);
        $stmt_salidas_empleadas_requisicion_detalle->bindParam(1, $row_requisicion_detalle["id"], PDO::PARAM_INT);
        $stmt_salidas_empleadas_requisicion_detalle->execute();

        // agregamos al arreglo de salidas empleadas
        $salidasEmpleadas = $stmt_salidas_empleadas_requisicion_detalle->fetchAll(PDO::FETCH_ASSOC);
    }

    // si no fue un producto programado
    else {
        print_r("Entro aqui 2");
        // primero debemos averiguar cual fue su requisicion
        $sql_select_requisicion_agregacion_detalle =
            "SELECT rad.id FROM requisicion_agregacion_detalle AS rad
                JOIN requisicion_agregacion AS ra ON ra.id = rad.idReqAgr
                WHERE ra.idProdFin = ? AND rad.idProdt = ?";
        $stmt_select_requisicion_agregacion_detalle = $pdo->prepare($sql_select_requisicion_agregacion_detalle);
        $stmt_select_requisicion_agregacion_detalle->bindParam(1, $idProdFin, PDO::PARAM_INT);
        $stmt_select_requisicion_agregacion_detalle->bindParam(2, $idProdt, PDO::PARAM_INT);
        $stmt_select_requisicion_agregacion_detalle->execute();
        $row_requisicion_agregacion_detalle = $stmt_select_requisicion_agregacion_detalle->fetch(PDO::FETCH_ASSOC);

        print_r($row_requisicion_agregacion_detalle);

        // AHORA BUSCAMOS LAS SALIDAS CORRESPONDIENTE AL DETALLE
        $sql_salidas_empleadas_requisicion_agregacion_detalle =
            "SELECT st.id, st.idEntSto, st.canSalStoReq, et.idAlm FROM salida_stock st
                JOIN entrada_stock AS et ON et.id = st.idEntSto
                WHERE st.idAgreDet = ? ORDER BY st.id DESC";
        $stmt_salidas_empleadas_requisicion_agregacion_detalle = $pdo->prepare($sql_salidas_empleadas_requisicion_agregacion_detalle);
        $stmt_salidas_empleadas_requisicion_agregacion_detalle->bindParam(1, $row_requisicion_agregacion_detalle["id"], PDO::PARAM_INT);
        $stmt_salidas_empleadas_requisicion_agregacion_detalle->execute();

        // agregamos al arreglo de salidas empleadas
        $salidasEmpleadas = $stmt_salidas_empleadas_requisicion_agregacion_detalle->fetchAll(PDO::FETCH_ASSOC);
    }

    print_r($salidasEmpleadas);

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
