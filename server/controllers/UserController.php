<?php
require_once 'BaseController.php';

class UserController extends BaseController {
    public function __construct($db) {
        parent::__construct($db, 'users');
    }
    
    // Переопределение метода getAll для добавления фильтрации
    public function getAll() {
        try {
            $query = "SELECT id, email, name, role, status, last_login, created_at, updated_at FROM {$this->table}";
            $params = [];
            
            // Фильтрация по роли
            if (isset($_GET['role']) && !empty($_GET['role'])) {
                $query .= " WHERE role = ?";
                $params[] = $_GET['role'];
            }
            
            // Фильтрация по статусу
            if (isset($_GET['status']) && !empty($_GET['status'])) {
                if (strpos($query, 'WHERE') !== false) {
                    $query .= " AND status = ?";
                } else {
                    $query .= " WHERE status = ?";
                }
                $params[] = $_GET['status'];
            }
            
            // Сортировка
            $query .= " ORDER BY name ASC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода get для исключения пароля
    public function get($id) {
        try {
            $stmt = $this->db->prepare("SELECT id, email, name, role, status, last_login, created_at, updated_at FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch();
            
            if (!$result) {
                http_response_code(404);
                return ['error' => 'User not found'];
            }
            
            return $result;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода create для хеширования пароля
    public function create($data) {
        try {
            // Проверка обязательных полей
            if (!isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                return ['error' => 'Email and password are required'];
            }
            
            // Проверка уникальности email
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE email = ?");
            $checkStmt->execute([$data['email']]);
            
            if ($checkStmt->fetch()) {
                http_response_code(400);
                return ['error' => 'Email already exists'];
            }
            
            // Хеширование пароля
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Генерация UUID, если не предоставлен
            if (!isset($data['id'])) {
                $data['id'] = $this->generateUUID();
            }
            
            // Установка роли и статуса по умолчанию, если не указаны
            if (!isset($data['role'])) {
                $data['role'] = 'user';
            }
            
            if (!isset($data['status'])) {
                $data['status'] = 'pending';
            }
            
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            
            $stmt = $this->db->prepare("INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})");
            $stmt->execute(array_values($data));
            
            // Возвращаем пользователя без пароля
            return $this->get($data['id']);
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода update для хеширования пароля
    public function update($id, $data) {
        try {
            // Проверка существования пользователя
            $checkStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return ['error' => 'User not found'];
            }
            
            // Хеширование пароля, если он изменяется
            if (isset($data['password'])) {
                $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            // Проверка уникальности email, если он изменяется
            if (isset($data['email'])) {
                $emailCheckStmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE email = ? AND id != ?");
                $emailCheckStmt->execute([$data['email'], $id]);
                
                if ($emailCheckStmt->fetch()) {
                    http_response_code(400);
                    return ['error' => 'Email already exists'];
                }
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
    
    // Пользовательские действия для пользователей
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'activate':
                return $this->updateUserStatus($id, 'active');
            case 'deactivate':
                return $this->updateUserStatus($id, 'inactive');
            case 'change-password':
                if (!$data || !isset($data['password'])) {
                    http_response_code(400);
                    return ['error' => 'Password is required'];
                }
                return $this->changePassword($id, $data['password']);
            case 'login':
                if (!$data || !isset($data['email']) || !isset($data['password'])) {
                    http_response_code(400);
                    return ['error' => 'Email and password are required'];
                }
                return $this->login($data['email'], $data['password']);
            default:
                http_response_code(404);
                return ['error' => 'Action not found'];
        }
    }
    
    // Обновление статуса пользователя
    private function updateUserStatus($id, $status) {
        try {
            $stmt = $this->db->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return ['error' => 'User not found'];
            }
            
            return ['success' => true, 'message' => 'User status updated successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Изменение пароля пользователя
    private function changePassword($id, $password) {
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE {$this->table} SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return ['error' => 'User not found'];
            }
            
            return ['success' => true, 'message' => 'Password changed successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Аутентификация пользователя
    private function login($email, $password) {
        try {
            $stmt = $this->db->prepare("SELECT id, email, name, password, role, status FROM {$this->table} WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                http_response_code(401);
                return ['error' => 'Invalid credentials'];
            }
            
            if ($user['status'] !== 'active') {
                http_response_code(401);
                return ['error' => 'Account is not active'];
            }
            
            if (!password_verify($password, $user['password'])) {
                http_response_code(401);
                return ['error' => 'Invalid credentials'];
            }
            
            // Обновление времени последнего входа
            $updateStmt = $this->db->prepare("UPDATE {$this->table} SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
            $updateStmt->execute([$user['id']]);
            
            // Удаление пароля из ответа
            unset($user['password']);
            
            return [
                'success' => true,
                'message' => 'Login successful',
                'user' => $user
            ];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
}
