<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";


//http://localhost/EMAPROD/Backend/produccion/produccion-lote/updateOrders.php
//https://emaprod.emaransac.com/produccion/produccion-lote/updateOrders.php


    if ($pdo) {
            $sql_consult_entradas_disponibles =
                "SELECT s.id as id_order, sd.id as id_order_detail, sd.sale_order_id, s.created_at,s.reference_serie,s.reference_number, s.serie, s.number 
                FROM sale_orders as s 
                JOIN sale_order_details as sd ON sd.sale_order_id = s.id 
                WHERE s.reference_number >= 13462 and s.reference_number <= 13528 and s.reference_serie = 'B301' ORDER BY s.reference_number ASC";

            try {

                $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
                $stmt_consult_entradas_disponibles->execute();
                
                while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                    array_push($result, $row);
                }
                foreach ($result as &$row) {
                    $id = intval($row["id_order_detail"]);
                    $stmt_delete_entrada_stock = $pdo->prepare( "DELETE FROM sale_order_details WHERE id =:id" );
                    $stmt_delete_entrada_stock->bindParam(':id', $id );
                    $stmt_delete_entrada_stock->execute();

                    if(!$stmt_delete_entrada_stock->rowCount() ) {
                        //die(json_encode("Deletion failed"));
                    }else{
                        //die(json_encode("Deletion sucsst"));
                    }

                }
                
               
                $rows_insert = [];
                $sql_consult_entradas_disponibles =
                "SELECT  so.id as id_order,  
                s.invoice_serie,
                s.invoice_number , 
                s.invoice_number , 
                so.reference_number,

                sd.product_id,
                sd.product_attribute_id,
                sd.warehouse_id,
                sd.unity_id,
                sd.price_rule_id,
                sd.tax_id,
                sd.tax_rate,
                sd.exchange_rate,
                sd.product_name,
                sd.quantity,
                sd.stock_physical,
                sd.stock,
                sd.discount_type,
                sd.price,
                sd.price_wt,
                sd.taxes,
                sd.discounts,
                sd.total,
                sd.total_wt,
                so.issue_date


                FROM sales as s   
                JOIN sale_orders as so ON so.reference_number = s.invoice_number 
                JOIN sale_details as sd ON sd.sale_id = s.id
                WHERE s.invoice_number >= 13462 and s.invoice_number <= 13528 and so.reference_serie = 'B301' ";

                
                $stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
                $stmt_consult_entradas_disponibles->execute();
                while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
                    array_push($rows_insert, $row);
                }

                foreach ($rows_insert as $row) {
                    $sale_order_id = intval($row["id_order"]);
                    $product_id = intval($row["product_id"]);
                    $product_attribute_id =  intval($row["product_attribute_id"]);
                    $warehouse_id = intval($row["warehouse_id"]);
                    $unity_id = intval($row["unity_id"]);
                    $price_rule_id = intval($row["price_rule_id"]);
                    $tax_id = intval($row["tax_id"]);
                    $tax_rate = floatval($row["tax_rate"]);
                    $exchange_rate = floatval($row["exchange_rate"]);
                    $product_name = $row["product_name"];
                    $quantity = intval($row["quantity"]);
                    $stock_physical = intval($row["stock_physical"]);
                    $stock = intval($row["stock"]);
                    $discount_type = floatval($row["discount_type"]);
                    $price = floatval($row["price"]);
                    $price_wt = floatval($row["price_wt"]);
                    $taxes = floatval($row["taxes"]);
                    $discounts = floatval($row["discounts"]);
                    $total = floatval($row["total"]);
                    $total_wt = floatval($row["total_wt"]);
                    $product_price = floatval($row["product_price"]);
                    $delivery_date =  $row["issue_date"];


                    //$ssss = [];
                    //$ssss["id_order"] = $sale_order_id;
                    //$ssss["product_id"] = $product_id;
                    //$ssss["product_attribute_id"] = $product_attribute_id;
                    //$ssss["warehouse_id"] = $warehouse_id;
                    //$ssss["unity_id"] = $unity_id;
                    //$ssss["price_rule_id"] = $price_rule_id;
                    //$ssss["tax_id"] = $tax_id;
                    //$ssss["tax_rate"] = $tax_rate;
                    //$ssss["exchange_rate"] = $exchange_rate;
                    //$ssss["product_name"] = $product_name;
                    //$ssss["quantity"] = $quantity;
                    //$ssss["stock_physical"] = $stock_physical;
                    //$ssss["stock"] = $stock;
                    //$ssss["discount_type"] = $discount_type;
                    //$ssss["price"] = $price;
                    //$ssss["price_wt"] = $price_wt;
                    //$ssss["taxes"] = $taxes;
                    //$ssss["discounts"] = $discounts;
                    //$ssss["total"] = $total;
                    //$ssss["total_wt"] = $total_wt;
                    //$ssss["product_price"] = $product_price;

                    //$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    $stmt = $pdo->prepare("
                    INSERT INTO sale_order_details(
                        
                        sale_order_id,
                        product_id,
                        product_attribute_id,
                        warehouse_id,
                        unity_id,
                        price_rule_id,
                        tax_id,
                        tax_rate,
                        exchange_rate,
                        product_name,
                        quantity,
                        stock_physical,
                        stock,
                        discount_type,
                        price,
                        price_wt,
                        taxes,
                        discounts,
                        total,
                        total_wt,
                        product_price,
                        delivery_date
                       ) 
                    VALUES( :sale_order_id,:product_id,:product_attribute_id,
                    :warehouse_id,:unity_id,:price_rule_id,:tax_id,:tax_rate,
                    :exchange_rate,:product_name,:quantity,:stock_physical,
                    :stock,:discount_type,:price,:price_wt,:taxes,
                    :discounts,:total,:total_wt,:product_price,:delivery_date )");

                     
                    $stmt->bindParam(':sale_order_id',  $sale_order_id );
                    $stmt->bindParam(':product_id', $product_id );
                    $stmt->bindParam(':product_attribute_id', $product_attribute_id );
                    $stmt->bindParam(':warehouse_id', $warehouse_id );
                    $stmt->bindParam(':unity_id', $unity_id );
                    $stmt->bindParam(':price_rule_id', $price_rule_id );
                    $stmt->bindParam(':tax_id', $tax_id );
                    $stmt->bindParam(':tax_rate', $tax_rate );
                    $stmt->bindParam(':exchange_rate', $exchange_rate );
                    $stmt->bindParam(':product_name', $product_name );
                    $stmt->bindParam(':quantity', $quantity );
                    $stmt->bindParam(':stock_physical', $stock_physical );
                    $stmt->bindParam(':stock', $stock );
                    $stmt->bindParam(':discount_type', $discount_type );
                    $stmt->bindParam(':price', $price );
                    $stmt->bindParam(':price_wt', $price_wt );
                    $stmt->bindParam(':taxes', $taxes );
                    $stmt->bindParam(':discounts', $discounts );
                    $stmt->bindParam(':total', $total );
                    $stmt->bindParam(':total_wt', $total_wt );
                    $stmt->bindParam(':product_price', $product_price );
                    $stmt->bindParam(':delivery_date', $delivery_date );
                    $stmt->execute();
                    //die(json_encode($row));

                    if(!$stmt->rowCount() ) {
                        //die(json_encode("add failed"));
                    }else{
                        //die(json_encode("add sucsst"));
                    }
                }
                    
            } catch (PDOException $e) {
                $description_error = $e->getMessage();
                die(json_encode($description_error));

            }
    } else {
        $message_error = "Error con la conexion a la base de datos";
        $description_error = "Error con la conexion a la base de datos a traves de PDO";
        die(json_encode($description_error));
    }

    echo json_encode($result);
