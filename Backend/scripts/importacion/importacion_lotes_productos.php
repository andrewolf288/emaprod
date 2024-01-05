<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    //primero leemos el archivo de lotes
    $nombreArchivo = 'importaciones-2024-lotes.csv';
    $lotes = array();
    $entradas_lotes = array();

    // Abre el archivo en modo lectura
    if (($archivo = fopen($nombreArchivo, 'r')) !== FALSE) {
        // Lee cada línea del archivo hasta el final
        while (($fila = fgetcsv($archivo, 1000, ',')) !== FALSE) {
            // Procesa cada fila (cada fila es un arreglo con los valores)
            $idLote = $fila[9];
            $idProdt = $fila[2];
            $idProdEst = 1;
            $idProdTip = 6;
            $idProdFinProgEst = 3;
            $idProdIniProgEst = 3;
            $esEnv = 0;
            $codProd = "";
            $codLotProd = $fila[0];
            $codLotProdAux = $fila[1];
            $klgLotProd = 0;
            $canLotProd = 0;
            $obsProd = "LOTE ANTERIOR";
            $fecProdIni = $fila[6];
            $fecVenLotProd = $fila[7];
            $añoCreacion = $fila[5];
            $numop = "OP" . $añoCreacion . $idLote;
            $totalUnidadesLoteProduccion = 0;
            $klgTotalLoteProduccion = 0;
            $canIng = 0;
            $regProFin = 1;

            $lote = array(
                "id" => $idLote,
                "idProdt" => $idProdt,
                "idProdEst" => $idProdEst,
                "idProdTip" => $idProdTip,
                "idProdFinProgEst" => $idProdFinProgEst,
                "idProdIniProgEst" => $idProdIniProgEst,
                "esEnv" => $esEnv,
                "codProd" => "PLEE" . str_pad($idLote, 8, "0", STR_PAD_LEFT),
                "codLotProd" => $codLotProd,
                "klgLotProd" => $klgLotProd,
                "canLotProd" => $canLotProd,
                "codLotProdAux" => $codLotProdAux,
                "obsProd" => $obsProd,
                "fecProdIni" => parserFecha($fecProdIni), //formatear
                "fecVenLotProd" => parserFecha($fecVenLotProd), // formatear
                "numop" => $numop,
                "totalUnidadesLoteProduccion" => $totalUnidadesLoteProduccion,
                "klgTotalLoteProduccion" => $klgTotalLoteProduccion,
                "canIng" => $canIng,
                "regProFin" => $regProFin,
            );

            array_push($lotes, $lote);

            // if ($idProdt != "No") {
            //     array_push($lotes, $lote);
            // }
        }
        fclose($archivo); // Cierra el archivo
        // // print_r($lotes);
        // $sql_import_lotes =
        //     "INSERT INTO 
        //     produccion(idProdt, idProdEst, idProdTip, idProdFinProgEst, idProdIniProgEst, esEnv, codProd, codLotProd, klgLotProd, canLotProd, obsProd, fecProdIni, fecVenLotProd, numop, totalUnidadesLoteProduccion, klgTotalLoteProduccion, canIng, regProFin) 
        //     VALUES";
        // foreach ($lotes as $lote) {
        //     $idProdt = $lote["idProdt"];
        //     $idProdEst = $lote["idProdEst"];
        //     $idProdTip = $lote["idProdTip"];
        //     $idProdFinProgEst = $lote["idProdFinProgEst"];
        //     $idProdIniProgEst = $lote["idProdIniProgEst"];
        //     $esEnv = $lote["esEnv"];
        //     $codProd = $lote["codProd"];
        //     $codLotProd = $lote["codLotProd"];
        //     $klgLotProd = $lote["klgLotProd"];
        //     $canLotProd = $lote["canLotProd"];
        //     $obsProd = $lote["obsProd"];
        //     $fecProdIni = $lote["fecProdIni"];
        //     $fecVenLotProd = $lote["fecVenLotProd"];
        //     $numop = $lote["numop"];
        //     $totalUnidadesLoteProduccion = $lote["totalUnidadesLoteProduccion"];
        //     $klgTotalLoteProduccion = $lote["klgTotalLoteProduccion"];
        //     $canIng = $lote["canIng"];
        //     $regProFin = $lote["regProFin"];

        //     $sql_import_lotes = $sql_import_lotes . "($idProdt, $idProdEst, $idProdTip, $idProdFinProgEst, $idProdIniProgEst, $esEnv, '$codProd', '$codLotProd', $klgLotProd, $canLotProd, '$obsProd', '$fecProdIni', '$fecVenLotProd', '$numop', $totalUnidadesLoteProduccion, $klgTotalLoteProduccion, $canIng, $regProFin),\n";
        // }

        // echo $sql_import_lotes;

        $nombreArchivo = 'importaciones-2024-lotes-productos.csv';
        // Abre el archivo en modo lectura
        if (($archivo = fopen($nombreArchivo, 'r')) !== FALSE) {
            while (($fila = fgetcsv($archivo, 1000, ',')) !== FALSE) {
                $idProd = $fila[0];
                $idProv = 1;
                $idEntStoEst = 1;
                $idAlm = 1;
                $idEntStoTip = 3;
                $canTotEnt = $fila[4];
                $canTotDis = $fila[4];
                $docEntSto = "SALDO INICIAL";
                $codLotProd = $fila[3];

                // Función de filtro usando array_filter
                $elementoFiltrado = array();

                foreach ($lotes as $lote) {
                    if ($lote["codLotProdAux"] === $codLotProd) {
                        $elementoFiltrado = $lote;
                        break;
                    }
                }

                $referencia = $elementoFiltrado["id"];
                $refProdc = $elementoFiltrado["id"];
                $codLotProd = $elementoFiltrado["codLotProd"];
                $fecEntSto = $elementoFiltrado["fecProdIni"];
                $fecVenEntSto = $elementoFiltrado["fecVenLotProd"];

                $entrada_lote = array(
                    "idProd" => $idProd,
                    "idProv" => $idProv,
                    "idEntStoEst" => $idEntStoEst,
                    "idAlm" => $idAlm,
                    "idEntStoTip" => $idEntStoTip,
                    "canTotEnt" => $canTotEnt,
                    "canTotDis" => $canTotDis,
                    "docEntSto" => $docEntSto,
                    "referencia" => $referencia,
                    "refProdc" => $refProdc,
                    "codLot" => $codLotProd,
                    "fecEntSto" => $fecEntSto,
                    "fecVenEntSto" => $fecVenEntSto,
                );
                array_push($entradas_lotes, $entrada_lote);
            }
            fclose($archivo); // Cierra el archivo
            print_r($entradas_lotes);
            try {
                $pdo->beginTransaction();
                foreach ($entradas_lotes as $entrada) {
                    $idProd = $entrada["idProd"];
                    $idProv = $entrada["idProv"];
                    $idEntStoEst = $entrada["idEntStoEst"];
                    $idAlm = $entrada["idAlm"];
                    $idEntStoTip = $entrada["idEntStoTip"];
                    $canTotEnt = $entrada["canTotEnt"];
                    $canTotDis = $entrada["canTotDis"];
                    $docEntSto = $entrada["docEntSto"];
                    $referencia = $entrada["referencia"];
                    $refProdc = $entrada["refProdc"];
                    $codLot = $entrada["codLot"];
                    $fecEntSto = $entrada["fecEntSto"];
                    $fecVenEntSto = $entrada["fecVenEntSto"];

                    $sql_insert_entrada =
                        "INSERT INTO entrada_stock (idProd, idProv, idEntStoEst, idAlm, idEntStoTip, canTotEnt, canTotDis, docEntSto, referencia, refProdc, codLot, fecEntSto, fecVenEntSto)
                    VALUES (?,?,?,?,?,$canTotEnt,$canTotDis,?,?,?,?,'$fecEntSto','$fecVenEntSto');";
                    $stmt_insert_entrada = $pdo->prepare($sql_insert_entrada);
                    $stmt_insert_entrada->bindParam(1, $idProd, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(2, $idProv, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(3, $idEntStoEst, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(4, $idAlm, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(5, $idEntStoTip, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(6, $docEntSto, PDO::PARAM_STR);
                    $stmt_insert_entrada->bindParam(7, $referencia, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(8, $refProdc, PDO::PARAM_INT);
                    $stmt_insert_entrada->bindParam(9, $codLot, PDO::PARAM_STR);
                    $stmt_insert_entrada->execute();

                    $sql_consult_almacen_stock =
                        "SELECT * FROM almacen_stock 
                    WHERE idProd = ? AND idAlm = ?";

                    // consultamos si existe un registro de almacen stock con el prod y alm
                    $stmt_consult_almacen_stock =  $pdo->prepare($sql_consult_almacen_stock);
                    $stmt_consult_almacen_stock->bindParam(1, $idProd, PDO::PARAM_INT);
                    $stmt_consult_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
                    $stmt_consult_almacen_stock->execute();

                    if ($stmt_consult_almacen_stock->rowCount() === 1) {
                        // UPDATE ALMACEN STOCK
                        $sql_update_almacen_stock =
                            "UPDATE almacen_stock 
                            SET canSto = canSto + $canTotEnt, canStoDis = canStoDis + $canTotEnt, fecActAlmSto = ?
                            WHERE idProd = ? AND idAlm = ?";
                        $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
                        $stmt_update_almacen_stock->bindParam(1, $fecEntSto, PDO::PARAM_STR);
                        $stmt_update_almacen_stock->bindParam(2, $idProd, PDO::PARAM_INT);
                        $stmt_update_almacen_stock->bindParam(3, $idAlm, PDO::PARAM_INT);

                        $stmt_update_almacen_stock->execute(); // ejecutamos
                    } else {
                        // CREATE NUEVO REGISTRO ALMACEN STOCK
                        $sql_create_almacen_stock =
                            "INSERT INTO almacen_stock (idProd, idAlm, canSto, canStoDis)
                                VALUE (?,?,$canTotEnt,$canTotEnt)";
                        $stmt_create_almacen_stock = $pdo->prepare($sql_create_almacen_stock);
                        $stmt_create_almacen_stock->bindParam(1, $idProd, PDO::PARAM_INT);
                        $stmt_create_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);

                        $stmt_create_almacen_stock->execute(); // ejecutamos
                    }
                };
                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER AL CONSULTAR ALMACEN STOCK";
                $description_error = $e->getMessage();
            }
        } else {
            echo "No se pudo abrir el archivo de entradas";
        }
    } else {
        echo "No se pudo abrir el archivo de lotes";
    }


    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}

function parserFecha($fecha)
{
    $arregloValores = explode("-", $fecha);
    $nuevaFecha = $arregloValores[2] . "-" . str_pad($arregloValores[1], 2, "0", STR_PAD_LEFT) . "-" . str_pad($arregloValores[0], 2, "0", STR_PAD_LEFT);
    return $nuevaFecha;
}
