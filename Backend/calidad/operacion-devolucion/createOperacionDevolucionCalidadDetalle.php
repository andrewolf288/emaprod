<?php
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idOpeDevCal = $data["id"];
    $detOpeDevCal = $data["detOpeDevCal"];
    $idMotDevCal = $data["idMotDevCal"];
    $numLots = $data["numLots"];
    $fechaActual = date('Y-m-d H:i:s');;

    if ($pdo) {
        try {
            $pdo->beginTransaction();

            $fueCom = 1;
            $sql_update_operacion_devolucion_calidad =
                "UPDATE operacion_devolucion_calidad
            SET idMotDevCal = ?, numLots = ?, fueCom = ?, fecComOpeDevCal = ?
            WHERE id = ?";
            $stmt_update_oepracion_devolucion_calidad = $pdo->prepare($sql_update_operacion_devolucion_calidad);
            $stmt_update_oepracion_devolucion_calidad->bindParam(1, $idMotDevCal, PDO::PARAM_INT);
            $stmt_update_oepracion_devolucion_calidad->bindParam(2, $numLots, PDO::PARAM_INT);
            $stmt_update_oepracion_devolucion_calidad->bindParam(3, $fueCom, PDO::PARAM_BOOL);
            $stmt_update_oepracion_devolucion_calidad->bindParam(4, $fechaActual, PDO::PARAM_STR);
            $stmt_update_oepracion_devolucion_calidad->bindParam(5, $idOpeDevCal, PDO::PARAM_INT);
            $stmt_update_oepracion_devolucion_calidad->execute();

            foreach ($detOpeDevCal as $detalle) {
                $idProdc = $detalle["idProdc"];
                $codLotProd = $detalle["codLotProd"];
                $canLotProd = intval($detalle["canLotProd"]);
                $pH = $detalle["pH"];
                $consistencia30 = $detalle["consistencia30"];
                $consistencia60 = $detalle["consistencia60"];
                $color = $detalle["color"];
                $sabor = $detalle["sabor"];
                $olor = $detalle["olor"];
                $observacion = $detalle["observacion"];
                $esReproceso = $detalle["esReproceso"];
                $esDetCamProd = $detalle["esDetCamProd"];
                $detCamProd = $detalle["detCamProd"];
                $idLastInsert = 0;

                $sql_insert_operacion_devolucion_calidad_detalle =
                    "INSERT INTO operacion_devolucion_calidad_detalle
                (idOpeDevCal, 
                idProdc, 
                codLotProd, 
                canLotProd, 
                pH, 
                consistencia30, 
                consistencia60, 
                color, 
                sabor, 
                olor, 
                observacion, 
                esReproceso, 
                esDetCamProd)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt_insert_operacion_devolucion_calidad_detalle = $pdo->prepare($sql_insert_operacion_devolucion_calidad_detalle);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(2, $idProdc, PDO::PARAM_INT);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(3, $codLotProd, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(4, $canLotProd, PDO::PARAM_INT);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(5, $pH, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(6, $consistencia30, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(7, $consistencia60, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(8, $color, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(9, $sabor, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(10, $olor, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(11, $observacion, PDO::PARAM_STR);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(12, $esReproceso, PDO::PARAM_BOOL);
                $stmt_insert_operacion_devolucion_calidad_detalle->bindParam(13, $esDetCamProd, PDO::PARAM_BOOL);
                $stmt_insert_operacion_devolucion_calidad_detalle->execute();
                $idLastInsert = $pdo->lastInsertId();

                // si se especifico detalle de cambio de producto y el detalle no es vacio
                if ($esDetCamProd == 1 && count($detCamProd) !== 0) {

                    foreach ($detCamProd as $detalleCambio) {
                        $refProdc = $detalleCambio["refProdc"];
                        $codLotProd = $detalleCambio["codLotProd"];
                        $canSalLotProd = $detalleCambio["canSalLotProd"];

                        $sql_create_operacion_devolucion_calidad_detalle_cambio =
                            "INSERT INTO operacion_devolucion_calidad_detalle_cambio
                        (idOpeDevCalDet, canProdtCam, idProdc, codLotProd)
                        VALUES(?, $canSalLotProd, ?, ?)";
                        $stmt_create_operacion_devolucion_calidad_detalle_cambio = $pdo->prepare($sql_create_operacion_devolucion_calidad_detalle_cambio);
                        $stmt_create_operacion_devolucion_calidad_detalle_cambio->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                        $stmt_create_operacion_devolucion_calidad_detalle_cambio->bindParam(2, $refProdc, PDO::PARAM_INT);
                        $stmt_create_operacion_devolucion_calidad_detalle_cambio->bindParam(3, $codLotProd, PDO::PARAM_STR);
                        $stmt_create_operacion_devolucion_calidad_detalle_cambio->execute();
                    }
                }

                // si es desmedro, creamos una requisicion de devolucion de desmedro
                if ($esReproceso == 0) {
                    $idProdFin = null;
                    $correlativo = "DESMEDRO";
                    $idReqEst = 1; // requisicion requerida

                    // consultamos el producto correspondiente
                    $sql_select_producto_operacion_devolucion =
                        "SELECT 
                    odd.idProdt
                    FROM operacion_devolucion_calidad AS odc
                    JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
                    WHERE odc.id = ?";
                    $stmt_select_producto_operacion_devolucion = $pdo->prepare($sql_select_producto_operacion_devolucion);
                    $stmt_select_producto_operacion_devolucion->bindParam(1, $idOpeDevCal, PDO::PARAM_INT);
                    $stmt_select_producto_operacion_devolucion->execute();
                    $row_producto_detalle = $stmt_select_producto_operacion_devolucion->fetch(PDO::FETCH_ASSOC);

                    $sql_create_requisicion_devolucion =
                        "INSERT INTO requisicion_devolucion
                    (idProdc, correlativo, idProdFin, idProdt, idReqEst, canTotUndReqDev)
                    VALUES(?, ?, ?, ?, ?, $canLotProd)";
                    $stmt_create_requisicion_devolucion = $pdo->prepare($sql_create_requisicion_devolucion);
                    $stmt_create_requisicion_devolucion->bindParam(1, $idProdc, PDO::PARAM_INT);
                    $stmt_create_requisicion_devolucion->bindParam(2, $correlativo, PDO::PARAM_STR);
                    $stmt_create_requisicion_devolucion->bindParam(3, $idProdFin);
                    $stmt_create_requisicion_devolucion->bindParam(4, $row_producto_detalle["idProdt"], PDO::PARAM_INT);
                    $stmt_create_requisicion_devolucion->bindParam(5, $idReqEst, PDO::PARAM_INT);
                    $stmt_create_requisicion_devolucion->execute();
                    $idLastCreationRequisicionDevolucion = $pdo->lastInsertId();

                    $detDev = array(
                        array(
                            "idProd" => $row_producto_detalle["idProdt"], // producto
                            "idProdDevMot" => 2, // motivo desmedro
                            "canProdDev" => $canLotProd // cantidad de devolucion
                        )
                    );

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
                    $stmt_create_trazabilidad_reproceso_devolucion->bindParam(1, $idLastInsert, PDO::PARAM_INT);
                    $stmt_create_trazabilidad_reproceso_devolucion->bindParam(2, $idLastCreationRequisicionDevolucion, PDO::PARAM_INT);
                    $stmt_create_trazabilidad_reproceso_devolucion->execute();
                }
            }

            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "Ocurrio un error en la creación";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error en la conexion";
        $description_error = "Error en la conexion con la base de datos";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
