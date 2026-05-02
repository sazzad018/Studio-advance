<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 'm' . time() . rand(100, 999);
    
    // Provide default values for fields that might be missing from the frontend
    $name = isset($data->name) ? $data->name : '';
    $category = isset($data->category) ? $data->category : '';
    $hourlyRate = isset($data->hourlyRate) ? $data->hourlyRate : 0;
    $rating = isset($data->rating) ? $data->rating : 0.0;
    $imageUrl = isset($data->imageUrl) ? $data->imageUrl : '';
    $status = isset($data->status) ? $data->status : 'Active';
    $phone = isset($data->phone) ? $data->phone : '';
    $email = isset($data->email) ? $data->email : '';
    $facebook = isset($data->facebook) ? $data->facebook : '';
    
    $stmt = $pdo->prepare("INSERT INTO models (id, name, category, hourlyRate, rating, imageUrl, status, phone, email, facebook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $category, $hourlyRate, $rating, $imageUrl, $status, $phone, $email, $facebook]);
    
    $data->id = $id;
    $data->projects = [];
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
