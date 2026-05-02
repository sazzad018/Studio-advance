<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->id)) {
    $stmt = $pdo->prepare("DELETE FROM invoices WHERE id = ?");
    $stmt->execute([$data->id]);
    
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
