<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 'c' . time() . rand(100, 999);
    
    // Provide default values for fields that might be missing from the frontend
    $name = isset($data->name) ? $data->name : '';
    $company = isset($data->company) ? $data->company : '';
    $email = isset($data->email) ? $data->email : '';
    $phone = isset($data->phone) ? $data->phone : '';
    $facebook = isset($data->facebook) ? $data->facebook : '';
    $status = isset($data->status) ? $data->status : 'Active';
    
    $stmt = $pdo->prepare("INSERT INTO clients (id, name, company, email, phone, facebook, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $name, $company, $email, $phone, $facebook, $status]);
    
    $data->id = $id;
    $data->projects = [];
    // Ensure totalBudget is set for the frontend
    if (!isset($data->totalBudget)) {
        $data->totalBudget = 0;
    }
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
