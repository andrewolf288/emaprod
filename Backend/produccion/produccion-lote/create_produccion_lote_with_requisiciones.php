<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');


$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";
//echo ("test");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdt = $data["idProdt"]; // subproducto
    $idProdTip = $data["idProdTip"]; // tipo de produccion
    $codTipProd = $data["codTipProd"]; // codigo de tipo de produccion
    $codLotProd = $data["codLotProd"]; // codigo de lote de produccion
    //$canLotProd = intval($data["canLotProd"]); // cantidad del lote
    $canLotProd = $data["canLotProd"];

    $klgLotProd = $data["klgLotProd"]; // peso del lote
    $fecProdIniProg = $data["fecProdIniProg"]; // fecha de inicio programado
    $fecProdFinProg = $data["fecProdFinProg"]; // fecha de fin programado
    $fecVenLotProd = $data["fecVenLotProd"];
    $obsProd = $data["obsProd"]; // observaciones
    $reqDetProdc = $data["reqDetProdc"]; // requerimientos
    $prodDetProdc = $data["prodDetProdc"]; // producto finales programados

    $totalUnidadesLoteProduccion = $data["totalUnidadesLoteProduccion"];
    $klgTotalLoteProduccion = $data["klgTotalLoteProduccion"];



    if ($pdo) {

        // ****** PRIMERO DEBEMOS BUSCAR SI EXISTE UNA FORMULA ADECUADA ********
        $idFor = 0; // inicializamos
        $sql_select_formula =
            "SELECT f.id
        FROM formula f WHERE lotKgrFor = $klgLotProd AND idProd = ?";
        $stmt_select_formula = $pdo->prepare($sql_select_formula);
        $stmt_select_formula->bindParam(1, $idProdt, PDO::PARAM_INT);
        $stmt_select_formula->execute();

        // si existe una formula adecuada
        if ($stmt_select_formula->rowCount() === 1) {
            while ($row = $stmt_select_formula->fetch(PDO::FETCH_ASSOC)) {
                $idFor = $row["id"];
            }

            // ahora consultamos el detalle de la formula para obtener la requisicion de materia prima
            $sql_consult_formula_detalle =
                "SELECT
            fd.id,
            fd.idFor,
            fd.idMatPri,
            fd.idAre,
            fd.canMatPriFor
            FROM formula_detalle fd
            WHERE fd.idFor = ?";
            $stmt_consult_formula_detalle = $pdo->prepare($sql_consult_formula_detalle);
            $stmt_consult_formula_detalle->bindParam(1, $idFor, PDO::PARAM_INT);
            $stmt_consult_formula_detalle->execute();

            while ($row_detalle = $stmt_consult_formula_detalle->fetch(PDO::FETCH_ASSOC)) {
                array_push($reqDetProdc, $row_detalle);
            }

            // ****** CREAMOS LAS INSERCIONES CORRESPONDIENTES *******
            /* CONDICION:
                1.- EL CODIGO DE LOTE NO DEBE SER REPETIDO DURANTE TODO EL AÑO DE PRODUCCION
            */
            $year = date("Y"); // obtenemos el año actual
            $sql = "SELECT * FROM produccion WHERE codLotProd = ? AND fecProdIni REGEXP '^$year-*'";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $codLotProd, PDO::PARAM_STR);
            $stmt->execute();
            $countRows = $stmt->rowCount();
            /*
            if ($countRows > 0) {
                $message_error = "REGISTRO EXISTENTE";
                $description_error = "Ya existe una produccion lote con ese codigo";
            } else {
                */
            // CALCULAMOS EL ESTADO DE LA PRODUCCION
            $idProdEst = 1; // iniciado

            // CALCULAMOS EL ESTADO DE LA PRODUCCION SEGUN SU PROGRAMACION DE INICIO
            $idProdIniProgEst = 0; // valor nulo
            $fechaIniciadoProgramacion = strtotime(explode(" ", $fecProdIniProg)[0]);
            $fechaIniciadoActual = strtotime(date("Y-m-d"));

            /* 
                    1. A tiempo
                    2. Atrasado
                    3. Adelantado
                */
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
            /* 
                    1. A tiempo
                    2. Atrasado
                    3. Adelantado
                */
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

            //echo ( $canLotProd);
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
                    klgTotalLoteProduccion)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
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

                $numop = $op . $anio . $mes . $lastInsertId;
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


                        /** TEST */
                        $rowProdDet["idProdFinFlag"] =  $pdo->lastInsertId();
                        //die (json_encode($rowProdDet) );

                    }
                    //die(json_encode("test"));

                    //unset($rowProdDet); 
                    //die (json_encode($prodDetProdc) );
                    //$idLastInsert = $pdo->lastInsertId(); // id de produccion_producto_final para detalle de requisicion

                    // ******** AHORA DEBEMOS GENERAR LAS REQUISICIONES CORRESPONDIENTES A CADA AREA *******

                    // AHORA DEBEMOS SEPARAR LA DATA RESPECTIVAMENTE
                    $reqDetMatPri = []; // detalle de requisicion de materia prima
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
                        if ($value["idAre"] == 2 || $value["idAre"] == 7) { // materia prima
                            array_push($reqDetMatPri, $value);
                        }
                    }

                    //die (json_encode($reqDetProdc) );

                    // AHORA CREAMOS LAS REQUISICIONES CORRESPONDIENTES
                    $idReqEst = 1; // requerido
                    $idReqDetEst = 1; // requerido

                    // requisicion materia prima
                    if (!empty($reqDetMatPri)) {
                        // ahora debemos crear las requisiciones correspondientes
                        $idAreMol = 2; // area de molienda
                        $idAreFre = 7; // area de frescos

                        $idLastInsertReqMatPri = 0;
                        $idAreReqMatPri = 0;

                        switch ($idProdTip) {
                            case 1: // polvos
                                $idAreReqMatPri = $idAreMol;
                                break;
                            case 2: // frescos
                                $idAreReqMatPri = $idAreFre;
                                break;
                            case 3: // sales parrilleras
                                $idAreReqMatPri = $idAreMol;
                                break;
                            case 5: // sub producto
                                $idAreReqMatPri = $idAreMol;
                                break;
                            default:
                                $idAreReqMatPri = $idAreMol;
                        }

                        //requisicion de materia prima
                        $sql_insert_requisicion_materia_prima =
                            "INSERT INTO
                                requisicion
                                (idProdc, idReqEst, idAre)
                                VALUES (?, ?, ?)";
                        try {
                            $pdo->beginTransaction(); // iniciamos una transaccion
                            $stmt_insert_requisicion_materia_prima = $pdo->prepare($sql_insert_requisicion_materia_prima);
                            $stmt_insert_requisicion_materia_prima->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                            $stmt_insert_requisicion_materia_prima->bindParam(2, $idReqEst, PDO::PARAM_INT);
                            $stmt_insert_requisicion_materia_prima->bindParam(3, $idAreReqMatPri, PDO::PARAM_INT);
                            $stmt_insert_requisicion_materia_prima->execute();

                            if ($stmt_insert_requisicion_materia_prima->rowCount() == 1) {
                                $idLastInsertReqMatPri = $pdo->lastInsertId();
                            }

                            if ($idLastInsertReqMatPri != 0) {
                                $sql_insert_requisicion_materia_prima_detalle = "";


                                $idProdtMatPri = $idProdt;
                                $canReqDet = $canLotProd;

                                /** test */
                                $idProdFinFlag = 0;
                                if (isset($row_detalle["idProdFinFlag"])) {
                                    $idProdFinFlag  = intval($row_detalle["idProdFinFlag"]);
                                }

                                $sql_insert_requisicion_materia_prima_detalle =
                                    "INSERT INTO
                                           requisicion_detalle
                                           (idProdt, idReq, idReqDetEst, canReqDet, idProdFin)
                                           VALUES (?, ?, ?, ?, ?)";

                                $stmt_insert_requisicion_materia_prima_detalle = $pdo->prepare($sql_insert_requisicion_materia_prima_detalle);
                                $stmt_insert_requisicion_materia_prima_detalle->bindParam(1, $idProdtMatPri, PDO::PARAM_INT);
                                $stmt_insert_requisicion_materia_prima_detalle->bindParam(2, $idLastInsertReqMatPri, PDO::PARAM_INT);
                                $stmt_insert_requisicion_materia_prima_detalle->bindParam(3, $idReqDetEst, PDO::PARAM_INT);
                                $stmt_insert_requisicion_materia_prima_detalle->bindParam(4, $canReqDet, PDO::PARAM_STR);
                                $stmt_insert_requisicion_materia_prima_detalle->bindParam(5, $idProdFinFlag, PDO::PARAM_STR);
                                $stmt_insert_requisicion_materia_prima_detalle->execute();

                                // foreach ($reqDetMatPri as $row_detalle) {
                                //   $idProdtMatPri = $row_detalle["idMatPri"];
                                //    $canReqDet = $row_detalle["canMatPriFor"] * $canLotProd;

                                /** test */
                                //    $idProdFinFlag = 0;
                                //    if (isset($row_detalle["idProdFinFlag"])) {
                                //        $idProdFinFlag  = intval($row_detalle["idProdFinFlag"]);
                                //    }

                                // generamos la query
                                //    $sql_insert_requisicion_materia_prima_detalle =
                                //        "INSERT INTO
                                //            requisicion_detalle
                                //            (idProdt, idReq, idReqDetEst, canReqDet, idProdFin)
                                //            VALUES (?, ?, ?, ?, ?)";
                                //
                                //$stmt_insert_requisicion_materia_prima_detalle = $pdo->prepare($sql_insert_requisicion_materia_prima_detalle);
                                //$stmt_insert_requisicion_materia_prima_detalle->bindParam(1, $idProdtMatPri, PDO::PARAM_INT);
                                //$stmt_insert_requisicion_materia_prima_detalle->bindParam(2, $idLastInsertReqMatPri, PDO::PARAM_INT);
                                //$stmt_insert_requisicion_materia_prima_detalle->bindParam(3, $idReqDetEst, PDO::PARAM_INT);
                                //$stmt_insert_requisicion_materia_prima_detalle->bindParam(4, $canReqDet, PDO::PARAM_STR);
                                //$stmt_insert_requisicion_materia_prima_detalle->bindParam(5, $idProdFinFlag, PDO::PARAM_STR);
                                //$stmt_insert_requisicion_materia_prima_detalle->execute();
                                //}

                            } else {
                                $message_error = "ERROR EN LA INSERCION";
                                $description_error = "Error al tratar de insertar la requisicion";
                            }

                            $pdo->commit();
                        } catch (PDOException $e) {
                            $pdo->rollBack();
                            $message_error = "ERROR INTERNO SERVER: fallo en insercion de requisicion materia prima";
                            $description_error = $e->getMessage();
                        }
                    }

                    // requisicion envasado
                    if (!empty($reqDetEnv)) {
                        $idLastInsertReqEnv = 0;
                        $idAreReqEnv = 5; // area envasado

                        // requisicion de envasado
                        $sql_insert_requisicion_envasado =
                            "INSERT INTO
                                requisicion
                                (idProdc, idReqEst, idAre)
                                VALUES (?, ?, ?)";
                        try {
                            $pdo->beginTransaction(); // iniciamos una transaccion
                            $stmt_insert_requisicion_envasado = $pdo->prepare($sql_insert_requisicion_envasado);
                            $stmt_insert_requisicion_envasado->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                            $stmt_insert_requisicion_envasado->bindParam(2, $idReqEst, PDO::PARAM_INT);
                            $stmt_insert_requisicion_envasado->bindParam(3, $idAreReqEnv, PDO::PARAM_INT);
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
                                (idProdc, idReqEst, idAre)
                                VALUES (?, ?, ?)";
                        try {
                            $pdo->beginTransaction(); // iniciamos una transaccion
                            $stmt_insert_requisicion_encajonado = $pdo->prepare($sql_insert_requisicion_encajonado);
                            $stmt_insert_requisicion_encajonado->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                            $stmt_insert_requisicion_encajonado->bindParam(2, $idReqEst, PDO::PARAM_INT);
                            $stmt_insert_requisicion_encajonado->bindParam(3, $idAreReqEnc, PDO::PARAM_INT);
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
                } else {
                    $message_error = "NO SE PUDO INSERTAR EL LOTE DE PRODUCCION";
                    $description_error = "No se pudo insertar el lote de produccion";
                }
            } catch (PDOException $e) {
                $message_error = "ERROR INTERNO SERVER: fallo en insercion de maestro requisicion molienda";
                $description_error = $e->getMessage();
            }
        } else {
            $message_error = "NO SE ENCONTRO NINGUNA FORMULA";
            $description_error = "No se encontro ninguna formula asociada al peso (kg) y subproducto elegido";
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
