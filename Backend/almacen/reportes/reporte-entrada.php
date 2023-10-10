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

    // FILTROS DE MATERIA PRIMA
    $filterMateriaPrima = $data["filterMateriaPrima"];
    $filterDataMateriaPrima = $filterMateriaPrima["materiaPrima"];
    $filterDataCategoriaMateriaPrima = $filterMateriaPrima["categoriaMateriaPrima"];

    // FILTROS DE FECHA
    $filterFecha = $data["filterFecha"];
    $fechaFin = ""; // fecha fin
    $fechaInicio = ""; // fecha inicio
    if (empty($filterFecha["fechaFin"])) {
        $fechaFin = date("Y-m-d");
    } else {
        // obtenemos solo la fecha para el filtro
        $fechaFin = explode(" ", $filterFecha["fechaFin"])[0];
    }

    if (!empty($filterFecha["fechaInicio"])) {
        $fechaInicio = explode(" ", $filterFecha["fechaInicio"])[0];
    }

    // FILTROS DE PROVEEDOR
    $filterProveedor = $data["filterProveedor"];

    // FILTROS DE ENTRADA
    $filterEntrada = $data["filterEntrada"];
    $estadoEntrada = $filterEntrada["estado"];

    if ($pdo) {
        // $sql =
        try {
            $sql =
                "SELECT 
                e.id,
                e.idMatPri,
                mp.nomMatPri,
                e.idPro,
                p.nomPro,
                e.idEntStoEst,
                ese.desEntStoEst,
                e.codEntSto,
                e.esSel,
                e.canSel,
                e.canPorSel,
                e.merTot,
                e.canTotEnt,
                e.canTotDis,
                e.docEntSto,
                DATE(e.fecEntSto) AS fecEntSto
                FROM entrada_stock e 
                JOIN materia_prima mp ON mp.id = e.idMatPri
                JOIN proveedor p ON p.id = e.idPro
                JOIN entrada_stock_estado ese ON ese.id = e.idEntStoEst
                WHERE ";

            // filtros de fecha
            if (empty($fechaInicio)) {
                $sql .= "DATE(fecEntSto) = '$fechaFin' ";
            } else {
                $sql .= "DATE(fecEntSto) BETWEEN '$fechaInicio' AND '$fechaFin' ";
            }

            // filtros de estado
            if ($estadoEntrada != 0) {
                $sql .= "AND idEntStoEst = $estadoEntrada ";
            }

            //filtros de materia prima
            if (!empty($filterDataMateriaPrima)) {
                $sql .= "AND (";
                foreach ($filterDataMateriaPrima as $item) {
                    $sql .= ('idMatPri = ' . $item["id"] . ' OR ');
                }
                $sql = substr($sql, 0, -3);
                $sql .= ") ";
            }

            //filtros de proveedor
            if (!empty($filterProveedor)) {
                $sql .= "AND (";
                foreach ($filterProveedor as $item) {
                    $sql .= ('idPro = ' . $item["id"] . ' OR ');
                }
                $sql = substr($sql, 0, -3);
                $sql .= ") ";
            }

            // IMPRIMIMOS LA SENTENCIA (descomentar para verificar)
            // echo $sql;

            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($result, $row);
            }
        } catch (PDOException $e) {
            echo $e;
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
