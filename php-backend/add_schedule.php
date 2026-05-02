<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 's' . time() . rand(100, 999);
    
    // Fallback for old participants field if sent
    $participants = isset($data->participants) ? json_encode($data->participants) : json_encode([]);
    
    // New fields
    $models = isset($data->models) ? json_encode($data->models) : json_encode([]);
    $crew = isset($data->crew) ? json_encode($data->crew) : json_encode([]);
    $projectId = isset($data->projectId) ? $data->projectId : '';
    $status = isset($data->status) ? $data->status : 'Pending';
    
    $stmt = $pdo->prepare("INSERT INTO schedule (id, title, date, type, participants, status, models, crew, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->title, $data->date, $data->type, $participants, $status, $models, $crew, $projectId]);
    
    $data->id = $id;
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
