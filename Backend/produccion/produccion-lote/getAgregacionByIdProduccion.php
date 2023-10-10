<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// Verificamos si se ha enviado el parámetro "id" en la solicitud GET


$json = file_get_contents('php://input');
$data = json_decode($json, true);
$id = $data["id"];

if (isset($id)) {
    $result = [];
    // Verificamos que el valor recibido sea un número válido
    if (is_numeric($id)) {
        // Convertimos el ID a un número entero para asegurarnos de que sea un número válido
        $id = (int) $id;
        try {
            $result = getAgregations($pdo,$id);
            
        
        } catch (PDOException $e) {
            // Manejo de errores
            $message_error = "Error interno en la consulta de la base de datos.";
            $description_error = $e->getMessage();
        }
    } else {
        // Si el valor recibido no es un número válido, configuramos un mensaje de error
        $message_error = "Error: El parámetro 'id' debe ser un número válido.";
    }
} else {
    // Si no se ha enviado el parámetro "id", configuramos un mensaje de error
    $message_error = "Error: No se ha proporcionado el parámetro 'id'.";
}

// Retornamos el resultado o el mensaje de error
$return['message_error'] = $message_error;
$return['description_error'] = $description_error;
$return['result'] = $result;
echo json_encode($return);

function getAgregations($pdo,$idLotProdc){

    try {
    
            $row["detAgr"] = [];

            $sql_detalle_agregaciones_lote_produccion =
                "SELECT 
            pa.id,
            pa.idProdc,
            pa.idProdt,
            p.nomProd,
            me.simMed,
            pa.idAlm,
            al.nomAlm,
            pa.idProdAgrMot,
            pam.desProdAgrMot,
            pa.canProdAgr,
            pa.fecCreProdAgr,
            pa.fechaInicio,
            pa.fechaFin, 
            pa.flag
            FROM produccion_agregacion as pa
            JOIN producto as p ON p.id = pa.idProdt
            JOIN medida as me ON me.id =  p.idMed
            JOIN almacen as al ON al.id = pa.idAlm
            JOIN produccion_agregacion_motivo as pam ON pam.id = pa.idProdAgrMot
            WHERE pa.idProdc = ?
            order by pa.flag desc";

                $stmt_detalle_agregaciones_lote_produccion = $pdo->prepare($sql_detalle_agregaciones_lote_produccion);
                $stmt_detalle_agregaciones_lote_produccion->bindParam(1, $idLotProdc, PDO::PARAM_INT);
                $stmt_detalle_agregaciones_lote_produccion->execute();

                while ($row_detalle_agregacion_lote_produccion = $stmt_detalle_agregaciones_lote_produccion->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["detAgr"], $row_detalle_agregacion_lote_produccion);
                }
          
         return $row;

    } catch (PDOException $e) {
        $description_error = $e->getMessage();
        return $description_error;
    }
}
?>


