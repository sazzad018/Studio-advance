<?php
require 'db.php';
$stmt = $pdo->query("DESCRIBE schedule");
echo json_encode($stmt->fetchAll());
?>
