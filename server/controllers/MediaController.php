<?php
require_once 'BaseController.php';

class MediaController extends BaseController {
    public function __construct($db) {
        parent::__construct($db, 'media');
    }
    
    // Переопределение метода getAll для добавления фильтрации
    public function getAll() {
        try {
            $query = "SELECT m.*, u.name as uploader_name FROM {$this->table} m 
                     LEFT JOIN users u ON m.uploaded_by = u.id";
            $params = [];
            
            // Фильтрация по типу
            if (isset($_GET['type']) && !empty($_GET['type'])) {
                $query .= " WHERE m.type = ?";
                $params[] = $_GET['type'];
            }
            
            // Фильтрация по загрузившему пользователю
            if (isset($_GET['uploaded_by']) && !empty($_GET['uploaded_by'])) {
                if (strpos($query, 'WHERE') !== false) {
                    $query .= " AND m.uploaded_by = ?";
                } else {
                    $query .= " WHERE m.uploaded_by = ?";
                }
                $params[] = $_GET['uploaded_by'];
            }
            
            // Поиск по имени или тегам
            if (isset($_GET['search']) && !empty($_GET['search'])) {
                $searchTerm = '%' . $_GET['search'] . '%';
                if (strpos($query, 'WHERE') !== false) {
                    $query .= " AND (m.name LIKE ? OR m.tags LIKE ?)"; 
                } else {
                    $query .= " WHERE (m.name LIKE ? OR m.tags LIKE ?)"; 
                }
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            // Сортировка
            if (isset($_GET['sort']) && !empty($_GET['sort'])) {
                switch ($_GET['sort']) {
                    case 'name_asc':
                        $query .= " ORDER BY m.name ASC";
                        break;
                    case 'name_desc':
                        $query .= " ORDER BY m.name DESC";
                        break;
                    case 'date_asc':
                        $query .= " ORDER BY m.created_at ASC";
                        break;
                    case 'date_desc':
                    default:
                        $query .= " ORDER BY m.created_at DESC";
                        break;
                }
            } else {
                $query .= " ORDER BY m.created_at DESC";
            }
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Переопределение метода get для получения информации о загрузившем пользователе
    public function get($id) {
        try {
            $stmt = $this->db->prepare("SELECT m.*, u.name as uploader_name FROM {$this->table} m 
                                       LEFT JOIN users u ON m.uploaded_by = u.id 
                                       WHERE m.id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch();
            
            if (!$result) {
                http_response_code(404);
                return ['error' => 'Media not found'];
            }
            
            return $result;
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    // Пользовательские действия для медиа
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'upload':
                // Обработка загрузки файла
                if (!isset($_FILES['file'])) {
                    http_response_code(400);
                    return ['error' => 'No file uploaded'];
                }
                return $this->handleFileUpload($_FILES['file'], $data);
            case 'update-tags':
                if (!$data || !isset($data['tags'])) {
                    http_response_code(400);
                    return ['error' => 'Tags are required'];
                }
                return $this->updateTags($id, $data['tags']);
            default:
                http_response_code(404);
                return ['error' => 'Action not found'];
        }
    }
    
    // Обработка загрузки файла
    private function handleFileUpload($file, $data) {
        try {
            // Проверка ошибок загрузки
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                return ['error' => 'File upload failed with error code: ' . $file['error']];
            }
            
            // Проверка обязательных данных
            if (!isset($data['uploaded_by'])) {
                http_response_code(400);
                return ['error' => 'Uploader ID is required'];
            }
            
            // Создание директории для загрузок, если она не существует
            $uploadDir = __DIR__ . '/../uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            // Генерация уникального имени файла
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueFilename = uniqid() . '.' . $fileExtension;
            $uploadPath = $uploadDir . $uniqueFilename;
            
            // Перемещение загруженного файла
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                http_response_code(500);
                return ['error' => 'Failed to move uploaded file'];
            }
            
            // Определение типа файла
            $fileType = $this->getFileType($fileExtension);
            
            // Получение размеров изображения, если это изображение
            $dimensions = null;
            if ($fileType === 'image' && function_exists('getimagesize')) {
                $imageInfo = getimagesize($uploadPath);
                if ($imageInfo) {
                    $dimensions = $imageInfo[0] . 'x' . $imageInfo[1];
                }
            }
            
            // Создание записи о медиафайле в базе данных
            $mediaData = [
                'id' => $this->generateUUID(),
                'name' => $file['name'],
                'type' => $fileType,
                'url' => '/uploads/' . $uniqueFilename,
                'size' => $file['size'],
                'dimensions' => $dimensions,
                'uploaded_by' => $data['uploaded_by'],
                'tags' => isset($data['tags']) ? $data['tags'] : null
            ];
            
            return $this->create($mediaData);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }
    
    // Определение типа файла по расширению
    private function getFileType($extension) {
        $extension = strtolower($extension);
        
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        $videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
        $audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
        $documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        $archiveExtensions = ['zip', 'rar', 'tar', 'gz', '7z'];
        
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        } elseif (in_array($extension, $videoExtensions)) {
            return 'video';
        } elseif (in_array($extension, $audioExtensions)) {
            return 'audio';
        } elseif (in_array($extension, $documentExtensions)) {
            return 'document';
        } elseif (in_array($extension, $archiveExtensions)) {
            return 'archive';
        } else {
            return 'other';
        }
    }
    
    // Обновление тегов медиафайла
    private function updateTags($id, $tags) {
        try {
            $stmt = $this->db->prepare("UPDATE {$this->table} SET tags = ? WHERE id = ?");
            $stmt->execute([$tags, $id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return ['error' => 'Media not found'];
            }
            
            return ['success' => true, 'message' => 'Tags updated successfully'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        }
    }
}
