<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idReqDet = $data["id"]; // id requisicion detalle
    $canReqDetNew = floatval($data["cantidadNueva"]); // cantidad nueva

    if ($pdo) {
        // variables utilizadas
        $cantidadResultante = 0; // cantidad diferencia entre nuevo y actual
        $canReqDet = 0; // cantidad actual de la requisicion
        $idProd = 0; // producto de la requisicion
        $idAlm = 0; // almacen destino
        $idAlmacenPrincipal = 1; // almacen principal

        // finalmente actualizamos la requisicion detalle
        $sql_update_requisicion_detalle =
            "UPDATE requisicion_detalle SET
            canReqDet = $canReqDetNew
            WHERE id = ?";

        try {
            $stmt_update_requisicion_detalle = $pdo->prepare($sql_update_requisicion_detalle);
            $stmt_update_requisicion_detalle->bindParam(1, $idReqDet, PDO::PARAM_INT);
            $stmt_update_requisicion_detalle->execute();

            // actualizamos el almacen principal
        } catch (PDOException $e) {
            $message_error = "Error en la actualizacion de requisicion detalle";
            $description_error = $e->getMessage();
        }

        // // primero consultamos el stock de la requisicion
        // $sql_consult_requisicion_detalle =
        //     "SELECT canReqDet, idProdt FROM requisicion_detalle
        // WHERE id = ?";

        // try {
        //     $stmt_consult_requisicion_detalle = $pdo->prepare($sql_consult_requisicion_detalle);
        //     $stmt_consult_requisicion_detalle->bindParam(1, $idReqDet, PDO::PARAM_INT);
        //     $stmt_consult_requisicion_detalle->execute();

        //     while ($row_consult = $stmt_consult_requisicion_detalle->fetch(PDO::FETCH_ASSOC)) {
        //         $canReqDet = $row_consult["canReqDet"];
        //         $idProd =  $row_consult["idProdt"];
        //     }

        //     // calculamos la diferencia
        //     $cantidadResultante = $canReqDetNew - $canReqDet;

        //     // si la cantidad resultante es igual o menor
        //     if ($cantidadResultante <= 0) {
        //         // actualizamos el almacen principal
        //         $sql_update_stock_almacen_principal_1 =
        //             "UPDATE almacen_stock SET 
        //         canSto = canSto - $cantidadResultante, canStoDis = canStoDis - $cantidadResultante
        //         WHERE idAlm = ? AND idProd = ?";

        //         try {
        //             $stmt_update_stock_almacen_principal_1 = $pdo->prepare($sql_update_stock_almacen_principal_1);
        //             $stmt_update_stock_almacen_principal_1->bindParam(1, $idAlmacenPrincipal, PDO::PARAM_INT);
        //             $stmt_update_stock_almacen_principal_1->bindParam(2, $idProd, PDO::PARAM_INT);
        //             $stmt_update_stock_almacen_principal_1->execute();

        //             // realizamos la transferencia del almacen correspondiente
        //             switch ($idAre) {
        //                 case 2:
        //                     $idAlm = 2; // almacen molienda
        //                     break;
        //                 case 5:
        //                     $idAlm = 3; // almacen envasado
        //                     break;
        //                 case 6:
        //                     $idAlm = 4; // almacen encajonado
        //                     break;
        //                 case 7:
        //                     $idAlm = 5; // almacen frescos
        //                     break;
        //             }

        //             $sql_update_almacen_destino_1 =
        //                 "UPDATE almacen_stock SET
        //             canSto = canSto + $cantidadResultante, canStoDis = canStoDis + $cantidadResultante
        //             WHERE idAlm = ? AND idProd = ?";

        //             try {
        //                 $stmt_update_almacen_destino_1 = $pdo->prepare($sql_update_almacen_destino_1);
        //                 $stmt_update_almacen_destino_1->bindParam(1, $idAlm, PDO::PARAM_INT);
        //                 $stmt_update_almacen_destino_1->bindParam(2, $idProd, PDO::PARAM_INT);
        //                 $stmt_update_almacen_destino_1->execute();
        //             } catch (PDOException $e) {
        //                 $message_error = "Error en la actualizacion del almacen destino";
        //                 $description_error = $e->getMessage();
        //             }
        //         } catch (PDOException $e) {
        //             $message_error = "Error en la actualizacion de stock almacen principal";
        //             $description_error = $e->getMessage();
        //         }
        //     } else {
        //         $canStoDis = 0; // cantidad stock disponible

        //         // consultamos si se puede realizar la actualizacion
        //         $sql_consult_stock_almacen =
        //             "SELECT canStoDis FROM almacen_stock
        //         WHERE idAlm = ? AND idProd = ?";

        //         try {
        //             $stmt_consult_stock_almacen = $pdo->prepare($sql_consult_stock_almacen);
        //             $stmt_consult_stock_almacen->bindParam(1, $idAlmacenPrincipal, PDO::PARAM_INT);
        //             $stmt_consult_stock_almacen->bindParam(2, $idProd, PDO::PARAM_INT);
        //             $stmt_consult_stock_almacen->execute();

        //             while ($row_consult_stock = $stmt_consult_stock_almacen->fetch(PDO::FETCH_ASSOC)) {
        //                 $canStoDis = floatval($row_consult_stock["canStoDis"]);
        //             }

        //             // si la cantidad stock disponible es mayor al restante
        //             if ($canStoDis >= $cantidadResultante) {
        //                 // actualizamos el almacen principal
        //                 $sql_update_stock_almacen_principal_2 =
        //                     "UPDATE almacen_stock SET
        //                 canSto = canSto - $cantidadResultante, canStoDis = canStoDis - $cantidadResultante
        //                 WHERE idAlm = ? AND idProd = ?";

        //                 try {
        //                     $stmt_update_stock_almacen_principal_2 = $pdo->prepare($sql_update_stock_almacen_principal_2);
        //                     $stmt_update_stock_almacen_principal_1->bindParam(1, $idAlmacenPrincipal, PDO::PARAM_INT);
        //                     $stmt_update_stock_almacen_principal_2->bindParam(2, $idProd, PDO::PARAM_INT);
        //                     $stmt_update_stock_almacen_principal_2->execute();

        //                     // transferimos al almacen correspondiente
        //                     switch ($idAre) {
        //                         case 2:
        //                             $idAlm = 2; // almacen molienda
        //                             break;
        //                         case 5:
        //                             $idAlm = 3; // almacen envasado
        //                             break;
        //                         case 6:
        //                             $idAlm = 4; // almacen encajonado
        //                             break;
        //                         case 7:
        //                             $idAlm = 5; // almacen frescos
        //                             break;
        //                     }

        //                     $sql_update_almacen_destino_2 =
        //                         "UPDATE almacen_stock SET
        //                     canSto = canSto + $cantidadResultante, canStoDis = canStoDis + $cantidadResultante
        //                     WHERE idAlm = ? AND idProd = ?";

        //                     try {
        //                         $stmt_update_almacen_destino_2 = $pdo->prepare($sql_update_almacen_destino_2);
        //                         $stmt_update_almacen_destino_2->bindParam(1, $idAlm, PDO::PARAM_INT);
        //                         $stmt_update_almacen_destino_2->bindParam(2, $idProd, PDO::PARAM_INT);
        //                         $stmt_update_almacen_destino_2->execute();
        //                     } catch (PDOException $e) {
        //                         $message_error = "Error en la actualizacion de almacen destino";
        //                         $description_error = $e->getMessage();
        //                     }
        //                 } catch (PDOException $e) {
        //                     $message_error = "Error en la actualizacion de stock almacen principal";
        //                     $description_error = $e->getMessage();
        //                 }
        //             } else {
        //                 $message_error = "Stock insuficiente";
        //                 $description_error = "No se puede realizar esta actualizacion porque no hay stock";
        //             }
        //         } catch (PDOException $e) {
        //             $message_error = "Error en la consulta de stock almacen principal";
        //             $description_error = $e->getMessage();
        //         }
        // }
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
