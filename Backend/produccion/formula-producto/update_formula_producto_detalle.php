<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idForProdFin = $data["id"];
    $reqDet = $data["reqDet"];
    $fecActForProTer = date('Y-m-d H:i:s');

    if ($pdo) {

        // actualizamos el maestro de formula
        $sql =
            "UPDATE formula_producto_terminado
            SET fecActForProTer = ?
            WHERE id = ?";

        try {
            $pdo->beginTransaction();
            // PREPARAMOS LA CONSULTA
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $fecActForProTer);
            $stmt->bindParam(2, $idForProdFin, PDO::PARAM_STR);
            $stmt->execute();

            foreach ($reqDet as $fila) {
                // obtenemos la cantidad
                $canForProDet = $fila["canForProDet"]; // cantidad
                $idAre = $fila["idAre"]; // area
                $idAlm = $fila["idAlm"]; // almacen

                // si es un nuevo detalle agregado en la formula en la actualizacion
                if (!isset($fila["idForProdFin"])) {
                    $idProd =  $fila["idProd"];
                    // insertamos un nuevo detalle de formula
                    $sql_detalle_insert = "INSERT INTO 
                        formula_producto_terminado_detalle (idForProdFin, idProd, idAre, idAlm, canForProDet) 
                        VALUES (?, ?, ?, ?, $canForProDet);";
                    try {
                        // PREPARAMOS LA CONSULTA
                        $stmt_detalle_insert = $pdo->prepare($sql_detalle_insert);
                        $stmt_detalle_insert->bindParam(1, $idForProdFin, PDO::PARAM_INT);
                        $stmt_detalle_insert->bindParam(2, $idProd, PDO::PARAM_INT);
                        $stmt_detalle_insert->bindParam(3, $idAre, PDO::PARAM_INT);
                        $stmt_detalle_insert->bindParam(4, $idAlm, PDO::PARAM_INT);
                        // EJECUTAMOS LA CONSULTA
                        $stmt_detalle_insert->execute();
                    } catch (PDOException $e) {
                        $message_error = "ERROR INTERNO SERVER: fallo en la insercion de un detalle formula";
                        $description_error = $e->getMessage();
                    }
                } else {
                    // obtenemos el id de la formula detalle
                    $idreqDet = $fila["id"];
                    // actualizamos el detalle de formula
                    $sql_detalle =
                        "UPDATE formula_producto_terminado_detalle 
                    SET canForProDet = $canForProDet, fecActForProTerDet = ?
                    WHERE id = ?";

                    try {
                        $stmt_detalle = $pdo->prepare($sql_detalle);
                        $stmt_detalle->bindParam(1, $fecActForProTer);
                        $stmt_detalle->bindParam(2, $idreqDet, PDO::PARAM_INT);
                        $stmt_detalle->execute();
                    } catch (PDOException $e) {
                        $message_error = "ERROR INTERNO SERVER: fallo en actualizacion de detalle formula";
                        $description_error = $e->getMessage();
                    }
                }
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollback();
            $message_error = "ERROR INTERNO SERVER: fallo en insercion de maestro formula";
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
