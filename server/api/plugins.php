<?php
require_once '../db_config.php';

header('Content-Type: application/json');

// Get database connection
$conn = getDbConnection();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($conn);
        break;
    case 'POST':
        handlePost($conn);
        break;
    case 'PUT':
        handlePut($conn);
        break;
    case 'DELETE':
        handleDelete($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Close connection
$conn->close();

// Handle GET requests
function handleGet($conn) {
    // Check if specific plugin ID is requested
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $stmt = $conn->prepare("SELECT * FROM marketplace_plugins WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode($result->fetch_assoc());
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Plugin not found']);
        }
        $stmt->close();
        return;
    }
    
    // Check if we're getting project plugins
    if (isset($_GET['project_id'])) {
        $projectId = $_GET['project_id'];
        $stmt = $conn->prepare("SELECT pp.*, mp.name, mp.description, mp.version, mp.author, mp.category 
                              FROM project_plugins pp 
                              JOIN marketplace_plugins mp ON pp.plugin_id = mp.id 
                              WHERE pp.project_id = ?");
        $stmt->bind_param("s", $projectId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $plugins = [];
        while ($row = $result->fetch_assoc()) {
            $plugins[] = $row;
        }
        
        echo json_encode($plugins);
        $stmt->close();
        return;
    }
    
    // Get all marketplace plugins with optional filtering
    $query = "SELECT * FROM marketplace_plugins WHERE 1=1";
    $params = [];
    $types = "";
    
    // Filter by category
    if (isset($_GET['category'])) {
        $query .= " AND category = ?";
        $params[] = $_GET['category'];
        $types .= "s";
    }
    
    // Filter by published status
    if (isset($_GET['published'])) {
        $published = $_GET['published'] === 'true' ? 1 : 0;
        $query .= " AND is_published = ?";
        $params[] = $published;
        $types .= "i";
    }
    
    // Search by name or description
    if (isset($_GET['search'])) {
        $search = "%{$_GET['search']}%";
        $query .= " AND (name LIKE ? OR description LIKE ?)";
        $params[] = $search;
        $params[] = $search;
        $types .= "ss";
    }
    
    // Sort options
    if (isset($_GET['sort'])) {
        switch ($_GET['sort']) {
            case 'downloads':
                $query .= " ORDER BY downloads DESC";
                break;
            case 'rating':
                $query .= " ORDER BY rating DESC";
                break;
            case 'newest':
                $query .= " ORDER BY created_at DESC";
                break;
            default:
                $query .= " ORDER BY downloads DESC";
                break;
        }
    } else {
        $query .= " ORDER BY downloads DESC";
    }
    
    // Prepare and execute the statement
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $plugins = [];
    while ($row = $result->fetch_assoc()) {
        $plugins[] = $row;
    }
    
    echo json_encode($plugins);
    $stmt->close();
}

// Handle POST requests
function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if we're installing a plugin for a project
    if (isset($data['project_id']) && isset($data['plugin_id'])) {
        installPluginForProject($conn, $data);
        return;
    }
    
    // Check if we're updating plugin settings
    if (isset($data['plugin_settings'])) {
        updatePluginSettings($conn, $data);
        return;
    }
    
    // Check if we're adding content metadata
    if (isset($data['content_metadata'])) {
        addContentMetadata($conn, $data);
        return;
    }
    
    // Create new marketplace plugin
    if (!isset($data['id']) || !isset($data['name']) || !isset($data['version']) || !isset($data['author'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    // Generate slug if not provided
    if (!isset($data['slug'])) {
        $data['slug'] = strtolower(str_replace(' ', '-', $data['name']));
    }
    
    $stmt = $conn->prepare("INSERT INTO marketplace_plugins 
                          (id, name, slug, description, version, author, category, tags, price, is_published, thumbnail_url, documentation_url) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $isPublished = isset($data['is_published']) ? $data['is_published'] : false;
    $stmt->bind_param("ssssssssssss", 
        $data['id'],
        $data['name'],
        $data['slug'],
        $data['description'],
        $data['version'],
        $data['author'],
        $data['category'],
        $data['tags'],
        $data['price'],
        $isPublished,
        $data['thumbnail_url'],
        $data['documentation_url']
    );
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $data['id']]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create plugin', 'details' => $stmt->error]);
    }
    
    $stmt->close();
}

// Handle PUT requests
function handlePut($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing plugin ID']);
        return;
    }
    
    // Check if we're updating project plugin status
    if (isset($data['project_id']) && isset($data['is_active'])) {
        updatePluginStatus($conn, $data);
        return;
    }
    
    // Update marketplace plugin
    $id = $data['id'];
    unset($data['id']); // Remove ID from data to update
    
    // Build update query
    $query = "UPDATE marketplace_plugins SET ";
    $params = [];
    $types = "";
    
    foreach ($data as $key => $value) {
        $query .= "$key = ?, ";
        $params[] = $value;
        
        // Determine parameter type
        if (is_int($value)) {
            $types .= "i";
        } elseif (is_float($value)) {
            $types .= "d";
        } elseif (is_bool($value)) {
            $types .= "i";
            $params[count($params) - 1] = $value ? 1 : 0;
        } else {
            $types .= "s";
        }
    }
    
    // Remove trailing comma and space
    $query = rtrim($query, ", ");
    
    // Add WHERE clause
    $query .= " WHERE id = ?";
    $params[] = $id;
    $types .= "s";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'id' => $id]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Plugin not found or no changes made']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update plugin', 'details' => $stmt->error]);
    }
    
    $stmt->close();
}

