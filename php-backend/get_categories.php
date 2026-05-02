<?php
require 'db.php';

try {
    $stmt = $pdo->query("SELECT name FROM categories");
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($categories)) {
        $categories = ['Fashion', 'Commercial', 'Editorial', 'Fitness', 'Parts'];
        foreach ($categories as $cat) {
            $pdo->exec("INSERT IGNORE INTO categories (name) VALUES ('$cat')");
        }
    }
    
    echo json_encode($categories);
} catch (\PDOException $e) {
    // Fallback if table doesn't exist
    echo json_encode(['Fashion', 'Commercial', 'Editorial', 'Fitness', 'Parts']);
}
?>
