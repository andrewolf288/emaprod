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
    $idProd = $data["idProd"]; // producto
    $codProd = $data["codProd"]; // codigo de producto
    $idProv = $data["idProv"]; // proveedor
    $codProv = $data["codProv"]; // codigo de proveedor
    $idAlm = $data["idAlm"]; // almacen dirigido
    $letAniEntSto = $data["letAniEntSto"]; // letra año
    $diaJulEntSto = $data["diaJulEntSto"]; // dia juliano
    $esSel = $data["esSel"]; // es para seleccionar
    $canTotEnt = $data["canTotEnt"]; // cantidad total entrada
    $canTotCom = $data["canTotCom"]; // cantidad total compra
    $canVar = $data["canVar"]; // cantidad variacion
    $docEntSto = $data["docEntSto"]; // documento de entrada
    $fecVenEntSto = $data["fecVenEntSto"]; // fecha de vencimiento
    $fecEntSto = $data["fecEntSto"];


    $prestProdt = $data["prestProdt"];
    $certCal = $data["certCal"];
    $lotProv = $data["lotProv"];
    $resbEval = $data["resbEval"];
    $fecProduccion = $data["fecProduccion"];
    $humedad = $data["humedad"];


    // SOLO SI ES SELECCION
    $idEntStoEst = 1; // estado de disponible
    $canTotDis = $canTotEnt; // cantidad total disponible
    $canSel = 0;
    $canPorSel = 0;
    $merTot = 0;


    if ($pdo) {

        // OBTENEMOS EL NUMERO DE INGRESO DE DICHA MATERIA PRIMA
        // EL NUMERO DE INGRESO DE UN PRODUCTO SE RESTABLECE A 1 CADA AÑO
        $anioActual = explode("-", explode(" ", $fecEntSto)[0])[0]; // año actual
        $sql_numero_entrada =
            "SELECT 
        MAX(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
        FROM entrada_stock
        WHERE idProd = ? AND YEAR(fecEntSto) = ?
        ORDER BY refNumIngEntSto DESC LIMIT 1";

        try {

            $pdo->beginTransaction(); // EMPEZAMOS UNA TRANSACCION

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
                    $refNumIngEntSto = intval($row["refNumIngEntSto"]) + 1;
                }
            } else {
                // si no hay ingresos de productos ese año
                $refNumIngEntSto = 1;
            }

            // EL CODIGO DE INGRESO ES DE 
            $refNumIngEntSto = str_pad(strval($refNumIngEntSto), 3, "0", STR_PAD_LEFT);

            // ***** FORMAMOS EL CODIGO DE ENTRADA ******
            $codEntSto = $codProd . $codProv . $letAniEntSto . $diaJulEntSto . $refNumIngEntSto;


            $prestProdt = $data["prestProdt"];
            $certCal = $data["certCal"];
            $lotProv = $data["lotProv"];
            $resbEval = $data["resbEval"];
            $fecProduccion = $data["fecProduccion"];
            $humedad = $data["humedad"];
            $obsEnt = $data["obsEnt"];
            $ordCom = $data["ordCom"];
            $guiRem = $data["guiRem"];

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
            canTotCom,
            canTotEnt,
            canTotDis,
            canVar,
            docEntSto,
            fecVenEntSto,
            fecEntSto,
            prestProdt,
            certCal,
            lotProv,
            resbEval,
            fecProduccion,
            humedad,
            obsEnt,
            ordCom,
            guiRem)
            VALUES (?,?,?,?,?,?,?,?,?,$canTotCom,$canTotEnt, $canTotDis, $canVar,?,?,?,?,?,?,?,?,?,?,?,?)";

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
                $stmt->bindParam(8, $refNumIngEntSto, PDO::PARAM_STR); // referencia de numero de ingreso
                $stmt->bindParam(9, $esSel, PDO::PARAM_BOOL); // es seleccion
                $stmt->bindParam(10, $docEntSto, PDO::PARAM_STR); // documento
                $stmt->bindParam(11, $fecVenEntSto, PDO::PARAM_STR); // fecha de vencimiento
                $stmt->bindParam(12, $fecEntSto, PDO::PARAM_STR); // fecha de entrada

                $stmt->bindParam(13, $prestProdt, PDO::PARAM_STR);
                $stmt->bindParam(14, $certCal, PDO::PARAM_STR);
                $stmt->bindParam(15, $lotProv, PDO::PARAM_STR);
                $stmt->bindParam(16, $resbEval, PDO::PARAM_STR);
                $stmt->bindParam(17, $fecProduccion, PDO::PARAM_STR);
                $stmt->bindParam(18, $humedad, PDO::PARAM_STR);
                $stmt->bindParam(19, $obsEnt, PDO::PARAM_STR);
                $stmt->bindParam(20, $ordCom, PDO::PARAM_STR);
                $stmt->bindParam(21, $guiRem, PDO::PARAM_STR);

                $stmt->execute(); // ejecutamos

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
                        VALUES (?,?,$canTotEnt,$canTotDis)";
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
        } catch (PDOException $e) {
            // No se pudo realizar la conexion a la base de datos
            $pdo->rollback();
            $message_error = "ERROR AL OBTENER EL NUMERO DE INGRESO";
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
