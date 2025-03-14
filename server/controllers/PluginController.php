<?php
require_once 'BaseController.php';

class PluginController extends BaseController {
    public function __construct($db) {
        parent::__construct($db, 'plugins');
    }
    
    // Переопределение метода getAll для добавления фильтрации
    public function getAll() {
        try {
            $query = "SELECT * FROM {$this->table}";
            $params = [];
            
            // Фильтрация по категории
            if (isset($_GET['category']) && !empty($_GET['category'])) {
                $query .= " WHERE category = ?";
                $params[] = $_GET['category'];
            }
            
            // Фильтрация по активности
            if (isset($_GET['is_active'])) {
                $isActive = (int)$_GET['is_active'];
                if (strpos($query, 'WHERE') !== false) {
                    $query .= " AND is_active = ?";
                } else {
                    $query .= " WHERE is_active = ?";
                }
                $params[] = $isActive;
            }
            
            // Сортировка
            if (isset($_GET['sort']) && !empty($_GET['sort'])) {
                $sortField = 'name'; // по умолчанию
                $sortDir = 'ASC';
                
                switch ($_GET['sort']) {
                    case 'name_asc':
                        $sortField = 'name';
                        $sortDir = 'ASC';
                        break;
                    case 'name_desc':
                        $sortField = 'name';
                        $sortDir = 'DESC';
                        break;
                    case 'downloads':
                        $sortField = 'downloads';
                        $sortDir = 'DESC';
                        break;
                    case 'rating':
                        $sortField = 'rating';
                        $sortDir = 'DESC';
                        break;
                    case 'date':
                        $sortField = 'installed_at';
                        $sortDir = 'DESC';
                        break;
                }
                
                $query .= " ORDER BY {$sortField} {$sortDir}";
            } else {
                $query .= " ORDER BY name ASC";
            }
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $plugins = $stmt->fetchAll();
            
            // Преобразование конфигурации из JSON
            foreach ($plugins as &$plugin) {
                if (isset($plugin['config']) && !empty($plugin['config'])) {
                    $plugin['config'] = json_decode($plugin['config'], true);
                } else {
                    $plugin['config'] = [];
                }
            }
            
            return $plugins;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода get для декодирования конфигурации
    public function get($id) {
        $plugin = parent::get($id);
        
        if (isset($plugin['error'])) {
            return $plugin;
        }
        
        // Декодирование конфигурации из JSON
        if (isset($plugin['config']) && !empty($plugin['config'])) {
            $plugin['config'] = json_decode($plugin['config'], true);
        } else {
            $plugin['config'] = [];
        }
        
        return $plugin;
    }
    
    // Переопределение метода create для кодирования конфигурации
    public function create($data) {
        // Кодирование конфигурации в JSON
        if (isset($data['config']) && is_array($data['config'])) {
            $data['config'] = json_encode($data['config']);
        }
        
        return parent::create($data);
    }
    
    // Переопределение метода update для кодирования конфигурации
    public function update($id, $data) {
        // Кодирование конфигурации в JSON
        if (isset($data['config']) && is_array($data['config'])) {
            $data['config'] = json_encode($data['config']);
        }
        
        return parent::update($id, $data);
    }
    
    // Пользовательские действия для плагинов
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'activate':
                return $this->activatePlugin($id);
            case 'deactivate':
                return $this->deactivatePlugin($id);
            case 'update-config':
                if (!$data) {
                    http_response_code(400);
                    return ['error' => 'Configuration data is required'];
                }
                return $this->updatePluginConfig($id, $data);
            default:
                http_response_code(404);
                return ['error' => 'Action not found'];
        }
    }
    
    // Активация плагина
    private function activatePlugin($id) {
        try {
            $stmt = $this->db->prepare("UPDATE {$this->table} SET is_active = 1 WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return ['error' => 'Plugin not found'];
            }
            
            return ['success' => true, 'message' => 'Plugin activated successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Деактивация плагина
    private function deactivatePlugin($id) {
        try {
            $stmt = $this->db->prepare("UPDATE {$this->table} SET is_active = 0 WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return ['error' => 'Plugin not found'];
            }
            
            return ['success' => true, 'message' => 'Plugin deactivated successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Обновление конфигурации плагина
    private function updatePluginConfig($id, $configData) {
        try {
            // Получение текущей конфигурации
            $stmt = $this->db->prepare("SELECT config FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            $plugin = $stmt->fetch();
            
            if (!$plugin) {
                http_response_code(404);
                return ['error' => 'Plugin not found'];
            }
            
            // Объединение текущей конфигурации с новой
            $currentConfig = !empty($plugin['config']) ? json_decode($plugin['config'], true) : [];
            $newConfig = array_merge($currentConfig, $configData);
            $configJson = json_encode($newConfig);
            
            // Обновление конфигурации
            $updateStmt = $this->db->prepare("UPDATE {$this->table} SET config = ? WHERE id = ?");
            $updateStmt->execute([$configJson, $id]);
            
            return ['success' => true, 'config' => $newConfig];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
}
