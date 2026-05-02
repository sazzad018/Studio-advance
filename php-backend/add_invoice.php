<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 'inv' . time() . rand(100, 999);
    $items = json_encode($data->items);
    $notes = isset($data->notes) ? $data->notes : '';
    
    $stmt = $pdo->prepare("INSERT INTO invoices (id, clientId, projectId, invoiceNumber, date, dueDate, items, subtotal, taxRate, discount, total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id, 
        $data->clientId, 
        $data->projectId, 
        $data->invoiceNumber, 
        $data->date, 
        $data->dueDate, 
        $items, 
        $data->subtotal, 
        $data->taxRate, 
        $data->discount, 
        $data->total, 
        isset($data->status) ? $data->status : 'Unpaid',
        $notes
    ]);
    
    $data->id = $id;
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
