<?php

function getPDOEMAFACT()
{
    $user = "sistemasR";
    $dbName = "emaran";
    $password = "@5pn2W2m1";
    $database = new PDO('mysql:host=45.32.170.27;dbname=' . $dbName, $user, $password);
    // $user = "emafact";
    // $dbName = "emaran";
    // $password = "emafactpass";
    // $database = new PDO('mysql:host=localhost;dbname=' . $dbName, $user, $password);
    $database->query("set names utf8;");
    $database->setAttribute(PDO::ATTR_EMULATE_PREPARES, FALSE);
    $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
    return $database;
}
