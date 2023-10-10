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



        //$sql_consult_entradas_disponibles =
        //"SELECT s.id as id_order, sd.id as id_order_detail, sd.sale_order_id, s.created_at,s.reference_serie,s.reference_number, s.serie, s.number 
        //FROM sale_orders as s 
        //JOIN sale_order_details as sd ON sd.sale_order_id = s.id 
        //WHERE s.reference_number >= 13462 and s.reference_number <= 13528 and s.reference_serie = 'B301' ORDER BY s.reference_number ASC";


        //$stmt_consult_entradas_disponibles = $pdo->prepare($sql_consult_entradas_disponibles);
        //$stmt_consult_entradas_disponibles->execute();
        
        //while ($row = $stmt_consult_entradas_disponibles->fetch(PDO::FETCH_ASSOC)) {
        //    array_push($result, $row);
       // }
                 


    


      
            
   


       try
    {
       $filename = "C:\Users\Usuario\Downloads\FIFO - MM-PP - TI.xlsm";
       //$filename = "C:\Users\Usuario\Downloads\query.txt";

       $file = fopen($filename, "r");
       //die(json_encode($file));
            $result = [];
        $count = 0;                                         // add this line
        while (($emapData = fgetcsv($file, 10000, ",")) !== FALSE)
        {
            //print_r($emapData);
            //exit();
            $count++;                                      // add this line
            die(json_encode($file));
            if($count>1){                                  // add this line
           // $sql = "INSERT into prod_list_1(p_bench,p_name,p_price,p_reason) values ('$emapData[0]','$emapData[1]','$emapData[2]','$emapData[3]')";
             die(json_encode($emapData));
            }      
            array_push($result, $emapData);
        }
    } catch (PDOException $e) {
        $description_error = $e->getMessage();
        die(json_encode($description_error));
    }
             
        //die(json_encode($result));
       
   

