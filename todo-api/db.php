<?php
$dbHost = 'sql209.infinityfree.com'; // Or your database host (e.g., 127.0.0.1)
$dbUser = 'if0_38931487';      // Your database username
$dbPass = 'iOM51gF3Vtim8T';          // Your database password
$dbName = 'if0_38931487_dbtodos'; // Your database name

header("Access-Control-Allow-Origin: tasktodo.infinityfreeapp.com"); // Allow requests from any origin (React dev server) - INSECURE FOR PRODUCTION!
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Allow specific methods
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"); // Allow specific headers
header("Content-Type: application/json; charset=UTF-8"); // Always return JSON

// Handle OPTIONS preflight request (sent by browsers for CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    // Set PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Optional: Set default fetch mode
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Don't echo connection errors in production! Log them instead.
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit(); // Stop script execution
}

?>