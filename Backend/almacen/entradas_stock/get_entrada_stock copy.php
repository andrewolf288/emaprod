<?php

require('../../common/conexion.php');
require_once('../../common/utils.php');
include_once "../../common/cors.php";

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdo) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $fechasMes = getStartEndDateNow();
        $fechaInicio = $fechasMes[0]; // inicio del mes
        $fechaFin = $fechasMes[1]; // fin del mes

        if (isset($data)) {
            if (!empty($data["fecEntIniSto"])) {
                $fechaInicio = $data["fecEntIniSto"];
            }
            if (!empty($data["fecEntFinSto"])) {
                $fechaFin = $data["fecEntFinSto"];
            }
        }
        $almacen = $data["almacen"];
        $codigo = $data["codigo"];
        $disponible = $data["disponible"];
        $documento = $data["documento"];
        $ingresado = $data["ingresado"];
        $merTot = $data["merTot"];
        $producto = $data["producto"];
        $provedor = $data["provedor"];
        $seleccion = $data["seleccion"];
        $tipoEntrada = $data["tipoEntrada"];

        //select
        //(@row_num:=@row_num +1) AS num1 
        //from
        //entrada_stock,
        //(select @row_num:=0) AS s;

        //die(json_encode($data));

        $sql =
            "SELECT
            (@row_num := @row_num +1) AS rowEnt,
            es.idProd,
            p.nomProd,
            es.idProv,
            CONCAT(pv.nomProv, ' ', pv.apeProv) AS nomProv,
            es.idEntStoEst,
            ese.desEntStoEst,
            es.idAlm,
            a.nomAlm,
            es.codEntSto,
            es.esSel,
            es.canTotEnt,
            es.canTotDis,
            es.fecEntSto,
            DATE(es.fecVenEntSto) AS fecVenEntSto,
            es.referencia,
            es.docEntSto,
            es.id as idEntStock,
            es.fecCreEntSto, 
            es.merTot,
            es.canVar, 
            es.codLot,
            es.esMol,
            es.esFre,
            es.prestProdt,
            es.certCal,
            es.lotProv,
            es.resbEval,
            es.fecProduccion,
            es.humedad
            FROM
            (
            SELECT
            @row_num := 0
            ) AS s,
            entrada_stock es
            JOIN producto p ON
            p.id = es.idProd
            LEFT JOIN proveedor pv ON
            pv.id = es.idProv
            JOIN entrada_stock_estado ese ON
            ese.id = es.idEntStoEst
            JOIN almacen a ON
            a.id = es.idAlm  
            WHERE 

            

           ( ( ('$tipoEntrada' = 'TODO' ) 
            or ('$tipoEntrada' = 'COMPRAS' and (es.referencia = 0 and es.esSel = 0) ) 
            or ('$tipoEntrada' = 'PRODT. FINAL' and (es.referencia > 1  ) ) 
            or ('$tipoEntrada' = 'PRODT. SELECCION' and (es.esSel = 1  ) ) 
            or ('$tipoEntrada' = 'PRODT. MOLIENDA' and (es.esMol = 1  ) ) 
            or ('$tipoEntrada' = 'PRODT. FRESCOS' and (es.esFre = 1  )  ) 
            
            and (DATE(fecEntSto) BETWEEN '$fechaInicio' AND '$fechaFin') ) )
            and a.nomAlm like '%$almacen%'
            and es.codEntSto like '%$codigo%'
            and es.canTotDis like '%$disponible%'
            and es.docEntSto like '%$documento%'
            and es.canTotEnt like '%$ingresado%'
            and es.merTot like '%$merTot%'
            and (p.nomProd like '%$producto%' or '$producto' = '' )
            and (CONCAT(pv.nomProv, ' ', pv.apeProv) like '%$provedor%' or '$provedor' = '' )
      
            ORDER BY `es`.`fecEntSto` DESC";

        //CASE '$tipoEntrada'
        //WHEN 'TODO' THEN true
        //WHEN 'COMPRAS' THEN true
        //ELSE false
        //END 

        //('$tipoEntrada' = 'TODO' ) 
        //or ($tipoEntrada = 'COMPRAS' ) 
        //and (es.referencia = 0 and data.esSel == 0)

        //if (inputs.tipoEntrada == "PRODT. FINAL" && data.referencia) {
        //    return true;
        //}
        // if (inputs.tipoEntrada == "PRODT. SELECCION" && data.esSel) {
        //   return true;
        //}
        //if (inputs.tipoEntrada == "PRODT. MOLIENDA" && data.esMol) {
        //    return true;
        //  }
        //  if (inputs.tipoEntrada == "PRODT. FRESCOS" && data.esFre) {
        //    return true;
        //  }

        //data.referencia == 0 &&
        //data.esSel == 0

        //and   CONCAT(pv.nomProv, ' ', pv.apeProv)  = $provedor
        #and like (CASE WHEN $producto = '' THEN '%$producto%' ELSE '$producto' END) 

        // CASE WHEN $producto = '' THEN '%$producto%' ELSE $producto' END` 
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute(); // ejecutamos
            // Recorremos los resultados
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

                $row["devoluciones"] = [];
                $row["salidasProduccion"] = [];
                $row["salidasSeleccion"] = [];

                $idEntStock = $row["idEntStock"];
                $row = getDevoluciones($pdo, $idEntStock, $row);
                $row = getSalidasProduccion($pdo, $idEntStock, $row);
                $row = getSalidasSeleccion($pdo, $idEntStock, $row);
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
function getSalidasSeleccion($pdo, $idEntStock, $row)
{
    $sql_salida_stock =
        "SELECT st.id, es.id , es.codEntSto,  st.idReqSel, st.idMatPri,   st.idEntSto,st.idMatPri, p.id as idProdt, 
        p.codProd2,  p.nomProd,st.canSalStoReqSel, st.canEntStoReqSel, st.merReqSel, st.fecSalStoReqSel, st.fecEntStoReqSel
        FROM entrada_stock as es
        join salida_entrada_seleccion st on st.idEntSto =  es.id
        join producto p on p.id = st.idMatPri
        WHERE es.id = ?";

    try {
        $stmt = $pdo->prepare($sql_salida_stock);
        $stmt->bindParam(1, $idEntStock, PDO::PARAM_INT);
        $stmt->execute();

        while ($row_salida_stock = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($row["salidasSeleccion"], $row_salida_stock);
        }
    } catch (PDOException $e) {
        $description_error = $e->getMessage();
        $row["salidasSeleccion"] = $description_error;
    }
    return $row;
}

