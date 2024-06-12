<?php
header('Content-Type: application/json; charset=utf-8');
include_once "../../common/cors.php";
include_once "../../common/conexion_integracion.php";
include_once "../../common/conexion.php";

$pdoCONTANET = getPDOContanet();
$pdoEMAPROD = getPDO();
$message_error = "";
$description_error = "";
$result = [];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($pdoCONTANET && $pdoEMAPROD) {
        try {
            $sql_productos_contanet = 
            "SELECT 
            Cd_Prod,  
            Nombre1,
            CodCo1_ 
            FROM dbo.Producto2";
            $stmt_producto_contanet = $pdoCONTANET->prepare($sql_productos_contanet);
            $stmt_producto_contanet->execute();
            $productos_CONTANET = $stmt_producto_contanet->fetchAll(PDO::FETCH_ASSOC);

            $sql_productos_emaprod = 
            "SELECT nomProd, codProd2
            FROM producto";
            $stmt_productos_emaprod = $pdoEMAPROD->prepare($sql_productos_emaprod);
            $stmt_productos_emaprod->execute();
            $productos_EMAPROD = $stmt_productos_emaprod->fetchAll(PDO::FETCH_ASSOC);

            // Normalizar y crear arreglos de nombres de productos para facilitar la comparación
            $nombres_CONTANET = array_map(function($producto) {
                return strtolower(trim($producto['Nombre1']));
            }, $productos_CONTANET);

            $nombres_EMAPROD = array_map(function($producto) {
                return strtolower(trim($producto['nomProd']));
            }, $productos_EMAPROD);

            // Encuentra aquellos productos en EMAPROD cuyos nombres no estén en CONTANET
            $productos_no_coinciden = array_filter($productos_EMAPROD, function($producto) use ($nombres_CONTANET) {
                return !in_array(strtolower(trim($producto['nomProd'])), $nombres_CONTANET);
            });

            // Imprime los productos que no coinciden
            print_r($productos_no_coinciden);

        } catch (PDOException $e) {
            $message_error = "ERROR INTERNO SERVER";
            $description_error = $e->getMessage();
        }
    } else {
        $message_error = "Error con la conexión a la base de datos";
        $description_error = "Error con la conexión a la base de datos a través de PDO";
    }
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}


// if ($_SERVER["REQUEST_METHOD"] == "POST") {
//     if ($pdoCONTANET && $pdoEMAPROD) {
//         try {
//             // Consulta para obtener productos de EMAPROD
//             $sql_productos_emaprod = 
//             "SELECT nomProd, codProd2 
//             FROM producto
//             WHERE codProd2 IS NOT NULL";
//             $stmt_productos_emaprod = $pdoEMAPROD->prepare($sql_productos_emaprod);
//             $stmt_productos_emaprod->execute();
//             $productos_emaprod = $stmt_productos_emaprod->fetchAll(PDO::FETCH_ASSOC);

//             foreach($productos_emaprod as $producto) {
//                 $nomProd = $producto['nomProd'];
//                 $codProd2 = $producto['codProd2'];

//                 // Consulta para buscar productos en Contanet
//                 $sql_producto_contanet = 
//                 "SELECT Nombre1
//                 FROM dbo.Producto2
//                 WHERE Nombre1 = '$nomProd'";
//                 $stmt_producto_contanet = $pdoCONTANET->prepare($sql_producto_contanet);
//                 $stmt_producto_contanet->execute();
//                 if($stmt_producto_contanet->rowCount() > 0) {
//                     $producto_contanet = $stmt_producto_contanet->fetch(PDO::FETCH_ASSOC);
//                     print($producto_contanet['Nombre1']);
//                 } else {
//                     $result[] = "No se encontró el producto con nombre: $nomProd";
//                 }
//             }

//         } catch (PDOException $e) {
//             $message_error = "ERROR INTERNO SERVER";
//             $description_error = $e->getMessage();
//         }
//     } else {
//         $message_error = "Error con la conexión a la base de datos";
//         $description_error = "Error con la conexión a la base de datos a través de PDO";
//     }
//     $return['message_error'] = $message_error;
//     $return['description_error'] = $description_error;
//     $return['result'] = $result;
//     echo json_encode($return);
// }
?>
