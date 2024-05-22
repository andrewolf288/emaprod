<?php

include_once "../../common/cors.php";
function findLoteProduccion(string $codLotProd, string $fecVenLotProd, string $codProd2, PDO $pdo)
{
    $message_error = "";
    $result = array();

    // buscamos el lote de produccion
    $sql_search_lote_produccion =
        "SELECT id, idProdt, codLotProd 
    FROM produccion
    WHERE codLotProd = ? AND YEAR(fecVenLotProd) = '$fecVenLotProd' LIMIT 1";
    $stmt_search_lote_produccion = $pdo->prepare($sql_search_lote_produccion);
    $stmt_search_lote_produccion->bindParam(1, $codLotProd, PDO::PARAM_STR);
    $stmt_search_lote_produccion->execute();
    $row_produccion = $stmt_search_lote_produccion->fetch(PDO::FETCH_ASSOC);

    if ($row_produccion) {
        $idProdtProdc = $row_produccion["idProdt"];
        $idProdc = $row_produccion["id"];
        $codLotProd = $row_produccion["codLotProd"];
        // seleccionamos un producto
        $sql_select_producto =
            "SELECT id, proRef, nomProd
        FROM producto
        WHERE codProd2 = ? LIMIT 1";
        $stmt_select_producto = $pdo->prepare($sql_select_producto);
        $stmt_select_producto->bindParam(1, $codProd2, PDO::PARAM_STR);
        $stmt_select_producto->execute();
        $row_producto = $stmt_select_producto->fetch(PDO::FETCH_ASSOC);

        if ($row_producto) {
            $proRef = $row_producto["proRef"];
            $nomProd = $row_producto["nomProd"];
            $idProdt = $row_producto["id"];

            $esIrradiado = substr($nomProd, 0, 3) == "RD.";
            // tenemos que verificar si pertenece al mismo subproducto
            if ($idProdtProdc == $proRef) {
                $result["idProdc"] = $idProdc;
                $result["codLotProd"] = $codLotProd;
                $result["idProdt"] = $idProdt;
            } else {
                if ($esIrradiado) {
                    $sql_select_origen_irradiado =
                        "SELECT proRef 
                        FROM producto 
                        WHERE id = ? LIMIT 1";
                    $stmt_select_origen_irradiaco = $pdo->prepare($sql_select_origen_irradiado);
                    $stmt_select_origen_irradiaco->bindParam(1, $proRef, PDO::PARAM_INT);
                    $stmt_select_origen_irradiaco->execute();
                    $row_producto_origen = $stmt_select_origen_irradiaco->fetch(PDO::FETCH_ASSOC);

                    if ($row_producto_origen) {
                        $proRefIrra = $row_producto_origen["proRef"];
                        if ($idProdtProdc == $proRefIrra) {
                            $result["idProdc"] = $idProdc;
                            $result["codLotProd"] = $codLotProd;
                            $result["idProdt"] = $idProdt;
                        } else {
                            $message_error = "El producto a cuadrar no pertenece al subproducto";
                        }
                    } else {
                        $message_error = "No se encontro el producto irradiado";
                    }
                } else {
                    $message_error = "El producto a cuadrar no pertenece al subproducto";
                }
            }
        } else {
            $message_error = "No existe el producto proporcionado";
        }
    } else {
        $message_error = "No se encontro el lote de producción. Codigo de lote: $codLotProd. Año vencimiento: $fecVenLotProd";
    }

    return array(
        "message_error" => $message_error,
        "result" => $result
    );
}
