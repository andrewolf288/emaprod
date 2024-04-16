<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require('../../common/utils.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOrdTrans = $data["idOrdTrans"];
    $idProdcIngProdt = $data["id"];
    $idProdc = $data["idProdc"];
    $codLotProd = $data["codLotProd"];
    $idProdt = $data["idProdt"]; // producto
    $canProdIng = $data["canProdIng"]; // cantidad ingresada
    $fecProdIngAlm = date('Y-m-d H:i:s'); // fecha ingreso almacen
    $idAlmacenPrincipal = 1;
    $idProv = 1;
    $fecProdIng = $data["fecProdIng"];
    $fecProdVen = $data["fecVenLotProd"];
    $codProd2 = $data["codProd2"];

    //regProFin
    if ($pdo) {
        try {
            $pdo->beginTransaction();
            // 1. Debemos definir los datos de entrada
            $anio_actual = date('Y'); // obtenemos año actual
            $idEntStoEst = 1; // disponible
            $idEntStoTip = 6; // ENTRADA DE TRANSFORMACION
            $docEntSto = "ENTRADA DE TRANSFORMACION";
            $refNumIngEntSto = 0; // numero de referencia de ingreso
            $codEntSto = ""; // codigo de entrada de stock

            $sql_numero_entrada =
                "SELECT 
            max(CAST(refNumIngEntSto AS UNSIGNED)) as refNumIngEntSto
            FROM entrada_stock
            WHERE idProd = ? AND YEAR(fecEntSto) = ? AND idAlm = ?
            ORDER BY refNumIngEntSto DESC LIMIT 1";

            // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
            $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
            $stmt_numero_entrada->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_numero_entrada->bindParam(2, $anio_actual, PDO::PARAM_STR);
            $stmt_numero_entrada->bindParam(3, $idAlmacenPrincipal, PDO::PARAM_INT);
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
            $letAniEntSto = letraAnio($fecProdIng);
            $diaJulEntSto = DiaJuliano($fecProdIng);

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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, $canProdIng, $canProdIng, ?, ?, ?, ?, ?, ?)";
            $stmt_create_entrada_stock_ingreso_irradiacion = $pdo->prepare($sql_create_entrada_stock_ingreso_irradiacion);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(2, $idProv, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(4, $idAlmacenPrincipal, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(5, $idEntStoTip, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(6, $codEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(7, $letAniEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(8, $diaJulEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(9, $refNumIngEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(10, $docEntSto, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(11, $fecProdVen, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(12, $fecProdIng, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(13, $idProdc, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(14, $codLotProd, PDO::PARAM_STR);
            $stmt_create_entrada_stock_ingreso_irradiacion->bindParam(15, $idProdc, PDO::PARAM_INT);
            $stmt_create_entrada_stock_ingreso_irradiacion->execute();

            // debemos asegurarnos de actualizar correctamente el stock
            $sql_consult_almacen_stock =
                "SELECT * FROM almacen_stock 
            WHERE idProd = ? AND idAlm = ?";
            $stmt_consult_almacen_stock =  $pdo->prepare($sql_consult_almacen_stock);
            $stmt_consult_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
            $stmt_consult_almacen_stock->execute();

            $fecDateNow = date('Y-m-d H:i:s');
            if ($stmt_consult_almacen_stock->rowCount() === 1) {
                // UPDATE ALMACEN STOCK
                $sql_update_almacen_stock =
                    "UPDATE almacen_stock 
                    SET canSto = canSto + $canProdIng, canStoDis = canStoDis + $canProdIng, fecActAlmSto = ?
                    WHERE idProd = ? AND idAlm = ?";
                $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                $stmt_update_almacen_stock->bindParam(1, $fecDateNow, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(3, $idAlmacenPrincipal, PDO::PARAM_INT);
                $stmt_update_almacen_stock->execute(); // ejecutamos
            } else {
                // CREATE NUEVO REGISTRO ALMACEN STOCK
                $sql_create_almacen_stock =
                    "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                    VALUE (?, ?, $canProdIng, $canProdIng)";
                $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                $stmt_create_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_create_almacen_stock->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
                $stmt_create_almacen_stock->execute(); // ejecutamos
            }

            // actualizamos el detalle de ingreso
            $esComProdIng = 1;
            $sql_update_produccion_ingreso_producto =
                "UPDATE orden_transformacion_ingreso_producto
            SET fecProdIngAlm = ?, esComProdIng = ?
            WHERE id = ?";
            $stmt_update_produccion_ingreso_producto = $pdo->prepare($sql_update_produccion_ingreso_producto);
            $stmt_update_produccion_ingreso_producto->bindParam(1, $fecProdIngAlm, PDO::PARAM_STR);
            $stmt_update_produccion_ingreso_producto->bindParam(2, $esComProdIng, PDO::PARAM_BOOL);
            $stmt_update_produccion_ingreso_producto->bindParam(3, $idProdcIngProdt, PDO::PARAM_INT);
            $stmt_update_produccion_ingreso_producto->execute();

            // hacemos commit a los cambios
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "Error en la consulta de almacen principal";
            $description_error = $e->getMessage();
        }
    }
    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
