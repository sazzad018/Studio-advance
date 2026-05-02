<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM models");
$models = $stmt->fetchAll();

foreach ($models as &$model) {
    $stmtProj = $pdo->prepare("SELECT project_id FROM project_models WHERE model_id = ?");
    $stmtProj->execute([$model['id']]);
    $model['projects'] = $stmtProj->fetchAll(PDO::FETCH_COLUMN);
    $model['hourlyRate'] = (float)$model['hourlyRate'];
    $model['rating'] = (float)$model['rating'];
}

echo json_encode($models);
?>
