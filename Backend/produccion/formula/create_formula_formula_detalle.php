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
    $idProd = $data["idProd"];
    $idTipFor = $data["idTipFor"];
    $nomFor = $data["nomFor"];
    $desFor = $data["desFor"];
    $lotKgrFor = $data["lotKgrFor"];
    $forDet = $data["forDet"];
    $idLastInsertion = 0;

    if ($pdo) {

        // primero debemos comprobar que no exista una formula para el mismo producto y klg
        $sql_consult_exist =
            "SELECT * FROM formula
        WHERE idProd = ? AND lotKgrFor = $lotKgrFor";

        $stmt_consult_exist = $pdo->prepare($sql_consult_exist);
        $stmt_consult_exist->bindParam(1, $idProd, PDO::PARAM_INT);
        $stmt_consult_exist->execute();

        if ($stmt_consult_exist->rowCount() == 1) {
            $message_error = "Formula existente";
            $description_error = "Ya existe una formula con el producto y peso ingresado";
        } else {

            $sql =
                "INSERT INTO
                formula
                (idProd, idTipFor, nomFor, desFor, lotKgrFor)
                VALUES (?,?,?,?,$lotKgrFor);
                ";

            try {
                // PREPARAMOS LA CONSULTA
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $idProd, PDO::PARAM_INT);
                $stmt->bindParam(2, $idTipFor, PDO::PARAM_INT);
                $stmt->bindParam(3, $nomFor, PDO::PARAM_STR);
                $stmt->bindParam(4, $desFor, PDO::PARAM_STR);

                $pdo->beginTransaction();
                $stmt->execute();
                $idLastInsertion = $pdo->lastInsertId();
                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollback();
                $message_error = "ERROR INTERNO SERVER: fallo en insercion de maestro formula";
                $description_error = $e->getMessage();
            }

            if ($idLastInsertion != 0) {
                $sql_detalle = "";
                try {
                    // COMENZAMOS LA TRANSACCION
                    $pdo->beginTransaction();
                    foreach ($forDet as $fila) {
                        // EXTRAEMOS LOS VALORES
                        $idMatPri = $fila["idMatPri"];
                        $canMatPriFor = $fila["canMatPriFor"];
                        $idAre = $fila["idAre"];

                        // CREAMOS LA SENTENCIA
                        $sql_detalle = "INSERT INTO 
                            formula_detalle (idFor, idMatPri, idAre, canMatPriFor) 
                            VALUES (?, ?, ?, $canMatPriFor);";
                        // PREPARAMOS LA CONSULTA
                        $stmt_detalle = $pdo->prepare($sql_detalle);
                        $stmt_detalle->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                        $stmt_detalle->bindParam(2, $idMatPri, PDO::PARAM_INT);
                        $stmt_detalle->bindParam(3, $idAre, PDO::PARAM_INT);
                        // EJECUTAMOS LA CONSULTA
                        $stmt_detalle->execute();
                        $sql_detalle = "";
                    }
                    // TERMINAMOS LA TRANSACCION
                    $pdo->commit();
                } catch (PDOException $e) {
                    $pdo->rollback();
                    $message_error = "ERROR INTERNO SERVER: fallo en inserción de detalles formula";
                    $description_error = $e->getMessage();
                }
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
