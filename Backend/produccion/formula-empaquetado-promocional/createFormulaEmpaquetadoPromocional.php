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

    $idProdt = $data["idProdt"];
    $nomForEmpProm = $data["nomForEmpProm"];
    $desForEmpProm = $data["desForEmpProm"];
    $detProdFinForEmpProm = $data["detProdFinForEmpProm"];
    $detReqMatForEmpProm = $data["detReqMatForEmpProm"];
    $idLastInsertion = 0;

    if ($pdo) {
        try {
            $pdo->beginTransaction();
            // insertamos la formula de empaquetado promocional
            $sql_create_formula_empaquetado_promocional = 
            "INSERT INTO formula_empaquetado_promocional
            (idProdt, nomForEmpProm, desForEmpProm)
            VALUES(?, ?, ?)";
            $stmt_create_formula_empaquetado_promocional = $pdo->prepare($sql_create_formula_empaquetado_promocional);
            $stmt_create_formula_empaquetado_promocional->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_create_formula_empaquetado_promocional->bindParam(2, $nomForEmpProm, PDO::PARAM_STR);
            $stmt_create_formula_empaquetado_promocional->bindParam(3, $desForEmpProm, PDO::PARAM_STR);
            $stmt_create_formula_empaquetado_promocional->execute();
            $idLastInsertion = $pdo->lastInsertId();
    
            // ASOCIAMOS LOS PRODUCTOS FINALES A LA FORMULACION DE COMBO
            foreach($detProdFinForEmpProm as $detalleProductoFinal){
                $idProdt = $detalleProductoFinal["id"];
                $canProdFinFor = $detalleProductoFinal["canProdFinFor"];
    
                $sql_create_detalle_productos_finales = 
                "INSERT INTO formula_empaquetado_promocional_detalle
                (idForEmpProm, idProdt, canEmpPromDet)
                VALUES(?, ?, $canProdFinFor)";
                $stmt_create_detalle_productos_finales = $pdo->prepare($sql_create_detalle_productos_finales);
                $stmt_create_detalle_productos_finales->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                $stmt_create_detalle_productos_finales->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_create_detalle_productos_finales->execute();
            }
    
            // ASOCIAMOS LA REQUESICION DE MATERIALES A LA FORMULACION
            foreach($detReqMatForEmpProm as $detalleMaterial){
                $idProdt = $detalleMaterial["id"];
                $canMatReqFor = $detalleMaterial["canMatReqFor"];
    
                $sql_create_detalle_materiales_requisicion = 
                "INSERT INTO formula_empaquetado_promocional_requisicion
                (idForEmpProm, idProdt, canForEmpPromReq)
                VALUES(?, ?, $canMatReqFor)";
                $stmt_create_detalle_materiales_requisicion = $pdo->prepare($sql_create_detalle_materiales_requisicion);
                $stmt_create_detalle_materiales_requisicion->bindParam(1, $idLastInsertion, PDO::PARAM_INT);
                $stmt_create_detalle_materiales_requisicion->bindParam(2, $idProdt, PDO::PARAM_INT);
                $stmt_create_detalle_materiales_requisicion->execute();
            }
            $pdo->commit();
        } catch(PDOException $e){
            $pdo->rollBack();
            $message_error = "Error en la operacion";
            $description_error = $e->getMessage();
        }

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
