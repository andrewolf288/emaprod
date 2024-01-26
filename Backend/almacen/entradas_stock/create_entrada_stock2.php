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

    //DATOS RECIBIDOS
    $canTotEnt = $data["canTotEnt"]; // cantidad total entrada
    $canTotCom =  $data["canTotCom"]; // cantidad total compra
    $canVar = $data["canVar"]; // cantidad variacion
    $codProd = $data["codProd"]; // codigo de producto
    $codProv = $data["codProv"]; // codigo de proveedor
    $diaJulEntSto = $data["diaJulEntSto"]; // dia juliano
    $docEntSto = $data["docEntSto"]; // documento de entrada
    $esEntPar = $data["esEntPar"]; // es entrada parcial
    $esSel = $data["esSel"]; // es para seleccionar
    $fecEntSto = $data["fecEntSto"]; // fecha de entrada stock
    $fecVenEntSto = $data["fecVenEntSto"]; // fecha de vencimiento
    $guiRem = $data["guiRem"]; // guia de remision
    $idAlm = $data["idAlm"]; // almacen dirigido
    $idProd = $data["idProd"]; // producto
    $idProv = $data["idProv"]; // proveedor
    $letAniEntSto = $data["letAniEntSto"]; // letra año
    $ordCom = $data["ordCom"]; // orden de compra
    // esta variable maneja la data de entradas parciales, puede ser un valor nulo cuando no se manejan entradas parciales
    $entradasParciales = $data["entradasParciales"];

    // DEMAS DATO
    $canTotDis = $canTotEnt; // cantidad total disponible
    $canSel = 0; // canttidad seleccionada
    $canPorSel = 0; // cantidad por seleccionar
    $merTot = 0; // merma total


    if ($pdo) {
        $codEntSto = ""; // codigo de entrada
        $refNumIngEntSto = 0; // numero de referencia de ingreso

        // si se proporciona informacion de las entradas parciales
        if (isset($entradasParciales)) {
            // tiene el mismo numero de ingreso de referencia
            $refNumIngEntSto = $entradasParciales["refNumIngEntSto"];
            // formamos el codigo
            $codEntSto = "$codProd" . "$codProv" . "$letAniEntSto" . "$diaJulEntSto" . "$refNumIngEntSto";

            // primero verificamos si es una entrada total
            if ($entradasParciales["esEntTot"]) {
                // la ultima entrada parcial pasa a ser entrada total
                $esEntPar = false;
                // actualizamos las entradas parciales a entrada total
                $sql_update_entrada_parcial = "";
                foreach ($entradasParciales["detEntPar"] as $row_entrada_parcial) {
                    $idEntSto = $row_entrada_parcial["id"]; // extraemos el id de la entrada de stock

                    $sql_update_entrada_parcial = "UPDATE entrada_stock SET esEntPar = ? WHERE id = ?";
                    $stmt_update_entrada_parcial = $pdo->prepare($sql_update_entrada_parcial);
                    $stmt_update_entrada_parcial->bindParam(1, $esEntPar, PDO::PARAM_BOOL);
                    $stmt_update_entrada_parcial->bindParam(2, $idEntSto, PDO::PARAM_INT);
                    $stmt_update_entrada_parcial->execute();
                }
            }
            // si no se proporciona informacion de las entradas parciales, significa que es un ingreso total o que se esta realizando el
            // primer ingreso parcial
        } else {
            // OBTENEMOS EL NUMERO DE INGRESO DE DICHA MATERIA PRIMA
            // Recordemos que el numero de ingreso se reinicia cada año es por ello que solo debemos
            // consultar las entradas que se dieron en el año actual

            $anio_actual = date('Y'); // obtenemos año actual
            $sql_numero_entrada =
                "SELECT 
            max(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
            FROM entrada_stock
            WHERE idProd = ? AND YEAR(fecEntSto) = ?
            ORDER BY refNumIngEntSto DESC LIMIT 1";

            // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
            $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
            $stmt_numero_entrada->bindParam(1, $idProd, PDO::PARAM_INT);
            $stmt_numero_entrada->bindParam(2, $anio_actual, PDO::PARAM_STR);
            $stmt_numero_entrada->execute();

            // Recorremos los resultados
            $result_numero_entrada = [];
            while ($row = $stmt_numero_entrada->fetch(PDO::FETCH_ASSOC)) {
                if (isset($row["refNumIngEntSto"])) {
                    array_push($result_numero_entrada, $row);
                }
            }

            // COMPROBAMOS SI NO HUBO ENTRADAS DE ESE PRODUCTO
            if (empty($result_numero_entrada)) {
                // SERA LA PRIMERA INSERCION DEL AÑO
                $refNumIngEntSto = 1;
            } else {
                $refNumIngEntSto = $result_numero_entrada[0]["refNumIngEntSto"] + 1;
            }

            // EL CODIGO DE INGRESO ES DE 
            $refNumIngEntSto = str_pad(strval($refNumIngEntSto), 3, "0", STR_PAD_LEFT);

            // ***** FORMAMOS EL CODIGO DE ENTRADA ******
            $codEntSto = "$codProd" . "$codProv" . "$letAniEntSto" . "$diaJulEntSto" . "$refNumIngEntSto";
        }

        /* 
            primero debemos comprobar que no se encuentren ingresos parciales pendientes 
            dentro de un periodo de un mes.
        */

        $siEsEntPar = true; // es entrada total
        $fecha_actual = date('Y-m-d'); // fecha actual
        $fecha_un_mes_atras = date('Y-m-d', strtotime('-1 month', strtotime($fecha_actual))); //fecha hace un mes
        $idEntStoTip = 1; // entrada de compra

        $sql_select_entradas_parciales_pendientes =
            "SELECT * FROM entrada_stock
        WHERE idProd = ? AND esEntPar = ? AND DATE(fecEntSto) >= ? LIMIT 1";
        $stmt_select_entradas_parciales_pendientes = $pdo->prepare($sql_select_entradas_parciales_pendientes);
        $stmt_select_entradas_parciales_pendientes->bindParam(1, $idProd, PDO::PARAM_INT);
        $stmt_select_entradas_parciales_pendientes->bindParam(2, $siEsEntPar, PDO::PARAM_BOOL);
        $stmt_select_entradas_parciales_pendientes->bindParam(3, $fecha_un_mes_atras);
        $stmt_select_entradas_parciales_pendientes->execute();

        // con esta operacion nosotros verificamos si hay entradas parciales pendientes
        $resultado_select_entradas_parciales_pendientes = $stmt_select_entradas_parciales_pendientes->fetchAll(PDO::FETCH_ASSOC);

        // si se realiza una entrada y hay entradas parciales sin resolver
        // y ademas, no se va a realizar una entrada parcial
        if (count($resultado_select_entradas_parciales_pendientes) > 0 && !isset($entradasParciales)) {
            // mostramos errores de entradas parciales pendientes
            $message_error = "Error en la insercion";
            $description_error = "Hay entradas parciales pendientes de este producto en un plazo de un mes";
        } else {
            // si es un producto de auxiliar
            // $idEntStoEst = ($idProd == 167 || $idProd == 168 || $idProd == 169 || $idProd == 170) ? 1 : 2;
            $idEntStoEst = 1;
            $idAlm = ($idProd == 167 || $idProd == 168 || $idProd == 169 || $idProd == 170) ? 8 : 1;

            // ahora iniciamos un proceso de insercion y actualizacion que debe estar envuelto en un rollback
            $pdo->beginTransaction(); // EMPEZAMOS UNA TRANSACCION
            // ***** REALIZAMOS LA ENTRADA RESPECTIVA ******
            $sql =
                "INSERT INTO
                    entrada_stock
                    (idProd, 
                    idProv,
                    idAlm, 
                    idEntStoEst,
                    codEntSto,
                    letAniEntSto, 
                    diaJulEntSto, 
                    refNumIngEntSto,
                    esSel,
                    canSel,
                    canPorSel,
                    merTot,
                    canTotCom,
                    canTotEnt,
                    canTotDis,
                    canVar,
                    docEntSto,
                    esEntPar,
                    fecVenEntSto,
                    fecEntSto,
                    ordCom,
                    guiRem,
                    idEntStoTip)
                    VALUES (?,?,?,?,?,?,?,?,?,$canSel, $canPorSel, $merTot, $canTotCom, $canTotEnt, $canTotDis, $canVar, ?, ?, ?, ?, ?, ?, ?)
                    ";

            try {
                //Preparamos la consulta
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $idProd, PDO::PARAM_INT); // producto
                $stmt->bindParam(2, $idProv, PDO::PARAM_INT); // proveedor
                $stmt->bindParam(3, $idAlm, PDO::PARAM_INT); // almacen
                $stmt->bindParam(4, $idEntStoEst, PDO::PARAM_INT); // estado entrada
                $stmt->bindParam(5, $codEntSto, PDO::PARAM_STR); // codigo de entrada
                $stmt->bindParam(6, $letAniEntSto, PDO::PARAM_STR); // letra de año
                $stmt->bindParam(7, $diaJulEntSto, PDO::PARAM_STR); // dia juliano
                $stmt->bindParam(8, $refNumIngEntSto, PDO::PARAM_INT); // referencia de numero de ingreso
                $stmt->bindParam(9, $esSel, PDO::PARAM_BOOL); // es seleccion
                $stmt->bindParam(10, $docEntSto, PDO::PARAM_STR); // documento
                $stmt->bindParam(11, $esEntPar, PDO::PARAM_BOOL); // es entrada parcial
                $stmt->bindParam(12, $fecVenEntSto); // fecha de vencimiento
                $stmt->bindParam(13, $fecEntSto); // fecha de entrada
                $stmt->bindParam(14, $ordCom, PDO::PARAM_STR); // fecha de vencimiento
                $stmt->bindParam(15, $guiRem, PDO::PARAM_STR); // fecha de entrada
                $stmt->bindParam(16, $idEntStoTip, PDO::PARAM_INT); // tipo de entrada (compra)

                $stmt->execute(); // ejecutamos
                $lastInsertionEntradaStock = $pdo->lastInsertId();

                // ahora debemos crear su informacion de calidad
                // solo si no es producto de auxiliar
                if ($idProd != 167 && $idProd != 168 && $idProd != 169 && $idProd != 170) {
                    $sql_create_entrada_calidad =
                        "INSERT INTO entrada_calidad(idEnt)
                    VALUES(?)";
                    $stmt_create_entrada_calidad = $pdo->prepare($sql_create_entrada_calidad);
                    $stmt_create_entrada_calidad->bindParam(1, $lastInsertionEntradaStock, PDO::PARAM_INT);
                    $stmt_create_entrada_calidad->execute();
                }

                // ACTUALIZAMOS EL STOCK TOTAL DEL ALMACEN Y LA MATERIA PRIMA

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
                                    SET canSto = canSto + $canTotEnt, canStoDis = canStoDis + $canTotDis, fecActAlmSto = ?
                                    WHERE idProd = ? AND idAlm = ?";
                        try {
                            $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                            $stmt_update_almacen_stock->bindParam(1, $fecEntSto, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->bindParam(2, $idProd, PDO::PARAM_INT);
                            $stmt_update_almacen_stock->bindParam(3, $idAlm, PDO::PARAM_INT);

                            $stmt_update_almacen_stock->execute(); // ejecutamos
                        } catch (PDOException $e) {
                            $pdo->rollback();
                            $message_error = "ERROR INTERNO SERVER AL ACTUALIZAR ALMACEN STOCK";
                            $description_error = $e->getMessage();
                        }
                    } else {
                        // CREATE NUEVO REGISTRO ALMACEN STOCK
                        $sql_create_almacen_stock =
                            "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                                VALUE (?,?,$canTotEnt,$canTotDis)";
                        try {
                            $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                            $stmt_create_almacen_stock->bindParam(1, $idProd, PDO::PARAM_INT);
                            $stmt_create_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);

                            $stmt_create_almacen_stock->execute(); // ejecutamos
                        } catch (PDOException $e) {
                            $pdo->rollback();
                            $message_error = "ERROR INTERNO SERVER AL CREAR ALMACEN STOCK";
                            $description_error = $e->getMessage();
                        }
                    }
                    // TERMINAMOS LA TRANSACCION
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollback();
                    $message_error = "ERROR INTERNO SERVER AL CONSULTAR ALMACEN STOCK";
                    $description_error = $e->getMessage();
                }
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER AL INSERTAR LA ENTRADA";
                $description_error = $e->getMessage();
            }
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
