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

        $sql_view_entrada_stock =
            "SELECT 
        es.id,
        es.idProd,
        p.nomProd,
        p.codProd,
        p.codProd2,
        p.codProd3,
        cl.desCla,
        es.idProv,
        pv.nomProv,
        pv.apeProv,
        pv.codProv,
        es.idAlm,
        al.nomAlm,
        al.codAlm,
        es.idEntStoEst,
        ese.desEntStoEst,
        es.codEntSto,
        es.fecEntSto,
        es.fecVenEntSto,
        es.esSel,
        es.canSel,
        es.canPorSel,
        es.merDis,
        es.merTot,
        es.canTotCom,
        es.canTotEnt,
        es.canTotDis,
        es.canVar,
        es.fecFinSto
        FROM entrada_stock es
        JOIN producto AS p ON p.id = es.idProd
        JOIN clase AS cl ON cl.id = p.idCla
        JOIN proveedor AS pv ON pv.id = es.idProv
        JOIN almacen AS al ON al.id = es.idAlm
        JOIN entrada_stock_estado AS ese ON ese.id = es.idEntStoEst
        WHERE es.id = ?";

        try {
            $stmt_view_entrada_stock = $pdo->prepare($sql_view_entrada_stock);
            $stmt_view_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
            $stmt_view_entrada_stock->execute(); // ejecutamos
            // Recorremos los resultados
            while ($row = $stmt_view_entrada_stock->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
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
