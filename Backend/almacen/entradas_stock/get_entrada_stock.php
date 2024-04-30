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

        $fechasMes = getStartEndDateNow();
        $fechaInicio = $fechasMes[0]; // inicio del mes
        $fechaFin = $fechasMes[1]; // fin del mes

        if (isset($data)) {
            if (!empty($data["fechaInicio"])) {
                $fechaInicio = $data["fechaInicio"];
            }
            if (!empty($data["fechaFin"])) {
                $fechaFin = $data["fechaFin"];
            }
        }

        $sql =
            "SELECT
        es.idProd,
        p.nomProd,
        es.idProv,
        CONCAT(pv.nomProv, ' ', pv.apeProv) AS nomProv,
        es.idEntStoEst,
        ese.desEntStoEst,
        es.idAlm,
        a.nomAlm,
        es.codEntSto,
        es.esSel,
        es.canTotEnt,
        es.canTotDis,
        es.fecEntSto,
        DATE(es.fecVenEntSto) AS fecVenEntSto,
        es.referencia,
        es.docEntSto,
        es.id as idEntStock,
        es.fecCreEntSto, 
        es.merTot,
        es.canVar, 
        es.codLot,
        es.obsEnt,
        es.ordCom,
        es.guiRem
        FROM entrada_stock AS es
        JOIN producto p ON p.id = es.idProd
        JOIN proveedor pv ON pv.id = es.idProv
        JOIN entrada_stock_estado ese ON ese.id = es.idEntStoEst
        JOIN almacen a ON a.id = es.idAlm  
        WHERE DATE(es.fecEntSto) BETWEEN ? AND ?
        ORDER BY es.fecEntSto DESC";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $fechaInicio, PDO::PARAM_STR);
            $stmt->bindParam(2, $fechaFin, PDO::PARAM_STR);
            $stmt->execute(); // ejecutamos
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $message_error = "ERROR EN LA CONSULTA";
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
