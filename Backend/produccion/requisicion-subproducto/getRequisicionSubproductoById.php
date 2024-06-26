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

    $idReq = $data["idReq"];

    if($pdo){
        $sql_select_requisicion_subproducto =
            "SELECT
        r.id,
        r.idReqEst,
        r.idProdt,
        r.idAre,
        a.desAre,
        r.codLotProd,
        r.cantProg AS canLotProd,
        re.desReqEst,
        p.nomProd,
        p.idMed,
        me.simMed,
        p.idCla,
        cl.desCla,
        p.idSubCla,
        sc.desSubCla,
        r.fecPedReq,
        r.fecEntReq,
        r.codReq
        FROM requisicion r
        JOIN producto AS p ON p.id = r.idProdt
        JOIN medida AS me ON me.id = p.idMed
        JOIN clase AS cl ON cl.id = p.idCla
        JOIN sub_clase AS sc ON sc.id = p.idSubCla
        JOIN area AS a ON a.id = r.idAre
        JOIN requisicion_estado AS re ON re.id = r.idReqEst
        WHERE r.id = ? ORDER BY r.fecPedReq DESC";
        $stmt_select_requisicion_subproducto = $pdo->prepare($sql_select_requisicion_subproducto);
        $stmt_select_requisicion_subproducto->bindParam(1, $idReq, PDO::PARAM_INT);
        $stmt_select_requisicion_subproducto->execute();
    
        $row_requisicion_subproducto = $stmt_select_requisicion_subproducto->fetch(PDO::FETCH_ASSOC);
    
        $sql_ingresos_requisicion_subproducto =
            "SELECT
        ris.id,
        ris.idReq,
        ris.idProdt,
        p.nomProd,
        p.codProd2,
        ris.canProdIng,
        ris.fecProdIng,
        ris.fecProdVen,
        ris.fecProdReqIngAlm,
        ris.esComReqProdIng
        FROM requisicion_ingreso_subproducto AS ris
        JOIN producto AS p ON p.id = ris.idProdt
        WHERE ris.idReq = ?";
        $stmt_ingresos_requisicion_subproducto = $pdo->prepare($sql_ingresos_requisicion_subproducto);
        $stmt_ingresos_requisicion_subproducto->bindParam(1, $idReq, PDO::PARAM_INT);
        $stmt_ingresos_requisicion_subproducto->execute();
        $row_requisicion_subproducto["detIng"] = $stmt_ingresos_requisicion_subproducto->fetchAll(PDO::FETCH_ASSOC);
    
        $result = $row_requisicion_subproducto;
    } else {
        $message_error = "No se pudo conectar con la base de datos";
        $description_error = "No se pudo conectar con la base de datos";
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
