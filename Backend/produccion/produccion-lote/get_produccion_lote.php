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
            if (!empty($data["fecProdLotIni"])) {
                $fechaInicio = $data["fecProdLotIni"];
            }
            if (!empty($data["fecProdLotFin"])) {
                $fechaFin = $data["fecProdLotFin"];
            }
        }

        $sql =
            "SELECT
        pd.id,
        pd.idProdt,
        p.nomProd,
        pd.idProdEst,
        pde.desEstPro,
        pd.idProdIniProgEst,
        pdipe.desProdIniProgEst,
        pd.esEnv,
        pd.codLotProd,
        pd.klgLotProd,
        DATE(pd.fecProdIni) AS fecProdIni,
        pd.fecProdIniProg,
        DATE(pd.fecVenLotProd) AS fecVenLotProd,
        pd.numop
        FROM produccion pd
        JOIN producto p ON pd.idProdt = p.id
        JOIN produccion_estado pde ON pd.idProdEst = pde.id
        JOIN produccion_inicio_programado_estado pdipe ON pd.idProdIniProgEst = pdipe.id
        WHERE DATE(pd.fecProdIni) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY pd.fecProdIni DESC";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute(); // ejecutamos
            $estado_requerido = 1; // requerido
            $estado_en_proceso = 2; // en proceso
            $estado_terminado = 3; // terminado
            $idAreEnv = 5; // area de envasado
            $idAreEnc = 6; // srea de encajonado

            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $idLoteProduccion = $row["id"];
                // buscamos requisicion de envase y encaje
                $sql_select_requisicion_encaje_envase =
                    "SELECT
                COALESCE(SUM(CASE WHEN r.idReqEst = 1 THEN 1 ELSE 0 END), 0) AS requerido,
                COALESCE(SUM(CASE WHEN r.idReqEst = 2 THEN 1 ELSE 0 END), 0) AS en_proceso,
                COALESCE(SUM(CASE WHEN r.idReqEst = 3 THEN 1 ELSE 0 END), 0) AS terminado
                FROM requisicion AS r
                WHERE r.idProdc = ? AND (r.idAre = ? OR r.idAre = ?)";
                $stmt_select_requisicion_encaje_envase = $pdo->prepare($sql_select_requisicion_encaje_envase);
                $stmt_select_requisicion_encaje_envase->bindParam(1, $idLoteProduccion, PDO::PARAM_INT);
                $stmt_select_requisicion_encaje_envase->bindParam(2, $idAreEnv, PDO::PARAM_INT);
                $stmt_select_requisicion_encaje_envase->bindParam(3, $idAreEnc, PDO::PARAM_INT);
                $stmt_select_requisicion_encaje_envase->execute();
                $row["req_env_enc"] = $stmt_select_requisicion_encaje_envase->fetchAll(PDO::FETCH_ASSOC);

                // buscamos requisiciones de ingreso
                $sql_select_requisicion_ingreso_producto =
                    "SELECT
                COALESCE(SUM(CASE WHEN pip.esComProdIng = 0 THEN 1 ELSE 0 END), 0) AS requerido,
                COALESCE(SUM(CASE WHEN pip.esComProdIng = 1 THEN 1 ELSE 0 END), 0) AS terminado
                FROM produccion_ingreso_producto AS pip
                WHERE pip.idProdc = ?";
                $stmt_select_requisicion_ingreso_producto = $pdo->prepare($sql_select_requisicion_ingreso_producto);
                $stmt_select_requisicion_ingreso_producto->bindParam(1, $idLoteProduccion, PDO::PARAM_INT);
                $stmt_select_requisicion_ingreso_producto->execute();
                $row["req_ing_prod"] = $stmt_select_requisicion_ingreso_producto->fetchAll(PDO::FETCH_ASSOC);

                // buscamos agregaciones
                $sql_select_requisicion_agregacion =
                    "SELECT
                COALESCE(SUM(CASE WHEN r.idReqEst = 1 THEN 1 ELSE 0 END), 0) AS requerido,
                COALESCE(SUM(CASE WHEN r.idReqEst = 2 THEN 1 ELSE 0 END), 0) AS en_proceso,
                COALESCE(SUM(CASE WHEN r.idReqEst = 3 THEN 1 ELSE 0 END), 0) AS terminado
                FROM requisicion_agregacion AS r
                WHERE r.idProdc = ?";
                $stmt_select_requisicion_agregacion = $pdo->prepare($sql_select_requisicion_agregacion);
                $stmt_select_requisicion_agregacion->bindParam(1, $idLoteProduccion, PDO::PARAM_INT);
                $stmt_select_requisicion_agregacion->execute();
                $row["req_agr"] = $stmt_select_requisicion_agregacion->fetchAll(PDO::FETCH_ASSOC);

                // buscamos devoluciones
                $sql_select_requisicion_devolucion =
                    "SELECT
                 COALESCE(SUM(CASE WHEN r.idReqEst = 1 THEN 1 ELSE 0 END), 0) AS requerido,
                 COALESCE(SUM(CASE WHEN r.idReqEst = 2 THEN 1 ELSE 0 END), 0) AS en_proceso,
                 COALESCE(SUM(CASE WHEN r.idReqEst = 3 THEN 1 ELSE 0 END), 0) AS terminado
                FROM requisicion_devolucion AS r
                WHERE r.idProdc = ?";
                $stmt_select_requisicion_devolucion = $pdo->prepare($sql_select_requisicion_devolucion);
                $stmt_select_requisicion_devolucion->bindParam(1, $idLoteProduccion, PDO::PARAM_INT);
                $stmt_select_requisicion_devolucion->execute();
                $row["req_dev"] = $stmt_select_requisicion_devolucion->fetchAll(PDO::FETCH_ASSOC);

                array_push($result, $row);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO EN LA CONSULTA DE ENTRADAS";
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
