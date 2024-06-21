<?php
include_once "../../common/cors.php";
header('Content-Type: application/json; charset=utf-8');
require('../../common/conexion.php');

$pdo = getPDO();
$response = [
    'message_error' => '',
    'description_error' => '',
    'result' => null
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener y decodificar la entrada JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validar entrada
    if (!isset($data["useUsu"]) || !isset($data["pasUsu"])) {
        $response['message_error'] = "Solicitud inválida";
        $response['description_error'] = "Nombre de usuario o contraseña no proporcionados";
        echo json_encode($response);
        exit();
    }

    $username = htmlspecialchars(trim($data["useUsu"]));
    $password = trim($data["pasUsu"]);

    if ($pdo) {
        try {
            // Consulta para obtener el hash de la contraseña
            $sql = "SELECT idRolUsu, idAre, nomUsu, apeUsu, pasUsu FROM usuario WHERE useUsu = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(1, $username, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() == 1) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if (password_verify($password, $row['pasUsu'])) {
                    // Contraseña verificada correctamente
                    unset($row['pasUsu']); // Eliminar el hash de la contraseña de la respuesta
                    $response['result'] = $row;
                } else {
                    // Contraseña incorrecta
                    $response['message_error'] = "Usuario o contraseña incorrectos";
                    $response['description_error'] = "Las credenciales ingresadas no pertenecen a ningún usuario";
                }
            } else {
                // Usuario no encontrado
                $response['message_error'] = "Usuario o contraseña incorrectos";
                $response['description_error'] = "Las credenciales ingresadas no pertenecen a ningún usuario";
            }
        } catch (PDOException $e) {
            // Manejo de errores de la base de datos
            $response['message_error'] = "Error interno del servidor";
            $response['description_error'] = $e->getMessage();
        }
    } else {
        // Error de conexión a la base de datos
        $response['message_error'] = "Error de conexión a la base de datos";
        $response['description_error'] = "Error al conectar con la base de datos a través de PDO";
    }

    // Retornar la respuesta
    echo json_encode($response);
}
?>
