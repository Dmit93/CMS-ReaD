<?php
/**
 * Main entry point for the CMS API
 */

// Set error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        } elseif (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        }
        
        putenv("$name=$value");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

// Database connection function
function getDatabaseConnection() {
    $dbType = getenv('DATABASE_TYPE') ?: 'sqlite';
    
    try {
        if ($dbType === 'sqlite') {
            $dbPath = getenv('DATABASE_PATH') ?: __DIR__ . '/../database.sqlite';
            $pdo = new PDO('sqlite:' . $dbPath);
            $pdo->exec('PRAGMA foreign_keys = ON;');
        } elseif ($dbType === 'mysql') {
            $dbHost = getenv('DATABASE_HOST') ?: 'localhost';
            $dbPort = getenv('DATABASE_PORT') ?: '3306';
            $dbName = getenv('DATABASE_NAME') ?: 'cms_platform';
            $dbUser = getenv('DATABASE_USER') ?: 'root';
            $dbPassword = getenv('DATABASE_PASSWORD') ?: '';
            $dbCharset = 'utf8mb4';
            
            $dsn = "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=$dbCharset";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $dbCharset COLLATE utf8mb4_unicode_ci"
            ];
            
            $pdo = new PDO($dsn, $dbUser, $dbPassword, $options);
        } else {
            throw new Exception("Unsupported database type: $dbType");
        }
        
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Base Controller class
class BaseController {
    protected $db;
    
    public function __construct() {
        $this->db = getDatabaseConnection();
        
        if ($this->db === null) {
            $this->sendError('Database connection failed', 500);
        }
    }
    
    protected function sendResponse($data, $statusCode = 200) {
        header("Content-Type: application/json");
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
    
    protected function sendError($message, $statusCode = 400) {
        $this->sendResponse(['error' => $message], $statusCode);
    }
    
    public function index() {
        $this->sendError('Method not implemented', 501);
    }
    
    public function show($id) {
        $this->sendError('Method not implemented', 501);
    }
    
    public function store($data) {
        $this->sendError('Method not implemented', 501);
    }
    
    public function update($id, $data) {
        $this->sendError('Method not implemented', 501);
    }
    
    public function destroy($id) {
        $this->sendError('Method not implemented', 501);
    }
    
    public function customAction($id, $action, $data = null) {
        $this->sendError('Method not implemented', 501);
    }
}

// Plugin Controller class
class PluginController extends BaseController {
    public function index() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM plugins");
            $stmt->execute();
            $plugins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->sendResponse(['plugins' => $plugins]);
        } catch (Exception $e) {
            $this->sendError('Failed to get plugins: ' . $e->getMessage(), 500);
        }
    }
    
    public function show($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$id]);
            $plugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plugin) {
                $this->sendError('Plugin not found', 404);
            }
            
            $this->sendResponse(['plugin' => $plugin]);
        } catch (Exception $e) {
            $this->sendError('Failed to get plugin: ' . $e->getMessage(), 500);
        }
    }
    
    public function store($data) {
        try {
            if (!isset($data['id']) || !isset($data['name']) || !isset($data['version'])) {
                $this->sendError('Missing required fields', 400);
            }
            
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$data['id']]);
            $existingPlugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingPlugin) {
                $this->sendError('Plugin already exists', 409);
            }
            
            $stmt = $this->db->prepare(
                "INSERT INTO plugins (id, name, version, description, author, url, installed, active, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, 1, 0, datetime('now'), datetime('now'))"
            );
            
            $stmt->execute([
                $data['id'],
                $data['name'],
                $data['version'],
                $data['description'] ?? '',
                $data['author'] ?? '',
                $data['url'] ?? ''
            ]);
            
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$data['id']]);
            $plugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(['plugin' => $plugin, 'message' => 'Plugin installed successfully'], 201);
        } catch (Exception $e) {
            $this->sendError('Failed to install plugin: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id, $data) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$id]);
            $plugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plugin) {
                $this->sendError('Plugin not found', 404);
            }
            
            $updateFields = [];
            $updateValues = [];
            
            foreach (['name', 'version', 'description', 'author', 'url', 'active'] as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $updateValues[] = $data[$field];
                }
            }
            
            $updateFields[] = "updated_at = datetime('now')";
            $updateValues[] = $id;
            
            $stmt = $this->db->prepare(
                "UPDATE plugins SET " . implode(', ', $updateFields) . " WHERE id = ?"
            );
            
            $stmt->execute($updateValues);
            
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$id]);
            $updatedPlugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(['plugin' => $updatedPlugin, 'message' => 'Plugin updated successfully']);
        } catch (Exception $e) {
            $this->sendError('Failed to update plugin: ' . $e->getMessage(), 500);
        }
    }
    
    public function destroy($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$id]);
            $plugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plugin) {
                $this->sendError('Plugin not found', 404);
            }
            
            $stmt = $this->db->prepare("DELETE FROM plugins WHERE id = ?");
            $stmt->execute([$id]);
            
            $this->sendResponse(['message' => 'Plugin uninstalled successfully']);
        } catch (Exception $e) {
            $this->sendError('Failed to uninstall plugin: ' . $e->getMessage(), 500);
        }
    }
    
    public function customAction($id, $action, $data = null) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM plugins WHERE id = ?");
            $stmt->execute([$id]);
            $plugin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plugin) {
                $this->sendError('Plugin not found', 404);
            }
            
            switch ($action) {
                case 'activate':
                    $stmt = $this->db->prepare(
                        "UPDATE plugins SET active = 1, updated_at = datetime('now') WHERE id = ?"
                    );
                    $stmt->execute([$id]);
                    
                    $this->sendResponse(['message' => 'Plugin activated successfully']);
                    break;
                
                case 'deactivate':
                    $stmt = $this->db->prepare(
                        "UPDATE plugins SET active = 0, updated_at = datetime('now') WHERE id = ?"
                    );
                    $stmt->execute([$id]);
                    
                    $this->sendResponse(['message' => 'Plugin deactivated successfully']);
                    break;
                
                case 'config':
                    if ($data === null) {
                        $this->sendError('No configuration data provided', 400);
                    }
                    
                    $config = json_encode($data);
                    
                    $stmt = $this->db->prepare(
                        "UPDATE plugins SET config = ?, updated_at = datetime('now') WHERE id = ?"
                    );
                    $stmt->execute([$config, $id]);
                    
                    $this->sendResponse(['message' => 'Plugin configuration updated successfully']);
                    break;
                
                default:
                    $this->sendError('Invalid action', 400);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Failed to perform action: ' . $e->getMessage(), 500);
        }
    }
    
    public function getMarketplacePlugins() {
        try {
            // Use mock data for marketplace plugins
            $plugins = [
                [
                    'id' => 'seo-toolkit',
                    'name' => 'SEO Toolkit',
                    'version' => '1.0.0',
                    'description' => 'SEO optimization tools for your content',
                    'author' => 'CMS Team',
                    'url' => 'https://example.com/plugins/seo-toolkit',
                    'rating' => 4.5,
                    'downloads' => 1250,
                    'price' => 0,
                    'category' => 'SEO'
                ],
                [
                    'id' => 'ecommerce-shop',
                    'name' => 'E-Commerce Shop',
                    'version' => '1.2.0',
                    'description' => 'Add e-commerce functionality to your site',
                    'author' => 'Commerce Solutions',
                    'url' => 'https://example.com/plugins/ecommerce-shop',
                    'rating' => 4.8,
                    'downloads' => 3500,
                    'price' => 49.99,
                    'category' => 'E-Commerce'
                ],
                [
                    'id' => 'social-media-integration',
                    'name' => 'Social Media Integration',
                    'version' => '1.1.0',
                    'description' => 'Integrate social media sharing and feeds',
                    'author' => 'Social Connect',
                    'url' => 'https://example.com/plugins/social-media-integration',
                    'rating' => 4.2,
                    'downloads' => 2100,
                    'price' => 0,
                    'category' => 'Social Media'
                ],
                [
                    'id' => 'form-builder',
                    'name' => 'Form Builder',
                    'version' => '1.0.5',
                    'description' => 'Create custom forms with validation',
                    'author' => 'Form Solutions',
                    'url' => 'https://example.com/plugins/form-builder',
                    'rating' => 4.4,
                    'downloads' => 2800,
                    'price' => 19.99,
                    'category' => 'Forms'
                ]
            ];
            
            $this->sendResponse(['plugins' => $plugins]);
        } catch (Exception $e) {
            $this->sendError('Failed to get marketplace plugins: ' . $e->getMessage(), 500);
        }
    }
}

