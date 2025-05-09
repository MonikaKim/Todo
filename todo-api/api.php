<?php
require 'db.php'; // Includes the database connection and CORS headers

$original_method = $_SERVER['REQUEST_METHOD'];
$method = $original_method;
$input = json_decode(file_get_contents('php://input'), true);

// --- Path-based routing for ID (optional) ---
$pathInfo = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';
$params = explode('/', trim($pathInfo,'/'));
$resourceId = isset($params[0]) && is_numeric($params[0]) ? intval($params[0]) : null;
// --- ---

// Handle _method overriding for POST requests (to simulate PUT/DELETE)
if ($original_method === 'POST' && isset($input['_method'])) {
    $potential_method_override = strtoupper($input['_method']);
    if (in_array($potential_method_override, ['PUT', 'DELETE'])) {
        $method = $potential_method_override; // Override the method
    }
}

// --- Determine ID from path, GET param, or input body ---
$id = $resourceId;
if (!$id) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
}
// For PUT/DELETE (or overridden POST), ID might also be in the body if not in URL
if (!$id && isset($input['id']) && ($method === 'PUT' || $method === 'DELETE')) {
    $id = intval($input['id']);
}
// --- ---

try {
    switch ($method) {
        case 'GET': // READ
            if ($id) {
                // Get a single todo item
                $stmt = $pdo->prepare("SELECT id, name, due_date, status, created_at FROM todos WHERE id = ? AND is_active = 1");
                $stmt->execute([$id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    echo json_encode($result);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Todo item not found']);
                }
            } else {
                // Get all active todo items
                // Assuming a 'created_at' column for ordering. Adjust if not present.
                $stmt = $pdo->query("SELECT id, name, due_date, status, created_at FROM todos WHERE is_active = 1 ORDER BY created_at DESC");
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($results);
            }
            break;

        case 'POST': // CREATE
            if (!isset($input['name'])) {
                http_response_code(400); // Bad Request
                echo json_encode(['error' => 'Missing required field: name']);
                exit;
            }

            $name = $input['name'];
            $due_date = isset($input['due_date']) ? $input['due_date'] : null;
            $status = isset($input['status']) ? $input['status'] : 'pending'; // Default status

            $sql = "INSERT INTO todos (name, due_date, status) VALUES (:name, :due_date, :status)";
            $stmt = $pdo->prepare($sql);
            
            if ($stmt->execute(['name' => $name, 'due_date' => $due_date, 'status' => $status])) {
                $lastId = $pdo->lastInsertId();
                // Fetch and return the created todo item
                $selectStmt = $pdo->prepare("SELECT id, name, due_date, status, created_at FROM todos WHERE id = ?");
                $selectStmt->execute([$lastId]);
                $createdTodo = $selectStmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(201); // Created
                echo json_encode($createdTodo);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create todo item']);
            }
            break;

        case 'PUT': // UPDATE
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing id for update']);
                exit;
            }

            // Check if the todo item exists
            $checkStmt = $pdo->prepare("SELECT id FROM todos WHERE id = ? AND is_active = 1");
            $checkStmt->execute([$id]);
            if ($checkStmt->fetchColumn() === false) {
                http_response_code(404);
                echo json_encode(['error' => 'Todo item not found or not active']);
                exit;
            }
            
            // Collect fields to update
            $fieldsToUpdate = [];
            $paramsToExecute = [];

            if (isset($input['name'])) {
                $fieldsToUpdate[] = "name = :name";
                $paramsToExecute['name'] = $input['name'];
            }
            if (isset($input['due_date'])) { // Allows setting due_date to null as well if explicitly passed
                $fieldsToUpdate[] = "due_date = :due_date";
                $paramsToExecute['due_date'] = $input['due_date'];
            }
            if (isset($input['status'])) {
                $fieldsToUpdate[] = "status = :status";
                $paramsToExecute['status'] = $input['status'];
            }

            if (empty($fieldsToUpdate)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields provided for update']);
                exit;
            }

            $paramsToExecute['id'] = $id;
            $sql = "UPDATE todos SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);

            if ($stmt->execute($paramsToExecute)) {
                // Fetch and return the updated todo item
                $selectStmt = $pdo->prepare("SELECT id, name, due_date, status, created_at FROM todos WHERE id = ?");
                $selectStmt->execute([$id]);
                $updatedTodo = $selectStmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($updatedTodo);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update todo item']);
            }
            break;

        case 'DELETE': // SOFT DELETE
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing id for delete']);
                exit;
            }
            $sql = "UPDATE todos SET is_active = 0 WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            
            if ($stmt->execute([$id])) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['message' => 'Todo item deleted successfully']);
                } else {
                    http_response_code(404); // Or handle as success if idempotency is desired
                    echo json_encode(['message' => 'Todo item not found or already deleted']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete todo item']);
            }
            break;

        default:
            http_response_code(405); // Method Not Allowed
            echo json_encode(['error' => 'Method Not Allowed. Allowed methods: GET, POST, PUT, DELETE. Original method: ' . $original_method . ', Processed method: ' . $method]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    // In production, log the detailed error and return a generic message
    error_log('Database Error: ' . $e->getMessage()); // Example logging
    echo json_encode(['error' => 'Database error processing your request.']);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    error_log('General Error: ' . $e->getMessage()); // Example logging
    echo json_encode(['error' => 'A general error occurred.']);
}
?>