<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM invoices ORDER BY date DESC");
$invoices = $stmt->fetchAll();

foreach ($invoices as &$invoice) {
    $invoice['items'] = json_decode($invoice['items']);
    $invoice['subtotal'] = (float)$invoice['subtotal'];
    $invoice['taxRate'] = (float)$invoice['taxRate'];
    $invoice['discount'] = (float)$invoice['discount'];
    $invoice['total'] = (float)$invoice['total'];
}

echo json_encode($invoices);
?>
