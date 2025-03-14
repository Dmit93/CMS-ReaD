<?php
require_once 'BaseController.php';

class SettingController extends BaseController {
    public function __construct($db) {
        parent::__construct($db, 'system_settings');
        $this->db = $db;
    }
    
    // Переопределение метода getAll для группировки настроек
    public function getAll() {
        try {
            // Получение всех системных настроек
            $stmt = $this->db->query("SELECT * FROM {$this->table}");
            $settings = $stmt->fetchAll();
            
            // Группировка настроек по префиксу ключа
            $groupedSettings = [];
            foreach ($settings as $setting) {
                $keyParts = explode('.', $setting['key']);
                $group = $keyParts[0];
                
                if (!isset($groupedSettings[$group])) {
                    $groupedSettings[$group] = [];
                }
                
                if (count($keyParts) > 1) {
                    $subKey = implode('.', array_slice($keyParts, 1));
                    $groupedSettings[$group][$subKey] = $setting['value'];
                } else {
                    $groupedSettings[$group]['value'] = $setting['value'];
                }
            }
            
            return $groupedSettings;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода get для получения настройки по ключу
    public function get($key) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE `key` = ?");
            $stmt->execute([$key]);
            $setting = $stmt->fetch();
            
            if (!$setting) {
                http_response_code(404);
                return ['error' => 'Setting not found'];
            }
            
            return $setting;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода create для создания настройки
    public function create($data) {
        try {
            // Проверка обязательных полей
            if (!isset($data['key']) || !isset($data['value'])) {
                http_response_code(400);
                return ['error' => 'Key and value are required'];
            }
            
            // Проверка уникальности ключа
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE `key` = ?");
            $checkStmt->execute([$data['key']]);
            
            if ($checkStmt->fetch()) {
                // Если настройка уже существует, обновляем её
                return $this->update($data['key'], ['value' => $data['value']]);
            }
            
            // Генерация UUID, если не предоставлен
            if (!isset($data['id'])) {
                $data['id'] = $this->generateUUID();
            }
            
            $stmt = $this->db->prepare("INSERT INTO {$this->table} (id, `key`, value) VALUES (?, ?, ?)");
            $stmt->execute([$data['id'], $data['key'], $data['value']]);
            
            return $this->get($data['key']);
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода update для обновления настройки по ключу
    public function update($key, $data) {
        try {
            // Проверка существования настройки
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE `key` = ?");
            $checkStmt->execute([$key]);
            $setting = $checkStmt->fetch();
            
            if (!$setting) {
                // Если настройка не существует, создаем её
                return $this->create(['key' => $key, 'value' => $data['value']]);
            }
            
            // Обновление значения настройки
            $stmt = $this->db->prepare("UPDATE {$this->table} SET value = ? WHERE `key` = ?");
            $stmt->execute([$data['value'], $key]);
            
            return $this->get($key);
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода delete для удаления настройки по ключу
    public function delete($key) {
        try {
            // Проверка существования настройки
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE `key` = ?");
            $checkStmt->execute([$key]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'Setting not found'];
            }
            
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE `key` = ?");
            $stmt->execute([$key]);
            
            return ['success' => true, 'message' => 'Setting deleted successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Пользовательские действия для настроек
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'user':
                // Получение пользовательских настроек
                if (!$id) {
                    http_response_code(400);
                    return ['error' => 'User ID is required'];
                }
                return $this->getUserSettings($id);
            case 'set-user':
                // Установка пользовательской настройки
                if (!$id || !$data || !isset($data['key']) || !isset($data['value'])) {
                    http_response_code(400);
                    return ['error' => 'User ID, key and value are required'];
                }
                return $this->setUserSetting($id, $data['key'], $data['value']);
            case 'bulk-update':
                // Массовое обновление настроек
                if (!$data || !is_array($data)) {
                    http_response_code(400);
                    return ['error' => 'Settings data is required'];
                }
                return $this->bulkUpdateSettings($data);
            default:
                http_response_code(404);
                return ['error' => 'Action not found'];
        }
    }
    
    // Получение пользовательских настроек
    private function getUserSettings($userId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM user_settings WHERE user_id = ?");
            $stmt->execute([$userId]);
            $settings = $stmt->fetchAll();
            
            // Преобразование в ассоциативный массив
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting['key']] = $setting['value'];
            }
            
            return $result;
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Установка пользовательской настройки
    private function setUserSetting($userId, $key, $value) {
        try {
            // Проверка существования пользователя
            $userCheckStmt = $this->db->prepare("SELECT id FROM users WHERE id = ?");
            $userCheckStmt->execute([$userId]);
            
            if (!$userCheckStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'User not found'];
            }
            
            // Проверка существования настройки
            $settingCheckStmt = $this->db->prepare("SELECT id FROM user_settings WHERE user_id = ? AND `key` = ?");
            $settingCheckStmt->execute([$userId, $key]);
            $setting = $settingCheckStmt->fetch();
            
            if ($setting) {
                // Обновление существующей настройки
                $updateStmt = $this->db->prepare("UPDATE user_settings SET value = ? WHERE id = ?");
                $updateStmt->execute([$value, $setting['id']]);
            } else {
                // Создание новой настройки
                $insertStmt = $this->db->prepare("INSERT INTO user_settings (id, user_id, `key`, value) VALUES (?, ?, ?, ?)");
                $insertStmt->execute([$this->generateUUID(), $userId, $key, $value]);
            }
            
            return ['success' => true, 'key' => $key, 'value' => $value];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Массовое обновление настроек
    private function bulkUpdateSettings($settings) {
        try {
            $this->db->beginTransaction();
            
            $updated = [];
            
            foreach ($settings as $key => $value) {
                // Проверка существования настройки
                $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE `key` = ?");
                $checkStmt->execute([$key]);
                $setting = $checkStmt->fetch();
                
                if ($setting) {
                    // Обновление существующей настройки
                    $updateStmt = $this->db->prepare("UPDATE {$this->table} SET value = ? WHERE id = ?");
                    $updateStmt->execute([$value, $setting['id']]);
                } else {
                    // Создание новой настройки
                    $insertStmt = $this->db->prepare("INSERT INTO {$this->table} (id, `key`, value) VALUES (?, ?, ?)");
                    $insertStmt->execute([$this->generateUUID(), $key, $value]);
                }
                
                $updated[$key] = $value;
            }
            
            $this->db->commit();
            
            return ['success' => true, 'updated' => $updated];
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
}
