<?php
// Конфигурация базы данных
$dbType = getenv('DB_TYPE') ?: 'sqlite'; // sqlite или mysql

if ($dbType === 'sqlite') {
    // SQLite конфигурация
    $dbPath = __DIR__ . '/database/cms.sqlite';
    
    // Создаем директорию для базы данных, если она не существует
    if (!file_exists(dirname($dbPath))) {
        mkdir(dirname($dbPath), 0777, true);
    }
    
    try {
        $db = new PDO("sqlite:$dbPath");
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        // Включаем поддержку внешних ключей
        $db->exec('PRAGMA foreign_keys = ON;');
        
        // Инициализация базы данных, если она новая
        if (!file_exists($dbPath) || filesize($dbPath) === 0) {
            require_once 'database/init_sqlite.php';
            initDatabase($db);
        }
    } catch (PDOException $e) {
        die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
    }
} else {
    // MySQL конфигурация
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'cms_platform';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: '';
    
    try {
        $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        // Проверка, нужно ли инициализировать базу данных
        $stmt = $db->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() === 0) {
            require_once 'database/init_mysql.php';
            initDatabase($db);
        }
    } catch (PDOException $e) {
        die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
    }
}
