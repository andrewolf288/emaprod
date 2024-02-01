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

    $requisicionDevolucion = $data["requisicionDevolucion"]; // obtenemos la requisicion de devolucion
    $detalleProductosDevueltos = $data["detalleProductosDevueltos"]; // obtenemos el detalle
    $correlativo = $data["correlativo"]; // correlativo

    if ($pdo) {
        $idProdc = $requisicionDevolucion["idProdc"]; // id de produccion
        $idProdt = $requisicionDevolucion["idProdt"]; // id producto
        $idProdFin = $requisicionDevolucion["idProdFin"]; // id producto
        $cantidadDeProducto = $requisicionDevolucion["cantidadDeProducto"]; // cantidad de producto

        $idLastInsert = 0; // id de la ultima insercion
        $idReqEst = 1; // estado de creado

        try {
            $pdo->beginTransaction();
            $sql_insert_requisicion_devolucion =
                "INSERT INTO requisicion_devolucion
                (idProdc, correlativo idProdFin, idProdt, idReqEst, canTotUndReqDev)
                VALUES(?, ?, ?, ?, ?, $cantidadDeProducto)";
            $stmt_insert_requisicion_devolucion = $pdo->prepare($sql_insert_requisicion_devolucion);
            $stmt_insert_requisicion_devolucion->bindParam(1, $idProdc, PDO::PARAM_INT);
            $stmt_insert_requisicion_devolucion->bindParam(2, $correlativo, PDO::PARAM_STR);
            $stmt_insert_requisicion_devolucion->bindParam(3, $idProdFin, PDO::PARAM_INT);
            $stmt_insert_requisicion_devolucion->bindParam(4, $idProdt, PDO::PARAM_INT);
            $stmt_insert_requisicion_devolucion->bindParam(5, $idReqEst, PDO::PARAM_INT);
            $stmt_insert_requisicion_devolucion->execute();

            $idLastInsert = $pdo->lastInsertId();

            $esComReqDevDet = 0;
            foreach ($detalleProductosDevueltos as $detalle) {
                $idProdDetalle = $detalle["idProd"]; // producto detalle
                $canProDev = $detalle["canProdDev"]; // cantidad devuelta 
                $idProdDevMot = $detalle["idProdDevMot"]; // motivo de devolucion

                $sql_insert_requisicion_devolucion_detalle =
                    "INSERT INTO requisicion_devolucion_detalle
                    (idReqDev, idProdt, idMotDev, canReqDevDet, esComReqDevDet)
                    VALUES(?, ?, ?, $canProDev, ?)";
                $stmt_insert_requisicion_devolucion_detalle = $pdo->prepare($sql_insert_requisicion_devolucion_detalle);
                $stmt_insert_requisicion_devolucion_detalle->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                $stmt_insert_requisicion_devolucion_detalle->bindParam(2, $idProdDetalle, PDO::PARAM_INT);
                $stmt_insert_requisicion_devolucion_detalle->bindParam(3, $idProdDevMot, PDO::PARAM_INT);
                $stmt_insert_requisicion_devolucion_detalle->bindParam(4, $esComReqDevDet, PDO::PARAM_BOOL);
                $stmt_insert_requisicion_devolucion_detalle->execute();
            }

            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "error interno SERVER";
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
