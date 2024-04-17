<?php
// CON ESTE SCRIPT DEBEMOS TRAER LA INFORMACION DE LA OPERACION DEVOLUCION CALIDAD POR ID
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

    $idProdt = $data["idProdt"]; // producto
    $codLotProd = $data["codLotProd"];
    $fecProdIni = $data["fecProdIni"];
    $fecVenLotProd = $data["fecVenLotProd"];
    $creacionAutomatica = $data["creacionAutomatica"];
    $sensibleMes = $data["sensibleMes"];
    $formatCodLotProd = strlen($codLotProd) === 3 ? $codLotProd : STR_PAD($codLotProd, 3, "0", STR_PAD_LEFT);
    $year = "";
    $month = "";
    $flagTypeDate = "";

    // debemos comprobar que fecha ha sido proporcionada
    if (!empty($fecProdIni)) {
        $year = date('Y', strtotime($fecProdIni));
        $month = date('m', strtotime($fecProdIni));
        $flagTypeDate = "I";
    }

    if (!empty($fecVenLotProd)) {
        $year = date('Y', strtotime($fecVenLotProd));
        $month = date('m', strtotime($fecVenLotProd));
        $flagTypeDate = "V";
    }

    // ahora debemos hacer la respectiva búsqueda
    $sql_consult_produccion =
        "SELECT * FROM produccion
    WHERE codLotProd = ? AND";

    if ($flagTypeDate == "I") {
        $sql_consult_produccion .= " YEAR(fecProdIni) = '$year'";
        if ($sensibleMes) {
            $sql_consult_produccion .= " AND MONTH(fecProdIni) = '$month'";
        }
    }
    if ($flagTypeDate == "V") {
        $sql_consult_produccion .= " YEAR(fecVenLotProd) = '$year'";
        if ($sensibleMes) {
            $sql_consult_produccion .= " AND MONTH(fecVenLotProd) = '$month'";
        }
    }

    $stmt_consult_produccion = $pdo->prepare($sql_consult_produccion);
    $stmt_consult_produccion->bindParam(1, $formatCodLotProd, PDO::PARAM_STR);
    $stmt_consult_produccion->execute();
    $row_produccion = $stmt_consult_produccion->fetch(PDO::FETCH_ASSOC);

    // SI EXISTE LA PRODUCCION
    if ($row_produccion) {
        $result = $row_produccion;
    } else {
        // SI HA ELEGIDO CREAR AUTOMATICAMENTE
        if ($creacionAutomatica) {
            try {
                $pdo->beginTransaction();
                // consultamos las caracteristicas del producto final
                $sql_select_producto =
                    "SELECT id, proRef 
                FROM producto
                WHERE id = ?";
                $stmt_select_producto = $pdo->prepare($sql_select_producto);
                $stmt_select_producto->bindParam(1, $idProdt, PDO::PARAM_INT);
                $stmt_select_producto->execute();
                $row_producto = $stmt_select_producto->fetch(PDO::FETCH_ASSOC);

                // si no existe la referencia de producto intermedio lanzamos error
                if ($row_producto["proRef"] == 0 || $row_producto["proRef"] == null) {
                    $message_error = "Error en los datos";
                    $description_error = "El producto final no esta asociado a un producto intermedio. Revisar con sistemas";
                } else {
                    $idProdInt = $row_producto["proRef"];
                    // traemos informacion del subproducto
                    $sql_consult_producto_intermedio =
                        "SELECT idSubCla FROM producto WHERE id = ?";
                    $stmt_consult_producto_intermedio = $pdo->prepare($sql_consult_producto_intermedio);
                    $stmt_consult_producto_intermedio->bindParam(1, $idProdInt, PDO::PARAM_INT);
                    $stmt_consult_producto_intermedio->execute();
                    $row_producto_intermedio = $stmt_consult_producto_intermedio->fetch(PDO::FETCH_ASSOC);
                    // extraemos la informacion correspondiente
                    $idLastInsertion = 0;
                    $idSubClaProdt = $row_producto_intermedio["idSubCla"];
                    $idProdEst = 6; // produccion terminada
                    $idProdTip = 6; // de tipo envasado y encajado
                    $idProdFinProgEst = 1;
                    $idProdIniProgEst = 1;
                    $obsProd = "CREADO POR REPROCESO";
                    $fecProdIniNew = strlen($fecProdIni) != 0 ? $fecProdIni : obtenerFechaLoteProduccion("DISMINUIR", $fecVenLotProd, $idSubClaProdt);
                    $fecVenLotProdNew = strlen($fecVenLotProd) != 0 ? $fecVenLotProd : obtenerFechaLoteProduccion("AUMENTAR", $fecProdIni, $idSubClaProdt);
                    $totalUnidadesLoteProduccion = 0;
                    $klgTotalLoteProduccion = 0;

                    $sql_create_produccion =
                        "INSERT INTO produccion
                    (idProdt, 
                    idProdEst, 
                    idProdTip, 
                    idProdFinProgEst, 
                    idProdIniProgEst, 
                    codLotProd, 
                    obsProd,
                    fecProdIni,
                    fecVenLotProd,
                    totalUnidadesLoteProduccion,
                    klgTotalLoteProduccion)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt_create_produccion = $pdo->prepare($sql_create_produccion);
                    $stmt_create_produccion->bindParam(1, $idProdInt, PDO::PARAM_INT);
                    $stmt_create_produccion->bindParam(2, $idProdEst, PDO::PARAM_INT);
                    $stmt_create_produccion->bindParam(3, $idProdTip, PDO::PARAM_INT);
                    $stmt_create_produccion->bindParam(4, $idProdFinProgEst, PDO::PARAM_INT);
                    $stmt_create_produccion->bindParam(5, $idProdIniProgEst, PDO::PARAM_INT);
                    $stmt_create_produccion->bindParam(6, $formatCodLotProd, PDO::PARAM_STR);
                    $stmt_create_produccion->bindParam(7, $obsProd, PDO::PARAM_STR);
                    $stmt_create_produccion->bindParam(8, $fecProdIniNew, PDO::PARAM_STR);
                    $stmt_create_produccion->bindParam(9, $fecVenLotProdNew, PDO::PARAM_STR);
                    $stmt_create_produccion->bindParam(10, $totalUnidadesLoteProduccion, PDO::PARAM_INT);
                    $stmt_create_produccion->bindParam(11, $klgTotalLoteProduccion, PDO::PARAM_INT);
                    $stmt_create_produccion->execute();

                    $idLastInsertion = $pdo->lastInsertId();
                    $formatDataCreated = array(
                        "id" => $idLastInsertion,
                        "idProdt" => $idProdInt,
                        "idProdEst" => $idProdEst,
                        "idProdTip" => $idProdTip,
                        "idProdFinProgEst" => $idProdFinProgEst,
                        "idProdIniProgEst" => $idProdIniProgEst,
                        "codLotProd" => $formatCodLotProd,
                        "obsProd" => $obsProd,
                        "fecProdIni" => $fecProdIniNew,
                        "fecVenLotProd" => $fecVenLotProdNew,
                    );

                    $result = $formatDataCreated;
                }

                $pdo->commit();
            } catch (PDOException $e) {
                $pdo->rollBack();
                $message_error = "Error al crear";
                $description_error = "Ocurrio un error al intentar crear el lote de produccion";
            }
        } else {
            $message_error = "No se encontro";
            $description_error = "No se encontro un lote de producción con los datos proporcionados";
        }
    }

    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}

function obtenerFechaLoteProduccion($action, $date, $idSubCla)
{
    $fecha_objeto = new DateTime($date);
    $cantidad_anios = $idSubCla == 50 ? 1 : 4;
    $cantidad_anios = $action == "DISMINUIR" ? -$cantidad_anios : $cantidad_anios;
    $fecha_objeto->modify("$cantidad_anios years");
    return $fecha_objeto->format('Y-m-d H:i:s');
}
