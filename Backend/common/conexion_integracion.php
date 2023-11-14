<?php

function getPDO()
{
    $serverName = '209.45.83.59,1433';
    $databaseName = 'ERP_EMAR';
    $username = 'sistemas2';
    $password = 'Sistemas@369741258%';

    // Opciones para configurar la conexión
    $connectionOptions = array(
        "Database" => $databaseName,
        "Uid" => $username,
        "PWD" => $password,
        "Encrypt" => 'true', // Configura a 'true' o 'false' según sea necesario (Solución 2)
        "TrustServerCertificate" => 'true' // Solución 3
    );

    try {
        $pdo = new PDO("sqlsrv:Server=$serverName", options: $connectionOptions);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
        return $pdo;
    } catch (PDOException $e) {
        // Manejo de errores (puedes personalizar según tus necesidades)
        echo "Error de conexión: " . $e->getMessage();
        return null;
    }
}
