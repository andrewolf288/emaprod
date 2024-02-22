<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = array();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOrdIrra = $data["idOrdIrra"]; // id de operacion de facturacion
    $idOrdIrraDet = $data["id"]; // id de operacion de facturacion detalle
    $canOpeIrra = $data["canOpeIrra"]; // cantidad de salida
    $idProdt = $data["idProdt"];  // id de producto
    $refProdt = $data["refProdt"]; // referencia del producto
    $detSal = $data["detSal"]; // detalle de salida
    $idAlmacenPrincipal = 1; // almacen principal


    try {
        // Iniciamos una transaccion
        $pdo->beginTransaction();

        // primero debemos consultar los movimientos de salida del detalle de orden de irradiacion
        $esSal = 1;
        $sql_select_movimiento_salida_orden_irradiacion =
            "SELECT * FROM movimiento_orden_irradiacion
        WHERE idOrdIrra = ? AND idOrdIrraDet = ? AND esSal = ?";
        $stmt_select_movimiento_salida_orden_irradiacion = $pdo->prepare($sql_select_movimiento_salida_orden_irradiacion);
        $stmt_select_movimiento_salida_orden_irradiacion->bindParam(1, $idOrdIrra, PDO::PARAM_INT);
        $stmt_select_movimiento_salida_orden_irradiacion->bindParam(2, $idOrdIrraDet, PDO::PARAM_INT);
        $stmt_select_movimiento_salida_orden_irradiacion->bindParam(3, $esSal, PDO::PARAM_BOOL);
        $stmt_select_movimiento_salida_orden_irradiacion->execute();
        $rows_movimientos_salida_orden_irradiacion = $stmt_select_movimiento_salida_orden_irradiacion->fetchAll(PDO::FETCH_ASSOC);
        // print_r($rows_movimientos_salida_orden_irradiacion);

        // recorremos el movimiento de salida de la orden de irradiacion
        foreach ($rows_movimientos_salida_orden_irradiacion as $row_movimiento) {
            $idProdt = $row_movimiento["idProdt"];
            $idEntSto = $row_movimiento["idEntSto"];
            $idProdc = $row_movimiento["idProdc"];
            $codLotProd = $row_movimiento["codLotProd"];
            $canMovOpeIrra = $row_movimiento["canMovOpeIrra"];

            // los productos que regresan son irradiados, debemos buscar la referencia de estos
            $sql_select_producto_irradiado =
                "SELECT id, codProd2 FROM producto WHERE proRef = ?";
            $stmt_select_producto_irradiado = $pdo->prepare($sql_select_producto_irradiado);
            $stmt_select_producto_irradiado->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_select_producto_irradiado->execute();
            $row_producto_irradiado = $stmt_select_producto_irradiado->fetch(PDO::FETCH_ASSOC);
            $idProdtIrra = intval($row_producto_irradiado["id"]);
            $codProd2 = $row_producto_irradiado["codProd2"];
            // print_r($idProdtIrra);

            // por cada movimiento diferente realizado debemos replicar un movimiento de ingreso
            $esEnt = 1;
            $sql_create_movimiento_orden_irradiacion =
                "INSERT INTO movimiento_orden_irradiacion
            (idOrdIrra, idOrdIrraDet, idProdt, idEntSto, idProdc, codLotProd, canMovOpeIrra, esEnt)
            VALUES(?, ?, ?, ?, ?, ?, $canMovOpeIrra, ?)";
            $stmt_create_movimiento_orden_irradiacion = $pdo->prepare($sql_create_movimiento_orden_irradiacion);
            $stmt_create_movimiento_orden_irradiacion->bindParam(1, $idOrdIrra, PDO::PARAM_INT);
            $stmt_create_movimiento_orden_irradiacion->bindParam(2, $idOrdIrraDet, PDO::PARAM_INT);
            $stmt_create_movimiento_orden_irradiacion->bindParam(3, $idProdtIrra, PDO::PARAM_INT);
            $stmt_create_movimiento_orden_irradiacion->bindParam(4, $idEntSto, PDO::PARAM_INT);
            $stmt_create_movimiento_orden_irradiacion->bindParam(5, $idProdc, PDO::PARAM_INT);
            $stmt_create_movimiento_orden_irradiacion->bindParam(6, $codLotProd, PDO::PARAM_STR);
            $stmt_create_movimiento_orden_irradiacion->bindParam(7, $esEnt, PDO::PARAM_BOOL);
            $stmt_create_movimiento_orden_irradiacion->execute();

            // por cada movimiento diferente realizado debemos realizar una entrada de stock
            // 1. Debemos consultar la informacion de la entrada utilizada para la salida
            $sql_select_entrada_stock_movimiento_salida =
                "SELECT * FROM entrada_stock
            WHERE id = ?";
            $stmt_select_entrada_stock_movimiento_salida = $pdo->prepare($sql_select_entrada_stock_movimiento_salida);
            $stmt_select_entrada_stock_movimiento_salida->bindParam(1, $idEntSto, PDO::PARAM_INT);
            $stmt_select_entrada_stock_movimiento_salida->execute();
            $row_entrada_stock = $stmt_select_entrada_stock_movimiento_salida->fetch(PDO::FETCH_ASSOC);

            // 3. Debemos definir los datos de entrada
            $anio_actual = date('Y'); // obtenemos año actual
            $idEntStoEst = 1; // disponible
            $idEntStoTip = 5; // ENTRADA DE IRRADIACION
            $docEntSto = "ENTRADA DE IRRADIACION";
            $refNumIngEntSto = 0; // numero de referencia de ingreso
            $codEntSto = ""; // codigo de entrada de stock

            $sql_numero_entrada =
                "SELECT 
            max(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
            FROM entrada_stock
            WHERE idProd = ? AND YEAR(fecEntSto) = ?
            ORDER BY refNumIngEntSto DESC LIMIT 1";

            // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
            $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
            $stmt_numero_entrada->bindParam(1, $idProdtIrra, PDO::PARAM_INT);
            $stmt_numero_entrada->bindParam(2, $anio_actual, PDO::PARAM_STR);
            $stmt_numero_entrada->execute();
            $row_numero_entrada = $stmt_numero_entrada->fetch(PDO::FETCH_ASSOC);

            // COMPROBAMOS SI NO HUBO ENTRADAS DE ESE PRODUCTO
            if (!$row_numero_entrada) {
                // SERA LA PRIMERA INSERCION DEL AÑO
                $refNumIngEntSto = 1;
            } else {
                $refNumIngEntSto = intval($row_numero_entrada["refNumIngEntSto"]) + 1;
            }

            // EL CODIGO DE INGRESO ES DE 
            $refNumIngEntSto = str_pad(strval($refNumIngEntSto), 3, "0", STR_PAD_LEFT);
            $letAniEntSto = $row_entrada_stock["letAniEntSto"];
            $diaJulEntSto = $row_entrada_stock["diaJulEntSto"];

            $codEntSto = "$codProd2" . "00" . "$letAniEntSto" . "$diaJulEntSto" . "$refNumIngEntSto";

            // 2. Debemos replicar el ingreso de una entrada haciendo una replica exacta
            $sql_create_entrada_stock_ingreso_irradiacion =
                "INSERT INTO entrada_stock
            (idProd, 
            idProv, 
            idEntStoEst, 
            idAlm, 
            idEntStoTip,
            codEntSto,
            letAniEntSto,
            diaJulEntSto,
            refNumIngEntSto,
            canTotEnt,
            canTotDis,
            docEntSto,
            fecVenEntSto,
            fecEntSto,
            referencia,
            codLot,
            refProdc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, $canMovOpeIrra, $canMovOpeIrra, ?, ?, ?, ?, ?, ?)";
            $stmt_create_entrada_stock_ingreso_irradiacion = $pdo->prepare($sql_create_entrada_stock_ingreso_irradiacion);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(1, $idProdtIrra, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(2, $row_entrada_stock["idProv"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(4, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(5, $idEntStoTip, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(6, $codEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(7, $letAniEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(8, $diaJulEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(9, $refNumIngEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(10, $docEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(11, $row_entrada_stock["fecVenEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(12, $row_entrada_stock["fecEntSto"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(13, $row_entrada_stock["referencia"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(14, $row_entrada_stock["codLot"], PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(15, $row_entrada_stock["refProdc"], PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->execute();

            // debemos asegurarnos de actualizar correctamente el stock
            $sql_consult_almacen_stock =
                "SELECT * FROM almacen_stock 
            WHERE idProd = ? AND idAlm = ?";
            $stmt_consult_almacen_stock =  $pdo->prepare($sql_consult_almacen_stock);
            $stmt_consult_almacen_stock->bindParam(1, $idProdtIrra, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->bindParam(2, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
            $stmt_consult_almacen_stock->execute();

            $fecDateNow = date('Y-m-d H:i:s');
            if ($stmt_consult_almacen_stock->rowCount() === 1) {
                // UPDATE ALMACEN STOCK
                $sql_update_almacen_stock =
                    "UPDATE almacen_stock 
                    SET canSto = canSto + $canMovOpeIrra, canStoDis = canStoDis + $canMovOpeIrra, fecActAlmSto = ?
                    WHERE idProd = ? AND idAlm = ?";
                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                $stmt_update_almacen_stock->bindParam(1, $fecDateNow, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idProdtIrra, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(3, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
                $stmt_update_almacen_stock->execute(); // ejecutamos
            } else {
                // CREATE NUEVO REGISTRO ALMACEN STOCK
                $sql_create_almacen_stock =
                    "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                    VALUE (?,?,$canMovOpeIrra,$canMovOpeIrra)";
                $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                $stmt_create_almacen_stock->bindParam(1, $idProdtIrra, PDO::PARAM_INT);
                $stmt_create_almacen_stock->bindParam(2, $row_entrada_stock["idAlm"], PDO::PARAM_INT);
                $stmt_create_almacen_stock->execute(); // ejecutamos
            }
        }

        // ACTUALIZAMOS EL DETALLE DE ORDEN DE IRRADIACION
        $esComIngrStoDet = 1; // ESTADO DE COMPLETADO
        $total_requisiciones_detalle_no_completadas = 0;
        $sql_consulta_requisicion_detalle =
            "SELECT * FROM orden_irradiacion_detalle
            WHERE idOrdIrra = ? AND fueComIngr <> ?";
        $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
        $stmt_consulta_requisicion_detalle->bindParam(1, $idOrdIrra, PDO::PARAM_INT);
        $stmt_consulta_requisicion_detalle->bindParam(2, $esComIngrStoDet, PDO::PARAM_BOOL);
        $stmt_consulta_requisicion_detalle->execute();

        $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

        $idOrdIrraEst  = 0; // inicializacion

        $fecIngrOrdIrraDet = date('Y-m-d H:i:s');
        // actualizamos el detalle
        $sql_update_requisicion_detalle =
            "UPDATE orden_irradiacion_detalle
        SET fueComIngr = ?, fecEntOrdIrraDet = ?
        WHERE id = ?";
        $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
        $stmt_update_requisicion_detalle->bindParam(1, $esComIngrStoDet, PDO::PARAM_BOOL);
        $stmt_update_requisicion_detalle->bindParam(2, $fecIngrOrdIrraDet, PDO::PARAM_STR);
        $stmt_update_requisicion_detalle->bindParam(3, $idOrdIrraDet, PDO::PARAM_INT);
        $stmt_update_requisicion_detalle->execute();

        if ($total_requisiciones_detalle_no_completadas === 1) { // si es la unica requisicion detalle por completar
            $idOrdIrraEst  = 5; // RETORNO COMPLETO
            // actualizamos la cabecera
            $sql_update_requisicion_completo =
                "UPDATE orden_irradiacion
            SET idOrdIrraEst = ?, fecComOrdIrra = ?
            WHERE id = ?";
            $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
            $stmt_update_requisicion_completo->bindParam(1, $idOrdIrraEst, PDO::PARAM_INT);
            $stmt_update_requisicion_completo->bindParam(2, $fecIngrOrdIrraDet, PDO::PARAM_STR);
            $stmt_update_requisicion_completo->bindParam(3, $idOrdIrra, PDO::PARAM_INT);
            $stmt_update_requisicion_completo->execute();
        } else {
            $idOrdIrraEst  = 4; // EN PROCESO DE RETORNO
            // actualizamos la cabecera
            $sql_update_requisicion_completo =
                "UPDATE orden_irradiacion
            SET idOrdIrraEst = ?
            WHERE id = ?";
            $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
            $stmt_update_requisicion_completo->bindParam(1, $idOrdIrraEst, PDO::PARAM_INT);
            $stmt_update_requisicion_completo->bindParam(2, $idOrdIrra, PDO::PARAM_INT);
            $stmt_update_requisicion_completo->execute();
        }

        // TERMINAMOS LA TRANSACCION
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollback();
        $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
        $description_error = $e->getMessage();
    } catch (PDOException $e) {
        $pdo->rollback();
        $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
