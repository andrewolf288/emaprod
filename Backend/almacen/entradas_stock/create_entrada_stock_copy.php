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
    $canExe = $data["canExe"]; // cantidad exedida
    $docEntSto = $data["docEntSto"]; // documento de entrada
    $fecVenEntSto = $data["fecVenEntSto"]; // fecha de vencimiento
    $fecEntSto = $data["fecEntSto"];

    // SOLO SI ES SELECCION
    $idEntStoEst = 0; // estado de las entrada
    $canTotDis = 0; // cantidad total disponible
    $canSel = 0;
    $canPorSel = 0;
    $merTot = 0;


    if ($pdo) {

        // VERIFICAMOS QUE LA ENTRADA SEA DE SELECCION O NO
        if ($esSel) {
            // LA CANTIDAD POR SELECCIONAR ES IGUAL A LA CANTIDAD ENTRANTE
            $canPorSel = $canTotEnt;
            $idEntStoEst = 3; // ESTADO DE POR PROCESAR
        } else {
            // LA CANTIDAD DISPONIBLE ES IGUAL A LA CANTIDAD ENTRANTE
            $canTotDis = $canTotEnt;
            $idEntStoEst = 1; // ESTADO DE DISPONIBLE
        }

        // OBTENEMOS EL NUMERO DE INGRESO DE DICHA MATERIA PRIMA
        $sql_numero_entrada =
            "SELECT 
        max(refNumIngEntSto) as refNumIngEntSto
        FROM entrada_stock
        WHERE idProd = ?
        ORDER BY refNumIngEntSto DESC";

        try {

            $pdo->beginTransaction(); // EMPEZAMOS UNA TRANSACCION

            // ***** OBTENEMOS EN NUMERO DE REFERENCIA DE INGRESO ******
            $stmt_numero_entrada = $pdo->prepare($sql_numero_entrada);
            $stmt_numero_entrada->bindParam(1, $idProd, PDO::PARAM_INT);
            $stmt_numero_entrada->execute();

            // Recorremos los resultados
            $result_numero_entrada = [];
            $refNumIngEntSto = 0;
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

            // ***** FORMAMOS EL CODIGO DE ENTRADA ******
            $codEntSto = "$codProd" . "$codProv" . "$letAniEntSto" . "$diaJulEntSto" . "$refNumIngEntSto";

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
            canTotEnt,
            canTotDis,
            docEntSto,
            fecVenEntSto,
            fecEntSto)
            VALUES (?,?,?,?,?,?,?,?,?,$canSel, $canPorSel, $merTot, $canTotEnt, $canTotDis,?,?,?)
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
                $stmt->bindParam(11, $fecVenEntSto, PDO::PARAM_STR); // fecha de vencimiento
                $stmt->bindParam(12, $fecEntSto, PDO::PARAM_STR); // fecha de entrada

                $stmt->execute(); // ejecutamos

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

                    // $sql_update_producto =
                    //     "UPDATE producto
                    //     SET stoActPro = stoActPro + $canTotEnt
                    //     WHERE id = ?";
                    // try {
                    //     $stmt_update_producto = $pdo->prepare($sql_update_producto);
                    //     $stmt_update_producto->bindParam(1, $idProd, PDO::PARAM_INT);
                    //     $stmt_update_producto->execute();
                    // } catch (PDOException $e) {
                    //     $message_error = "ERROR INTERNO SERVER AL MODIFICAR ALMACEN";
                    //     $description_error = $e->getMessage();
                    // }

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
