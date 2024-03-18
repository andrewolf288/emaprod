<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $ordenReproceso = $data["ordenReproceso"];
    $requisicionDevolucion = $data["requisicionDevolucion"];

    if ($pdo) {
        try {
            $idProdc = $ordenReproceso["idProdc"];
            $idProdt = $ordenReproceso["idProdt"];
            $canDevUnd = $requisicionDevolucion["canDevUnd"];
            $idOpeDevCalDet = $ordenReproceso["id"];
            $idReqEst = 1; // requisicion requerida

            // 1. Creacion de la devolucion
            /*
                a. Creamos la requisicion de devolucion
                b. Creamos el detalle de devolucion
                c. Registramos la trazabilidad de devolucion
            */
            $correlativo = "REPROCESO";
            $idLastCreationRequisicionDevolucion = 0;
            $detDev = $requisicionDevolucion["detDev"];

            // primero debemos comprobar que la requisicion no este vacia
            if (!empty($detDev)) {
                // primero consultamos la referencia del producto a devolver sus materiales
                $sql_consult_produccion_producto_final_origen =
                    "SELECT id FROM produccion_producto_final
                WHERE idProdc = ? AND idProdt = ?";
                $stmt_consult_produccion_producto_final_origen = $pdo->prepare($sql_consult_produccion_producto_final_origen);
                $stmt_consult_produccion_producto_final_origen->bindParam(1, $idProdc, PDO::PARAM_INT);
                $stmt_consult_produccion_producto_final_origen->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_consult_produccion_producto_final_origen->execute();

                $row_produccion_producto_final_origen = $stmt_consult_produccion_producto_final_origen->fetch(PDO::FETCH_ASSOC);

                // a. creamos la requisicion
                $sql_create_requisicion_devolucion =
                    "INSERT INTO requisicion_devolucion
                (idProdc, correlativo, idProdFin, idProdt, idReqEst, canTotUndReqDev)
                VALUES(?, ?, ?, ?, ?, $canDevUnd)";
                $stmt_create_requisicion_devolucion = $pdo->prepare($sql_create_requisicion_devolucion);
                $stmt_create_requisicion_devolucion->bindParam(1, $idProdc, PDO::PARAM_INT);
                $stmt_create_requisicion_devolucion->bindParam(2, $correlativo, PDO::PARAM_STR);
                $stmt_create_requisicion_devolucion->bindParam(3, $row_produccion_producto_final_origen["id"]);
                $stmt_create_requisicion_devolucion->bindParam(4, $idProdt, PDO::PARAM_INT);
                $stmt_create_requisicion_devolucion->bindParam(5, $idReqEst, PDO::PARAM_INT);
                $stmt_create_requisicion_devolucion->execute();
                $idLastCreationRequisicionDevolucion = $pdo->lastInsertId();

                // b. creamos el detalle de requisicion devolucion
                foreach ($detDev as $detalleDevolucion) {
                    $idProdDev = $detalleDevolucion["idProd"];
                    $idProdDevMot = $detalleDevolucion["idProdDevMot"];
                    $canProdDev = $detalleDevolucion["canProdDev"];

                    $sql_create_requisicion_devolucion_detalle =
                        "INSERT INTO requisicion_devolucion_detalle
                    (idReqDev, idProdt, idMotDev, canReqDevDet)
                    VALUES (?, ?, ?, $canProdDev)";
                    $stmt_create_requisicion_devolucion_detalle = $pdo->prepare($sql_create_requisicion_devolucion_detalle);
                    $stmt_create_requisicion_devolucion_detalle->bindParam(1, $idLastCreationRequisicionDevolucion, PDO::PARAM_INT);
                    $stmt_create_requisicion_devolucion_detalle->bindParam(2, $idProdDev, PDO::PARAM_INT);
                    $stmt_create_requisicion_devolucion_detalle->bindParam(3, $idProdDevMot, PDO::PARAM_INT);
                    $stmt_create_requisicion_devolucion_detalle->execute();
                }

                // c. Realizamos la trazabilidad de devolucion
                $sql_create_trazabilidad_reproceso_devolucion =
                    "INSERT INTO trazabilidad_reproceso_devolucion 
                    (idOpeDevCalDet, idReqDev)
                VALUES (?, ?)";
                $stmt_create_trazabilidad_reproceso_devolucion = $pdo->prepare($sql_create_trazabilidad_reproceso_devolucion);
                $stmt_create_trazabilidad_reproceso_devolucion->bindParam(1, $idOpeDevCalDet, PDO::PARAM_INT);
                $stmt_create_trazabilidad_reproceso_devolucion->bindParam(2, $idLastCreationRequisicionDevolucion, PDO::PARAM_INT);
                $stmt_create_trazabilidad_reproceso_devolucion->execute();
            }
        } catch (PDOException $e) {
            $message_error = "Hubo un error al realizar las operaciones";
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
