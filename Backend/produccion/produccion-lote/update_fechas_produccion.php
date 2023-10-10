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
    $idProd = $data["id"];
    $fecFinMolProd = $data["fecFinMolProd"];
    $fecFinEnvProd = $data["fecFinEnvProd"];
    $fecFinEncProd = $data["fecFinEncProd"];
    $fecProdFin = $data["fecProdFin"];

    if ($pdo) {

        // DATOS NECESARIOS
        $idProdFinProgEst = 0;

        // comprobamos los valores para evaluar los estados
        $idProdEst = 3;
        if (isset($fecFinMolProd)) {
            $idProdEst = 4; // proceso molienda completo
        }
        if (isset($fecFinEnvProd) && isset($fecFinMolProd)) {
            $idProdEst = 5; // proceso envasado completo
        }
        if (isset($fecFinEncProd) && isset($fecFinEnvProd) && isset($fecFinMolProd)) {
            $idProdEst = 6; // proceso encajonado completo
        }

        if (isset($fecProdFin) && isset($fecFinEncProd) && isset($fecFinEnvProd) && isset($fecFinMolProd)) {
            $idProdEst = 7; // proceso terminado
            $fechaFinProgramado = ""; // fecha fin programado

            $sql_consult =
                "SELECT DATE(pd.fecProdFinProg) AS fecProdFinProg, pd.idProdFinProgEst FROM produccion pd 
                WHERE pd.id = ?";

            $stmt_consult = $pdo->prepare($sql_consult);
            $stmt_consult->bindParam(1, $idProd, PDO::PARAM_INT);
            $stmt_consult->execute();

            while ($row = $stmt_consult->fetch(PDO::FETCH_ASSOC)) {
                $fechaFinProgramado = $row["fecProdFinProg"];
                $idProdFinProgEst = $row["idProdFinProgEst"];
            }

            $fechaFinProgramado = strtotime(explode(" ", $fechaFinProgramado)[0]);
            $fechaFin = strtotime(explode(" ", $fecProdFin)[0]);
            /* 
                    1. A tiempo
                    2. Atrasado
                    3. Adelantado
                */
            if ($fechaFinProgramado > $fechaFin) {
                $idProdFinProgEst = 2; // fin atrasado
            } else {
                if ($fechaFinProgramado == $fechaFin) {
                    $idProdFinProgEst = 1; // fin a tiempo
                } else {
                    $idProdFinProgEst = 3; // fin adelantado
                }
            }

            // actualizamos el maestro de formula
            $sql =
                "UPDATE produccion
            SET fecFinMolProd = ?, fecFinEnvProd = ?, fecFinEncProd = ?, fecProdFin = ?, idProdEst = ?, idProdFinProgEst = ?
            WHERE id = ?";
            try {

                // PREPARAMOS LA CONSULTA
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $fecFinMolProd);
                $stmt->bindParam(2, $fecFinEnvProd);
                $stmt->bindParam(3, $fecFinEncProd);
                $stmt->bindParam(4, $fecProdFin);
                $stmt->bindParam(5, $idProdEst, PDO::PARAM_INT);
                $stmt->bindParam(6, $idProdFinProgEst, PDO::PARAM_INT);
                $stmt->bindParam(7, $idProd, PDO::PARAM_INT);
                $stmt->execute();
            } catch (PDOException $e) {
                $message_error = "ERROR SERVER INTERNO: ERROR EN LA ACTUALIZACION DE PRODUCCION";
                $description_error = $e->getMessage();
            }
        } else {
            // actualizamos el maestro de formula
            $sql =
                "UPDATE produccion
                SET fecFinMolProd = ?, fecFinEnvProd = ?, fecFinEncProd = ?, fecProdFin = ?, idProdEst = ?
                WHERE id = ?";
            try {

                // PREPARAMOS LA CONSULTA
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(1, $fecFinMolProd);
                $stmt->bindParam(2, $fecFinEnvProd);
                $stmt->bindParam(3, $fecFinEncProd);
                $stmt->bindParam(4, $fecProdFin);
                $stmt->bindParam(5, $idProdEst, PDO::PARAM_INT);
                $stmt->bindParam(6, $idProd, PDO::PARAM_INT);
                $stmt->execute();
            } catch (PDOException $e) {
                $message_error = "ERROR SERVER INTERNO: ERROR EN LA ACTUALIZACION DE PRODUCCION";
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
