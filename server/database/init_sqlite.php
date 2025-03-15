<?php
/**
 * Initialize SQLite database
 * 
 * This script creates the SQLite database and tables.
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

// Get database path from environment or use default
$dbPath = getenv('DATABASE_PATH') ?: __DIR__ . '/../../database.sqlite';

// Check if database file already exists
if (file_exists($dbPath)) {
    echo "Database file already exists at: $dbPath\n";
    echo "Do you want to overwrite it? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $line = fgets($handle);
    if (trim($line) !== 'y') {
        echo "Aborted.\n";
        exit(0);
    }
    fclose($handle);
    
    // Backup existing database
    $backupPath = $dbPath . '.backup.' . date('YmdHis');
    if (!copy($dbPath, $backupPath)) {
        echo "Error: Failed to create backup of existing database.\n";
        exit(1);
    }
    echo "Backup created at: $backupPath\n";
}

// Create database directory if it doesn't exist
$dbDir = dirname($dbPath);
if (!file_exists($dbDir)) {
    if (!mkdir($dbDir, 0755, true)) {
        echo "Error: Failed to create database directory.\n";
        exit(1);
    }
}

try {
    // Create new SQLite database
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Enable foreign keys
    $db->exec('PRAGMA foreign_keys = ON;');
    
    // Create tables
    $db->exec("CREATE TABLE IF NOT EXISTS users (
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
    );");
    
    $db->exec("CREATE TABLE IF NOT EXISTS content (
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
    );");
    
    $db->exec("CREATE TABLE IF NOT EXISTS content_meta (
        id VARCHAR(36) PRIMARY KEY,
        content_id VARCHAR(36) NOT NULL,
        meta_key VARCHAR(100) NOT NULL,
        meta_value TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
        UNIQUE(content_id, meta_key)
    );");
    
    $db->exec("CREATE TABLE IF NOT EXISTS media (
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
    );");
    
    $db->exec("CREATE TABLE IF NOT EXISTS plugins (
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
    );");
    
    $db->exec("CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    );");
    
    // Insert default admin user
    $db->exec("INSERT OR IGNORE INTO users (id, username, email, password, first_name, last_name, role, active, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'admin',
        'admin@example.com',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
        'Admin',
        'User',
        'admin',
        1,
        datetime('now'),
        datetime('now')
    );");
    
    // Insert default system settings
    $db->exec("INSERT OR IGNORE INTO system_settings (id, setting_key, setting_value, created_at, updated_at)
    VALUES 
    ('00000000-0000-0000-0000-000000000001', 'site_name', 'CMS Platform', datetime('now'), datetime('now')),
    ('00000000-0000-0000-0000-000000000002', 'site_description', 'A comprehensive content management system', datetime('now'), datetime('now')),
    ('00000000-0000-0000-0000-000000000003', 'site_url', 'http://localhost:5173', datetime('now'), datetime('now')),
    ('00000000-0000-0000-0000-000000000004', 'admin_email', 'admin@example.com', datetime('now'), datetime('now')),
    ('00000000-0000-0000-0000-000000000005', 'posts_per_page', '10', datetime('now'), datetime('now'));");
    
    // Insert default plugins
    $db->exec("INSERT OR IGNORE INTO plugins (id, name, version, description, author, url, installed, active, created_at, updated_at)
    VALUES 
    ('seo-toolkit', 'SEO Toolkit', '1.0.0', 'SEO optimization tools for your content', 'CMS Team', 'https://example.com/plugins/seo-toolkit', 1, 1, datetime('now'), datetime('now'));");
    
    echo "SQLite database initialized successfully at: $dbPath\n";
    exit(0);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
