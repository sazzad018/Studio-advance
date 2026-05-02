<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 'ct' . time() . rand(100, 999);
    $url = isset($data->url) ? $data->url : null;
    
    $stmt = $pdo->prepare("INSERT INTO content (id, title, type, platform, status, scheduledDate, url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->title, $data->type, $data->platform, $data->status, $data->scheduledDate, $url]);
    
    $data->id = $id;
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
