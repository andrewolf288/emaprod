<?php

// function getConectionContanet(){
//     $serverName = "209.45.83.59,1433";
//     $connectionOptions = array(
//         "Database" => "ERP_EMAR",
//         "UID" => "sistemas2",
//         "PWD" => "Sistemas@369741258%",
//         "TrustServerCertificate" => true
//     );
//     $conn = sqlsrv_connect($serverName, $connectionOptions);

//     return $conn;
// }
//
function getConectionContanet() {
    $serverName = "209.45.83.59,1433";
    $database = "ERP_EMAR";
    $username = "sistemas2";
    $password = "Sistemas@369741258%";

    try {
        $conn = new PDO("sqlsrv:server=$serverName;Database=$database", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        die("Error connecting to SQL Server: " . $e->getMessage());
    }
}