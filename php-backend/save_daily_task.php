<?php
require_once 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['date_key']) || !isset($data['step_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing date_key or step_id"]);
    exit;
}

$dateKey = $data['date_key'];
$stepId = $data['step_id'];
$completed = isset($data['completed']) ? (int)$data['completed'] : 0;
$notes = isset($data['notes']) ? $data['notes'] : '';

try {
    $stmt = $pdo->prepare("
        INSERT INTO daily_tasks (date_key, step_id, completed, notes) 
        VALUES (:date_key, :step_id, :completed, :notes)
        ON DUPLICATE KEY UPDATE 
            completed = VALUES(completed), 
            notes = VALUES(notes)
    ");
    
    $stmt->execute([
        ':date_key' => $dateKey,
        ':step_id' => $stepId,
        ':completed' => $completed,
        ':notes' => $notes
    ]);
    
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save daily task: " . $e->getMessage()]);
}
?>