function getSalidasProduccion($pdo, $idEntStock, $row)
{
    $sql_salida_stock =
        "SELECT st.id, es.id , es.codEntSto,  st.idReq, st.idAgre, st.numop,  es.idProd, es.idAlm, st.idEntSto, st.idProdt, codProd2, st.idAlm, al.nomAlm, p.nomProd, st.canSalStoReq, st.fecSalStoReq
        FROM entrada_stock as es
        join salida_stock st on st.idEntSto =  es.id
        join almacen al on al.id = st.idAlm
        join producto p on p.id = st.idProdt
        WHERE es.id = ?";

    try {
        $stmt = $pdo->prepare($sql_salida_stock);
        $stmt->bindParam(1, $idEntStock, PDO::PARAM_INT);
        $stmt->execute();

        while ($row_salida_stock = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($row["salidasProduccion"], $row_salida_stock);
        }
    } catch (PDOException $e) {
        $description_error = $e->getMessage();
        $row["salidasProduccion"] = $description_error;
    }
    return $row;
}


function getDevoluciones($pdo, $idEntStock, $row)
{
    $sql_detalle_devoluciones =
        "SELECT es.id as idEntStock , es.canTotDis, pdt.idProdDev, pdt.idEntSto, pdt.canProdDevTra , p.nomProd, pdt.fecCreProdDevTra
        FROM entrada_stock  as es 
        join producto_devolucion_trazabilidad as pdt  
        on pdt.idEntSto = es.id
        JOIN produccion_devolucion pd ON pd.id = pdt.idProdDev
        JOIN producto p ON p.id = pd.idProdt
        WHERE es.id = ?";

    try {
        $stmt_detalle_devoluciones = $pdo->prepare($sql_detalle_devoluciones);
        $stmt_detalle_devoluciones->bindParam(1, $idEntStock, PDO::PARAM_INT);
        $stmt_detalle_devoluciones->execute();

        while ($row_devolucion = $stmt_detalle_devoluciones->fetch(PDO::FETCH_ASSOC)) {
            array_push($row["devoluciones"], $row_devolucion);
        }
    } catch (PDOException $e) {
        $description_error = $e->getMessage();
        $row["devoluciones"] = $description_error;
    }
    return $row;
}
