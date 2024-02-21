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

    $idProdc = $data["idProdc"]; // lote produccion
    $idProdt = $data["idProdt"]; // producto
    $idProdFin = $data["idProdFin"]; // referencia la producto final de produccion id
    $idProdDevMot = $data["idMotDev"]; // motivo de devolucion
    $canProdDev = floatval($data["canReqDevDet"]); // cantidad devuelta
    $nomProd = $data["nomProd"]; // producto
    $idReqDev = $data["idReqDev"]; // id de requisicion de devolucion
    $idReqDevDet = $data["id"]; // id de requisicion devolucion detalle
    // tolerancia de error de punto flotante
    $tolerancia = 0.000001;

    // si el motivo de devolucion no es desmedro
    if ($idProdDevMot != 2) {

        // si la variable idProdFin no es null
        if ($idProdFin) {
            $salidasEmpleadas = []; // salidas empleadas
            // primero debemos identificar si el producto final no fue programado
            $esProdcProdtProg = 1;

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

            // debemos formar un sql adecuado para cada ocasion
            /*
            1. si el producto final fue algo programado, su requisicion se encuentra en requisicon
            2. si el producto final no fue programado y fue agregado se encuentra en requisicion agregacion
        */
            $sql_salidas_empleadas_requisicion_detalle = "";

            // si fue un producto programado
            if ($esProdcProdtProg == 1) {
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

            // si se obtuvo sus salidas empleadas
            if (!empty($salidasEmpleadas)) {

                $cantidadAdevolver = $canProdDev; // acumulado
                $cantSalPorIteracion = 0; // cantidad auxiliar
                $idEntStoEst = 1; // estado de disponible de entrada
                try {
                    $pdo->beginTransaction();
                    // recorremos las salidas
                    foreach ($salidasEmpleadas as $value) {
                        $idEntSto = $value["idEntSto"]; // entrada
                        $canSalStoReq = $value["canSalStoReq"]; // cantidad
                        $idAlmacenEntrada = $value["idAlm"]; // almacen entrada

                        // si la cantidad a devolver es mayor a salida de la entrada
                        if ($cantidadAdevolver - $canSalStoReq >= -$tolerancia) {
                            $cantidadAdevolver -= $canSalStoReq;
                            $cantSalPorIteracion = $canSalStoReq;
                        } else {
                            $cantSalPorIteracion = $cantidadAdevolver;
                            $cantidadAdevolver = 0;
                        }

                        // actualizamos la entrada
                        $sql_update_entrada_stock =
                            "UPDATE entrada_stock
                        SET canTotDis = canTotDis + $cantSalPorIteracion, idEntStoEst = ?
                        WHERE id = ?";

                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->execute();

                        // tenemos que registrar la trazabilidad de la devolucion
                        $sql_insert_trazabilidad_devolucion_entrada =
                            "INSERT INTO trazabilidad_devolucion_entrada
                            (idReqDevDet, idEntSto, canReqDevDet)
                            VALUES(?, ?, $cantSalPorIteracion)";
                        $stmt_insert_trazabilidad_devolucion_entrada = $pdo->prepare($sql_insert_trazabilidad_devolucion_entrada);
                        $stmt_insert_trazabilidad_devolucion_entrada->bindParam(1, $idReqDevDet, PDO::PARAM_INT);
                        $stmt_insert_trazabilidad_devolucion_entrada->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_insert_trazabilidad_devolucion_entrada->execute();

                        // debemos actualizar el stock almacen
                        $sql_consult_almacen_stock =
                            "SELECT * FROM almacen_stock
                        WHERE idProd = ? AND idAlm = ?";
                        $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
                        $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->bindParam(2, $idAlmacenEntrada, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->execute();

                        if ($stmt_consult_almacen_stock->rowCount() === 1) {
                            // ACTUALIZAMOS
                            $sql_update_almacen_stock =
                                "UPDATE almacen_stock 
                                SET canSto = canSto + $cantSalPorIteracion, canStoDis = canStoDis + $cantSalPorIteracion
                                WHERE idProd = ? AND idAlm = ?";
                            $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                            $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->bindParam(2, $idAlmacenEntrada, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->execute();
                        } else {
                            // CREAMOS
                            $sql_insert_almacen_stock =
                                "INSERT INTO almacen_stock
                                (idProd, idAlm, canSto, canStoDis)
                                VALUES(?, ?, $cantSalPorIteracion, $cantSalPorIteracion)";
                            $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                            $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                            $stmt_insert_almacen_stock->bindParam(2, $idAlmacenEntrada, PDO::PARAM_INT);
                            $stmt_insert_almacen_stock->execute();
                        }

                        // si la cantidad a devolver es igual a 0
                        if (abs($cantidadAdevolver) < $tolerancia) {
                            break;
                        }
                    }
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollBack();
                    $message_error = "ERROR EN LA ACTUALIZACION DE LA ENTRADA";
                    $description_error = $e->getMessage();
                }
            } else {
                $message_error = "No se genero las salidas del producto";
                $description_error = $description_error . "No se generaron las salidas del producto de su requisicion: $nomProd" . "\n";
            }
        } else {
            $anio_actual = date('Y'); // obtenemos año actual
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
            $stmt_numero_entrada->bindParam(1, $idProdt, PDO::PARAM_INT);
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

            // debemos generar una nueva entrada de tipo TRANSFORMACION
            $idLastCreationEntradaStock = 0;
            $idProv = 1;
            $codProv = "00";
            $idAlmacenPrincipal = 1;
            $idEntStoEst = 1;
            $letAniEntSto = obtenerLetraCorrespondiente();
            $diaJulEntSto = obtenerDiaJulianoActual();
            $docEntSto = "DEVOLUCION DE TRANSFORMACION";
            $idEntStoTip = 7; // devolucion de transformacion
            $fecEntSto = date('Y-m-d H:i:s'); // fecha ingreso almacen

            // ***** FORMAMOS EL CODIGO DE ENTRADA ******
            $sql_select_codigo_producto =
                "SELECT codProd2 
            FROM producto 
            WHERE id= ?";
            $stmt_select_codigo_producto = $pdo->prepare($sql_select_codigo_producto);
            $stmt_select_codigo_producto->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_select_codigo_producto->execute();
            $row_producto = $stmt_select_codigo_producto->fetch(PDO::FETCH_ASSOC);
            $codProd = $row_producto["codProd2"];

            $codEntSto = "$codProd" . "$codProv" . "$letAniEntSto" . "$diaJulEntSto" . "$refNumIngEntSto";

            $sql_create_entrada_stock =
                "INSERT INTO entrada_stock
            (idProd,
            idProv,
            idAlm,
            idEntStoEst,
            codEntSto,
            letAniEntSto,
            diaJulEntSto,
            refNumIngEntSto,
            canTotEnt,
            canTotDis,
            docEntSto,
            fecEntSto,
            idEntStoTip)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, $canProdDev, $canProdDev, ?, ?, ?)";
            $stmt_create_entrada_stock = $pdo->prepare($sql_create_entrada_stock);
            $stmt_create_entrada_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_create_entrada_stock->bindParam(2, $idProv, PDO::PARAM_INT);
            $stmt_create_entrada_stock->bindParam(3, $idAlmacenPrincipal, PDO::PARAM_INT);
            $stmt_create_entrada_stock->bindParam(4, $idEntStoEst, PDO::PARAM_INT);
            $stmt_create_entrada_stock->bindParam(5, $codEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock->bindParam(6, $letAniEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock->bindParam(7, $diaJulEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock->bindParam(8, $refNumIngEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock->bindParam(9, $docEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock->bindParam(10, $fecEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock->bindParam(11, $idEntStoTip, PDO::PARAM_INT);
            $stmt_create_entrada_stock->execute();

            $idLastCreationEntradaStock = $pdo->lastInsertId();

            // tenemos que registrar la trazabilidad de la devolucion
            $sql_insert_trazabilidad_devolucion_entrada =
                "INSERT INTO trazabilidad_devolucion_entrada
            (idReqDevDet, idEntSto, canReqDevDet)
            VALUES(?, ?, $canProdDev)";
            $stmt_insert_trazabilidad_devolucion_entrada = $pdo->prepare($sql_insert_trazabilidad_devolucion_entrada);
            $stmt_insert_trazabilidad_devolucion_entrada->bindParam(1, $idReqDevDet, PDO::PARAM_INT);
            $stmt_insert_trazabilidad_devolucion_entrada->bindParam(2, $idLastCreationEntradaStock, PDO::PARAM_INT);
            $stmt_insert_trazabilidad_devolucion_entrada->execute();

            // debemos actualizar el stock almacen
            $sql_consult_almacen_stock =
                "SELECT * FROM almacen_stock
            WHERE idProd = ? AND idAlm = ?";
            $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
            $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->execute();

            if ($stmt_consult_almacen_stock->rowCount() === 1) {
                // ACTUALIZAMOS
                $sql_update_almacen_stock =
                    "UPDATE almacen_stock 
                SET canSto = canSto + $canProdDev, canStoDis = canStoDis + $canProdDev
                WHERE idProd = ? AND idAlm = ?";
                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
                $stmt_update_almacen_stock->execute();
            } else {
                // CREAMOS
                $sql_insert_almacen_stock =
                    "INSERT INTO almacen_stock
                (idProd, idAlm, canSto, canStoDis)
                VALUES(?, ?, $canProdDev, $canProdDev)";
                $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_insert_almacen_stock->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
                $stmt_insert_almacen_stock->execute();
            }
        }
    }
    // debemos hacer el tratamiento para la devolucion al almacen de desmedro
    else {
        $idAlmacenDesmedros = 7; // almacen de desmedros
        // primero consultamos si existe ese almacen stock
        $sql_consult_almacen_stock =
            "SELECT * FROM almacen_stock
            WHERE idProd = ? AND idAlm = ?";
        try {
            // iniciamos una transaccion
            $pdo->beginTransaction();
            $stmt_consult_almacen_stock = $pdo->prepare($sql_consult_almacen_stock);
            $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->bindParam(2, $idAlmacenDesmedros, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->execute();

            if ($stmt_consult_almacen_stock->rowCount() === 1) {
                // ACTUALIZAMOS
                $sql_update_almacen_stock =
                    "UPDATE almacen_stock 
                SET canSto = canSto + $canProdDev, canStoDis = canStoDis + $canProdDev
                WHERE idProd = ? AND idAlm = ?";
                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idAlmacenDesmedros, PDO::PARAM_INT);
                $stmt_update_almacen_stock->execute();
            } else {
                // CREAMOS
                $sql_insert_almacen_stock =
                    "INSERT INTO almacen_stock
                (idProd, idAlm, canSto, canStoDis)
                VALUES(?, ?, $canProdDev, $canProdDev)";
                $stmt_insert_almacen_stock = $pdo->prepare($sql_insert_almacen_stock);
                $stmt_insert_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_insert_almacen_stock->bindParam(2, $idAlmacenDesmedros, PDO::PARAM_INT);
                $stmt_insert_almacen_stock->execute();
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "ERROR EN LA CONSULTA DEL ALMACEN STOCK";
            $description_error = $e->getMessage();
        }
    }

    // actualizamos los estados
    if (empty($message_error)) {
        try {
            // Iniciamos una transaccion
            $pdo->beginTransaction();
            // ACTUALIZAMOS EL ESTADO DE LA REQUISICION
            $esComReqDevDet = 1; // ESTADO DE COMPLETADO
            $total_requisiciones_detalle_no_completadas = 0;
            $sql_consulta_requisicion_detalle =
                "SELECT * FROM requisicion_devolucion_detalle
                WHERE idReqDev = ? AND esComReqDevDet <> ?";
            $stmt_consulta_requisicion_detalle = $pdo->prepare($sql_consulta_requisicion_detalle);
            $stmt_consulta_requisicion_detalle->bindParam(1, $idReqDev, PDO::PARAM_INT);
            $stmt_consulta_requisicion_detalle->bindParam(2, $esComReqDevDet, PDO::PARAM_BOOL);
            $stmt_consulta_requisicion_detalle->execute();

            $total_requisiciones_detalle_no_completadas = $stmt_consulta_requisicion_detalle->rowCount();

            $idReqEst = 0; // inicializacion

            if ($total_requisiciones_detalle_no_completadas === 1) { // si no hay requisiciones detalle pendientes
                $idReqEst = 3; // COMPLETADO
            } else {
                $idReqEst = 2; // EN PROCESO
            }

            // PRIMERO ACTUALIZAMOS EL DETALLE
            $sql_update_requisicion_detalle =
                "UPDATE requisicion_devolucion_detalle
                SET esComReqDevDet = ?
                WHERE id = ?";
            $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
            $stmt_update_requisicion_detalle->bindParam(1, $esComReqDevDet, PDO::PARAM_BOOL);
            $stmt_update_requisicion_detalle->bindParam(2, $idReqDevDet, PDO::PARAM_INT);
            $stmt_update_requisicion_detalle->execute();

            // LUEGO ACTUALIZAMOS EL MAESTRO
            if ($idReqEst == 3) {
                // obtenemos la fecha actual
                $fecComReqDev = date('Y-m-d H:i:s');
                $sql_update_requisicion_completo =
                    "UPDATE requisicion_devolucion
                SET idReqEst = ?, fecComReqDev = ?
                WHERE id = ?";
                $stmt_update_requisicion_completo = $pdo->prepare($sql_update_requisicion_completo);
                $stmt_update_requisicion_completo->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion_completo->bindParam(2, $fecComReqDev);
                $stmt_update_requisicion_completo->bindParam(3, $idReqDev, PDO::PARAM_INT);
                $stmt_update_requisicion_completo->execute();
            } else {
                $sql_update_requisicion =
                    "UPDATE requisicion_devolucion
                SET idReqEst = ?
                WHERE id = ?";
                $stmt_update_requisicion = $pdo->prepare($sql_update_requisicion);
                $stmt_update_requisicion->bindParam(1, $idReqEst, PDO::PARAM_INT);
                $stmt_update_requisicion->bindParam(2, $idReqDev, PDO::PARAM_INT);
                $stmt_update_requisicion->execute();
            }

            // TERMINAMOS LA TRANSACCION
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
            $description_error = $e->getMessage();
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
