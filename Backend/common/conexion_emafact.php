<?php

function getPDOEMAFACT()
{
    // $password = obtenerVariableDelEntorno("MYSQL_PASSWORD");
    // $user = obtenerVariableDelEntorno("MYSQL_USER");
    // $dbName = obtenerVariableDelEntorno("MYSQL_DATABASE_NAME");
    $user = "emafact";
    $dbName = "emaran";
    $password = "%Dz8y6i3";
    $database = new PDO('mysql:host=45.77.80.71;dbname=' . $dbName, $user, $password);
    // $user = "emaprod";
    // $dbName = "emaprod";
    // $password = "Sm~18jn57";
    // $database = new PDO('mysql:host=45.77.80.71;dbname=' . $dbName, $user, $password);
    $database->query("set names utf8;");
    $database->setAttribute(PDO::ATTR_EMULATE_PREPARES, FALSE);
    $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
    return $database;
}
