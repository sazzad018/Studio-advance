<?php
// Error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Global exception handler to return JSON errors
set_exception_handler(function ($e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
    exit;
});

$host = 'localhost';
$db   = 'studio_management';
$user = 'root'; // আপনার ডাটাবেজ ইউজারনেম দিন (যেমন: XAMPP এর জন্য root)
$pass = '';     // আপনার ডাটাবেজ পাসওয়ার্ড দিন (XAMPP এর জন্য ফাঁকা রাখুন)
$charset = 'utf8mb4';

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Auto-migrate missing columns for projects table
    $projectColumns = [
        "category" => "VARCHAR(100) DEFAULT ''",
        "thumbnailUrl" => "LONGTEXT",
        "script" => "TEXT",
        "link" => "VARCHAR(255)",
        "clientAdvance" => "DECIMAL(10, 2) DEFAULT 0",
        "modelPayment" => "DECIMAL(10, 2) DEFAULT 0",
        "extraExpenses" => "DECIMAL(10, 2) DEFAULT 0",
        "contentLog" => "TEXT"
    ];
    
    try {
        // Check if projects table exists first
        $stmt = $pdo->query("SHOW TABLES LIKE 'projects'");
        if ($stmt->rowCount() > 0) {
            foreach ($projectColumns as $colName => $colDef) {
                $stmt = $pdo->query("SHOW COLUMNS FROM projects LIKE '$colName'");
                if ($stmt->rowCount() == 0) {
                    try {
                        $pdo->exec("ALTER TABLE projects ADD COLUMN $colName $colDef");
                    } catch (\Exception $e) {}
                }
            }
            
            // Modify thumbnailUrl to LONGTEXT if it's not already
            try {
                $stmt = $pdo->query("SHOW COLUMNS FROM projects LIKE 'thumbnailUrl'");
                $col = $stmt->fetch();
                if ($col && stripos($col['Type'], 'longtext') === false) {
                    $pdo->exec("ALTER TABLE projects MODIFY COLUMN thumbnailUrl LONGTEXT");
                }
            } catch (\Exception $e) {}
        }
    } catch (\Exception $e) {}
    
    // Auto-migrate categories table if missing
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'categories'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("CREATE TABLE categories (name VARCHAR(100) PRIMARY KEY)");
            $pdo->exec("INSERT INTO categories (name) VALUES ('Fashion'), ('Commercial'), ('Editorial'), ('Fitness'), ('Parts')");
        }
    } catch (\Exception $e) {}
    
    // Auto-migrate missing columns for models table
    $modelColumns = [
        "phone" => "VARCHAR(50)",
        "email" => "VARCHAR(100)",
        "facebook" => "VARCHAR(255)"
    ];
    
    try {
        // Check if models table exists first
        $stmt = $pdo->query("SHOW TABLES LIKE 'models'");
        if ($stmt->rowCount() > 0) {
            foreach ($modelColumns as $colName => $colDef) {
                $stmt = $pdo->query("SHOW COLUMNS FROM models LIKE '$colName'");
                if ($stmt->rowCount() == 0) {
                    try {
                        $pdo->exec("ALTER TABLE models ADD COLUMN $colName $colDef");
                    } catch (\Exception $e) {}
                }
            }
            
            // Modify imageUrl to LONGTEXT if it's not already
            try {
                $stmt = $pdo->query("SHOW COLUMNS FROM models LIKE 'imageUrl'");
                $col = $stmt->fetch();
                if ($col && stripos($col['Type'], 'longtext') === false) {
                    $pdo->exec("ALTER TABLE models MODIFY COLUMN imageUrl LONGTEXT");
                }
            } catch (\Exception $e) {}
        }
    } catch (\Exception $e) {}
    
    // Auto-migrate missing columns for schedule table
    $scheduleColumns = [
        "models" => "TEXT",
        "crew" => "TEXT",
        "projectId" => "VARCHAR(100)",
        "status" => "VARCHAR(50) DEFAULT 'Pending'"
    ];
    
    try {
        // Check if schedule table exists first
        $stmt = $pdo->query("SHOW TABLES LIKE 'schedule'");
        if ($stmt->rowCount() > 0) {
            foreach ($scheduleColumns as $colName => $colDef) {
                $stmt = $pdo->query("SHOW COLUMNS FROM schedule LIKE '$colName'");
                if ($stmt->rowCount() == 0) {
                    try {
                        $pdo->exec("ALTER TABLE schedule ADD COLUMN $colName $colDef");
                    } catch (\Exception $e) {}
                }
            }
            
            // Make status nullable or default
            try {
                $pdo->exec("ALTER TABLE schedule MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
            } catch (\Exception $e) {}
        }
    } catch (\Exception $e) {}

    // Auto-migrate invoices table if missing
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'invoices'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("CREATE TABLE invoices (
                id VARCHAR(50) PRIMARY KEY,
                clientId VARCHAR(50),
                projectId VARCHAR(50),
                invoiceNumber VARCHAR(50),
                date VARCHAR(50),
                dueDate VARCHAR(50),
                items LONGTEXT,
                subtotal DECIMAL(10, 2),
                taxRate DECIMAL(5, 2),
                discount DECIMAL(10, 2),
                total DECIMAL(10, 2),
                status VARCHAR(50) DEFAULT 'Unpaid'
            )");
        }
    } catch (\Exception $e) {}
    
} catch (\PDOException $e) {
    http_response_code(500);
    if (strpos($e->getMessage(), 'could not find driver') !== false) {
        echo json_encode(['error' => 'PDO MySQL driver is missing on your server. Please enable "pdo_mysql" and "mysqli" extensions in your cPanel PHP Selector.']);
    } else {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    }
    exit;
}
?>
