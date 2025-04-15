<?php

// Obtener los datos enviados desde el frontend (React)
$data = json_decode(file_get_contents("php://input"), true);

// Verificar si la solicitud contiene los datos necesarios
if (isset($data['tableName']) && isset($data['columns']) && !empty($data['tableName']) && !empty($data['columns'])) {
    $tableName = $data['tableName'];
    $columns = $data['columns'];

    // Aquí puedes realizar validaciones adicionales si es necesario
    // Ejemplo: comprobar que cada columna tenga un nombre y tipo
''
    $valid = true;
    foreach ($columns as $column) {
        if (empty($column['name']) || empty($column['type'])) {
            $valid = false;
            break;
        }
    }

    // Si los datos son válidos, hacemos la llamada a GenerateAngularCrud.php
    if ($valid) {
        // Establecer la URL del archivo GenerateAngularCrud.php
        $generateCrudUrl = 'http://localhost/adminlte-dashboard/generateAngularCrud.php';
        // Pasamos los datos necesarios a GenerateAngularCrud.php

        $postData = [
            'tableName' => $tableName,
            'columns' => $columns
        ];

        // Convertir los datos a un formato JSON para pasarlos a GenerateAngularCrud.php
        $dataString = json_encode($postData);

        // Realizar la solicitud POST a GenerateAngularCrud.php usando CURL
        $ch = curl_init($generateCrudUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        // Ejecutar la solicitud y obtener la respuesta
        $response = curl_exec($ch);

        // Comprobar si ocurrió algún error en la solicitud CURL
        if (curl_errno($ch)) {
            echo json_encode(['success' => false, 'message' => 'Error al llamar a GenerateAngularCrud.php']);
        } else {
            // Si todo salió bien, devolver true
            echo json_encode(['success' => true, 'message' => 'CRUD generado correctamente.']);
        }

        // Cerrar la conexión CURL
        curl_close($ch);
    } else {
        // Si la validación falló, devolver false
        echo json_encode(['success' => false, 'message' => 'Los datos de la tabla no son válidos.']);
    }
} else {
    // Si falta algún dato, devolver false
    echo json_encode(['success' => false, 'message' => 'Faltan datos necesarios.']);
}
?>
