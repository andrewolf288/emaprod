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
    $codComCon = $data["Cd_Com"]; // codigo de compra contanet
    $diaJulEntSto = $data["diaJulEntSto"]; // dia juliano
    $docEntSto = $data["docEntSto"]; // documento de entrada
    $esSel = $data["esSel"]; // es para seleccionar
    $fecEntSto = $data["fecEntSto"]; // fecha de entrada stock
    $guiRem = $data["guiRem"]; // guia de remision
    $idAlm = $data["idAlm"]; // almacen dirigido
    $idProd = $data["idProd"]; // producto
    $idProv = $data["idProv"]; // proveedor
    $letAniEntSto = $data["letAniEntSto"]; // letra año
    $ordCom = $data["ordCom"]; // orden de compra
    $anio_actual = date('Y'); // obtenemos año actual

    // DEMAS DATO
    $canTotDis = $canTotEnt; // cantidad total disponible
    $canSel = 0; // canttidad seleccionada
    $canPorSel = 0; // cantidad por seleccionar
    $merTot = 0; // merma total
    $idEntStoEst = 1;
    $idEntStoTip = 1; // tipo de entrada por compra

    if ($pdo) {
        $codEntSto = ""; // codigo de entrada
        $refNumIngEntSto = 0; // numero de referencia de ingreso
        if ($idAlm != 8) {
            $idAlm = ($idProd == 167 || $idProd == 168 || $idProd == 169 || $idProd == 170) ? 8 : 1;
        }

        $sql_numero_entrada =
            "SELECT 
        max(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
        FROM entrada_stock
        WHERE idProd = ? AND YEAR(fecEntSto) = ? AND idAlm = ?
        ORDER BY refNumIngEntSto DESC LIMIT 1";

        // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
        $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
        $stmt_numero_entrada->bindParam(1, $idProd, PDO::PARAM_INT);
        $stmt_numero_entrada->bindParam(2, $anio_actual, PDO::PARAM_STR);
        $stmt_numero_entrada->bindParam(3, $idAlm, PDO::PARAM_INT);
        $stmt_numero_entrada->execute();
        $row_numero_entrada = $stmt_numero_entrada->fetch(PDO::FETCH_ASSOC);

        // COMPROBAMOS SI EXISTE UNA ENTRADA DE ESTE PRODUCTO
        if ($row_numero_entrada) {
            $refNumIngEntSto = intval($row_numero_entrada["refNumIngEntSto"]) + 1;
        } else {
            $refNumIngEntSto = 1;
        }
        $refNumIngEntSto = str_pad(strval($refNumIngEntSto), 3, "0", STR_PAD_LEFT);

        // ***** FORMAMOS EL CODIGO DE ENTRADA ******
        $codEntSto = "$codProd" . "$codProv" . "$letAniEntSto" . "$diaJulEntSto" . "$refNumIngEntSto";

        try {
            $pdo->beginTransaction();
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
            fecEntSto,
            ordCom,
            guiRem,
            idEntStoTip,
            codComCon)
            VALUES (?,?,?,?,?,?,?,?,?,$canSel, $canPorSel, $merTot, $canTotCom, $canTotEnt, $canTotDis, $canVar, ?, ?, ?, ?, ?, ?)";

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
            $stmt->bindParam(11, $fecEntSto); // fecha de entrada
            $stmt->bindParam(12, $ordCom, PDO::PARAM_STR); // fecha de vencimiento
            $stmt->bindParam(13, $guiRem, PDO::PARAM_STR); // fecha de entrada
            $stmt->bindParam(14, $idEntStoTip, PDO::PARAM_INT); // tipo de entrada (compra)
            $stmt->bindParam(15, $codComCon, PDO::PARAM_STR); // tipo de entrada (compra)

            $stmt->execute(); // ejecutamos
            $lastInsertionEntradaStock = $pdo->lastInsertId();

            // ahora debemos crear su informacion de calidad
            if ($idProd != 167 && $idProd != 168 && $idProd != 169 && $idProd != 170 && $idAlm != 8) {
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

                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                $stmt_update_almacen_stock->bindParam(1, $fecEntSto, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idProd, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(3, $idAlm, PDO::PARAM_INT);
                $stmt_update_almacen_stock->execute(); // ejecutamos
            } else {
                // CREATE NUEVO REGISTRO ALMACEN STOCK
                $sql_create_almacen_stock =
                    "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                VALUE (?,?,$canTotEnt,$canTotDis)";
                $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                $stmt_create_almacen_stock->bindParam(1, $idProd, PDO::PARAM_INT);
                $stmt_create_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                $stmt_create_almacen_stock->execute(); // ejecutamos
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER AL CONSULTAR ALMACEN STOCK";
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
