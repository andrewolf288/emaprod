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
        //die(json_encode($data["fecProdLotFin"]));

        $sql =
            "SELECT
            pd.id,
            pd.idProdt,
            p.nomProd,
            pd.idProdEst,
            pde.desEstPro,
            pd.idProdTip,
            pdt.desProdTip,
            pd.idProdIniProgEst,
            pdipe.desProdIniProgEst,
            pd.idProdFinProgEst,
            pdfpe.desProdFinProgEst,
            pd.esEnv,
            pd.codLotProd,
            pd.klgLotProd,
            pd.fecProdIni,
            pd.fecProdIniProg,
            pd.fecProdFin,
            pd.fecProdFinProg,
            pd.fecFinMolProd,
            pd.fecFinEnvProd,
            pd.fecFinEncProd,
            pd.fecVenLotProd,
            pd.numop
        FROM produccion pd
        JOIN producto p ON pd.idProdt = p.id
        JOIN produccion_estado pde ON pd.idProdEst = pde.id
        JOIN produccion_tipo pdt ON pd.idProdTip = pdt.id
        JOIN produccion_inicio_programado_estado pdipe ON pd.idProdIniProgEst = pdipe.id
        JOIN produccion_fin_programado_estado pdfpe ON pd.idProdFinProgEst = pdfpe.id
        WHERE DATE(pd.fecProdIni) BETWEEN '$fechaInicio' AND '$fechaFin'
        ORDER BY pd.fecProdIni DESC";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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
