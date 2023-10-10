<?php

require('../../common/conexion.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        // 171 => COMINO MOLIDO PROCESADO X 01 KG
        // 172 => PIMIENTA NEGRA MOLIDO PROCESADO X 01 KG
        // 173 => PALILLO MOLIDO PROCESADO X 01 KG
        // 174 = AJO MOLIDO PROCESADO X 01 KG
        // 175 => KION MOLIDO PROCESADO X 01 KG
        // 176 => OREGANO MOLIDO PROCESADO X 01 KG

        // 398 => BOLSA PALILLO MOLIDO BATAN X 01 KG
        // 400 => BOLSA KION MOLIDO BATAN X 01 KG
        // 401 => BOLSA PIMIENTA MOLIDO BATAN X 01 KG
        // 402 => BOLSA COMINO MOLIDO BATAN X 01 KG
        // 403 =>  BOLSA  AJO MOLIDO BATAN X 01 KG
        // 404 => BOLSA OREGANO BATAN X 01 KG


        $parameter = "";
        if (isset($data["idProdt"])) {
            $parameter = " and p.proRef = " . $data["idProdt"];
        }

        //die(json_encode($parameter));
        $sql =
            "SELECT
        p.id,
        p.idMed,
        ME.simMed,
        p.nomProd,
        p.codProd2,
        p.esMatPri,
        p.esProFin,
        p.esProProd
        FROM producto p
        LEFT JOIN medida ME ON p.idMed = ME.id
        WHERE (p.esProFin = ? or p.id in (171, 172, 173, 174, 175, 176) ) and p.discontinued = 0 " . $parameter;
        //WHERE(p.esProFin = ?   and p.id not in (398, 400, 401, 402, 403, 404)) or p.id in (171, 172, 173, 174, 175, 176) and p.discontinued = 0

        $stmt = $pdo->prepare($sql);
        $esProFin = 1; // filtramos los productos presentaciones finales
        $stmt->bindParam(1, $esProFin, PDO::PARAM_BOOL);
        // Ejecutamos la consulta
        try {
            $stmt->execute();
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (Exception $e) {
            $message_error = "ERROR INTERNO SERVER";
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
