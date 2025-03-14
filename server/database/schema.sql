-- Database schema for plugin system

-- Marketplace plugins table
CREATE TABLE IF NOT EXISTS marketplace_plugins (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  tags TEXT,
  price VARCHAR(100) DEFAULT 'Free',
  downloads INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  thumbnail_url TEXT,
  documentation_url TEXT
);

-- Project plugins table (installed plugins for specific projects)
CREATE TABLE IF NOT EXISTS project_plugins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  plugin_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  config TEXT,
  UNIQUE KEY (project_id, plugin_id)
);

-- Plugin settings table
CREATE TABLE IF NOT EXISTS plugin_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plugin_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (plugin_id, project_id, setting_key)
);

-- Content metadata table (for SEO and other plugins)
CREATE TABLE IF NOT EXISTS content_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL,
  plugin_id VARCHAR(255) NOT NULL,
  meta_key VARCHAR(255) NOT NULL,
  meta_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (content_id, plugin_id, meta_key)
);
