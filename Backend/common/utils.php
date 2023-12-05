<?php
function getStartEndDateNow()
{
    $inicio = date("Y-m-01");
    $fin =  date("Y-m-t");
    return [$inicio, $fin];
}

function getTodayDateNow()
{
    $inicio = date("Y-m-d");
    $fin =  date("Y-m-d");
    return [$inicio, $fin];
}
