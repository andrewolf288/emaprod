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

    // OBTENEMOS LOS DATOS
    //$idReq = $data["idReq"]; // requisicion
    //$idReqDet = $data["id"]; // requisicion detalle
    $idProdt = $data["idProdt"]; // producto (materia prima, material, insumo, etc)
    // $idAlm = $data["idAlm"]; // almacen de la transferencia (A. Principal --> A. Correspondiente)
    //$idAre = $data["idAre"]; // area
    $idAlm = 6; // almacen transitorio
    //$idAlmDes = 0; // almacen destino
    $canReqDet = floatval($data["canReqDet"]); // cantidad de requisicion detalle
    $idEstSalSto = 1; // estado de completado


    if ($pdo) {
        // PRIMERO OBTENEMOS LA LISTA DE ENTRADAS DISPONIBLES
        /*
            EL ALGORITMO SERA EL SIGUIENTE:
            1. Se realiza la consulta de todas las entradas que cumplan las siguientes condiciones:
                * que la cantidad disponibles sea mayor a 0
                * que tenga un estado de disponible la entrada
                * que corresponda al producto que especifica el detalle de la requisicion
            2. Una vez obtenido la lista de ingresos disponibles se debe empezar por el mas antiguo
            3. Un for va recorriendo las cantidad disponibles y va comparando con el total solicitado
            4. Tenemos los siguientes casos:
                a. Si hay la cantidad requerida, por ende detenemos el bucle y proseguimos
                b. Se recorrio todo el array y no se cumplio lo requerido por ende se muestra el mensaje de 
                error y se finaliza el proceso.
            5. Una vez obtenido la informacion de las entradas requeridas para salida se procede
                a realizar las salidas correspondientes
            6. Se actualizan los estados de los detalles y maestros
            7. Termina el proceso
        */

        // PASO NUMERO 1: CONSULTA DE ENTRADAS DISPONIBLES
        $idEntStoEst = 1; // ESTADO DISPONIBLE DE LAS ENTRADAS
        $array_entradas_disponibles = [];
        $sql_consult_entradas_disponibles =
            "SELECT
                es.id,
                es.codEntSto,
                es.refNumIngEntSto,
                DATE(es.fecEntSto) AS fecEntSto,
                es.canTotDis, 
                es.codLot
            FROM entrada_stock AS es
            WHERE idProd = ? AND idEntStoEst = ? AND canTotDis <> 0.000
            ORDER BY es.fecEntSto ASC";

        try {
            $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
            $stmt_consult_entradas_disponibles->bindParam(1, $idProdt, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->bindParam(2, $idEntStoEst, PDO::PARAM_INT);
            $stmt_consult_entradas_disponibles->execute();

            // AÑADIMOS AL ARRAY
            while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                array_push($array_entradas_disponibles, $row);
            }

            // comprobamos si hay entradas disponibles para ahorrar proceso computacional
            if (!empty($array_entradas_disponibles)) {
                $entradasUtilizadas = [];
                // $cantidad_acumulada = 0;
                $cantidad_faltante = $canReqDet;
                // Se tienen las siguientes condiciones:
                /* 
                    1. Si la cantidad disponible de la entrada es mayor o igual a lo solicitado:
                    Se procede a realizar el descuento
                */
                foreach ($array_entradas_disponibles as $row_entrada_dispomible) {
                    if ($cantidad_faltante > 0) {

                        $idEntStoUti = $row_entrada_dispomible["id"]; // id entrada
                        $canDisEnt = $row_entrada_dispomible["canTotDis"]; // cantidad disponible

                        if ($canDisEnt >= $cantidad_faltante) {
                            // añadimos a entradas utilizadas
                            array_push(
                                $entradasUtilizadas,
                                array(
                                    "idEntSto" => $idEntStoUti,
                                    "canSalStoReq" => $cantidad_faltante // la cantidad de la requisicion detalle
                                )
                            );

                            $cantidad_faltante = 0;

                            break; // termina el flujo
                        } else {
                            $cantidad_faltante -= $canDisEnt;
                            array_push(
                                $entradasUtilizadas,
                                array(
                                    "idEntSto" => $idEntStoUti,
                                    "canSalStoReq" => $canDisEnt // la cantidad disponible de la entrada
                                )
                            );
                        }
                    } else {
                        break; // salimos del flujo
                    }
                }
              // die(json_encode($cantidad_faltante));
                // comprobamos finalmente que la cantidad faltante sea exactamente 0
                die(json_encode($cantidad_faltante));

                
            } else {
                $message_error = "No hay entradas disponibles";
                $description_error = "No hay entradas disponibles para el producto del detalle";
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER: fallo en la consulta de entradas disponibles";
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