// Handle DELETE requests
function handleDelete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if we're uninstalling a plugin from a project
    if (isset($data['project_id']) && isset($data['plugin_id'])) {
        uninstallPluginFromProject($conn, $data);
        return;
    }
    
    // Delete marketplace plugin
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing plugin ID']);
        return;
    }
    
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM marketplace_plugins WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Plugin not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete plugin', 'details' => $stmt->error]);
    }
    
    $stmt->close();
}

// Helper function to install a plugin for a project
function installPluginForProject($conn, $data) {
    $stmt = $conn->prepare("INSERT INTO project_plugins (project_id, plugin_id, is_active, config) VALUES (?, ?, ?, ?)");
    
    $isActive = isset($data['is_active']) ? $data['is_active'] : false;
    $config = isset($data['config']) ? json_encode($data['config']) : null;
    
    $stmt->bind_param("ssis", $data['project_id'], $data['plugin_id'], $isActive, $config);
    
    if ($stmt->execute()) {
        // Increment download count for the plugin
        $updateStmt = $conn->prepare("UPDATE marketplace_plugins SET downloads = downloads + 1 WHERE id = ?");
        $updateStmt->bind_param("s", $data['plugin_id']);
        $updateStmt->execute();
        $updateStmt->close();
        
        http_response_code(201);
        echo json_encode(['success' => true]);
    } else {
        // Check if it's a duplicate entry error
        if ($conn->errno === 1062) { // Duplicate entry error code
            http_response_code(409);
            echo json_encode(['error' => 'Plugin already installed for this project']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to install plugin', 'details' => $stmt->error]);
        }
    }
    
    $stmt->close();
}

// Helper function to uninstall a plugin from a project
function uninstallPluginFromProject($conn, $data) {
    $stmt = $conn->prepare("DELETE FROM project_plugins WHERE project_id = ? AND plugin_id = ?");
    $stmt->bind_param("ss", $data['project_id'], $data['plugin_id']);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Also delete any plugin settings
            $settingsStmt = $conn->prepare("DELETE FROM plugin_settings WHERE project_id = ? AND plugin_id = ?");
            $settingsStmt->bind_param("ss", $data['project_id'], $data['plugin_id']);
            $settingsStmt->execute();
            $settingsStmt->close();
            
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Plugin not installed for this project']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to uninstall plugin', 'details' => $stmt->error]);
    }
    
    $stmt->close();
}

// Helper function to update plugin status (active/inactive)
function updatePluginStatus($conn, $data) {
    $stmt = $conn->prepare("UPDATE project_plugins SET is_active = ? WHERE project_id = ? AND plugin_id = ?");
    
    $isActive = $data['is_active'] ? 1 : 0;
    $stmt->bind_param("iss", $isActive, $data['project_id'], $data['id']);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Plugin not found for this project']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update plugin status', 'details' => $stmt->error]);
    }
    
    $stmt->close();
}

// Helper function to update plugin settings
function updatePluginSettings($conn, $data) {
    if (!isset($data['plugin_id']) || !isset($data['project_id']) || !isset($data['settings'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $pluginId = $data['plugin_id'];
    $projectId = $data['project_id'];
    $settings = $data['settings'];
    
    // Begin transaction
    $conn->begin_transaction();
    
    try {
        foreach ($settings as $key => $value) {
            // Use REPLACE INTO to handle both insert and update
            $stmt = $conn->prepare("REPLACE INTO plugin_settings (plugin_id, project_id, setting_key, setting_value) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $pluginId, $projectId, $key, $value);
            $stmt->execute();
            $stmt->close();
        }
        
        // Commit transaction
        $conn->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update plugin settings', 'details' => $e->getMessage()]);
    }
}

// Helper function to add content metadata
function addContentMetadata($conn, $data) {
    if (!isset($data['content_id']) || !isset($data['plugin_id']) || !isset($data['metadata'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $contentId = $data['content_id'];
    $pluginId = $data['plugin_id'];
    $metadata = $data['metadata'];
    
    // Begin transaction
    $conn->begin_transaction();
    
    try {
        foreach ($metadata as $key => $value) {
            // Use REPLACE INTO to handle both insert and update
            $stmt = $conn->prepare("REPLACE INTO content_metadata (content_id, plugin_id, meta_key, meta_value) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $contentId, $pluginId, $key, $value);
            $stmt->execute();
            $stmt->close();
        }
        
        // Commit transaction
        $conn->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add content metadata', 'details' => $e->getMessage()]);
    }
}
