<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT date_key, step_id, completed, notes FROM daily_tasks");
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Transform flat array into nested associative array for frontend
    // { "2024-04-16": { "step1": { "completed": true, "notes": "..." } } }
    $result = [];
    foreach ($tasks as $task) {
        $dateKey = $task['date_key'];
        $stepId = $task['step_id'];
        
        if (!isset($result[$dateKey])) {
            $result[$dateKey] = [];
        }
        
        $result[$dateKey][$stepId] = [
            'completed' => (bool)$task['completed'],
            'notes' => $task['notes']
        ];
    }
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch daily tasks: " . $e->getMessage()]);
}
?>
