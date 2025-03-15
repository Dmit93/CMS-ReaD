<?php
/**
 * Initialize MySQL database
 * 
 * This script creates the MySQL database and tables.
 */

// Set error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../../.env')) {
    $lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
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

// Get database configuration from environment
$dbHost = getenv('DATABASE_HOST') ?: 'localhost';
$dbPort = getenv('DATABASE_PORT') ?: '3306';
$dbName = getenv('DATABASE_NAME') ?: 'cms_platform';
$dbUser = getenv('DATABASE_USER') ?: 'root';
$dbPassword = getenv('DATABASE_PASSWORD') ?: '';
$dbCharset = 'utf8mb4';
$dbCollation = 'utf8mb4_unicode_ci';

try {
    // Connect to MySQL server without selecting database
    $dsn = "mysql:host=$dbHost;port=$dbPort;charset=$dbCharset";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $dbCharset COLLATE $dbCollation"
    ];
    
    $pdo = new PDO($dsn, $dbUser, $dbPassword, $options);
    
    // Check if database exists
    $stmt = $pdo->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?");
    $stmt->execute([$dbName]);
    $dbExists = $stmt->fetch();
    
    if (!$dbExists) {
        // Create database
        $pdo->exec("CREATE DATABASE `$dbName` CHARACTER SET $dbCharset COLLATE $dbCollation");
        echo "Database '$dbName' created.\n";
    } else {
        echo "Database '$dbName' already exists.\n";
        echo "Do you want to drop and recreate it? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        if (trim($line) === 'y') {
            $pdo->exec("DROP DATABASE `$dbName`");
            $pdo->exec("CREATE DATABASE `$dbName` CHARACTER SET $dbCharset COLLATE $dbCollation");
            echo "Database '$dbName' dropped and recreated.\n";
        }
        fclose($handle);
    }
    
    // Select database
    $pdo->exec("USE `$dbName`");
    
    // Create tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=$dbCharset COLLATE=$dbCollation;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS content (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT,
        excerpt TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        type VARCHAR(50) NOT NULL DEFAULT 'page',
        author_id VARCHAR(36),
        featured_image_id VARCHAR(36),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        published_at DATETIME,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=$dbCharset COLLATE=$dbCollation;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS content_meta (
        id VARCHAR(36) PRIMARY KEY,
        content_id VARCHAR(36) NOT NULL,
        meta_key VARCHAR(100) NOT NULL,
        meta_value TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
        UNIQUE(content_id, meta_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=$dbCharset COLLATE=$dbCollation;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(36) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        filesize INTEGER NOT NULL,
        filetype VARCHAR(100) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        alt_text VARCHAR(255),
        width INTEGER,
        height INTEGER,
        user_id VARCHAR(36),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=$dbCharset COLLATE=$dbCollation;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS plugins (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        version VARCHAR(20) NOT NULL,
        description TEXT,
        author VARCHAR(100),
        url VARCHAR(255),
        config TEXT,
        installed BOOLEAN NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=$dbCharset COLLATE=$dbCollation;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=$dbCharset COLLATE=$dbCollation;");
    
    // Insert default admin user
    $pdo->exec("INSERT IGNORE INTO users (id, username, email, password, first_name, last_name, role, active, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'admin',
        'admin@example.com',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
        'Admin',
        'User',
        'admin',
        1,
        NOW(),
        NOW()
    );");
    
    // Insert default system settings
    $pdo->exec("INSERT IGNORE INTO system_settings (id, setting_key, setting_value, created_at, updated_at)
    VALUES 
    ('00000000-0000-0000-0000-000000000001', 'site_name', 'CMS Platform', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'site_description', 'A comprehensive content management system', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003', 'site_url', 'http://localhost:5173', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000004', 'admin_email', 'admin@example.com', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000005', 'posts_per_page', '10', NOW(), NOW());");
    
    // Insert default plugins
    $pdo->exec("INSERT IGNORE INTO plugins (id, name, version, description, author, url, installed, active, created_at, updated_at)
    VALUES 
    ('seo-toolkit', 'SEO Toolkit', '1.0.0', 'SEO optimization tools for your content', 'CMS Team', 'https://example.com/plugins/seo-toolkit', 1, 1, NOW(), NOW());");
    
    echo "MySQL database initialized successfully.\n";
    exit(0);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
