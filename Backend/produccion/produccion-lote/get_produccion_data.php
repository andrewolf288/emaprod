<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// Verificamos si se ha enviado el parámetro "id" en la solicitud GET
if (isset($_GET["id"])) {
    $id = $_GET["id"];

    // Verificamos que el valor recibido sea un número válido
    if (is_numeric($id)) {
        // Convertimos el ID a un número entero para asegurarnos de que sea un número válido
        $id = (int) $id;

        // Consulta SQL para obtener los datos de producción por ID
        $sqlProduccion = "SELECT pd.id,p.codProd,p.codProd2, pd.fecProdIniProg,pd.fecProdFinProg,pd.obsProd,pd.numop, pd.idProdt,
                        p.nomProd, pd.idProdEst, pe.desEstPro, pd.idProdTip, pt.desProdTip, pd.codLotProd, pd.klgLotProd, 
                        pd.canLotProd, pd.fecVenLotProd,pd.fecCreProd,
                        pd.totalUnidadesLoteProduccion,
                        pd.klgTotalLoteProduccion
                         FROM produccion pd
                         JOIN producto as p ON p.id = pd.idProdt
                         JOIN produccion_estado as pe ON pe.id = pd.idProdEst
                         JOIN produccion_tipo as pt ON pt.id = pd.idProdTip
                         WHERE pd.id = :id";

        // Consulta SQL para obtener los datos de las requisiciones por ID de producción
        $sqlRequisiciones = "SELECT r.id, r.idProdc, r.idReqEst, re.desReqEst, r.idAre, ar.desAre, r.fecPedReq, r.fecEntReq
                            FROM requisicion r
                            JOIN requisicion_estado as re ON re.id = r.idReqEst
                            JOIN area as ar ON ar.id = r.idAre
                            WHERE r.idProdc = :id
                            ORDER BY r.id ASC";

        $sqlListproducts = "SELECT ppf.id,pd.codProd,pd.codProd2, ppf.idProdcProdtFinEst, ppfe.desProProFinEst,ppf.idProdt, pd.nomProd, me.simMed, cl.desCla, ppf.canTotProgProdFin, ppf.canTotIngProdFin 
                            FROM produccion_producto_final ppf 
                            JOIN producto as pd on pd.id = ppf.idProdt 
                            JOIN medida as me on me.id = pd.idMed 
                            JOIN clase as cl on cl.id = pd.idCla 
                            JOIN produccion_producto_final_estado as ppfe on ppfe.id = ppf.idProdcProdtFinEst 
                            WHERE ppf.idProdc = :id";




        try {
            // Obtenemos los datos de producción por ID
            $stmtProduccion = $pdo->prepare($sqlProduccion);
            $stmtProduccion->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtProduccion->execute();
            $resultProduccion = $stmtProduccion->fetch(PDO::FETCH_ASSOC);

            // Obtenemos los datos de las requisiciones por ID de producción
            $stmtRequisiciones = $pdo->prepare($sqlRequisiciones);
            $stmtRequisiciones->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtRequisiciones->execute();
            $resultRequisiciones = $stmtRequisiciones->fetchAll(PDO::FETCH_ASSOC);

            // Obtenemos los detalles de cada requisición
            foreach ($resultRequisiciones as &$requisicion) {
                $idReq = $requisicion['id'];

                $sqlDetallesRequisicion =
                    "SELECT rd.id,p.codProd,p.codProd2, rd.idProdt, p.nomProd, me.simMed, rd.idReq, rd.idReqDetEst, rde.desReqDetEst, rd.canReqDet,
                rd.idProdFin as prodFCode
                FROM requisicion_detalle rd
                JOIN producto as p ON p.id = rd.idProdt
                JOIN medida as me ON me.id = p.idMed
                JOIN requisicion_detalle_estado as rde ON rde.id = rd.idReqDetEst
                WHERE rd.idReq = :idReq";

                $stmtDetallesRequisicion = $pdo->prepare($sqlDetallesRequisicion);
                $stmtDetallesRequisicion->bindParam(':idReq', $idReq, PDO::PARAM_INT);
                $stmtDetallesRequisicion->execute();
                $detallesRequisicion = $stmtDetallesRequisicion->fetchAll(PDO::FETCH_ASSOC);
                $requisicion['detalles'] = $detallesRequisicion;

                //$sqlDetallesRequisicionWithPF = "SELECT  rd.id, proF.id as id_prod_final,p.codProd,p.codProd2, rd.idProdt, p.nomProd, me.simMed, rd.idReq, rd.idReqDetEst, rde.desReqDetEst, rd.canReqDet
                //FROM requisicion_detalle rd
                //JOIN producto as p ON p.id = rd.idProdt
                //JOIN medida as me ON me.id = p.idMed
                //JOIN requisicion_detalle_estado as rde ON rde.id = rd.idReqDetEst
                //JOIN requisicion as r ON r.id = rd.idReq
                //JOIN produccion as pro ON pro.id = r.idProdc
                //JOIN produccion_producto_final as proF ON proF.idProdc = pro.id
                //WHERE rd.idReq = :idReq";
                //$stmtDetallesRequisicion = $pdo->prepare($sqlDetallesRequisicionWithPF);
                //$stmtDetallesRequisicion->bindParam(':idReq', $idReq, PDO::PARAM_INT);
                //$stmtDetallesRequisicion->execute();
                //$detallesRequisicion = $stmtDetallesRequisicion->fetchAll(PDO::FETCH_ASSOC);
                //$requisicion['detalles-copia'] = $detallesRequisicion;

            }

            // Preparamos la respuesta con los datos de producción y las requisiciones con sus detalles
            //$result["produccion"] = $resultProduccion;
            //$result["requisiciones"] = $resultRequisiciones;
            $stmtListproducts = $pdo->prepare($sqlListproducts);
            $stmtListproducts->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtListproducts->execute();
            $resultListproducts = $stmtListproducts->fetchAll(PDO::FETCH_ASSOC);

            // Agregamos los datos de sqlListproducts al resultado final con la clave "productos_finales"
            $result["productos_finales"] = $resultListproducts;

            // Preparamos la respuesta con los datos de producción, las requisiciones con sus detalles y los productos finales
            $result["produccion"] = $resultProduccion;
            $result["requisiciones"] = $resultRequisiciones;
            // $result["agregaciones"] = getAgregationsByOrderProdc($pdo, $id);;
            // $result["prodFinalWithAgreg"] = agregWithProdFinal($pdo, $id);;
            //$result["AllAgregations"] = AllAgregations($pdo);


        } catch (PDOException $e) {
            // Manejo de errores
            $message_error = "Error interno en la consulta de la base de datos.";
            $description_error = $e->getMessage();
        }
    } else {

        // $result["AllAgregations"] = AllAgregations($pdo);
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


function AllAgregations($pdo)
{

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
            pa.flag, 
            pd.id as idProdc , 
            pd.numop,
            concat(pd.numop, ' - ', pa.flag) as codigoAgreg

            FROM produccion_agregacion as pa
            JOIN producto as p ON p.id = pa.idProdt
            JOIN medida as me ON me.id =  p.idMed
            JOIN almacen as al ON al.id = pa.idAlm
            JOIN produccion as pd ON pd.id = pa.idProdc
            LEFT JOIN produccion_agregacion_motivo as pam ON pam.id = pa.idProdAgrMot
            ORDER BY pa.id asc";

        $stmt_detalle_agregaciones_lote_produccion = $pdo->prepare($sql_detalle_agregaciones_lote_produccion);
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

function getAgregationsByOrderProdc($pdo, $idLotProdc)
{

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
            pa.fechaFin,pa.flag, p.codProd2
            FROM produccion_agregacion as pa
            JOIN producto as p ON p.id = pa.idProdt
            JOIN medida as me ON me.id =  p.idMed
            JOIN almacen as al ON al.id = pa.idAlm
            LEFT JOIN produccion_agregacion_motivo as pam ON pam.id = pa.idProdAgrMot
            WHERE pa.idProdc = ?";

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


function agregWithProdFinal($pdo, $idLotProdc)
{

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
            pa.fechaFin,pa.flag,
            pf.id as idProdFin
            FROM produccion_agregacion as pa
            JOIN producto as p ON p.id = pa.idProdt
            JOIN medida as me ON me.id =  p.idMed
            JOIN almacen as al ON al.id = pa.idAlm
            LEFT JOIN produccion_agregacion_motivo as pam ON pam.id = pa.idProdAgrMot
            RIGHT JOIN produccion_producto_final as pf ON pf.id = pa.idProdFin
            WHERE pf.idProdc = ?";

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
