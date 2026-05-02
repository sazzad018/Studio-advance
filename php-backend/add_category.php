<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->category)) {
    try {
        $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
        $stmt->execute([$data->category]);
        echo json_encode(['success' => true]);
    } catch (\PDOException $e) {
        // If category already exists, just return success
        if ($e->getCode() == 23000) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
