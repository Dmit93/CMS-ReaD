<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка OPTIONS запросов для CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Подключение к базе данных
require_once 'db_config.php';

// Маршрутизация запросов
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// Базовый путь API
$apiBase = isset($uri[1]) ? $uri[1] : '';

if ($apiBase !== 'api') {
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
    exit();
}

// Определение ресурса и действия
$resource = isset($uri[2]) ? $uri[2] : '';
$id = isset($uri[3]) ? $uri[3] : null;
$action = isset($uri[4]) ? $uri[4] : null;

// Получение данных запроса
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestData = json_decode(file_get_contents('php://input'), true);

// Маршрутизация к соответствующему контроллеру
switch ($resource) {
    case 'plugins':
        require_once 'controllers/PluginController.php';
        $controller = new PluginController($db);
        break;
    case 'content':
        require_once 'controllers/ContentController.php';
        $controller = new ContentController($db);
        break;
    case 'users':
        require_once 'controllers/UserController.php';
        $controller = new UserController($db);
        break;
    case 'media':
        require_once 'controllers/MediaController.php';
        $controller = new MediaController($db);
        break;
    case 'settings':
        require_once 'controllers/SettingController.php';
        $controller = new SettingController($db);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found']);
        exit();
}

// Выполнение соответствующего метода контроллера
switch ($requestMethod) {
    case 'GET':
        if ($id) {
            if ($action) {
                $response = $controller->customAction($id, $action);
            } else {
                $response = $controller->get($id);
            }
        } else {
            $response = $controller->getAll();
        }
        break;
    case 'POST':
        if ($id && $action) {
            $response = $controller->customAction($id, $action, $requestData);
        } else {
            $response = $controller->create($requestData);
        }
        break;
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required for PUT requests']);
            exit();
        }
        $response = $controller->update($id, $requestData);
        break;
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required for DELETE requests']);
            exit();
        }
        $response = $controller->delete($id);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit();
}

// Отправка ответа
echo json_encode($response);
