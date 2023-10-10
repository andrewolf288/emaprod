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

    $idMatPri = $data["id"]; // ID DE LA MATERIA PRIMA
    $refNumIngEntSto = 0; // REFERENCIA DEL NUMERO DE INGRESO

    if ($pdo) {
        $sql =
            "SELECT 
        max(refNumIngEntSto) as refNumIngEntSto
        FROM entrada_stock
        WHERE idMatPri = ?
        ORDER BY refNumIngEntSto DESC
        ";
        //Preparamos la consulta
        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(1, $idMatPri, PDO::PARAM_INT);

        // Comprobamos la respuesta
        try {
            $stmt->execute();

            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if (isset($row["refNumIngEntSto"])) {
                    array_push($result, $row);
                }
            }

            // COMPROBAMOS SI NO HUBO ENTRADAS DE ESE PRODUCTO
            if (empty($result)) {
                // SERA LA PRIMERA INSERCION DEL AÑO
                $refNumIngEntSto = 1;
            } else {
                $refNumIngEntSto = $result[0]["refNumIngEntSto"] + 1;
            }
            $result = $refNumIngEntSto;
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
