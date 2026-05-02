<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM content");
$content = $stmt->fetchAll();

echo json_encode($content);
?>
