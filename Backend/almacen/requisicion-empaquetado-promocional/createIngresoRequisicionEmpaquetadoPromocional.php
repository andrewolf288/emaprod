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

    $idReqIngEmpProm = $data["id"]; // id de requisicion ingreso
    $idProdt = $data["idProdt"]; // producto
    $codProd2 = $data["codProd2"]; // codigo de producto
    $letAniEntSto = $data["letAniEntSto"]; // letra
    $diaJulEntSto = $data["diaJulEntSto"]; // dia juliano
    $canProdIng = $data["canProdIng"]; // cantidad ingresada
    $fecEntSto = $data["fecProdIng"]; // fecha de ingreso
    $fecProdVen = $data["fecProdVen"]; // fecha de vencimiento
    $fecProdIngAlm = date('Y-m-d H:i:s'); // fecha ingreso almacen

    if ($pdo) {
        try {
            $pdo->beginTransaction();
            $idProv = 1; // proveedor EMARANSAC
            $idAlm = 1; // almacen principal
            $idEntStoEst = 1; // disponible
            $codProv = "00"; // proveedor EMARANSAC
            $esSel = 0; // es seleccion
            $docEntSto = "PRODUCTO FINAL";
            $idEntStoTip = 3; // entrada de produto final
            $anioActual = explode("-", explode(" ", $fecEntSto)[0])[0]; // año actual

            $sql_numero_entrada =
                "SELECT 
            MAX(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
            FROM entrada_stock
            WHERE idProd = ? AND YEAR(fecEntSto) = ? AND idAlm = ?
            ORDER BY refNumIngEntSto DESC LIMIT 1";

            // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
            $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
            $stmt_numero_entrada->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_numero_entrada->bindParam(2, $anioActual, PDO::PARAM_STR);
            $stmt_numero_entrada->bindParam(3, $idAlm, PDO::PARAM_INT);
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
            $codEntSto = $codProd2 . $codProv . $letAniEntSto . $diaJulEntSto . $refNumIngEntSto;

            // debemos buscar el lote de origen
            $sql_select_lote_referencia =
            "SELECT lotPorDef FROM producto
            WHERE id = ?";
            $stmt_select_lote_referencia = $pdo->prepare($sql_select_lote_referencia);
            $stmt_select_lote_referencia->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_select_lote_referencia->execute();
            $row_producto_ingreso = $stmt_select_lote_referencia->fetch(PDO::FETCH_ASSOC);

            // ahora consultamos el lote correspondinete
            $sql_select_produccion = 
            "SELECT id FROM produccion
            WHERE codLotProd = ?";
            $stmt_select_produccion = $pdo->prepare($sql_select_produccion);
            $stmt_select_produccion->bindParam(1, $row_producto_ingreso["lotPorDef"], PDO::PARAM_STR);
            $stmt_select_produccion->execute();
            $row_produccion = $stmt_select_produccion->fetch(PDO::FETCH_ASSOC);

            if($row_produccion){
                $sql_insert_entrada_stock =
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
                docEntSto,
                fecEntSto,
                fecVenEntSto,
                idEntStoTip,
                refProdc,
                referencia)
                VALUES (?,?,?,?,?,?,?,?,?,$canProdIng,$canProdIng,?,?,?,?,?,?)";
    
                $stmt_insert_entrada_stock = $pdo->prepare($sql_insert_entrada_stock);
                $stmt_insert_entrada_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(2, $idProv, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(3, $idAlm, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(4, $idEntStoEst, PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(5, $codEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(6, $letAniEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(7, $diaJulEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(8, $refNumIngEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(9, $esSel, PDO::PARAM_BOOL);
                $stmt_insert_entrada_stock->bindParam(10, $docEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(11, $fecEntSto, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(12, $fecProdVen, PDO::PARAM_STR);
                $stmt_insert_entrada_stock->bindParam(13, $idEntStoTip, PDO::PARAM_INT); // entrada de tipo producto final
                $stmt_insert_entrada_stock->bindParam(14, $row_produccion["id"], PDO::PARAM_INT);
                $stmt_insert_entrada_stock->bindParam(15, $row_produccion["id"], PDO::PARAM_INT);
                $stmt_insert_entrada_stock->execute();
    
                // finalmente actualizamos stock de almacen principal
                // primero consultamos si existe el producto registrado
                $sql_consult_stock_almacen =
                    "SELECT * FROM almacen_stock
                WHERE idAlm = ? AND idProd = ?";
    
                $stmt_consult_stock_almacen = $pdo->prepare($sql_consult_stock_almacen);
                $stmt_consult_stock_almacen->bindParam(1, $idAlm, PDO::PARAM_INT);
                $stmt_consult_stock_almacen->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_consult_stock_almacen->execute();
    
                // Si esta registrado el producto en el almacen principal (UPDATE)
                if ($stmt_consult_stock_almacen->rowCount() == 1) {
                    $sql_update_stock_almacen =
                        "UPDATE almacen_stock SET
                    canSto = canSto + $canProdIng, canStoDis = canStoDis + $canProdIng
                    WHERE idAlm = ? AND idProd = ?";
    
                    $stmt_update_stock_almacen = $pdo->prepare($sql_update_stock_almacen);
                    $stmt_update_stock_almacen->bindParam(1, $idAlm, PDO::PARAM_INT);
                    $stmt_update_stock_almacen->bindParam(2, $idProdt, PDO::PARAM_INT);
                    $stmt_update_stock_almacen->execute();
                    // Si no esta registrado el producto en el almacen principal (CREATE)
                } else {
                    $sql_create_stock_almacen =
                        "INSERT INTO almacen_stock
                    (idProd, idAlm, canSto, canStoDis)
                    VALUES(?, ?, $canProdIng, $canProdIng)";
    
                    $stmt_create_stock_almacen = $pdo->prepare($sql_create_stock_almacen);
                    $stmt_create_stock_almacen->bindParam(1, $idProdt, PDO::PARAM_INT);
                    $stmt_create_stock_almacen->bindParam(2, $idAlm, PDO::PARAM_INT);
                    $stmt_create_stock_almacen->execute();
                }
    
                // actualizamos el detalle de ingreso
                $esComProdIng = 1;
                $sql_update_produccion_ingreso_producto =
                    "UPDATE requisicion_empaquetado_promocional_ingreso
                SET fecProdIngAlm = ?, esComProdIng = ?
                WHERE id = ?";
                $stmt_update_produccion_ingreso_producto = $pdo->prepare($sql_update_produccion_ingreso_producto);
                $stmt_update_produccion_ingreso_producto->bindParam(1, $fecProdIngAlm, PDO::PARAM_STR);
                $stmt_update_produccion_ingreso_producto->bindParam(2, $esComProdIng, PDO::PARAM_BOOL);
                $stmt_update_produccion_ingreso_producto->bindParam(3, $idReqIngEmpProm, PDO::PARAM_INT);
                $stmt_update_produccion_ingreso_producto->execute();
            } else {
                $message_error = "No se encontró el lote";
                $description_error = "No se ha definido un lote para este producto empaquetado proocional";
            }

            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "Error con la conexion a la base de datos";
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
