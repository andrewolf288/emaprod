<?php
// CON ESTE SCRIPT DEBEMOS MOSTRAR LAS OPERACIONES DE DEVOLUCION QUE NO RETORNAN
/*
    1. CONSULTAMOS EN LA TABLA "operacion_devolucion" AQUELLAS QUE SEAN DE NO RETORNO
    2. DEBEMOS TRAER SU DETALLE DE OPERACIONES DE DEVOLUCION DE CALIDAD "operacion_devolucion_calidad"
*/
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

    $fechasMes = getStartEndDateNow();
    $fechaInicio = $fechasMes[0]; // inicio del mes
    $fechaFin = $fechasMes[1]; // fin del mes

    if (isset($data)) {
        if (!empty($data["fechaInicio"])) {
            $fechaInicio = $data["fechaInicio"];
        }
        if (!empty($data["fechaFin"])) {
            $fechaFin = $data["fechaFin"];
        }
    }

    if ($pdo) {
        $esRet = 0;

        $sql_select_operacion_devolucion_no_retorno =
            "SELECT
            od.id,
            od.invSerFac,
            od.invNumFac,
            ofm.desOpeFacMot,
            od.fecCreOpeDev
        FROM operacion_devolucion AS od
        JOIN operacion_facturacion_motivo AS ofm ON ofm.id = od.idOpeFacMot
        WHERE (od.esRet = ?) AND DATE(od.fecCreOpeDev) BETWEEN ? AND ? 
        ORDER BY od.fecCreOpeDev DESC ";
        $stmt_select_operacion_devolucion_no_retorno = $pdo->prepare($sql_select_operacion_devolucion_no_retorno);
        $stmt_select_operacion_devolucion_no_retorno->bindParam(1, $esRet, PDO::PARAM_BOOL);
        $stmt_select_operacion_devolucion_no_retorno->bindParam(2, $fechaInicio, PDO::PARAM_STR);
        $stmt_select_operacion_devolucion_no_retorno->bindParam(3, $fechaFin, PDO::PARAM_STR);
        $stmt_select_operacion_devolucion_no_retorno->execute();

        while ($row_operacion_devolucion = $stmt_select_operacion_devolucion_no_retorno->fetch(PDO::FETCH_ASSOC)) {
            $idOpeDev = $row_operacion_devolucion["id"];
            $row_operacion_devolucion["detOpeDevCal"] = array();

            $sql_select_operacion_devolucion_calidad =
                "SELECT
            odc.id,
            odc.fueCom,
            p.nomProd,
            me.simMed,
            p.codProd2,
            odd.canOpeDevDet,
            odd.fecComOpeDevDet
            FROM operacion_devolucion_calidad AS odc
            JOIN operacion_devolucion_detalle AS odd ON odd.id = odc.idOpeDevDet
            JOIN producto AS p ON p.id = odd.idProdt
            JOIN medida AS me ON me.id = p.idMed
            WHERE odc.idOpeDev = ?";
            $stmt_select_operacion_devolucion_calidad = $pdo->prepare($sql_select_operacion_devolucion_calidad);
            $stmt_select_operacion_devolucion_calidad->bindParam(1, $idOpeDev, PDO::PARAM_INT);
            $stmt_select_operacion_devolucion_calidad->execute();

            // $row_operacion_devolucion["detOpeDevCal"] = $stmt_select_operacion_devolucion_calidad->fetchAll(PDO::FETCH_ASSOC);
            $totalCompletos = 0;
            $totalDetalle = $stmt_select_operacion_devolucion_calidad->rowCount();
            $idEstOpeDevCal = 0;

            while ($row_operacion_devolucion_calidad = $stmt_select_operacion_devolucion_calidad->fetch(PDO::FETCH_ASSOC)) {
                $fueCom = $row_operacion_devolucion_calidad["fueCom"];
                if ($fueCom == 1) {
                    $totalCompletos++;
                }
                array_push($row_operacion_devolucion["detOpeDevCal"], $row_operacion_devolucion_calidad);
            }

            if ($totalCompletos == 0) {
                $idEstOpeDevCal = 1; // incompleto
            }
            if ($totalCompletos == $totalDetalle) {
                $idEstOpeDevCal = 3; // completo
            }
            if ($totalCompletos != 0 && $totalCompletos != $totalDetalle) {
                $idEstOpeDevCal = 2; // en proceso
            }

            $row_operacion_devolucion["idEstOpeDevCal"] = $idEstOpeDevCal;
            $row_operacion_devolucion["desEstOpeDevCal"] = ($idEstOpeDevCal == 1) ? "Requerido" : (($idEstOpeDevCal == 2) ? "En proceso" : "Completado");
            array_push($result, $row_operacion_devolucion);
        }
    } else {
        // No se pudo realizar la conexion a la base de datos
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
