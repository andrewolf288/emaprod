<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$result = [];
$message_error = "";
$description_error = "";

// este script sirve para resetear las entradas existentes

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $lotes = array("LT0999", "LT0998", "LT0997", "LT0996", "LT0995", "LT0102C10", "LT0108C12", "LT082C8", "LT093C9", "LT055C7", "LT092C11", "LT0110C11", "LT096C10", "LT0101C10", "LT087C9", "LT040C5", "LT057C7", "LT0105C11", "LT154AA10", "LT172AA11", "LT0106B10", "LT0109B10", "LT037B4", "LT074B7", "LT0103C11", "LT025B3", "LT0100C10", "LT0113C11", "LT0114C11", "LT062C7", "LT094C9", "LT079C8", "LT097C10", "LT0106C11", "LT063C7", "LT085C9", "LT054B5", "LT067C7", "LT0109C12", "LT009C2", "LT004C1", "LT066C7", "LT080C8", "LT023B3", "LT088C9", "LT098C10", "LT053C6", "LT071C8", "LT058B6", "LT081C8", "LT054C6", "LT072C7", "LT0116C12", "LT084C8", "LT089A7", "LT018B2", "LT099C10", "LT075C7", "LT064C7", "LT065C7", "LT091C9", "LT060C7", "LT042C5", "LT030C4", "LT039C5", "LT021C3", "LT0130B10", "LT0132B11", "LT0114B10", "LT0127B11", "LT063C7.", "LT061C7", "LT0120B11", "LT012C3", "LT020B3", "LT056B6", "LT073C7", "LT046C5", "LT001C1", "LT002C1", "LT018C3", "LT058C6", "LT064B6", "LT086A7", "LT0124B11", "LT0115C12", "LT544C12", "LT545C12", "LT535C8", "LT539C9", "LT542C10", "LT547C11", "LT549C12", "LT550C12", "LT543C10", "LT551C12", "LT537C8", "LT540C9", "LT544C10", "LT544C11", "LT546C11", "LT548C11", "LT303C12", "LT006B1", "LT077C8", "LT024C3", "LT149A12", "LT025C3", "LT0111B10", "LT058C10", "LT086C9", "LT0112B10", "LT0140B12", "LT070C7", "LT069C7", "LT073A6", "LT051C6", "LT049B5", "LT028C4", "LT427C11", "LT426C11", "LT425C9", "LT408C2", "LT412C3");
    $lotes_referencia = array(7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130);
    $lotes_productos = array("LT0999", "LT0998", "LT0997", "LT0996", "LT0995", "LT0102C10", "LT0108C12", "LT082C8", "LT093C9", "LT055C7", "LT092C11", "LT0110C11", "LT096C10", "LT0101C10", "LT087C9", "LT040C5", "LT057C7", "LT0105C11", "LT154AA10", "LT172AA11", "LT0106B10", "LT0109B10", "LT037B4", "LT074B7", "LT0103C11", "LT025B3", "LT0100C10", "LT0113C11", "LT0114C11", "LT062C7", "LT094C9", "LT079C8", "LT097C10", "LT0106C11", "LT063C7", "LT085C9", "LT054B5", "LT067C7", "LT093C9", "LT0109C12", "LT009C2", "LT004C1", "LT066C7", "LT0113C11", "LT080C8", "LT023B3", "LT057C7", "LT088C9", "LT0105C11", "LT098C10", "LT053C6", "LT071C8", "LT094C9", "LT092C11", "LT058B6", "LT081C8", "LT054C6", "LT063C7", "LT0100C10", "LT072C7", "LT0116C12", "LT084C8", "LT089A7", "LT018B2", "LT0109C12", "LT099C10", "LT075C7", "LT062C7", "LT0105C11", "LT064C7", "LT065C7", "LT091C9", "LT060C7", "LT096C10", "LT062C7", "LT071C8", "LT063C7", "LT064C7", "LT067C7", "LT093C9", "LT042C5", "LT030C4", "LT039C5", "LT021C3", "LT0130B10", "LT0132B11", "LT0114B10", "LT0127B11", "LT063C7.", "LT061C7", "LT099C10", "LT0120B11", "LT012C3", "LT009C2", "LT020B3", "LT056B6", "LT073C7", "LT057C7", "LT058B6", "LT046C5", "LT021C3", "LT001C1", "LT064C7", "LT065C7", "LT0127B11", "LT063C7", "LT002C1", "LT018C3", "LT061C7", "LT0113C11", "LT058C6", "LT009C2", "LT064B6", "LT073C7", "LT086A7", "LT0124B11", "LT030C4", "LT057C7", "LT0115C12", "LT544C12", "LT545C12", "LT545C12", "LT535C8", "LT539C9", "LT542C10", "LT547C11", "LT549C12", "LT547C11", "LT550C12", "LT543C10", "LT551C12", "LT537C8", "LT540C9", "LT544C10", "LT544C11", "LT544C12", "LT546C11", "LT549C12", "LT548C11", "LT551C12", "LT303C12", "LT0110C11", "LT088C9", "LT096C10", "LT0105C11", "LT0106C11", "LT0109C12", "LT061C7", "LT057C7", "LT075C7", "LT006B1", "LT075C7", "LT002C1", "LT088C9", "LT0105C11", "LT079C8", "LT077C8", "LT098C10", "LT024C3", "LT053C6", "LT149A12", "LT025C3", "LT0111B10", "LT092C11", "LT057C7", "LT058C10", "LT081C8", "LT054C6", "LT086C9", "LT0112B10", "LT0140B12", "LT070C7", "LT069C7", "LT073A6", "LT089A7", "LT018B2", "LT051C6", "LT061C7", "LT099C10", "LT075C7", "LT025C3", "LT0127B11", "LT054C6", "LT063C7", "LT049B5", "LT064C7", "LT028C4", "LT024C3", "LT067C7", "LT061C7", "LT099C10", "LT427C11", "LT426C11", "LT425C9", "LT408C2", "LT412C3");

    foreach ($lotes_productos as $valor) {
        $indice = array_search($valor, $lotes);

        if ($indice !== false) {
            echo $lotes_referencia[$indice];
            echo "\n";
        } else {
            echo "El valor $valor no se encontró en el segundo arreglo.";
            echo "\n";
        }
    }

    // Retornamos el resultado
    $return['message_error'] = $message_error;
    $return['description_error'] = $description_error;
    $return['result'] = $result;
    echo json_encode($return);
}