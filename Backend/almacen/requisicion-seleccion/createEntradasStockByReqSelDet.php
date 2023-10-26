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

    // OBTENEMOS LOS DATOS
    $idReqSel = $data["idReqSel"]; // id requisicion seleccion
    $idReqSelDet = $data["idReqSelDet"]; // id requisicion seleccion detalle
    $idMatPri = $data["idMatPri"]; // id materia prima
    $salStoSelDet = $data["salStoSelDet"]; // salida
    $datEntSto =  $data["datEntSto"]; // datos de la entrada
    $cantidadTotalEntrada = 0; // cantidad total ingresada
    $mermaTotalIngresada = 0; // merma total generada
    $fecEntSto = $datEntSto["fecEnt"];
    $fecVenEntSto = $datEntSto["fecVent"];

    if ($pdo) {
        $sql = "";
        foreach ($salStoSelDet as $item) {

            // OBTENEMOS LOS DATOS
            $idSalEntStoSel = $item["id"]; // id salida entrada stock seleccion
            $idEntSto = $item["idEntSto"]; // id entrada stock
            $canSalStoReqSel = $item["canSalStoReqSel"]; // cantidad de salida
            $canEntStoReqSel = $item["canEntStoReqSel"]; // cantidad entrada prorrateada
            $merReqSel = $item["merReqSel"]; // merma total
            $idAlm = $item["idAlm"]; // id de la entrada
            $fecEntStoReqSel = date('Y-m-d H:i:s'); // Fecha de la entrada a stock

            $idSalEntSelEst = 2; // ESTADO DE ENTRADA COMPLETADA

            // ACTUALIZAMOS LA SALIDA_ENTRADA_SELECCION
            $idSalEntSelEstSalidaCompleta = 1;

            // sql de actualizacion
            $sql_update_entrada_seleccion =
                "UPDATE
            salida_entrada_seleccion
            SET canEntStoReqSel = $canEntStoReqSel, merReqSel = $merReqSel, idSalEntSelEst = ?, fecEntStoReqSel = ?
            WHERE id = ? AND idSalEntSelEst = ?";

            try {
                // INICIAMOS UNA TRANSACCION
                $pdo->beginTransaction();

                $stmt_update_entrada_seleccion = $pdo->prepare($sql_update_entrada_seleccion);
                $stmt_update_entrada_seleccion->bindParam(1, $idSalEntSelEst, PDO::PARAM_INT);
                $stmt_update_entrada_seleccion->bindParam(2, $fecEntStoReqSel);
                $stmt_update_entrada_seleccion->bindParam(3, $idSalEntStoSel, PDO::PARAM_INT);
                $stmt_update_entrada_seleccion->bindParam(4, $idSalEntSelEstSalidaCompleta, PDO::PARAM_INT);

                // EJECUTAMOS LA ACTUALIZACION DE LA TABLA
                $stmt_update_entrada_seleccion->execute();

                // AUMENTAMOS LA CANTIDAD TOTAL
                $cantidadTotalEntrada += $canEntStoReqSel;
                $mermaTotalIngresada += $merReqSel;
                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en inserción de salidas";
                $description_error = $e->getMessage();
            }
            // SE TERMINA LA ITERACION Y SE CONTINUA CON LA SIGUIENTE SALIDA
        }

        // CREAMOS LA ENTRADA RESPECTIVA
        if (empty($message_error)) {
            //$fecEntSto = $datEntSto["fecEntSto"];  
            // $fecVenEntSto = $datEntSto["fecVenEntSto"]; 
            $idProd = $datEntSto["prodtEnt"]; // producto
            $codProd = $datEntSto["codProdEnt"]; // codigo de producto
            $idProv = 1; // proveedor EMARANSAC
            $idAlm = 1; // almacen principal
            $idEntStoEst = 1; // disponible
            $codProv = "00"; // proveedor EMARANSAC
            $esSel = 1; // es seleccion
            $letAniEntSto = $datEntSto["letAniEntSto"]; // letra del año
            $diaJulEntSto =  $datEntSto["diaJulEntSto"]; // dia juliano
            $docEntSto = "Entrada seleccion"; // documento de entrada

            $anioActual = explode("-", explode(" ", $fecEntSto)[0])[0]; // año actual
            $sql_numero_entrada =
                "SELECT 
                MAX(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
                FROM entrada_stock
                WHERE idProd = ? AND YEAR(fecEntSto) = ?
                ORDER BY refNumIngEntSto DESC LIMIT 1";

            try {
                // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
                $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
                $stmt_numero_entrada->bindParam(1, $idProd, PDO::PARAM_INT);
                $stmt_numero_entrada->bindParam(2, $anioActual);
                $stmt_numero_entrada->execute();

                // Recorremos los resultados
                $refNumIngEntSto = 0;

                // si hay ingresos de ese producto ese año
                if ($stmt_numero_entrada->rowCount() == 1) {
                    while ($row = $stmt_numero_entrada->fetch(PDO::FETCH_ASSOC)) {
                        $refNumIngEntSto = $row["refNumIngEntSto"] + 1;
                    }
                } else {
                    // si no hay ingresos de productos ese año
                    $refNumIngEntSto = 1;
                }

                // EL CODIGO DE INGRESO ES DE 
                $refNumIngEntSto = str_pad(strval($refNumIngEntSto), 3, "0", STR_PAD_LEFT);
                // ***** FORMAMOS EL CODIGO DE ENTRADA ******
                $codEntSto = $codProd . $codProv . $letAniEntSto . $diaJulEntSto . $refNumIngEntSto;
                // sql de insert entrada seleccion
                $sql_insert_entrada_seleccion =
                    "INSERT INTO entrada_stock
                (idProd,
                idProv,
                idAlm,
                idEntStoEst,
                codEntSto,
                letAniEntSto,
                diaJulEntSto,
                refNumIngEntSto,
                esSel,
                canTotEnt,
                canTotDis,
                merDis,
                merTot,
                docEntSto,
                fecEntSto,
                fecVenEntSto)
                VALUES (?,?,?,?,?,?,?,?,?, $cantidadTotalEntrada, $cantidadTotalEntrada, $mermaTotalIngresada, $mermaTotalIngresada,?,?,?)";

                try {
                    $stmt_insert_entrada_seleccion = $pdo->prepare($sql_insert_entrada_seleccion);
                    $stmt_insert_entrada_seleccion->bindParam(1, $idProd, PDO::PARAM_INT);
                    $stmt_insert_entrada_seleccion->bindParam(2, $idProv, PDO::PARAM_INT);
                    $stmt_insert_entrada_seleccion->bindParam(3, $idAlm, PDO::PARAM_INT);
                    $stmt_insert_entrada_seleccion->bindParam(4, $idEntStoEst, PDO::PARAM_INT);
                    $stmt_insert_entrada_seleccion->bindParam(5, $codEntSto, PDO::PARAM_STR);
                    $stmt_insert_entrada_seleccion->bindParam(6, $letAniEntSto, PDO::PARAM_STR);
                    $stmt_insert_entrada_seleccion->bindParam(7, $diaJulEntSto, PDO::PARAM_STR);
                    $stmt_insert_entrada_seleccion->bindParam(8, $refNumIngEntSto, PDO::PARAM_STR);
                    $stmt_insert_entrada_seleccion->bindParam(9, $esSel, PDO::PARAM_BOOL);
                    $stmt_insert_entrada_seleccion->bindParam(10, $docEntSto, PDO::PARAM_STR);
                    $stmt_insert_entrada_seleccion->bindParam(11, $fecEntSto);
                    $stmt_insert_entrada_seleccion->bindParam(12, $fecVenEntSto);

                    $stmt_insert_entrada_seleccion->execute();
                    // ACTUALIZAMOS EL STOCK TOTAL DEL ALMACEN Y LA MATERIA PRIMA
                    // SI NO ES UNA ENTRADA DE SELECCION, ENTONCES ACTUALIZAMOS DIRECTAMENTE EL STOCK

                    $sql_consult_almacen_stock =
                        "SELECT * FROM almacen_stock 
                        WHERE idProd = ? AND idAlm = ?";

                    try {
                        // consultamos si existe un registro de almacen stock con el prod y alm
                        $stmt_consult_almacen_stock =  $pdo->prepare($sql_consult_almacen_stock);
                        $stmt_consult_almacen_stock->bindParam(1, $idProd, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                        $stmt_consult_almacen_stock->execute();

                        if ($stmt_consult_almacen_stock->rowCount() === 1) {
                            // UPDATE ALMACEN STOCK
                            $sql_update_almacen_stock =
                                "UPDATE almacen_stock 
                                SET canSto = canSto + $cantidadTotalEntrada, canStoDis = canStoDis + $cantidadTotalEntrada, fecActAlmSto = ?
                                WHERE idProd = ? AND idAlm = ?";
                            try {
                                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                                $stmt_update_almacen_stock->bindParam(1, $fecEntSto);
                                $stmt_update_almacen_stock->bindParam(2, $idProd, PDO::PARAM_INT);
                                $stmt_update_almacen_stock->bindParam(3, $idAlm, PDO::PARAM_INT);

                                $stmt_update_almacen_stock->execute(); // ejecutamos
                            } catch (PDOException $e) {
                                $message_error = "ERROR INTERNO SERVER AL ACTUALIZAR ALMACEN STOCK";
                                $description_error = $e->getMessage();
                            }
                        } else {
                            // CREATE NUEVO REGISTRO ALMACEN STOCK
                            $sql_create_almacen_stock =
                                "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                                VALUES (?,?,$cantidadTotalEntrada,$cantidadTotalEntrada)";
                            try {
                                $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                                $stmt_create_almacen_stock->bindParam(1, $idProd, PDO::PARAM_INT);
                                $stmt_create_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);

                                $stmt_create_almacen_stock->execute(); // ejecutamos
                            } catch (PDOException $e) {
                                $message_error = "ERROR INTERNO SERVER AL CREAR ALMACEN STOCK";
                                $description_error = $e->getMessage();
                            }
                        }
                    } catch (PDOException $e) {
                        $message_error = "ERROR INTERNO SERVER AL CONSULTAR ALMACEN STOCK";
                        $description_error = $e->getMessage();
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR AL INSERTA LA ENTRADA DE STOCK";
                    $description_error = $e->getMessage();
                }
            } catch (PDOException $e) {
                $message_error = "ERROR AL OBTENER EL NUMERO DE INGRESO";
                $description_error = $e->getMessage();
            }
        }

        // ACTUALIZAMOS LOS ESTADOS DE LA REQUISICION SELECCION MAESTRO Y DETALLE
        if (empty($message_error)) {

            // PRIMERO ACTUALIZAMOS EL DETALLE DE REQUISICION SELECCION
            $idSalEntSelEst = 1; // ESTADO DE SALIDA TERMINADA

            $sql_consulta_salida_entrada_seleccion =
                "SELECT * FROM salida_entrada_seleccion
                WHERE idSalEntSelEst = ? AND idReqSel = ? AND idMatPri = ?";

            try {
                // Iniciamos una transaccion
                $pdo->beginTransaction();
                $stmt_consulta_salida_entrada_seleccion = $pdo->prepare($sql_consulta_salida_entrada_seleccion);
                $stmt_consulta_salida_entrada_seleccion->bindParam(1, $idSalEntSelEst, PDO::PARAM_INT);
                $stmt_consulta_salida_entrada_seleccion->bindParam(2, $idReqSel, PDO::PARAM_INT);
                $stmt_consulta_salida_entrada_seleccion->bindParam(3, $idMatPri, PDO::PARAM_INT);
                $stmt_consulta_salida_entrada_seleccion->execute();

                $total_salidas_entradas_salidas_terminadas = $stmt_consulta_salida_entrada_seleccion->rowCount();
                $idReqSelEst = 0;
                $idReqSelDetEst = 0; // ESTADO PARA EL DETALLE
                if ($total_salidas_entradas_salidas_terminadas != 0) {
                    $idReqSelDetEst = 3; // EN PROCESO
                } else {
                    $idReqSelDetEst = 4; // COMPLETADO
                }

                // ACTUALIZAMOS EL DETALLE
                $sql_update_requisicion_seleccion_detalle =
                    "UPDATE requisicion_seleccion_detalle
                SET idReqSelDetEst = ?
                WHERE idReqSel = ? AND idMatPri = ? AND id = ?";
                $stmt_update_requisicion_seleccion_detalle = $pdo->prepare($sql_update_requisicion_seleccion_detalle);
                $stmt_update_requisicion_seleccion_detalle->bindParam(1, $idReqSelDetEst, PDO::PARAM_INT);
                $stmt_update_requisicion_seleccion_detalle->bindParam(2, $idReqSel, PDO::PARAM_INT);
                $stmt_update_requisicion_seleccion_detalle->bindParam(3, $idMatPri, PDO::PARAM_INT);
                $stmt_update_requisicion_seleccion_detalle->bindParam(4, $idReqSelDet, PDO::PARAM_INT);
                $stmt_update_requisicion_seleccion_detalle->execute();

                // POR ULTIMO ACTUALIZAMOS EL MAESTRO DE REQUISICION SELECCION
                try {
                    $idReqSelDetEst = 4; // ESTADO DE DETALLE REQUISICION SELECCION COMPLETADO
                    $sql_consulta_requisicion_seleccion_detalle =
                        "SELECT * FROM requisicion_seleccion_detalle
                WHERE idReqSelDetEst <> ? AND idReqSel = ?";
                    $stmt_consulta_requisicion_seleccion_detalle = $pdo->prepare($sql_consulta_requisicion_seleccion_detalle);
                    $stmt_consulta_requisicion_seleccion_detalle->bindParam(1, $idReqSelDetEst, PDO::PARAM_INT);
                    $stmt_consulta_requisicion_seleccion_detalle->bindParam(2, $idReqSel, PDO::PARAM_INT);
                    $stmt_consulta_requisicion_seleccion_detalle->execute();

                    $total_requisiciones_seleccion_detalle_completadas = $stmt_consulta_requisicion_seleccion_detalle->rowCount();
                    $idReqSelEst = 0; // ESTADO DE REQUISICION SELECCION
                    if ($total_requisiciones_seleccion_detalle_completadas != 0) {
                        $idReqSelEst = 2; // ESTADO EN PROCESO
                    } else {
                        $idReqSelEst = 3; // ESTADO COMPLETADO
                    }

                    // ACTUALIZAMOS EL MAESTRO
                    if ($idReqSelEst == 3) {
                        $dateReqSelTerminado = date('Y-m-d H:i:s');
                        $sql_update_requisicion_seleccion =
                            "UPDATE requisicion_seleccion
                    SET idReqSelEst = ?, fecTerReqSel = ?
                    WHERE id = ?";
                        $stmt_update_requsicion_seleccion = $pdo->prepare($sql_update_requisicion_seleccion);
                        $stmt_update_requsicion_seleccion->bindParam(1, $idReqSelEst, PDO::PARAM_INT);
                        $stmt_update_requsicion_seleccion->bindParam(2, $dateReqSelTerminado);
                        $stmt_update_requsicion_seleccion->bindParam(3, $idReqSel, PDO::PARAM_INT);
                        $stmt_update_requsicion_seleccion->execute();
                    } else {
                        if ($idReqSelEst == 2) {
                            $sql_update_requisicion_seleccion =
                                "UPDATE requisicion_seleccion
                    SET idReqSelEst = ?
                    WHERE id = ?";
                            $stmt_update_requsicion_seleccion = $pdo->prepare($sql_update_requisicion_seleccion);
                            $stmt_update_requsicion_seleccion->bindParam(1, $idReqSelEst, PDO::PARAM_INT);
                            $stmt_update_requsicion_seleccion->bindParam(2, $idReqSel, PDO::PARAM_INT);
                            $stmt_update_requsicion_seleccion->execute();
                        }
                    }
                } catch (PDOException $e) {
                    $message_error = "ERROR INTERNO SERVER: fallo en la actualización del estadp de requisicion seleccion";
                    $description_error = $e->getMessage();
                }

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en la actualización del estado de requision seleccion detalle";
                $description_error = $e->getMessage();
            }
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
