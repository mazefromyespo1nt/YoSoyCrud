<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Continúa con el resto de tu código...


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Manejar solicitud GET para obtener datos de la tabla
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        "tableName" => "users",
        "columns" => [
            ["name" => "id", "type" => "int"],
            ["name" => "name", "type" => "varchar"],
            ["name" => "email", "type" => "varchar"]
        ]
    ]);
    exit;
}

// Obtener los datos enviados desde el frontend (React)
$data = json_decode(file_get_contents("php://input"), true);

// Verificar si la solicitud contiene los datos necesarios
if (isset($data['tableName']) && isset($data['columns']) && !empty($data['tableName']) && !empty($data['columns'])) {
    $tableName = $data['tableName'];
    $columns = $data['columns'];

    // Validar que cada columna tenga nombre y tipo
    $valid = true;
    foreach ($columns as $column) {
        if (empty($column['name']) || empty($column['type'])) {
            $valid = false;
            break;
        }
    }

    // Si los datos son válidos, hacemos la llamada a GenerateAngularCrud.php
    if ($valid) {
        $generateCrudUrl = 'http://localhost/adminlte-dashboard/generateAngularCrud.php';
        
        $postData = json_encode([
            'tableName' => $tableName,
            'columns' => $columns
        ]);

        // Realizar la solicitud POST usando CURL
        $ch = curl_init($generateCrudUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            echo json_encode(['success' => false, 'message' => 'Error al llamar a GenerateAngularCrud.php']);
        } else {
            echo json_encode(['success' => true, 'message' => 'CRUD generado correctamente.']);
        }

        curl_close($ch);
    } else {
        echo json_encode(['success' => false, 'message' => 'Los datos de la tabla no son válidos.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Faltan datos necesarios.']);
}
?>
