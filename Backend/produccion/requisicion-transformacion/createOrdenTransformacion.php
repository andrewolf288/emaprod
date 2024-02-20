<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $ordenTransformacion = $data["ordenTransformacion"];
    $requisicionMateriales = $data["requisicionMateriales"];
    $requisicionDevolucion = $data["requisicionDevolucion"];

    // En la operacion de cracion de transformacion debemos realizar 4 operaciones
    /*
        1. Creación de orden de transformacion
        2. Creación de producto final no programado
        3. Creación de requisicion de materiales
        4. Creación de nueva requisicion de devolucion
        5. Salida de almacen de producto transformado
    */

    try {
        $pdo->beginTransaction();

        // 1. Creacion de orden de transformacion
        $idProdtInt = $ordenTransformacion["idProdtInt"];
        $idProdc = $ordenTransformacion["idProdc"];
        $codLotProd = $ordenTransformacion["codLotProd"];
        $idProdtOri = $ordenTransformacion["idProdtOri"];
        $canUndProdtOri = $ordenTransformacion["canUndProdtOri"];
        $canPesProdtOri = $ordenTransformacion["canPesProdtOri"];
        $idProdtDes = $ordenTransformacion["idProdtDes"];
        $canUndProdtDes = $ordenTransformacion["canUndProdtDes"];
        $canPesProdtDes = $ordenTransformacion["canPesProdtDes"];
        $canDevUnd = $requisicionDevolucion["canDevUnd"]; // cantidad a sacar de salida
        $canDevPes = $requisicionDevolucion["canDevPes"];

        $idLastCreationOrdenTransformacion = 0;

        $sql_create_orden_transformacion =
            "INSERT INTO orden_transformacion 
        (idProdtInt, 
        idProdc, 
        codLotProd, 
        idProdtOri, 
        canUndProdtOri, 
        canPesProdtOri, 
        idProdtDes, 
        canUndProdtDes, 
        canPesProdtDes)
        VALUES(?, ?, ?, ?, $canDevUnd, $canDevPes, ?, $canUndProdtDes, $canPesProdtDes)";

        $stmt_create_orden_transformacion = $pdo->prepare($sql_create_orden_transformacion);
        $stmt_create_orden_transformacion->bindParam(1, $idProdtInt, PDO::PARAM_INT);
        $stmt_create_orden_transformacion->bindParam(2, $idProdc, PDO::PARAM_INT);
        $stmt_create_orden_transformacion->bindParam(3, $codLotProd, PDO::PARAM_STR);
        $stmt_create_orden_transformacion->bindParam(4, $idProdtOri, PDO::PARAM_INT);
        $stmt_create_orden_transformacion->bindParam(5, $idProdtDes, PDO::PARAM_INT);
        $stmt_create_orden_transformacion->execute();

        // establecemos el id de orden de transformacion
        $idLastCreationOrdenTransformacion = $pdo->lastInsertId();

        // 2. Creacion de producto final no programado
        /* 
            a. Consultamos si el producto fue creado anteriormente
            b. Si fue creado, solamente obtenemos su id y actualizamos
            c. Si no fue creado, lo creamos y obtenemos su id
            d. Registramos la trazabilidad
        */

        $idLastCreationProduccionProductoFinal = 0;
        // a. consultamos
        $sql_consult_produccion_producto_final =
            "SELECT id FROM produccion_producto_final
        WHERE idProdc = ? AND idProdt = ?";
        $stmt_consult_produccion_producto_final = $pdo->prepare($sql_consult_produccion_producto_final);
        $stmt_consult_produccion_producto_final->bindParam(1, $idProdc, PDO::PARAM_INT);
        $stmt_consult_produccion_producto_final->bindParam(2, $idProdtDes, PDO::PARAM_INT);
        $stmt_consult_produccion_producto_final->execute();

        $row_produccion_producto_final = $stmt_consult_produccion_producto_final->fetch(PDO::FETCH_ASSOC);
        if ($row_produccion_producto_final) {
            $esTerIngProFin = 0;
            // b. actualizamos los estados
            $sql_update_produccion_producto_final =
                "UPDATE produccion_producto_final 
            SET esTerIngProFin = ?, canTotProgProdFin = canTotProgProdFin + $canUndProdtDes
            WHERE id = ?";
            $stmt_update_produccion_producto_final = $pdo->prepare($sql_update_produccion_producto_final);
            $stmt_update_produccion_producto_final->bindParam(1, $esTerIngProFin, PDO::PARAM_BOOL);
            $stmt_update_produccion_producto_final->bindParam(2, $row_produccion_producto_final["id"], PDO::PARAM_INT);
            $stmt_update_produccion_producto_final->execute();

            $idLastCreationProduccionProductoFinal = $row_produccion_producto_final["id"];
        } else {
            $idProdcProdtFinEst = 1; // creado
            $esProdcProdtProg = 0; // no fue programado

            // c. creamos un nuevo registro de la siguiente manera
            $sql_create_produccion_producto_final =
                "INSERT INTO produccion_producto_final 
            (idProdc, idProdcProdtFinEst, idProdt, esProdcProdtProg, canTotProgProdFin)
            VALUES (?, ?, ?, ?, $canUndProdtDes)";
            $stmt_create_produccion_producto_final = $pdo->prepare($sql_create_produccion_producto_final);
            $stmt_create_produccion_producto_final->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt_create_produccion_producto_final->bindParam(2, $idProdcProdtFinEst, PDO::PARAM_INT);
            $stmt_create_produccion_producto_final->bindParam(3, $idProdtDes, PDO::PARAM_INT);
            $stmt_create_produccion_producto_final->bindParam(4, $esProdcProdtProg, PDO::PARAM_BOOL);
            $stmt_create_produccion_producto_final->execute();

            $idLastCreationProduccionProductoFinal = $pdo->lastInsertId();
        }

        // d. Registramos la trazabilidad
        $sql_create_trazabilidad_transformacion_producto_final =
            "INSERT INTO trazabilidad_transformacion_producto_final 
        (idOrdTrans, idProdProdtFin)
        VALUES (?, ?)";
        $stmt_create_trazabilidad_transformacion_producto_final = $pdo->prepare($sql_create_trazabilidad_transformacion_producto_final);
        $stmt_create_trazabilidad_transformacion_producto_final->bindParam(1, $idLastCreationOrdenTransformacion, PDO::PARAM_INT);
        $stmt_create_trazabilidad_transformacion_producto_final->bindParam(2, $idLastCreationProduccionProductoFinal, PDO::PARAM_INT);
        $stmt_create_trazabilidad_transformacion_producto_final->execute();

        // 3. Creacion de las requisiciones
        /* 
            a. Crear requisicion 
            b. Crear requisicion detalle
            c. Referencias por medio de la trazabilidad
        */

        $requisicion_envasado = array();
        $requisicion_encajado = array();

        $detReq = $requisicionMateriales["detReq"];

        // separamos los distintas requisicion (envasado, encajado)
        foreach ($detReq as $detalle) {
            // area envasado
            if ($detalle["idAre"] == 5) {
                array_push($requisicion_envasado, $detalle);
            }
            // area encajado
            if ($detalle["idAre"] == 6) {
                array_push($requisicion_encajado, $detalle);
            }
        }

        $idReqTip = 4; // requisicion de transformacion
        $idReqEst = 1; // requisicion requerida

        // si no esta vacia la requisicion de envasado
        if (!empty($requisicion_envasado)) {
            $idAre = 5;
            $idLastCreationRequisicionEnvase = 0;

            // a. primero creamos la requisicion de envasado
            $sql_create_requisicion_envase =
                "INSERT INTO requisicion 
            (idReqEst, idAre, idReqTip)
            VALUES (?, ?, ?)";

            $stmt_create_requisicion_envase = $pdo->prepare($sql_create_requisicion_envase);
            $stmt_create_requisicion_envase->bindParam(1, $idReqEst, PDO::PARAM_INT);
            $stmt_create_requisicion_envase->bindParam(2, $idAre, PDO::PARAM_INT);
            $stmt_create_requisicion_envase->bindParam(3, $idReqTip, PDO::PARAM_INT);
            $stmt_create_requisicion_envase->execute();
            $idLastCreationRequisicionEnvase = $pdo->lastInsertId();

            // b. luego creamos el detalle de la requisicion de envasado
            foreach ($requisicion_envasado as $reqEnv) {
                $idProdReqEnv = $reqEnv["idProd"];
                $canReqProdLotEnv = $reqEnv["canReqProdLot"];

                $sql_create_requisicion_detalle_envase =
                    "INSERT INTO requisicion_detalle
                (idProdt, idReq, idReqDetEst, canReqDet, idProdFin)
                VALUES (?, ?, ?, $canReqProdLotEnv, ?)";
                $stmt_create_requisicion_detalle_envase = $pdo->prepare($sql_create_requisicion_detalle_envase);
                $stmt_create_requisicion_detalle_envase->bindParam(1, $idProdReqEnv, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_envase->bindParam(2, $idLastCreationRequisicionEnvase, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_envase->bindParam(3, $idReqEst, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_envase->bindParam(4, $idLastCreationProduccionProductoFinal, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_envase->execute();
            }

            // c. finalmente anotamos la trazabilidad
            $sql_create_trazabilidad_transformacion_requisicion_envase =
                "INSERT INTO trazabilidad_transformacion_requisicion 
            (idOrdTrans, 
            idReq)
            VALUES(?, ?)";
            $stmt_create_trazabilidad_transformacion_requisicion_envase = $pdo->prepare($sql_create_trazabilidad_transformacion_requisicion_envase);
            $stmt_create_trazabilidad_transformacion_requisicion_envase->bindParam(1, $idLastCreationOrdenTransformacion, PDO::PARAM_INT);
            $stmt_create_trazabilidad_transformacion_requisicion_envase->bindParam(2, $idLastCreationRequisicionEnvase, PDO::PARAM_INT);
            $stmt_create_trazabilidad_transformacion_requisicion_envase->execute();
        }

        // si no esta vacia la requiscion de encajado
        if (!empty($requisicion_encajado)) {
            $idAre = 6;
            $idLastCreationRequisicionEncaje = 0;

            // a. primero creamos la requisicion de encajado
            $sql_crearte_requisicion_encaje =
                "INSERT INTO requisicion 
            (idReqEst, idAre, idReqTip)
            VALUES (?, ?, ?)";

            $stmt_create_requisicion_encaje = $pdo->prepare($sql_crearte_requisicion_encaje);
            $stmt_create_requisicion_encaje->bindParam(1, $idReqEst, PDO::PARAM_INT);
            $stmt_create_requisicion_encaje->bindParam(2, $idAre, PDO::PARAM_INT);
            $stmt_create_requisicion_encaje->bindParam(3, $idReqTip, PDO::PARAM_INT);
            $stmt_create_requisicion_encaje->execute();
            $idLastCreationRequisicionEncaje = $pdo->lastInsertId();

            // b. luego creamos el detalle de la requisicion de encajado
            foreach ($requisicion_encajado as $reqEnc) {
                $idProdReqEnc = $reqEnc["idProd"];
                $canReqProdLotEnc = $reqEnc["canReqProdLot"];

                $sql_create_requisicion_detalle_encaje =
                    "INSERT INTO requisicion_detalle
                (idProdt, idReq, idReqDetEst, canReqDet, idProdFin)
                VALUES (?, ?, ?, $canReqProdLotEnc, ?)";
                $stmt_create_requisicion_detalle_encaje = $pdo->prepare($sql_create_requisicion_detalle_encaje);
                $stmt_create_requisicion_detalle_encaje->bindParam(1, $idProdReqEnc, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_encaje->bindParam(2, $idLastCreationRequisicionEncaje, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_encaje->bindParam(3, $idReqEst, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_encaje->bindParam(4, $idLastCreationProduccionProductoFinal, PDO::PARAM_INT);
                $stmt_create_requisicion_detalle_encaje->execute();
            }

            // c. finalmente anotamos la trazabilidad
            $sql_create_trazabilidad_transformacion_requisicion_encaje =
                "INSERT INTO trazabilidad_transformacion_requisicion
            (idOrdTrans,
            idReq)
            VALUES(?, ?)";
            $stmt_create_trazabilidad_transformacion_requisicion_encaje = $pdo->prepare($sql_create_trazabilidad_transformacion_requisicion_encaje);
            $stmt_create_trazabilidad_transformacion_requisicion_encaje->bindParam(1, $idLastCreationOrdenTransformacion, PDO::PARAM_INT);
            $stmt_create_trazabilidad_transformacion_requisicion_encaje->bindParam(2, $idLastCreationRequisicionEncaje, PDO::PARAM_INT);
            $stmt_create_trazabilidad_transformacion_requisicion_encaje->execute();
        }

        // 4. Creacion de la devolucion
        /* 
            a. Creamos la requisicion de devolucion
            b. Creamos el detalle de requisicion de devolucion
            c. Registramos la trazabilidad de devolucion
        */
        $correlativo = "TRANSFORMACION";
        $idLastCreationRequisicionDevolucion = 0;
        $detDev = $requisicionDevolucion["detDev"];

        // primero consultamos la referencia del producto a devolver sus materiales
        $sql_consult_produccion_producto_final_origen =
            "SELECT id FROM produccion_producto_final
        WHERE idProdc = ? AND idProdt = ?";
        $stmt_consult_produccion_producto_final_origen = $pdo->prepare($sql_consult_produccion_producto_final_origen);
        $stmt_consult_produccion_producto_final_origen->bindParam(1, $idProdc, PDO::PARAM_INT);
        $stmt_consult_produccion_producto_final_origen->bindParam(2, $idProdtOri, PDO::PARAM_INT);
        $stmt_consult_produccion_producto_final_origen->execute();

        $row_produccion_producto_final_origen = $stmt_consult_produccion_producto_final_origen->fetch(PDO::FETCH_ASSOC);

        // a. creamos la requisicion
        $sql_create_requisicion_devolucion =
            "INSERT INTO requisicion_devolucion
        (idProdc, correlativo, idProdFin, idProdt, idReqEst, canTotUndReqDev)
        VALUES(?, ?, ?, ?, ?, $canDevUnd)";
        $stmt_create_requisicion_devolucion = $pdo->prepare($sql_create_requisicion_devolucion);
        $stmt_create_requisicion_devolucion->bindParam(1, $idProdc, PDO::PARAM_INT);
        $stmt_create_requisicion_devolucion->bindParam(2, $correlativo, PDO::PARAM_STR);
        $stmt_create_requisicion_devolucion->bindParam(3, $row_produccion_producto_final_origen["id"]);
        $stmt_create_requisicion_devolucion->bindParam(4, $idProdtOri, PDO::PARAM_INT);
        $stmt_create_requisicion_devolucion->bindParam(5, $idReqEst, PDO::PARAM_INT);
        $stmt_create_requisicion_devolucion->execute();
        $idLastCreationRequisicionDevolucion = $pdo->lastInsertId();

        // b. creamos el detalle de requisicion devolucion
        foreach ($detDev as $detalleDevolucion) {
            $idProdDev = $detalleDevolucion["idProd"];
            $motivos = $detalleDevolucion["motivos"];

            foreach ($motivos as $detalleDevolucion) {
                $idProdDevMot = $detalleDevolucion["idProdDevMot"];
                $canProdDev = $detalleDevolucion["canProdDev"];

                $sql_create_requisicion_devolucion_detalle =
                    "INSERT INTO requisicion_devolucion_detalle
                    (idReqDev, idProdt, idMotDev, canReqDevDet)
                    VALUES (?, ?, ?, $canProdDev)";
                $stmt_create_requisicion_devolucion_detalle = $pdo->prepare($sql_create_requisicion_devolucion_detalle);
                $stmt_create_requisicion_devolucion_detalle->bindParam(1, $idLastCreationRequisicionDevolucion, PDO::PARAM_INT);
                $stmt_create_requisicion_devolucion_detalle->bindParam(2, $idProdDev, PDO::PARAM_INT);
                $stmt_create_requisicion_devolucion_detalle->bindParam(3, $idProdDevMot, PDO::PARAM_INT);
                $stmt_create_requisicion_devolucion_detalle->execute();
            }
        }

        // c. Realizamos la trazabilidad de devolucion
        $sql_create_trazabilidad_transformacion_devolucion =
            "INSERT INTO trazabilidad_transformacion_devolucion (idOrdTrans, idReqDev)
        VALUES (?, ?)";
        $stmt_create_trazabilidad_transformacion_devolucion = $pdo->prepare($sql_create_trazabilidad_transformacion_devolucion);
        $stmt_create_trazabilidad_transformacion_devolucion->bindParam(1, $idLastCreationOrdenTransformacion, PDO::PARAM_INT);
        $stmt_create_trazabilidad_transformacion_devolucion->bindParam(2, $idLastCreationRequisicionDevolucion, PDO::PARAM_INT);
        $stmt_create_trazabilidad_transformacion_devolucion->execute();

        // 5. Salida de almacen de producto transformado
        /* 
            a. buscar salida de entradas
            b. registrar la salida en la tabla de trazabilidad
            c. hacer el descuento a la entrada correspondiente
            d. actualizar el almacen
        */

        // a. buscamos las salidas para realizar la salida por orden de transformacion
        $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
        $idAlmacenPrincipal = 1; // ALMACEN PRINCIPAL

        $sql_consult_entradas_disponibles =
            "SELECT
        es.id,
        es.refProdc,
        DATE(es.fecEntSto) AS fecEntSto,
        es.canTotDis
        FROM entrada_stock AS es
        WHERE idProd = ? AND idEntStoEst = ? AND refProdc = ? AND canTotDis > 0 AND idAlm = ?
        ORDER BY es.fecEntSto ASC";
        $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
        $stmt_consult_entradas_disponibles->bindParam(1, $idProdtOri, PDO::PARAM_INT);
        $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
        $stmt_consult_entradas_disponibles->bindParam(3, $idProdc, PDO::PARAM_INT);
        $stmt_consult_entradas_disponibles->bindParam(4, $idAlmacenPrincipal, PDO::PARAM_INT);
        $stmt_consult_entradas_disponibles->execute();

        // AÑADIMOS AL ARRAY
        $array_entradas_disponibles = $stmt_consult_entradas_disponibles->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($array_entradas_disponibles)) {
            $entradasUtilizadas = []; // entradas utilizadas
            $cantidad_faltante = $canDevUnd; // cantidad total faltante

            foreach ($array_entradas_disponibles as $row_entrada_disponible) {
                if ($cantidad_faltante > 0) {
                    $idEntStoUti = $row_entrada_disponible["id"]; // id entrada
                    $canDisEnt = intval($row_entrada_disponible["canTotDis"]); // cantidad disponible
                    $refProdc = $row_entrada_disponible["refProdc"]; // referencia a produccion

                    if ($canDisEnt >= $cantidad_faltante) {
                        // añadimos a entradas utilizadas
                        array_push(
                            $entradasUtilizadas,
                            array(
                                "idEntSto" => $idEntStoUti,
                                "canSalStoReq" => $cantidad_faltante, // la cantidad de la requisicion detalle
                                "refProdc" => $refProdc,

                            )
                        );

                        $cantidad_faltante = 0;

                        break; // termina el flujo
                    } else {
                        $cantidad_faltante -= $canDisEnt;
                        array_push(
                            $entradasUtilizadas,
                            array(
                                "idEntSto" => $idEntStoUti,
                                "canSalStoReq" => $canDisEnt, // la cantidad disponible de la entrada
                                "refProdc" => $refProdc,
                            )
                        );
                    }
                } else {
                    break; // salimos del flujo
                }
            }

            // comprobamos finalmente que la cantidad faltante sea exactamente 0
            if ($cantidad_faltante == 0) {
                foreach ($entradasUtilizadas as $item) {
                    // OBTENEMOS LOS DATOS
                    $idEntSto = $item["idEntSto"]; // id de la entrada
                    $canSalStoReq = $item["canSalStoReq"]; // cantidad de salida de stock
                    //$canTotDis = $item["canTotDis"];

                    // CONSULTAMOS LA ENTRADA 
                    $canTotDisEntSto = 0; // cantidad disponible
                    $idEntStoEst = 0; // estado de la entrada
                    $idAlmacen = 0; // id del almacen para realizar la actualizacion
                    $refProdc = 0; // referencia a produccion
                    $codLot = ""; // codigo de lote de produccion

                    $sql_consult_entrada_stock =
                        "SELECT 
                            canTotDis,
                            idAlm,
                            refProdc,
                            codLot
                            FROM entrada_stock
                            WHERE id = ?";
                    $stmt_consulta_entrada_stock = $pdo->prepare($sql_consult_entrada_stock);
                    $stmt_consulta_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
                    $stmt_consulta_entrada_stock->execute();

                    while ($row = $stmt_consulta_entrada_stock->fetch(PDO::FETCH_ASSOC)) {
                        $canTotDisEntSto = $row["canTotDis"];
                        $idAlmacen = $row["idAlm"];
                        $refProdc = $row["refProdc"];
                        $codLot = $row["codLot"];
                    }

                    $esSal = 1;
                    // sentencia sql
                    $sql =
                        "INSERT
                     salida_orden_transformacion
                     (idOrdTrans, idProdt, idProdc, idEntSto, canSalOrdTrans)
                     VALUES (?, ?, ?, ?, $canSalStoReq)";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(1, $idLastCreationOrdenTransformacion, PDO::PARAM_INT); // id de la operacion facturacion
                    $stmt->bindParam(2, $idProdtOri, PDO::PARAM_INT);
                    $stmt->bindParam(3, $refProdc, PDO::PARAM_INT);
                    $stmt->bindParam(4, $idEntSto, PDO::PARAM_INT);

                    // EJECUTAMOS LA CREACION DE UNA SALIDA
                    $stmt->execute();

                    // ********* AHORA ACTUALIZAMOS LA ENTRADA CORRESPONDIENTE **************
                    $canResAftOpe =  $canTotDisEntSto - $canSalStoReq; // cantidad restante luego de la salida

                    if ($canResAftOpe == 0) { // SI LA CANTIDAD RESTANTE ES 0
                        $idEntStoEst = 2; // ESTADO DE ENTRADA AGOTADA O TERMINADA
                        $fecFinSto = date('Y-m-d H:i:s'); // FECHA DE TERMINO DE STOCK DE LA ENTRADA

                        // sql actualizar entrada stock con fecha de finalización
                        $sql_update_entrada_stock =
                            "UPDATE
                        entrada_stock
                        SET canTotDis = $canResAftOpe, idEntStoEst = ?, fecFinSto = ?
                        WHERE id = ?
                        ";
                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $fecFinSto);
                        $stmt_update_entrada_stock->bindParam(3, $idEntSto, PDO::PARAM_INT);

                        $stmt_update_entrada_stock->execute();
                    } else {
                        $idEntStoEst = 1; // ESTADO DE ENTRADA DISPONIBLE

                        // ACTUALIZAMOS LA ENTRADA STOCK
                        $sql_update_entrada_stock =
                            "UPDATE
                        entrada_stock
                        SET canTotDis = $canResAftOpe, idEntStoEst = ?
                        WHERE id = ?
                        ";
                        $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                        $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                        $stmt_update_entrada_stock->execute();
                    }

                    // ACTUALIZAMOS EL ALMACEN CORRESPONDIENTE A LA ENTRADA
                    $sql_update_almacen_stock =
                        "UPDATE almacen_stock
                        SET canSto = canSto - $canSalStoReq, canStoDis = canStoDis - $canSalStoReq
                        WHERE idAlm = ? AND idProd = ?";

                    $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                    $stmt_update_almacen_stock->bindParam(1, $idAlmacen, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->bindParam(2, $idProdtOri, PDO::PARAM_INT);
                    $stmt_update_almacen_stock->execute();
                }
            } else {
                throw new Exception("No hay entradas disponibles para el producto del detalle");
            }
        } else {
            throw new Exception("No hay entradas disponibles para el producto del detalle");
        }

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "ERROR";
        $description_error = $e->getMessage();
    } catch (Exception $e) {
        $pdo->rollBack();
        $message_error = "ERROR";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
