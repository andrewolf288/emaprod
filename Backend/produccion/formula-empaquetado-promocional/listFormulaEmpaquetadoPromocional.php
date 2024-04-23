<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');
require_once('../../common/utils.php');

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
        $sql_formulas_empaquetado_promocional = 
        "SELECT 
        fep.id,
        fep.idProdt,
        p.nomProd,
        me.simMed,
        fep.nomForEmpProm,
        fep.desForEmpProm,
        fep.fecCreForEmpProm,
        fep.fecActForEmpProm
        FROM formula_empaquetado_promocional AS fep
        JOIN producto AS p ON p.id = fep.idProdt
        JOIN medida AS me ON me.id = p.idMed
        WHERE (DATE(fep.fecCreForEmpProm) BETWEEN ? AND ?)";
        $stmt_formulas_empaquetado_promocional = $pdo->prepare($sql_formulas_empaquetado_promocional);
        $stmt_formulas_empaquetado_promocional->bindParam(1, $fechaInicio, PDO::PARAM_STR);
        $stmt_formulas_empaquetado_promocional->bindParam(2, $fechaFin, PDO::PARAM_STR);
        $stmt_formulas_empaquetado_promocional->execute();

        $result = $stmt_formulas_empaquetado_promocional->fetchAll(PDO::FETCH_ASSOC);

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