<?php
require '../../common/utils.php';

function entradaDetalleEncuadre(int $idProdt, string $codProd2, int $idAlm, $canProdIng, int $idOpeEncDet, PDO $pdo, int $idProdc = 0, string $codLotProd = "")
{
    $idProv = 1;
    $codProv = "00";
    $fecEntSto = date('Y-m-d H:i:s'); // fecha ingreso 
    $fecVenEntSto = null;
    $idEntStoEst = 1; // disponible
    $docEntSto = "INGRESO ENCUADRE";
    $letAniEntSto = letraAnio($fecEntSto);
    $diaJulEntSto = DiaJuliano($fecEntSto);
    $refNumIngEntSto = str_pad("0", 3, "0", STR_PAD_LEFT);
    $codEntSto = $codProd2 . $codProv . $letAniEntSto . $diaJulEntSto . $refNumIngEntSto;
    $idEntStoTip = 9; // entrada encuadre

    // realizamos la entrada
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
    canTotEnt,
    canTotDis,
    docEntSto,
    fecEntSto,
    fecVenEntSto,
    idEntStoTip)
    VALUES (?,?,?,?,?,?,?,?,$canProdIng,$canProdIng,?,?,?,?)";

    if ($idProdc != 0) {
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
        canTotEnt,
        canTotDis,
        docEntSto,
        fecEntSto,
        fecVenEntSto,
        idEntStoTip,
        referencia,
        refProdc,
        codLot)
        VALUES (?,?,?,?,?,?,?,?,$canProdIng,$canProdIng,?,?,?,?,?,?,?)";
    }

    $stmt_insert_entrada_stock = $pdo->prepare($sql_insert_entrada_stock);
    $stmt_insert_entrada_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
    $stmt_insert_entrada_stock->bindParam(2, $idProv, PDO::PARAM_INT);
    $stmt_insert_entrada_stock->bindParam(3, $idAlm, PDO::PARAM_INT);
    $stmt_insert_entrada_stock->bindParam(4, $idEntStoEst, PDO::PARAM_INT);
    $stmt_insert_entrada_stock->bindParam(5, $codEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(6, $letAniEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(7, $diaJulEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(8, $refNumIngEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(9, $docEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(10, $fecEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(11, $fecVenEntSto, PDO::PARAM_STR);
    $stmt_insert_entrada_stock->bindParam(12, $idEntStoTip, PDO::PARAM_INT); // entrada de tipo producto final
    
    if($idProdc != 0){
        $stmt_insert_entrada_stock->bindParam(13, $idProdc, PDO::PARAM_INT);
        $stmt_insert_entrada_stock->bindParam(14, $idProdc, PDO::PARAM_INT);
        $stmt_insert_entrada_stock->bindParam(15, $codLotProd, PDO::PARAM_STR);
    }

    $stmt_insert_entrada_stock->execute();
    $idLastInsertion = $pdo->lastInsertId();

    // creamos la insercion de la trazabilidad
    $sql_insert_entrada_operacion_encuadre_detalle =
        "INSERT INTO trazabilidad_entrada_operacion_encuadre_detalle
    (idOpeEncDet, idEntSto, canEntOpeEncDet)
    values(?, ?, $canProdIng)";
    $stmt_insert_entrada_operacion_encuadre_detalle = $pdo->prepare($sql_insert_entrada_operacion_encuadre_detalle);
    $stmt_insert_entrada_operacion_encuadre_detalle->bindParam(1, $idOpeEncDet, PDO::PARAM_INT);
    $stmt_insert_entrada_operacion_encuadre_detalle->bindParam(2, $idLastInsertion, PDO::PARAM_INT);
    $stmt_insert_entrada_operacion_encuadre_detalle->execute();

    // actualizamos el almacen
    $sql_update_almacen_stock =
        "UPDATE almacen_stock 
    SET canSto = canSto + $canProdIng, canStoDis = canStoDis + $canProdIng
    WHERE idProd = ? AND idAlm = ?";
    $stmt_update_almacen_stock = $pdo->prepare($sql_update_almacen_stock);
    $stmt_update_almacen_stock->bindParam(1, $idProdt, PDO::PARAM_INT);
    $stmt_update_almacen_stock->bindParam(2, $idAlm, PDO::PARAM_INT);
    $stmt_update_almacen_stock->execute();
}
