<?php
$url = 'http://localhost/adminlte-dashboard/src/Component/CallerLenguage.php';
$data = [
    'tableName' => 'Usuarios',
    'columns' => [
        ['name' => 'id', 'type' => 'INT PRIMARY KEY AUTO_INCREMENT'],
        ['name' => 'nombre', 'type' => 'VARCHAR(255)'],
        ['name' => 'email', 'type' => 'VARCHAR(255)'],
    ]
];

$options = [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($data)
];

$ch = curl_init();
curl_setopt_array($ch, $options);
$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "Error cURL: " . $error;
} else {
    echo "Respuesta del servidor: " . $response;
}
?>
