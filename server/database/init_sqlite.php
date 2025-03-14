<?php
function initDatabase($db) {
    // Создание таблицы пользователей
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'pending',
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )");

    // Создание таблицы контента
    $db->exec("CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        content TEXT,
        metadata TEXT,
        author_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
    )");

    // Создание таблицы медиа
    $db->exec("CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        size INTEGER NOT NULL,
        dimensions TEXT,
        uploaded_by TEXT NOT NULL,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )");

    // Создание таблицы плагинов
    $db->exec("CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        version TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        price TEXT DEFAULT 'Free',
        downloads INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        is_active INTEGER DEFAULT 0,
        installed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        config TEXT
    )");

    // Создание таблицы настроек системы
    $db->exec("CREATE TABLE IF NOT EXISTS system_settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )");

    // Создание таблицы пользовательских настроек
    $db->exec("CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, key),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    // Создание таблицы для метаданных контента (для SEO плагина)
    $db->exec("CREATE TABLE IF NOT EXISTS content_meta (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        meta_key TEXT NOT NULL,
        meta_value TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(content_id, meta_key),
        FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
    )");

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
