<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $idEntSto = $data["id"];

        $sql =
            "SELECT
            es.id,
            es.idProd,
            p.nomProd,
            p.idCla,
            p.codProd2,
            p.codProd3,
            es.idProv,
            pv.nomProv,
            pv.apeProv,
            pv.codProv,
            es.idEntStoEst,
            ese.desEntStoEst,
            es.codEntSto,
            es.esSel,
            es.canTotEnt,
            es.canTotDis,
            es.canTotCom,
            es.canSel,
            es.canPorSel,
            DATE(es.fecEntSto) AS fecEntSto,
            DATE(es.fecVenEntSto) AS fecVenEntSto,
            es.fecFinSto,
            es.referencia,
            es.docEntSto,
            es.fecCreEntSto, 
            es.merTot,
            es.merDis,
            es.canVar, 
            es.codLot,
            es.obsEnt,
            es.ordCom,
            es.guiRem
            FROM entrada_stock es
            JOIN producto p ON p.id = es.idProd
            JOIN proveedor pv ON pv.id = es.idProv
            JOIN entrada_stock_estado ese ON ese.id = es.idEntStoEst
            WHERE es.id = ?";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idEntSto, PDO::PARAM_INT);
            $stmt->execute(); // ejecutamos
            $result_entrada_stock = $stmt->fetch(PDO::FETCH_ASSOC);

            // AHORA DEBEMOS CONSULTAR SU INFORMACION DE CALIDAD
            $select_entrada_stock_calidad =
                "SELECT 
                ec.id,
                ec.idEnt,
                ec.idEntCalEst,
                ec.idResEntCal,
                ec.obsAccEntCal,
                ec.conHigTrans,
                ec.fecCreEntCal,
                ec.fecActEntCal
            FROM entrada_calidad AS ec
            WHERE ec.idEnt = ?";
            $stmt_entrada_stock_calidad = $pdo->prepare($select_entrada_stock_calidad);
            $stmt_entrada_stock_calidad->bindParam(1, $idEntSto, PDO::PARAM_INT);
            $stmt_entrada_stock_calidad->execute();
            $result_entrada_stock["informacion_calidad"] = $stmt_entrada_stock_calidad->fetch(PDO::FETCH_ASSOC);

            // AHORA TRAEMOS LOS ATRIBUTOS ASOCIADOS AL PRODUCTO
            $sql_select_atributos_calidad_entrada =
                "SELECT
            pac.id,
            pac.idProdt,
            pac.nomProdAtr,
            pac.idTipProdAtr,
            tpa.nomTipAtrCal,
            pac.opcProdAtr,
            pac.codGruAtr,
            pac.labGruAtr
            FROM producto_atributo_calidad AS pac
            JOIN tipo_producto_atributo AS tpa ON tpa.id = pac.idTipProdAtr
            WHERE pac.idProdt = ?";
            $stmt_select_atributos_calidad_entrada = $pdo->prepare($sql_select_atributos_calidad_entrada);
            $stmt_select_atributos_calidad_entrada->bindParam(1, $result_entrada_stock["idProd"], PDO::PARAM_INT);
            $stmt_select_atributos_calidad_entrada->execute();
            $result_entrada_stock["informacion_atributos"] = $stmt_select_atributos_calidad_entrada->fetchAll(PDO::FETCH_ASSOC);

            // AHORA LOS REGISTROS REALIZADOS DE LOS ATRIBUTOS E CALIDADA
            $sql_select_atributos_calidad_entrada_registrados =
                "SELECT * FROM entrada_calidad_atributos
            WHERE idEntCal = ?";
            $stmt_select_atributos_calidad_entrada_registrados = $pdo->prepare($sql_select_atributos_calidad_entrada_registrados);
            $stmt_select_atributos_calidad_entrada_registrados->bindParam(1, $result_entrada_stock["informacion_calidad"]["id"], PDO::PARAM_INT);
            $stmt_select_atributos_calidad_entrada_registrados->execute();
            $result_entrada_stock["informacion_valores_atributos"] = $stmt_select_atributos_calidad_entrada_registrados->fetchAll(PDO::FETCH_ASSOC);

            $result = $result_entrada_stock;
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
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
