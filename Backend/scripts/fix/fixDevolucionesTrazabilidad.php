<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // primero llamamos al detalle de la requisicion de devolucion
    $motivoDesmedro = 2;
    $sql_select_devolucion_detalle =
        "SELECT 
        rdd.id, 
        rdd.idReqDev,
        rdd.idProdt,
        rdd.idMotDev,
        rdd.canReqDevDet,
        rdd.esComReqDevDet,
        rdd.fecCreReqDevDet,
        rdd.fecActReqDevDet,
        rdd.estReg,
        rd.idProdFin,
        rd.idProdc
        FROM requisicion_devolucion_detalle AS rdd
        JOIN requisicion_devolucion AS rd ON rd.id = rdd.idReqDev
    WHERE idMotDev <> ?";
    $stmt_select_devolucion_detalle = $pdo->prepare($sql_select_devolucion_detalle);
    $stmt_select_devolucion_detalle->bindParam(1, $motivoDesmedro, PDO::PARAM_INT);
    $stmt_select_devolucion_detalle->execute();

    try {
        $pdo->beginTransaction();
        while ($row_detalle_devolucion = $stmt_select_devolucion_detalle->fetch(PDO::FETCH_ASSOC)) {
            $idProdt = $row_detalle_devolucion["idProdt"]; // producto
            $idProdFin = $row_detalle_devolucion["idProdFin"]; // referencia la producto final de produccion id
            $idProdc = $row_detalle_devolucion["idProdc"]; // lote produccion
            $canProdDev = floatval($row_detalle_devolucion["canReqDevDet"]); // cantidad devuelta
            $idReqDev = $row_detalle_devolucion["idReqDev"]; // id de requisicion de devolucion
            $idReqDevDet = $row_detalle_devolucion["id"]; // id de requisicion devolucion detalle

            $salidasEmpleadas = []; // salidas empleadas
            /*
            Primero debemos identificar que entradas fueron utilizadas para
            cumplir con la requisicion del producto a devolver:
    
            1. Primero recorro las requisicion con idProdc
            2. Recorro las salidas de stock del idReq donde idProdt = ?
            3. Obtengo las salidas utilizadas para cumplir con idProdt = ?
            4. La devolucion tiene que ir a la ultima entrada utilizada porque se supone que el uso se hace de manera secuencial en el FIFO
            5. Creamos cada registro para la trazabilidad
            6. Fin del algoritmo
            */

            // primero debemos identificar si el producto final no fue programado
            $esProdcProdtProg = 1;

            $sql_select_presentacion_final =
                "SELECT esProdcProdtProg 
                FROM produccion_producto_final
                WHERE id = ?";
            $stmt_select_presentacion_final = $pdo->prepare($sql_select_presentacion_final);
            $stmt_select_presentacion_final->bindParam(1, $idProdFin, PDO::PARAM_INT);
            $stmt_select_presentacion_final->execute();

            $row_select = $stmt_select_presentacion_final->fetch(PDO::FETCH_ASSOC);
            if ($row_select !== false) {
                // Comprueba si es true o false (asumiendo que es un booleano en la base de datos)
                if ($row_select['esProdcProdtProg'] == 0) {
                    $esProdcProdtProg = 0;
                }
            }

            // debemos formar un sql adecuado para cada ocasion
            /*
                    1. si el producto final fue algo programado, su requisicion se encuentra en requisicon
                    2. si el producto final no fue programado y fue agregado se encuentra en requisicion agregacion
                */
            $sql_salidas_empleadas_requisicion_detalle = "";

            // si fue un producto programado
            if ($esProdcProdtProg == 1) {
                $sql_salidas_empleadas_requisicion_detalle =
                    "SELECT * FROM salida_stock st
                    JOIN requisicion AS r ON r.id = st.idReq
                    WHERE st.idProdt = ? AND r.idProdc = ?
                    ORDER BY idEntSto DESC";
            }

            // si no fue un producto programado
            else {
                $sql_salidas_empleadas_requisicion_detalle =
                    "SELECT * FROM salida_stock st
                    JOIN requisicion_agregacion AS ra ON ra.id = st.idAgre
                    WHERE st.idProdt = ? AND ra.idProdc = ?
                    ORDER BY idEntSto DESC";
            }

            $stmt_salidas_empleadas_requisicion_detalle = $pdo->prepare($sql_salidas_empleadas_requisicion_detalle);
            $stmt_salidas_empleadas_requisicion_detalle->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_salidas_empleadas_requisicion_detalle->bindParam(2, $idProdc, PDO::PARAM_INT);
            $stmt_salidas_empleadas_requisicion_detalle->execute();

            // recorremos las salidas y las ingresamos en las salidas utilizadas
            if ($stmt_salidas_empleadas_requisicion_detalle->rowCount() != 0) {
                $salidasEmpleadas = $stmt_salidas_empleadas_requisicion_detalle->fetchAll(PDO::FETCH_ASSOC);

                $cantidadAdevolver = $canProdDev; // acumulado
                $cantSalPorIteracion = 0; // cantidad auxiliar
                $idEntStoEst = 1; // estado de disponible de entrada

                // ahora recorremos las salidas
                foreach ($salidasEmpleadas as $value) {
                    $idEntSto = $value["idEntSto"]; // entrada
                    $canSalStoReq = $value["canSalStoReq"]; // cantidad

                    if ($cantidadAdevolver >= $canSalStoReq) {
                        $cantidadAdevolver -= $canSalStoReq;
                        $cantSalPorIteracion = $canSalStoReq;
                    } else {
                        $cantSalPorIteracion = $cantidadAdevolver;
                        $cantidadAdevolver = 0;
                    }

                    $sql_update_entrada_stock =
                        "UPDATE entrada_stock
                        SET canTotDis = canTotDis + $cantSalPorIteracion, idEntStoEst = ?
                        WHERE id = ?";

                    $stmt_update_entrada_stock = $pdo->prepare($sql_update_entrada_stock);
                    $stmt_update_entrada_stock->bindParam(1, $idEntStoEst, PDO::PARAM_INT);
                    $stmt_update_entrada_stock->bindParam(2, $idEntSto, PDO::PARAM_INT);
                    $stmt_update_entrada_stock->execute();

                    $sql_insert_trazabilidad_devolucion_entrada =
                        "INSERT INTO trazabilidad_devolucion_entrada
                        (idReqDevDet, idEntSto, canReqDevDet)
                        VALUES(?, ?, $cantSalPorIteracion)";
                    $stmt_insert_trazabilidad_devolucion_entrada = $pdo->prepare($sql_insert_trazabilidad_devolucion_entrada);
                    $stmt_insert_trazabilidad_devolucion_entrada->bindParam(1, $idReqDevDet, PDO::PARAM_INT);
                    $stmt_insert_trazabilidad_devolucion_entrada->bindParam(2, $idEntSto, PDO::PARAM_INT);
                    $stmt_insert_trazabilidad_devolucion_entrada->execute();

                    if ($cantidadAdevolver == 0) {
                        break;
                    }
                }
            } else {
                $message_error = "No se genero las salidas del producto";
                $description_error = $description_error . "No se generaron las salidas del producto de su requisicion: $idProdt" . "\n";
            }
        }

        $pdo->commit();
    } catch (PDOException $e) {
        $pdo->rollBack();
        $message_error = "HUBO UN PROBLEMA";
        $description_error = $e->getMessage();
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
