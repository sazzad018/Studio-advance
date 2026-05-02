<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM schedule");
$schedule = $stmt->fetchAll();

// Convert strings back to arrays for frontend
foreach ($schedule as &$event) {
    $event['participants'] = isset($event['participants']) && !empty($event['participants']) ? json_decode($event['participants']) : [];
    $event['models'] = isset($event['models']) && !empty($event['models']) ? json_decode($event['models']) : [];
    $event['crew'] = isset($event['crew']) && !empty($event['crew']) ? json_decode($event['crew']) : [];
}

echo json_encode($schedule);
?>
