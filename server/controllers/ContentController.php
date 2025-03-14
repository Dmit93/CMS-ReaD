<?php
require_once 'BaseController.php';

class ContentController extends BaseController {
    public function __construct($db) {
        parent::__construct($db, 'content');
        $this->db = $db;
    }
    
    // Переопределение метода getAll для добавления фильтрации
    public function getAll() {
        try {
            $query = "SELECT c.*, u.name as author_name FROM {$this->table} c 
                     LEFT JOIN users u ON c.author_id = u.id";
            $params = [];
            
            // Фильтрация по типу
            if (isset($_GET['type']) && !empty($_GET['type'])) {
                $query .= " WHERE c.type = ?";
                $params[] = $_GET['type'];
            }
            
            // Фильтрация по статусу
            if (isset($_GET['status']) && !empty($_GET['status'])) {
                if (strpos($query, 'WHERE') !== false) {
                    $query .= " AND c.status = ?";
                } else {
                    $query .= " WHERE c.status = ?";
                }
                $params[] = $_GET['status'];
            }
            
            // Фильтрация по автору
            if (isset($_GET['author_id']) && !empty($_GET['author_id'])) {
                if (strpos($query, 'WHERE') !== false) {
                    $query .= " AND c.author_id = ?";
                } else {
                    $query .= " WHERE c.author_id = ?";
                }
                $params[] = $_GET['author_id'];
            }
            
            // Сортировка
            $query .= " ORDER BY c.updated_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $content = $stmt->fetchAll();
            
            // Получение метаданных для каждого элемента контента
            foreach ($content as &$item) {
                $item['metadata'] = !empty($item['metadata']) ? json_decode($item['metadata'], true) : [];
                $item['meta'] = $this->getContentMeta($item['id']);
            }
            
            return $content;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода get для получения метаданных
    public function get($id) {
        try {
            $stmt = $this->db->prepare("SELECT c.*, u.name as author_name FROM {$this->table} c 
                                       LEFT JOIN users u ON c.author_id = u.id 
                                       WHERE c.id = ?");
            $stmt->execute([$id]);
            $content = $stmt->fetch();
            
            if (!$content) {
                http_response_code(404);
                return ['error' => 'Content not found'];
            }
            
            // Декодирование метаданных
            $content['metadata'] = !empty($content['metadata']) ? json_decode($content['metadata'], true) : [];
            
            // Получение дополнительных метаданных (для SEO плагина и других)
            $content['meta'] = $this->getContentMeta($id);
            
            return $content;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода create для обработки метаданных
    public function create($data) {
        try {
            $this->db->beginTransaction();
            
            // Извлечение метаданных из данных
            $meta = isset($data['meta']) ? $data['meta'] : [];
            unset($data['meta']);
            
            // Кодирование метаданных в JSON
            if (isset($data['metadata']) && is_array($data['metadata'])) {
                $data['metadata'] = json_encode($data['metadata']);
            }
            
            // Генерация UUID, если не предоставлен
            if (!isset($data['id'])) {
                $data['id'] = $this->generateUUID();
            }
            
            // Создание контента
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            
            $stmt = $this->db->prepare("INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})");
            $stmt->execute(array_values($data));
            
            // Сохранение метаданных
            if (!empty($meta)) {
                $this->saveContentMeta($data['id'], $meta);
            }
            
            $this->db->commit();
            
            return $this->get($data['id']);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода update для обработки метаданных
    public function update($id, $data) {
        try {
            $this->db->beginTransaction();
            
            // Проверка существования записи
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'Content not found'];
            }
            
            // Извлечение метаданных из данных
            $meta = isset($data['meta']) ? $data['meta'] : [];
            unset($data['meta']);
            
            // Кодирование метаданных в JSON
            if (isset($data['metadata']) && is_array($data['metadata'])) {
                $data['metadata'] = json_encode($data['metadata']);
            }
            
            // Обновление контента, если есть данные для обновления
            if (!empty($data)) {
                $setClause = implode(' = ?, ', array_keys($data)) . ' = ?';
                $stmt = $this->db->prepare("UPDATE {$this->table} SET {$setClause} WHERE id = ?");
                
                $values = array_values($data);
                $values[] = $id;
                $stmt->execute($values);
            }
            
            // Обновление метаданных
            if (!empty($meta)) {
                $this->saveContentMeta($id, $meta);
            }
            
            $this->db->commit();
            
            return $this->get($id);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Получение метаданных контента
    private function getContentMeta($contentId) {
        try {
            $stmt = $this->db->prepare("SELECT meta_key, meta_value FROM content_meta WHERE content_id = ?");
            $stmt->execute([$contentId]);
            $metaRows = $stmt->fetchAll();
            
            $meta = [];
            foreach ($metaRows as $row) {
                $meta[$row['meta_key']] = $row['meta_value'];
            }
            
            return $meta;
        } catch (PDOException $e) {
            return [];
        }
    }
    
    // Сохранение метаданных контента
    private function saveContentMeta($contentId, $meta) {
        foreach ($meta as $key => $value) {
            // Проверка существования метаданных
            $checkStmt = $this->db->prepare("SELECT id FROM content_meta WHERE content_id = ? AND meta_key = ?");
            $checkStmt->execute([$contentId, $key]);
            $existingMeta = $checkStmt->fetch();
            
            if ($existingMeta) {
                // Обновление существующих метаданных
                $updateStmt = $this->db->prepare("UPDATE content_meta SET meta_value = ? WHERE content_id = ? AND meta_key = ?");
                $updateStmt->execute([$value, $contentId, $key]);
            } else {
                // Создание новых метаданных
                $insertStmt = $this->db->prepare("INSERT INTO content_meta (id, content_id, meta_key, meta_value) VALUES (?, ?, ?, ?)");
                $insertStmt->execute([$this->generateUUID(), $contentId, $key, $value]);
            }
        }
    }
    
    // Пользовательские действия для контента
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'publish':
                return $this->updateContentStatus($id, 'published');
            case 'draft':
                return $this->updateContentStatus($id, 'draft');
            case 'archive':
                return $this->updateContentStatus($id, 'archived');
            case 'meta':
                if (!$data) {
                    http_response_code(400);
                    return ['error' => 'Meta data is required'];
                }
                return $this->updateContentMeta($id, $data);
            default:
                http_response_code(404);
                return ['error' => 'Action not found'];
        }
    }
    
    // Обновление статуса контента
    private function updateContentStatus($id, $status) {
        try {
            $stmt = $this->db->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return ['error' => 'Content not found'];
            }
            
            return ['success' => true, 'message' => 'Content status updated successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Обновление метаданных контента
    private function updateContentMeta($id, $meta) {
        try {
            $this->db->beginTransaction();
            
            // Проверка существования контента
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'Content not found'];
            }
            
            // Сохранение метаданных
            $this->saveContentMeta($id, $meta);
            
            $this->db->commit();
            
            return ['success' => true, 'meta' => $this->getContentMeta($id)];
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
}
