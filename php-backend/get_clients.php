<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM clients");
$clients = $stmt->fetchAll();

foreach ($clients as &$client) {
    $stmtProj = $pdo->prepare("SELECT * FROM projects WHERE client_id = ?");
    $stmtProj->execute([$client['id']]);
    $projects = $stmtProj->fetchAll();

    $totalBudget = 0;
    foreach ($projects as &$project) {
        $stmtMod = $pdo->prepare("SELECT model_id FROM project_models WHERE project_id = ?");
        $stmtMod->execute([$project['id']]);
        $project['models'] = $stmtMod->fetchAll(PDO::FETCH_COLUMN);
        $project['budget'] = (float)$project['budget'];
        $totalBudget += $project['budget'];
        
        // Add default values for properties expected by the frontend
        $project['title'] = isset($project['name']) ? $project['name'] : '';
        $project['contentLog'] = isset($project['contentLog']) && !empty($project['contentLog']) ? json_decode($project['contentLog']) : [];
        $project['clientAdvance'] = isset($project['clientAdvance']) ? (float)$project['clientAdvance'] : 0;
        $project['modelPayment'] = isset($project['modelPayment']) ? (float)$project['modelPayment'] : 0;
        $project['extraExpenses'] = isset($project['extraExpenses']) ? (float)$project['extraExpenses'] : 0;
        $project['category'] = isset($project['category']) ? $project['category'] : '';
        $project['thumbnailUrl'] = isset($project['thumbnailUrl']) ? $project['thumbnailUrl'] : '';
        $project['script'] = isset($project['script']) ? $project['script'] : '';
        $project['link'] = isset($project['link']) ? $project['link'] : '';
    }
    $client['projects'] = $projects;
    
    // Ensure totalBudget exists (either from DB if added, or calculated from projects)
    if (!isset($client['totalBudget'])) {
        $client['totalBudget'] = $totalBudget;
    } else {
        $client['totalBudget'] = (float)$client['totalBudget'];
    }
}

echo json_encode($clients);
?>
