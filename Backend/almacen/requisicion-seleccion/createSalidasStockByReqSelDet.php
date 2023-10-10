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

    // OBTENEMOS LOS DATOS
    $idReqSel = $data["idReqSel"];
    $idReqSelDet = $data["idReqSelDet"];
    $idMatPri = $data["idMatPri"];
    $canReqSelDet = $data["canReqSelDet"];
    $salStoSelDet = $data["salStoSelDet"];

    if ($pdo) {
        $sql = "";
        foreach ($salStoSelDet as $item) {

            try {
                // INICIAMOS UNA TRANSACCION
                $pdo->beginTransaction();

                // OBTENEMOS LOS DATOS
                $idEntSto = $item["idEntSto"];
                $canSalReqSel = $item["canSalReqSel"];
                $idAlm = $item["idAlm"];
                $idSalEntSelEst = 1; // ESTADO DE SALIDA COMPLETA

                // CREAMOS LA CONSULTA PARA GENERAR LAS SALIDAS ENTRADAS DE SELECCION
                $sql =
                    "INSERT
                salida_entrada_seleccion
                (idEntSto, idReqSel, idMatPri, idSalEntSelEst, canSalStoReqSel)
                VALUES (?,?,?,?,$canSalReqSel)";

                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $idEntSto, PDO::PARAM_INT);
                $stmt->bindParam(2, $idReqSel, PDO::PARAM_INT);
                $stmt->bindParam(3, $idMatPri, PDO::PARAM_INT);
                $stmt->bindParam(4, $idSalEntSelEst, PDO::PARAM_INT);
                // ejecutamos
                $stmt->execute();

                // ACTUALIZAMOS LA ENTRADA STOCK
                $sql_update_entrada_stock =
                    "UPDATE
                entrada_stock
                SET canSel =  canSel + $canSalReqSel, canPorSel = canPorSel - $canSalReqSel
                WHERE id = ?
                ";
                $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                $stmt_update_entrada_stock->bindParam(1, $idEntSto, PDO::PARAM_INT);
                // ejecutamos
                $stmt_update_entrada_stock->execute();

                // ACTUALIZO EL ALMACEN
                $sql_update_almacen =
                    "UPDATE
                almacen_stock
                SET canSto = canSto - $canSalReqSel
                WHERE idAlm = ? AND idProd = ?
                ";
                $stmt_update_almacen_stock =  $pdo->prepare($sql_update_almacen);
                $stmt_update_almacen_stock->bindParam(1, $idAlm, PDO::PARAM_INT);
                $stmt_update_almacen_stock->bindParam(2, $idMatPri, PDO::PARAM_INT);
                // ejecutamos
                $stmt_update_almacen_stock->execute();

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en inserción de salidas";
                $description_error = $e->getMessage();
            }
            // SE TERMINA LA ITERACION Y SE CONTINUA CON LA SIGUIENTE SALIDA
        }

        // ACTUALIZAMOS LOS ESTADOS DE LA REQUISICION SELECCION MAESTRO Y DETALLE
        if (empty($message_error)) {
            try {
                // Iniciamos una transaccion
                $pdo->beginTransaction();

                // PRIMERO ACTUALIZAMOS EL DETALLE
                $idReqSelDetEstPorSel = 2; // ESTADO DE POR SELECCIONAR
                $sql_update_requisicion_molienda_detalle =
                    "UPDATE requisicion_seleccion_detalle
                SET idReqSelDetEst = ?
                WHERE id = ?";
                $stmt_update_requisicion_molienda_detalle = $pdo->prepare($sql_update_requisicion_molienda_detalle);
                $stmt_update_requisicion_molienda_detalle->bindParam(1, $idReqSelDetEstPorSel, PDO::PARAM_INT);
                $stmt_update_requisicion_molienda_detalle->bindParam(2, $idReqSelDet, PDO::PARAM_INT);
                $stmt_update_requisicion_molienda_detalle->execute();

                // TERMINAMOS LA TRANSACCION
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en la actualización de los estados";
                $description_error = $e->getMessage();
            }
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
