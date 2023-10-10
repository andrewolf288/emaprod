<?php

function getPDO()
{
    $serverName = '209.45.83.59,1433';
    $databaseName = 'ERP_EMAR';
    $username = 'sistemas2';
    $password = 'Sistemas@369741258%';
    //$database = new PDO("sqlsrv:server=$serverName;database=$databaseName,$username,$password");
    $database = new PDO("sqlsrv:server=$serverName;database=$databaseName", $username, $password);
    $database->setAttribute(PDO::ATTR_EMULATE_PREPARES, FALSE);
    $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
    return $database;
}

// function obtenerVariableDelEntorno($key)
// {
//     if (defined("_ENV_CACHE")) {
//         $vars = _ENV_CACHE;
//     } else {
//         $file = "../../env.php";
//         if (!file_exists($file)) {
//             throw new Exception("El archivo de las variables de entorno ($file) no existe. Favor de crearlo");
//         }
//         $vars = parse_ini_file($file);
//         define("_ENV_CACHE", $vars);
//     }
//     if (isset($vars[$key])) {
//         return $vars[$key];
//     } else {
//         throw new Exception("La clave especificada (" . $key . ") no existe en el archivo de las variables de entorno");
//     }
// }