<?php
/**
 * SEO Toolkit Plugin
 * 
 * Provides SEO analysis and metadata management for content
 */

class SEOToolkitPlugin {
    private $conn;
    private $pluginId = 'seo-toolkit';
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    /**
     * Get plugin metadata
     */
    public function getMetadata() {
        return [
            'id' => $this->pluginId,
            'name' => 'SEO Toolkit',
            'version' => '1.0.0',
            'description' => 'Comprehensive SEO tools for optimizing your content',
            'author' => 'CMS Team',
            'category' => 'SEO',
            'settings' => [
                'default_title_format' => '{title} | {site_name}',
                'default_description_length' => 160,
                'enable_social_meta' => true,
                'enable_schema_markup' => true
            ]
        ];
    }
    
    /**
     * Initialize the plugin
     */
    public function initialize() {
        // Register hooks
        add_action('content:beforeCreate', [$this, 'processSEOMetadata']);
        add_action('content:beforeUpdate', [$this, 'processSEOMetadata']);
        add_action('content:afterGet', [$this, 'appendSEOMetadata']);
        
        // Register admin pages
        add_admin_page('SEO Settings', 'seo-settings', [$this, 'renderSettingsPage']);
    }
    
    /**
     * Process SEO metadata before content is saved
     */
    public function processSEOMetadata($content) {
        // Extract SEO fields from content if they exist
        if (isset($content['seo'])) {
            $seoData = $content['seo'];
            $contentId = $content['id'];
            
            // Save SEO metadata to database
            $this->saveSEOMetadata($contentId, $seoData);
            
            // Remove SEO data from content to prevent duplication
            unset($content['seo']);
        }
        
        return $content;
    }
    
    /**
     * Append SEO metadata to content when retrieved
     */
    public function appendSEOMetadata($content) {
        if (!isset($content['id'])) {
            return $content;
        }
        
        $contentId = $content['id'];
        $seoData = $this->getSEOMetadata($contentId);
        
        if ($seoData) {
            $content['seo'] = $seoData;
        } else {
            // Generate default SEO metadata if none exists
            $content['seo'] = $this->generateDefaultSEOMetadata($content);
        }
        
        return $content;
    }
    
