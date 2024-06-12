<?php

function getPDOContanet()
{
    $serverName = '209.45.83.59,1433';
    $databaseName = 'ERP_EMAR';
    $username = 'sistemas2';
    $password = 'Sistemas@369741258%';

    try {
        // Construir el DSN (Data Source Name)
        $dsn = "sqlsrv:Server=$serverName;Database=$databaseName";

        // Crear la instancia PDO
        // $pdo = new PDO($dsn, $username, $password, $connectionOptions);
        $pdo = new PDO($dsn, $username, $password);

        // Establecer los atributos de error y modo de obtención
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

        return $pdo;
    } catch (PDOException $e) {
        // Manejo de errores (puedes personalizar según tus necesidades)
        echo "Error de conexión: " . $e->getMessage();
        return null;
    }
}
?>
