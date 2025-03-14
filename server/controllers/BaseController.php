<?php
abstract class BaseController {
    protected $db;
    protected $table;
    
    public function __construct($db, $table) {
        $this->db = $db;
        $this->table = $table;
    }
    
    // Получить все записи
    public function getAll() {
        try {
            $stmt = $this->db->query("SELECT * FROM {$this->table}");
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Получить запись по ID
    public function get($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch();
            
            if (!$result) {
                http_response_code(404);
                return ['error' => 'Record not found'];
            }
            
            return $result;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Создать новую запись
    public function create($data) {
        try {
            // Генерация UUID, если не предоставлен
            if (!isset($data['id'])) {
                $data['id'] = $this->generateUUID();
            }
            
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            
            $stmt = $this->db->prepare("INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})");
            $stmt->execute(array_values($data));
            
            return $this->get($data['id']);
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Обновить запись
    public function update($id, $data) {
        try {
            // Проверка существования записи
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'Record not found'];
            }
            
            // Подготовка запроса обновления
            $setClause = implode(' = ?, ', array_keys($data)) . ' = ?';
            $stmt = $this->db->prepare("UPDATE {$this->table} SET {$setClause} WHERE id = ?");
            
            $values = array_values($data);
            $values[] = $id;
            $stmt->execute($values);
            
            return $this->get($id);
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Удалить запись
    public function delete($id) {
        try {
            // Проверка существования записи
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'Record not found'];
            }
            
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            
            return ['success' => true, 'message' => 'Record deleted successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Пользовательское действие (для переопределения в дочерних классах)
    public function customAction($id, $action, $data = null) {
        http_response_code(404);
        return ['error' => 'Action not found'];
    }
    
    // Генерация UUID
    protected function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
