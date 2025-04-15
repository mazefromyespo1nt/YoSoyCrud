<?php
// habilitar CORS para permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);


// manejar solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// datos de conexión a MySQL
$servername = "localhost";
$username = "root";
$password = "";

// función para generar un nombre aleatorio para la base de datos
function generateRandomDatabaseName() {
    return 'db_' . uniqid();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // leer el cuerpo de la solicitud como JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // verificar si se pide listar tablas
    if (isset($data['action'])) {
        $databaseName = $data['databaseName'] ?? null;

        if (!$databaseName) {
            echo json_encode(['message' => "Error: No se proporcionó el nombre de la base de datos."]);
            exit();
        }
        error_log("DatabaseName recibido: " . $databaseName);


        // Establecer conexión a MySQL
            $conn = new mysqli($servername, $username, $password, $databaseName);

            if ($conn->connect_error) {
                echo json_encode(['message' => "Conexión fallida: " . $conn->connect_error]);
                exit();
            }

        // si la acción es listar las tablas
        if ($data['action'] === 'listTables') {
            // obtener las tablas de la base de datos
            $tablesResult = $conn->query("SHOW TABLES");

            if (!$tablesResult) {
                echo json_encode(['message' => "Error al obtener las tablas: " . $conn->error]);
                $conn->close();
                exit();
            }

            $tables = [];
            while ($row = $tablesResult->fetch_array()) {
                $tables[] = $row[0]; // Cada fila contiene el nombre de una tabla
            }

            $conn->close();
            echo json_encode(['tables' => $tables]); // Enviar las tablas como respuesta
            exit();
        }

        // si la acción es listar columnas de una tabla
        if ($data['action'] === 'listColumns' && isset($data['tableName'])) {
            $tableName = $data['tableName'];

            // Obtener las columnas de la tabla especificada
            $columnsResult = $conn->query("SHOW COLUMNS FROM `$tableName`");

            if (!$columnsResult) {
                echo json_encode(['message' => "Error al obtener las columnas: " . $conn->error]);
                $conn->close();
                exit();
            }

            $columns = [];
            while ($row = $columnsResult->fetch_assoc()) {
                $columns[] = $row['Field']; // Obtener el nombre de la columna
            }

            $conn->close();
            echo json_encode(['columns' => $columns]); // Enviar las columnas como respuesta
            exit();
        }
    }

    // verificar que 'sqlQuery' esté presente para otras acciones (ej. crear tablas)
    if (!isset($data['sqlQuery']) || empty(trim($data['sqlQuery']))) {
        echo json_encode(['message' => "Error: El campo 'sqlQuery' es obligatorio."]);
        exit();
    }

    $sqlQuery = trim($data['sqlQuery']);
    $responseMessages = []; // Arreglo para almacenar los mensajes

    // si se proporciona 'databaseName', la reutilizamos
    if (isset($data['databaseName']) && !empty($data['databaseName'])) {
        $databaseName = $data['databaseName'];
    } else {
        echo json_encode(['message' => "Error: No se proporcionó el nombre de la base de datos."]);
        exit();
    }

    // establecer conexión a MySQL
    $conn = new mysqli($servername, $username, $password);

    if ($conn->connect_error) {
        echo json_encode(['message' => "Conexión fallida: " . $conn->connect_error]);
        exit();
    }

    // comprobamos si la base de datos existe
    $dbCheckQuery = "SHOW DATABASES LIKE '$databaseName'";
    $dbCheckResult = $conn->query($dbCheckQuery);

    if ($dbCheckResult->num_rows === 0) {
        // Si la base de datos no existe, la creamos
        $createDbQuery = "CREATE DATABASE `$databaseName`";
        if ($conn->query($createDbQuery) === TRUE) {
            $responseMessages[] = "Base de datos '$databaseName' creada con éxito.";
            // Cerrar la conexión y reabrirla 
            $conn->close();
            $conn = new mysqli($servername, $username, $password);
            if ($conn->connect_error) {
                echo json_encode(['message' => "Error al reconectar a MySQL: " . $conn->connect_error]);
                exit();
            }
        } else {
            echo json_encode(['message' => "Error al crear la base de datos: " . $conn->error]);
            $conn->close();
            exit();
        }
    }

    // seleccionar la base de datos para ejecutar el CREATE TABLE
    if (!$conn->select_db($databaseName)) {
        echo json_encode(['message' => "Error: No se pudo seleccionar la base de datos '$databaseName'."]);
        $conn->close();
        exit();
    }

    // ejecutar la consulta SQL (ejemplo: CREATE TABLE)
    if ($conn->multi_query($sqlQuery)) {
        do {
            if ($result = $conn->store_result()) {
                while ($row = $result->fetch_assoc()) {
                    // Proceso de los resultados si es necesario
                }
                $result->free();
            }

            if ($conn->errno) {
                echo json_encode(['message' => "Error al ejecutar la consulta: " . $conn->error]);
                $conn->close();
                exit();
            }
        } while ($conn->more_results() && $conn->next_result());

        $responseMessages[] = "Consultas SQL ejecutadas con éxito.";
    } else {
        echo json_encode(['message' => "Error al ejecutar las consultas: " . $conn->error]);
        $conn->close();
        exit();
    }

    // cerrar la conexión
    $conn->close();

    // devolver todos los mensajes en formato JSON
    echo json_encode([
        'databaseName' => $databaseName,
        'messages' => $responseMessages,
    ]);
} else {
    echo json_encode(['message' => "Método no soportado. Utiliza POST para enviar la sentencia SQL."]);
}


?>
