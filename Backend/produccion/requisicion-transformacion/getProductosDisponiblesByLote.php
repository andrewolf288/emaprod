<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = array();
$message_error = "";
$description_error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $idProdc = $data["idProdc"];
    $idAlmacenPrincipal = 1; // Almacen principal

    try {
        // primero buscamos las entradas por lote
        $sql_select_productos_disponibles =
            "SELECT 
            es.idProd, 
            p.nomProd, 
            es.canTotDis, 
            es.refProdc, 
            es.codLot 
        FROM entrada_stock AS es
        JOIN producto AS p ON p.id = es.idProd
        WHERE refProdc = ? AND canTotDis > 0 AND idAlm = ?";
        $stmt_select_productos_disponibles = $pdo->prepare($sql_select_productos_disponibles);
        $stmt_select_productos_disponibles->bindParam(1, $idProdc, PDO::PARAM_INT);
        $stmt_select_productos_disponibles->bindParam(2, $idAlmacenPrincipal, PDO::PARAM_INT);
        $stmt_select_productos_disponibles->execute();
        $rows_entradas_lote_produccion = $stmt_select_productos_disponibles->fetchAll(PDO::FETCH_ASSOC);

        // agrupamos las entradas
        $result_productos_finales = array();
        foreach ($rows_entradas_lote_produccion as $row_entrada) {
            $idProd = $row_entrada["idProd"];
            $canTotDis = $row_entrada["canTotDis"];

            // Buscamos si el idProd ya existe en el arreglo resultante
            $existingKey = array_search($idProd, array_column($result_productos_finales, 'idProd'));

            if ($existingKey !== false) {
                // Si existe, sumamos canTotDis
                $result_productos_finales[$existingKey]['canTotDis'] += $canTotDis;
            } else {
                // Si no existe, agregamos un nuevo objeto al arreglo resultante
                // $result_productos_finales[] = array("idProd" => $idProd, "canTotDis" => $canTotDis);
                $result_productos_finales[] = $row_entrada;
            }
        }

        // perfecto, ahora debemos traer la formulacion de este
        foreach ($result_productos_finales as &$row_producto) {
            $idProd = $row_producto["idProd"];
            $row_producto["detFor"] = array();

            $sql_select_formula =
                "SELECT id 
            FROM formula_producto_terminado
            WHERE idProdFin = ?";
            $stmt_select_formula = $pdo->prepare($sql_select_formula);
            $stmt_select_formula->bindParam(1, $idProd, PDO::PARAM_INT);
            $stmt_select_formula->execute();
            $row_formula = $stmt_select_formula->fetch(PDO::FETCH_ASSOC);

            $sql_select_formula_detalle =
                "SELECT 
                fptd.id, 
                fptd.idForProdFin, 
                fptd.idProd, 
                p.nomProd,
                me.simMed,
                fptd.idAre, 
                fptd.canForProDet
            FROM formula_producto_terminado_detalle AS fptd
            JOIN producto AS p ON p.id = idProd
            JOIN medida AS me ON p.idMed = me.id
            WHERE idForProdFin = ?";

            $stmt_select_formula_detalle = $pdo->prepare($sql_select_formula_detalle);
            $stmt_select_formula_detalle->bindParam(1, $row_formula["id"]);
            $stmt_select_formula_detalle->execute();
            $row_producto["detFor"] = $stmt_select_formula_detalle->fetchAll(PDO::FETCH_ASSOC);
        }
        $result = $result_productos_finales;
    } catch (PDOException $e) {
        $message_error = "ERROR EN LA CONEXIOON";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
