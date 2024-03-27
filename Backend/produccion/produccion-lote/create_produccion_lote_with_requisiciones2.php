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

    $idProdt = $data["idProdt"]; // subproducto o producto intermedio
    $idProdTip = $data["idProdTip"]; // tipo de produccion
    $codTipProd = $data["codTipProd"]; // codigo de tipo de produccion
    $codLotProd = $data["codLotProd"]; // codigo de lote de produccion
    $canLotProd = $data["canLotProd"]; // cantidad de lote de produccion
    $idReq = $data["idReq"];

    $klgLotProd = $data["klgLotProd"]; // peso del lote
    $fecProdIniProg = $data["fecProdIniProg"]; // fecha de inicio programado
    $fecProdFinProg = $data["fecProdFinProg"]; // fecha de fin programado
    $fecVenLotProd = $data["fecVenLotProd"];
    $obsProd = $data["obsProd"]; // observaciones
    $reqDetProdc = $data["reqDetProdc"]; // requerimientos
    $prodDetProdc = $data["prodDetProdc"]; // producto finales programados

    $totalUnidadesLoteProduccion = $data["totalUnidadesLoteProduccion"]; // total de unidades esperadas de la produccion
    $klgTotalLoteProduccion = $data["klgTotalLoteProduccion"]; // total de kilogramos de la produccion

    if ($pdo) {
        // ****** CREAMOS LAS INSERCIONES CORRESPONDIENTES *******
        // CALCULAMOS EL ESTADO DE LA PRODUCCION
        $idProdEst = 1; // iniciado

        // CALCULAMOS EL ESTADO DE LA PRODUCCION SEGUN SU PROGRAMACION DE INICIO
        $idProdIniProgEst = 0; // valor nulo
        $fechaIniciadoProgramacion = strtotime(explode(" ", $fecProdIniProg)[0]);
        $fechaIniciadoActual = strtotime(date("Y-m-d"));

        if ($fechaIniciadoProgramacion > $fechaIniciadoActual) {
            $idProdIniProgEst = 2; // inicio atrasado
        } else {
            if ($fechaIniciadoProgramacion == $fechaIniciadoActual) {
                $idProdIniProgEst = 1; // inicio a tiempo
            } else {
                $idProdIniProgEst = 3; // inicio adelantado
            }
        }

        // CALCULAMOS EL ESTADO DE LA PRODUCCION SEGUN SU PROGRAMACION DE FIN
        $idProdFinProgEst = 0;

        if ($idProdIniProgEst == 2) {
            $idProdFinProgEst = 2; // fin atrasado
        } else {
            if ($idProdIniProgEst == 3) {
                $idProdFinProgEst = 3; // fin adelantado
            } else {
                $idProdFinProgEst = 1; // fin a tiempo
            }
        }

        // PARA COMPLETAR EL CODIGO NUMÉRICO PRIMERO DEBEMOS CONSULTAR LA ULTIMA INSERCION
        $sql_consult_produccion =
            "SELECT SUBSTR(codProd,5,8) AS numberCodProd FROM produccion ORDER BY id DESC LIMIT 1";

        $stmt_consult_produccion = $pdo->prepare($sql_consult_produccion);
        $stmt_consult_produccion->execute();

        $numberProduccion = 0;
        $codProd = ""; // CODIGO DE PRODUCCION

        if ($stmt_consult_produccion->rowCount() !== 1) {
            // nueva insercion
            $codProd = "PL" . $codTipProd . "00000001";
        } else {
            while ($row = $stmt_consult_produccion->fetch(PDO::FETCH_ASSOC)) {
                $numberProduccion = intval($row["numberCodProd"]) + 1; // el siguiente numeral
            }
            $codProd = "PL" . $codTipProd . str_pad(strval($numberProduccion), 8, "0", STR_PAD_LEFT);
        }

        $idLastInsert = 0;

        $op = "OP"; // Valor fijo para "op"
        $anio = date("Y"); // Obtiene el año actual
        $mes = date("m"); // Obtiene el mes actual

        /*****obtiene el valor maximo de los ids******** */
        $sql = "SELECT MAX(id) FROM produccion";
        $stmt = $pdo->query($sql);
        $lastInsertId = $stmt->fetchColumn();

        $numop = $op . $anio . $mes . $lastInsertId;
        $sql_insert_produccion =
            "INSERT INTO
        produccion
        (idProdt, 
        idProdEst, 
        idProdTip, 
        idProdFinProgEst, 
        idProdIniProgEst,
        codProd, 
        codLotProd,
        klgLotProd, 
        canLotProd,
        obsProd,
        fecProdIniProg,
        fecProdFinProg,
        fecVenLotProd,
        numop,
        totalUnidadesLoteProduccion,
        klgTotalLoteProduccion,
        idReqLot)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        try {
            $stmt_insert_produccion = $pdo->prepare($sql_insert_produccion);
            $stmt_insert_produccion->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_insert_produccion->bindParam(2, $idProdEst, PDO::PARAM_INT);
            $stmt_insert_produccion->bindParam(3, $idProdTip, PDO::PARAM_INT);
            $stmt_insert_produccion->bindParam(4, $idProdFinProgEst, PDO::PARAM_INT);
            $stmt_insert_produccion->bindParam(5, $idProdIniProgEst, PDO::PARAM_INT);
            $stmt_insert_produccion->bindParam(6, $codProd, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(7, $codLotProd, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(8, $klgLotProd, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(9, $canLotProd, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(10, $obsProd, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(11, $fecProdIniProg, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(12, $fecProdFinProg, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(13, $fecVenLotProd, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(14, $numop, PDO::PARAM_STR);
            $stmt_insert_produccion->bindParam(15, $totalUnidadesLoteProduccion);
            $stmt_insert_produccion->bindParam(16, $klgTotalLoteProduccion);
            $stmt_insert_produccion->bindParam(17, $idReq, PDO::PARAM_INT);

            $stmt_insert_produccion->execute();

            // verificamos si se realizo la insercion del lote de produccion
            if ($stmt_insert_produccion->rowCount() === 1) {

                $idLastInsert = $pdo->lastInsertId(); // le asignamos el id de lote produccion
                // ******* AHORA DEBEMOS AGREGAR LOS PRODUCTO FINALES ESPERADOS A UN LOTE DE PRODUCCION *****

                $sql_insert_producto_lote_produccion = "";
                $idProdcProdtFinEst = 1; // creado
                foreach ($prodDetProdc as &$rowProdDet) {
                    //datos necesarios
                    $idProdtFinProdc = $rowProdDet["idProdFin"]; // producto final
                    $canTotProgProdFin = $rowProdDet["canUnd"]; // cantidad programada

                    $sql_insert_producto_lote_produccion =
                        "INSERT INTO 
                    produccion_producto_final
                    (idProdc,
                    idProdcProdtFinEst,
                    idProdt,
                    canTotProgProdFin)
                    VALUES (?,?,?,?)";

                    $stmt_insert_producto_lote_produccion = $pdo->prepare($sql_insert_producto_lote_produccion);
                    $stmt_insert_producto_lote_produccion->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                    $stmt_insert_producto_lote_produccion->bindParam(2, $idProdcProdtFinEst, PDO::PARAM_INT);
                    $stmt_insert_producto_lote_produccion->bindParam(3, $idProdtFinProdc, PDO::PARAM_INT);
                    $stmt_insert_producto_lote_produccion->bindParam(4, $canTotProgProdFin, PDO::PARAM_INT);
                    $stmt_insert_producto_lote_produccion->execute();

                    $rowProdDet["idProdFinFlag"] =  $pdo->lastInsertId();
                }

                // ******** AHORA DEBEMOS GENERAR LAS REQUISICIONES CORRESPONDIENTES A CADA AREA *******

                // AHORA DEBEMOS SEPARAR LA DATA RESPECTIVAMENTE
                $reqDetEnv = []; // detalle de requisicion de envasado
                $reqDetEnc = []; // detalle de requisicion de encajonado

                foreach ($reqDetProdc as $value) {

                    foreach ($prodDetProdc as $row) {
                        if (isset($value["indexProdFin"]) && $value["indexProdFin"] == $row["index"]) {
                            $value["idProdFinFlag"]  = $row["idProdFinFlag"];
                        }
                    }

                    if ($value["idAre"] == 5) { // envasado
                        array_push($reqDetEnv, $value);
                    }
                    if ($value["idAre"] == 6) { // encajado
                        array_push($reqDetEnc, $value);
                    }
                }

                // AHORA CREAMOS LAS REQUISICIONES CORRESPONDIENTES
                $idReqEst = 1; // requerido
                $idReqDetEst = 1; // requerido
                $idReqTip = 2; // requisicion de envase y encaje

                // requisicion envasado
                if (!empty($reqDetEnv)) {
                    $idLastInsertReqEnv = 0;
                    $idAreReqEnv = 5; // area envasado

                    // requisicion de envasado
                    $sql_insert_requisicion_envasado =
                        "INSERT INTO
                    requisicion
                    (idProdc, idReqEst, idAre, idReqTip, codLotProd)
                    VALUES (?, ?, ?, ?, ?)";
                    try {
                        $pdo->beginTransaction(); // iniciamos una transaccion
                        $stmt_insert_requisicion_envasado = $pdo->prepare($sql_insert_requisicion_envasado);
                        $stmt_insert_requisicion_envasado->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                        $stmt_insert_requisicion_envasado->bindParam(2, $idReqEst, PDO::PARAM_INT);
                        $stmt_insert_requisicion_envasado->bindParam(3, $idAreReqEnv, PDO::PARAM_INT);
                        $stmt_insert_requisicion_envasado->bindParam(4, $idReqTip, PDO::PARAM_INT);
                        $stmt_insert_requisicion_envasado->bindParam(5, $codLotProd, PDO::PARAM_STR);
                        $stmt_insert_requisicion_envasado->execute();

                        if ($stmt_insert_requisicion_envasado->rowCount() == 1) {
                            $idLastInsertReqEnv = $pdo->lastInsertId();
                        }

                        if ($idLastInsertReqEnv != 0) {
                            $sql_insert_requisicion_envasado_detalle = "";
                            foreach ($reqDetEnv as $row_detalle) {
                                // extraemos los datos necesarios

                                if (isset($row_detalle["idProd"]) && isset($row_detalle["canReqProdLot"])) {
                                    $idProdtEnv = $row_detalle["idProd"];
                                    $canReqDet = $row_detalle["canReqProdLot"];

                                    /** test */
                                    $idProdFinFlag = 0;
                                    if (isset($row_detalle["idProdFinFlag"])) {
                                        $idProdFinFlag  = intval($row_detalle["idProdFinFlag"]);
                                        //die (json_encode(  $idProdFinFlag) );
                                    }

                                    // generamos la query
                                    $sql_insert_requisicion_envasado_detalle =
                                        "INSERT INTO
                                    requisicion_detalle
                                    (idProdt, idReq, idReqDetEst, canReqDet, idProdFin)
                                    VALUES (?, ?, ?, $canReqDet, $idProdFinFlag)";

                                    $stmt_insert_requisicion_envasado_detalle = $pdo->prepare($sql_insert_requisicion_envasado_detalle);
                                    $stmt_insert_requisicion_envasado_detalle->bindParam(1, $idProdtEnv, PDO::PARAM_INT);
                                    $stmt_insert_requisicion_envasado_detalle->bindParam(2, $idLastInsertReqEnv, PDO::PARAM_INT);
                                    $stmt_insert_requisicion_envasado_detalle->bindParam(3, $idReqDetEst, PDO::PARAM_INT);
                                    $stmt_insert_requisicion_envasado_detalle->execute();
                                }
                            }
                        } else {
                            $message_error = "ERROR EN LA INSERCION";
                            $description_error = "Error al tratar de insertar la requisicion ";
                        }

                        $pdo->commit();
                    } catch (PDOException $e) {
                        $pdo->rollBack();
                        $message_error = "ERROR INTERNO SERVER: fallo en insercion de requisicion envase";
                        $description_error = $e->getMessage();
                    }
                }

                // requisicion encajonado
                if (!empty($reqDetEnc)) {

                    $idLastInsertReqEnc = 0;
                    $idAreReqEnc = 6; // area encajonado

                    // requisicion de envasado
                    $sql_insert_requisicion_encajonado =
                        "INSERT INTO
                    requisicion
                    (idProdc, idReqEst, idAre, idReqTip, codLotProd)
                    VALUES (?, ?, ?, ?, ?)";
                    try {
                        $pdo->beginTransaction(); // iniciamos una transaccion
                        $stmt_insert_requisicion_encajonado = $pdo->prepare($sql_insert_requisicion_encajonado);
                        $stmt_insert_requisicion_encajonado->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                        $stmt_insert_requisicion_encajonado->bindParam(2, $idReqEst, PDO::PARAM_INT);
                        $stmt_insert_requisicion_encajonado->bindParam(3, $idAreReqEnc, PDO::PARAM_INT);
                        $stmt_insert_requisicion_encajonado->bindParam(4, $idReqTip, PDO::PARAM_INT);
                        $stmt_insert_requisicion_encajonado->bindParam(5, $codLotProd, PDO::PARAM_STR);
                        $stmt_insert_requisicion_encajonado->execute();

                        if ($stmt_insert_requisicion_encajonado->rowCount() == 1) {
                            $idLastInsertReqEnc = $pdo->lastInsertId();
                        }

                        if ($idLastInsertReqEnc != 0) {

                            $sql_insert_requisicion_encajonado_detalle = "";
                            foreach ($reqDetEnc as $row_detalle) {
                                // extraemos los datos necesarios
                                $idProdtEnc = $row_detalle["idProd"];
                                $canReqDet = $row_detalle["canReqProdLot"];

                                /** test */
                                $idProdFinFlag = 0;
                                if (isset($row_detalle["idProdFinFlag"])) {
                                    $idProdFinFlag  = intval($row_detalle["idProdFinFlag"]);
                                }

                                // generamos la query
                                $sql_insert_requisicion_encajonado_detalle =
                                    "INSERT INTO
                                requisicion_detalle
                                (idProdt, idReq, idReqDetEst, canReqDet, idProdFin)
                                VALUES (?, ?, ?, $canReqDet, $idProdFinFlag)";

                                $stmt_insert_requisicion_encajonado_detalle = $pdo->prepare($sql_insert_requisicion_encajonado_detalle);
                                $stmt_insert_requisicion_encajonado_detalle->bindParam(1, $idProdtEnc, PDO::PARAM_INT);
                                $stmt_insert_requisicion_encajonado_detalle->bindParam(2, $idLastInsertReqEnc, PDO::PARAM_INT);
                                $stmt_insert_requisicion_encajonado_detalle->bindParam(3, $idReqDetEst, PDO::PARAM_INT);

                                $stmt_insert_requisicion_encajonado_detalle->execute();
                            }
                        } else {
                            $message_error = "ERROR EN LA INSERCION";
                            $description_error = "Error al tratar de insertar la requisicion";
                            die(json_encode($message_error));
                        }

                        $pdo->commit();
                    } catch (PDOException $e) {
                        $pdo->rollBack();
                        $message_error = "ERROR INTERNO SERVER: fallo en insercion de requisicion encajonado";
                        $description_error = $e->getMessage();
                    }
                }

                // LA SECCION COMENTADA CORRESPONDE A SALIDAS DE PRODUCTO INTERMEDIO.
                // SIN EMBARGO, LA EMPRESA ACTUALMENTE NO LO MANEJA DE TAL FORMA

                /* 
                    Debemos generar la salida del producto intermedio.
                    Recordemos que al momento de hacer los ingresos desde molienda se 
                    generaron entradas respectivamente. Las condiciones son:
                    codLot, estado disponible, cantDis <> 0, 
                */

                // $idEntStoEst = 1; // ESTADO DE DISPONIBLE

                // $sql_select_entradas_producto_intermedio =
                //     "SELECT * FROM entrada_stock 
                // WHERE idProd = ? AND codLot = ? AND idEntStoEst = ? AND canTotDis <> 0";

                // $stmt_select_entradas_producto_intermedio = $pdo->prepare($sql_select_entradas_producto_intermedio);
                // $stmt_select_entradas_producto_intermedio->bindParam(1, $idProdt, PDO::PARAM_INT);
                // $stmt_select_entradas_producto_intermedio->bindParam(2, $codLotProd, pdo::PARAM_STR);
                // $stmt_select_entradas_producto_intermedio->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
                // $stmt_select_entradas_producto_intermedio->execute();

                // while ($row_entrada_producto_intermedio = $stmt_select_entradas_producto_intermedio->fetch(PDO::FETCH_ASSOC)) {
                //     try {
                //         $pdo->beginTransaction(); // iniciamos una transaccion
                //         $idEntSto = $row_entrada_producto_intermedio["id"]; // entrada
                //         $idProdt = $row_entrada_producto_intermedio["idProd"]; // producto
                //         $idAlmDes = 3; // almacen de envasado
                //         $idEstSalSto = 1; // completado
                //         $canSalStoReq = $row_entrada_producto_intermedio["canTotDis"]; // cantidad total disponible
                //         $merSalStoReq = 0.0;

                //         // primero realizamos la salida correspondiente
                //         $sql_create_salida_producto_intermedio =
                //             "INSERT INTO salida_stock (idEntSto, idReq, idProdt, idAlm, idEstSalSto, canSalStoReq, merSalStoReq, numop)
                //         VALUES(?, ?, ?, ?, ?, $canSalStoReq, $merSalStoReq, ?)";
                //         $stmt_create_salida_producto_intermedio = $pdo->prepare($sql_create_salida_producto_intermedio);
                //         $stmt_create_salida_producto_intermedio->bindParam(1, $idEntSto, PDO::PARAM_INT);
                //         $stmt_create_salida_producto_intermedio->bindParam(2, $idReq, PDO::PARAM_INT);
                //         $stmt_create_salida_producto_intermedio->bindParam(3, $idProdt, PDO::PARAM_INT);
                //         $stmt_create_salida_producto_intermedio->bindParam(4, $idAlmDes, PDO::PARAM_INT);
                //         $stmt_create_salida_producto_intermedio->bindParam(5, $idEstSalSto, PDO::PARAM_INT);
                //         $stmt_create_salida_producto_intermedio->bindParam(6, $numop, PDO::PARAM_STR);
                //         $stmt_create_salida_producto_intermedio->execute();

                //         // luego actualizamos la entrada correspondiente
                //         $idEntStoEstTer = 2; // estado de entrada terminado
                //         $canTotDisEmpty = 0.0;
                //         $sql_update_entrada_producto_intermedio =
                //             "UPDATE entrada_stock SET canTotDis = $canTotDisEmpty, idEntStoEst = ? WHERE id = ?";
                //         $stmt_update_entrada_producto_intermedio = $pdo->prepare($sql_update_entrada_producto_intermedio);
                //         $stmt_update_entrada_producto_intermedio->bindParam(1, $idEntStoEstTer, PDO::PARAM_INT);
                //         $stmt_update_entrada_producto_intermedio->bindParam(2, $idEntSto, PDO::PARAM_INT);
                //         $stmt_update_entrada_producto_intermedio->execute();

                //         $pdo->commit(); // commit de las operaciones

                //     } catch (PDOException $e) {
                //         $pdo->rollBack(); // rollback
                //         $message_error = "ERROR INTERNO SERVER: fallo en creacion de salida y actualizacion de entrada";
                //         $description_error = $e->getMessage();
                //     }
                // }

                /* Ahora colocamos un flag en la requisicion de producto intermedio 
                   que nos permita identificar que esta fue utilizada para una orden
                   de produccion
                */
                $fueUtilizadoEnOrdenProduccion = 1;

                $sql_update_requisicion_producto_intermedio =
                    "UPDATE requisicion SET fueUtiOrdProd	= ? WHERE id = ?";
                $stmt_update_requisicion_producto_intermedio = $pdo->prepare($sql_update_requisicion_producto_intermedio);
                $stmt_update_requisicion_producto_intermedio->bindParam(1, $fueUtilizadoEnOrdenProduccion, PDO::PARAM_BOOL);
                $stmt_update_requisicion_producto_intermedio->bindParam(2, $idReq, PDO::PARAM_INT);
                $stmt_update_requisicion_producto_intermedio->execute();
            } else {
                $message_error = "NO SE PUDO INSERTAR EL LOTE DE PRODUCCION";
                $description_error = "No se pudo insertar el lote de produccion";
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en insercion de maestro requisicion molienda";
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
