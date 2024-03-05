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

        $idEntradaCalidad = $data["informacion_calidad"]["id"]; // entrada calidad
        $idEntCalEst = $data["informacion_calidad"]["idEntCalEst"]; // aprobacion de calidad
        $idResEntCal = $data["informacion_calidad"]["idResEntCal"]; // responsable de evaluacion
        $obsAccEntCal = $data["informacion_calidad"]["obsAccEntCal"]; //observacion de evaluacion
        $conHigTrans = $data["informacion_calidad"]["conHigTrans"]; // condiciones de higiene
        $dataAtributosEntradaCalidad = $data["dataAtributosEntradaCalidad"]; // data a procesar

        try {
            $pdo->beginTransaction();
            $fecActEntCal = date('Y-m-d H:i:s');;
            // primero debemos actualizar los datos de calidad
            $sql_update_entrada_calidad =
                "UPDATE entrada_calidad 
                SET idResEntCal = ?, 
                obsAccEntCal = ?, 
                idEntCalEst = ?, 
                conHigTrans = ?, 
                fecActEntCal = ?
            WHERE id = ?";
            $stmt_update_entrada_calidad = $pdo->prepare($sql_update_entrada_calidad);
            $stmt_update_entrada_calidad->bindParam(1, $idResEntCal, PDO::PARAM_INT);
            $stmt_update_entrada_calidad->bindParam(2, $obsAccEntCal, PDO::PARAM_STR);
            $stmt_update_entrada_calidad->bindParam(3, $idEntCalEst, PDO::PARAM_BOOL);
            $stmt_update_entrada_calidad->bindParam(4, $conHigTrans, PDO::PARAM_STR);
            $stmt_update_entrada_calidad->bindParam(5, $fecActEntCal, PDO::PARAM_STR);
            $stmt_update_entrada_calidad->bindParam(6, $idEntradaCalidad, PDO::PARAM_INT);
            $stmt_update_entrada_calidad->execute();

            // ahora debemos procesar la data
            foreach ($dataAtributosEntradaCalidad as $atributoEntradaCalidad) {
                $action = $atributoEntradaCalidad["action"];
                $idProdtAtrCal = $atributoEntradaCalidad["id"];
                $valEntCalAtr = $atributoEntradaCalidad["valEntCalAtr"];

                if ($action === "CREATE") {
                    $sql_create_atributo_calidad_entrada =
                        "INSERT INTO 
                    entrada_calidad_atributos (idEntCal, idProdtAtrCal, valEntCalAtr)
                    VALUES(?, ?, ?)";
                    $stmt_create_atributo_calidad_entrada = $pdo->prepare($sql_create_atributo_calidad_entrada);
                    $stmt_create_atributo_calidad_entrada->bindParam(1, $idEntradaCalidad, PDO::PARAM_INT);
                    $stmt_create_atributo_calidad_entrada->bindParam(2, $idProdtAtrCal, PDO::PARAM_INT);
                    $stmt_create_atributo_calidad_entrada->bindParam(3, $valEntCalAtr, PDO::PARAM_STR);
                    $stmt_create_atributo_calidad_entrada->execute();
                } else {
                    $sql_update_atributo_calidad_entrada =
                        "UPDATE
                    entrada_calidad_atributos SET valEntCalAtr = ?
                    WHERE idEntCal = ? AND idProdtAtrCal = ?";
                    $stmt_update_atributo_calidad_entrada = $pdo->prepare($sql_update_atributo_calidad_entrada);
                    $stmt_update_atributo_calidad_entrada->bindParam(1, $valEntCalAtr, PDO::PARAM_STR);
                    $stmt_update_atributo_calidad_entrada->bindParam(2, $idEntradaCalidad, PDO::PARAM_INT);
                    $stmt_update_atributo_calidad_entrada->bindParam(3, $idProdtAtrCal, PDO::PARAM_INT);
                    $stmt_update_atributo_calidad_entrada->execute();
                }
            }

            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            $message_error = "OCURRIO UN ERROR EN EL PROCESO";
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
