<?php
function initDatabase($db) {
    // Создание таблицы пользователей
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'pending',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Создание таблицы контента
    $db->exec("CREATE TABLE IF NOT EXISTS content (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        content TEXT,
        metadata TEXT,
        author_id VARCHAR(36) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Создание таблицы медиа
    $db->exec("CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        size INT NOT NULL,
        dimensions VARCHAR(50),
        uploaded_by VARCHAR(36) NOT NULL,
        tags VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Создание таблицы плагинов
    $db->exec("CREATE TABLE IF NOT EXISTS plugins (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        version VARCHAR(50) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(50),
        tags VARCHAR(255),
        price VARCHAR(50) DEFAULT 'Free',
        downloads INT DEFAULT 0,
        rating FLOAT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 0,
        installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        config TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Создание таблицы настроек системы
    $db->exec("CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(36) PRIMARY KEY,
        `key` VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Создание таблицы пользовательских настроек
    $db->exec("CREATE TABLE IF NOT EXISTS user_settings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        `key` VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE(user_id, `key`),
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Создание таблицы для метаданных контента (для SEO плагина)
    $db->exec("CREATE TABLE IF NOT EXISTS content_meta (
        id VARCHAR(36) PRIMARY KEY,
        content_id VARCHAR(36) NOT NULL,
        meta_key VARCHAR(255) NOT NULL,
        meta_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE(content_id, meta_key),
        FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Добавление администратора по умолчанию
    $adminId = generateUUID();
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("INSERT INTO users (id, email, name, password, role, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$adminId, 'admin@example.com', 'Admin User', $adminPassword, 'admin', 'active']);

    // Добавление SEO плагина по умолчанию
    $pluginId = 'seo-toolkit';
    $config = json_encode([
        'enabled' => true,
        'metaTitleField' => true,
        'metaDescriptionField' => true,
        'keywordsField' => true,
        'ogTagsField' => true,
        'twitterCardsField' => true,
        'structuredDataField' => false,
        'contentTypes' => ['page', 'post']
    ]);
    
    $stmt = $db->prepare("INSERT INTO plugins (id, name, slug, description, version, author, category, is_active, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $pluginId,
        'SEO Toolkit',
        'seo-toolkit',
        'Comprehensive SEO tools for optimizing your content',
        '1.0.0',
        'CMS Team',
        'SEO',
        1, // активен по умолчанию
        $config
    ]);
}

// Функция для генерации UUID
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
