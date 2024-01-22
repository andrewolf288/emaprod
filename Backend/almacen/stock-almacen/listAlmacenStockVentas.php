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

        // VERIFICAMOS SI SE PROPORCIONO LA DATA
        $idAlm = 0;
        if (isset($data)) {
            if (!empty($data["idAlm"])) {
                $idAlm = $data["idAlm"];
            } else {
                $idAlm = 1;
            }
        } else {
            $idAlm = 1;
        }

        // REALIZAMOS LA CONSULTA
        $sql =
            "SELECT 
                als.id,
                als.idProd,
                p.nomProd,
                c.desCla,
                me.simMed,
                al.nomAlm,
                als.canSto,
                als.canStoDis,
                als.fecActAlmSto,
                p.codProd2
                FROM almacen_stock as als
                JOIN producto as p ON p.id = als.idProd
                JOIN clase as c ON c.id = p.idCla
                JOIN medida as me ON me.id = p.idMed
                JOIN almacen as al ON al.id = als.idAlm
                WHERE idAlm = ? AND (p.idCla = ? OR p.idCla = ?)";

        try {
            $claseProductosFinales = 2;
            $claseMercaderias = 5;
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $idAlm, PDO::PARAM_INT);
            $stmt->bindParam(2, $claseProductosFinales, PDO::PARAM_INT);
            $stmt->bindParam(3, $claseMercaderias, PDO::PARAM_INT);
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
