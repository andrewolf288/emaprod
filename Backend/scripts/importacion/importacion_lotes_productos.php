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
                "id" => $idLote = $fila[9],
                "idProdt" => $idProdt,
                "idProdEst" => $idProdEst,
                "idProdTip" => $idProdTip,
                "idProdFinProgEst" => $idProdFinProgEst,
                "idProdIniProgEst" => $idProdIniProgEst,
                "esEnv" => $esEnv,
                "codProd" => $codProd,
                "codLotProd" => $codLotProd,
                "codLotProdAux" => $codLotProdAux,
                "klgLotProd" => $klgLotProd,
                "canLotProd" => $canLotProd,
                "obsProd" => $obsProd,
                "fecProdIni" => parserFecha($fecProdIni), //formatear
                "fecVenLotProd" => parserFecha($fecVenLotProd), // formatear
                "numop" => $numop,
                "totalUnidadesLoteProduccion" => $totalUnidadesLoteProduccion,
                "klgTotalLoteProduccion" => $klgTotalLoteProduccion,
                "canIng" => $canIng,
                "regProFin" => $regProFin,
            );

            if ($idProdt != "No") {
                array_push($lotes, $lote);
            }
        }
        fclose($archivo); // Cierra el archivo
        // print_r($lotes);

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

                if ($idProd != "No") {
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
            }
            fclose($archivo); // Cierra el archivo
            print_r($entradas_lotes);
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
