<?php
function getStartEndDateNow()
{
    $inicio = date("Y-m-01");
    $fin =  date("Y-m-t");
    return [$inicio, $fin];
}