    /**
     * Save SEO metadata to database
     */
    private function saveSEOMetadata($contentId, $seoData) {
        // Begin transaction
        $this->conn->begin_transaction();
        
        try {
            foreach ($seoData as $key => $value) {
                // Use REPLACE INTO to handle both insert and update
                $stmt = $this->conn->prepare("REPLACE INTO content_metadata (content_id, plugin_id, meta_key, meta_value) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("ssss", $contentId, $this->pluginId, $key, $value);
                $stmt->execute();
                $stmt->close();
            }
            
            // Commit transaction
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            // Rollback on error
            $this->conn->rollback();
            error_log("SEO Toolkit: Failed to save metadata - " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get SEO metadata from database
     */
    private function getSEOMetadata($contentId) {
        $stmt = $this->conn->prepare("SELECT meta_key, meta_value FROM content_metadata WHERE content_id = ? AND plugin_id = ?");
        $stmt->bind_param("ss", $contentId, $this->pluginId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $metadata = [];
        while ($row = $result->fetch_assoc()) {
            $metadata[$row['meta_key']] = $row['meta_value'];
        }
        
        $stmt->close();
        return $metadata;
    }
    
    /**
     * Generate default SEO metadata based on content
     */
    private function generateDefaultSEOMetadata($content) {
        $settings = $this->getPluginSettings();
        
        $title = isset($content['title']) ? $content['title'] : '';
        $description = '';
        
        // Extract description from content if available
        if (isset($content['content'])) {
            $plainText = strip_tags($content['content']);
            $description = substr($plainText, 0, $settings['default_description_length'] ?? 160);
            if (strlen($plainText) > ($settings['default_description_length'] ?? 160)) {
                $description .= '...';
            }
        }
        
        return [
            'meta_title' => $title,
            'meta_description' => $description,
            'meta_keywords' => '',
            'og_title' => $title,
            'og_description' => $description,
            'og_image' => '',
            'twitter_title' => $title,
            'twitter_description' => $description,
            'twitter_image' => '',
            'canonical_url' => '',
            'robots' => 'index,follow'
        ];
    }
    
    /**
     * Get plugin settings
     */
    private function getPluginSettings() {
        $defaultSettings = $this->getMetadata()['settings'];
        $projectId = $_ENV['PROJECT_ID'] ?? 'default';
        
        $stmt = $this->conn->prepare("SELECT setting_key, setting_value FROM plugin_settings WHERE plugin_id = ? AND project_id = ?");
        $stmt->bind_param("ss", $this->pluginId, $projectId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $settings = $defaultSettings;
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        
        $stmt->close();
        return $settings;
    }
    
    /**
     * Render settings page
     */
    public function renderSettingsPage() {
        $settings = $this->getPluginSettings();
        
        // This would be a proper HTML form in a real implementation
        echo '<div class="seo-settings-page">';
        echo '<h1>SEO Toolkit Settings</h1>';
        
        echo '<form id="seo-settings-form">';
        echo '<div class="form-group">';
        echo '<label for="default_title_format">Default Title Format</label>';
        echo '<input type="text" id="default_title_format" name="default_title_format" value="' . htmlspecialchars($settings['default_title_format']) . '">';
        echo '<p class="help-text">Available variables: {title}, {site_name}, {separator}</p>';
        echo '</div>';
        
        echo '<div class="form-group">';
        echo '<label for="default_description_length">Default Description Length</label>';
        echo '<input type="number" id="default_description_length" name="default_description_length" value="' . intval($settings['default_description_length']) . '">';
        echo '</div>';
        
        echo '<div class="form-group">';
        echo '<label for="enable_social_meta">Enable Social Media Metadata</label>';
        echo '<input type="checkbox" id="enable_social_meta" name="enable_social_meta"' . ($settings['enable_social_meta'] ? ' checked' : '') . '>';
        echo '</div>';
        
        echo '<div class="form-group">';
        echo '<label for="enable_schema_markup">Enable Schema Markup</label>';
        echo '<input type="checkbox" id="enable_schema_markup" name="enable_schema_markup"' . ($settings['enable_schema_markup'] ? ' checked' : '') . '>';
        echo '</div>';
        
        echo '<button type="submit" class="button button-primary">Save Settings</button>';
        echo '</form>';
        echo '</div>';
        
        // Add JavaScript for form submission
        echo '<script>
            document.getElementById("seo-settings-form").addEventListener("submit", function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const settings = {};
                
                for (const [key, value] of formData.entries()) {
                    settings[key] = value;
                }
                
                // Handle checkboxes
                settings.enable_social_meta = document.getElementById("enable_social_meta").checked;
                settings.enable_schema_markup = document.getElementById("enable_schema_markup").checked;
                
                // Send settings to server
                fetch("/api/plugins.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        plugin_id: "seo-toolkit",
                        project_id: "' . ($_ENV['PROJECT_ID'] ?? 'default') . '",
                        settings: settings
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Settings saved successfully");
                    } else {
                        alert("Failed to save settings: " + data.error);
                    }
                })
                .catch(error => {
                    alert("Error: " + error);
                });
            });
        </script>';
    }
    
    /**
     * Analyze content for SEO issues
     */
    public function analyzeSEO($content, $seoData) {
        $issues = [];
        $score = 100;
        
        // Check title length
        if (empty($seoData['meta_title'])) {
            $issues[] = ['type' => 'error', 'message' => 'Meta title is missing'];
            $score -= 15;
        } elseif (strlen($seoData['meta_title']) < 30) {
            $issues[] = ['type' => 'warning', 'message' => 'Meta title is too short (less than 30 characters)'];
            $score -= 5;
        } elseif (strlen($seoData['meta_title']) > 60) {
            $issues[] = ['type' => 'warning', 'message' => 'Meta title is too long (more than 60 characters)'];
            $score -= 5;
        }
        
        // Check description
        if (empty($seoData['meta_description'])) {
            $issues[] = ['type' => 'error', 'message' => 'Meta description is missing'];
            $score -= 15;
        } elseif (strlen($seoData['meta_description']) < 70) {
            $issues[] = ['type' => 'warning', 'message' => 'Meta description is too short (less than 70 characters)'];
            $score -= 5;
        } elseif (strlen($seoData['meta_description']) > 160) {
            $issues[] = ['type' => 'warning', 'message' => 'Meta description is too long (more than 160 characters)'];
            $score -= 5;
        }
        
        // Check keywords
        if (empty($seoData['meta_keywords'])) {
            $issues[] = ['type' => 'info', 'message' => 'Meta keywords are missing (not critical for SEO)'];
        }
        
        // Check content length
        $contentText = strip_tags($content['content'] ?? '');
        $wordCount = str_word_count($contentText);
        
        if ($wordCount < 300) {
            $issues[] = ['type' => 'warning', 'message' => 'Content is too short (less than 300 words)'];
            $score -= 10;
        }
        
        // Check if title appears in content
        if (!empty($seoData['meta_title']) && !empty($contentText)) {
            if (stripos($contentText, $seoData['meta_title']) === false) {
                $issues[] = ['type' => 'info', 'message' => 'Meta title does not appear in content'];
                $score -= 3;
            }
        }
        
        // Ensure score is between 0 and 100
        $score = max(0, min(100, $score));
        
        return [
            'score' => $score,
            'issues' => $issues,
            'word_count' => $wordCount
        ];
    }
}

// Helper functions for hooks (would be part of a real plugin system)
function add_action($hook, $callback) {
    // This would register a callback for a specific hook
    // Implementation depends on the CMS's event system
}

function add_admin_page($title, $slug, $callback) {
    // This would register an admin page
    // Implementation depends on the CMS's admin system
}

// Initialize the plugin when included
$seoToolkit = new SEOToolkitPlugin($conn);
$seoToolkit->initialize();

// Return plugin metadata for registration
return $seoToolkit->getMetadata();
