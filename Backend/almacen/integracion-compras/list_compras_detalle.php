<?php
include_once "../../common/cors.php";
include_once "../../common/conexion_integracion.php";

$pdo = getPDO();
$message_error = "";
$description_error = "";
$result = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if ($pdo) {
        try {

            // AQUI SE DEBEN DEFINIR 2 ASPECTOS
            /*
            - fechas en las que se deben filtrar
            - estado de la orden de compra
            */

            $sql_orden_compra =
                "SELECT 
                Cd_OC,
                NroOc AS numero_orden_compra,
                CAST(FecEmi AS date) AS fecha_emision,
                CAST(FecEnt AS date) AS fecha_entrega,
                CAST(FecPag AS date) AS fecha_pago,
                Cd_Mda AS codigo_moneda,
                CamMda AS cambio_moneda,
                Cd_Prv AS codigo_proveedor,
                Proveedor AS proveedor,
                ValorTotal AS valor_total,
                Igv AS igv,
                Total AS total,
                C_IGV_TASA AS igv_tasa,
                C_IB_CERRADO_ATENCION_PARCIAL AS atencion_parcial,
                C_PENDIENTE_CANCELADO AS pendiente
                 FROM OrdCompra2
            WHERE CAST(FecEmi AS date) >= '2023-02-21' AND CAST(FecEmi AS date) <= '2023-02-21'";

            $stmt_orden_compra = $pdo->prepare($sql_orden_compra);
            $stmt_orden_compra->execute();

            while ($row = $stmt_orden_compra->fetch(PDO::FETCH_ASSOC)) {
                $row["ordComDet"] = [];
                $Cd_Oc = $row["Cd_OC"];

                $sql_orden_compra_detalle =
                    "SELECT
                    Cd_OC,
                    Item AS item,
                    Cd_Prod AS codigo_producto,
                    Descrip AS descripcion,
                    ValorUni AS valor_unitario,
                    IgvUni AS igv_unitario,
                    PrecioUni AS precio_unidad,
                    CONVERT(decimal(20,2), Cant) AS cantidad,
                    ValorTotal AS valor_total,
                    Igv AS igv,
                    Total AS total,
                    CAST(FecEnt AS date) AS fecha_entrega
                    FROM OrdCompraDet2 WHERE Cd_OC = ?";
                $stmt_orden_compra_detalle = $pdo->prepare($sql_orden_compra_detalle);
                $stmt_orden_compra_detalle->bindParam(1, $Cd_Oc, PDO::PARAM_STR);

                $stmt_orden_compra_detalle->execute();
                while ($row_detalle = $stmt_orden_compra_detalle->fetch(PDO::FETCH_ASSOC)) {
                    array_push($row["ordComDet"], $row_detalle);
                }
                array_push($result, $row);
            }
        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
    }
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}