// Parse request URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';

// Remove query string from request URI if present
if (strpos($requestUri, '?') !== false) {
    $requestUri = substr($requestUri, 0, strpos($requestUri, '?'));
}

// Check if request is for API
if (strpos($requestUri, $basePath) === 0) {
    // Remove base path from request URI
    $requestUri = substr($requestUri, strlen($basePath));
    
    // Split URI into segments
    $segments = explode('/', trim($requestUri, '/'));
    $resource = $segments[0] ?? '';
    $id = $segments[1] ?? null;
    $action = $segments[2] ?? null;
    
    // Get request method
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Get request body for POST, PUT requests
    $body = null;
    if ($method === 'POST' || $method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
    }
    
    // Route request to appropriate controller
    switch ($resource) {
        case 'plugins':
            $controller = new PluginController();
            
            if ($method === 'GET' && $id === 'marketplace') {
                $controller->getMarketplacePlugins();
            } elseif ($method === 'GET' && $id === null) {
                $controller->index();
            } elseif ($method === 'GET' && $id !== null) {
                $controller->show($id);
            } elseif ($method === 'POST' && $id === null) {
                $controller->store($body);
            } elseif ($method === 'PUT' && $id !== null) {
                $controller->update($id, $body);
            } elseif ($method === 'DELETE' && $id !== null) {
                $controller->destroy($id);
            } elseif ($method === 'POST' && $id !== null && $action !== null) {
                $controller->customAction($id, $action, $body);
            } else {
                header("HTTP/1.1 404 Not Found");
                echo json_encode(['error' => 'Route not found']);
            }
            break;
        
        default:
            // Resource not found
            header("HTTP/1.1 404 Not Found");
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
} else {
    // Not an API request, serve static files or frontend
    $filePath = __DIR__ . $requestUri;
    
    if (file_exists($filePath) && is_file($filePath)) {
        // Determine content type based on file extension
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $contentTypes = [
            'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'pdf' => 'application/pdf'
        ];
        
        $contentType = $contentTypes[$extension] ?? 'text/plain';
        header("Content-Type: $contentType");
        
        // Output file contents
        readfile($filePath);
    } else {
        // File not found, redirect to index.html for SPA routing
        $indexPath = __DIR__ . '/index.html';
        
        if (file_exists($indexPath)) {
            header("Content-Type: text/html");
            readfile($indexPath);
        } else {
            // Index file not found
            header("HTTP/1.1 404 Not Found");
            echo "404 Not Found";
        }
    }
}
