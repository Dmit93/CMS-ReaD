<?php
/**
 * SEO Toolkit Plugin
 * 
 * Добавляет SEO-функциональность для контента в CMS.
 */

class SEOToolkitPlugin {
    private $db;
    private $config;
    
    public function __construct($db) {
        $this->db = $db;
        $this->loadConfig();
    }
    
    /**
     * Загрузка конфигурации плагина из базы данных
     */
    private function loadConfig() {
        try {
            $stmt = $this->db->prepare("SELECT config FROM plugins WHERE id = 'seo-toolkit'");
            $stmt->execute();
            $plugin = $stmt->fetch();
            
            if ($plugin && !empty($plugin['config'])) {
                $this->config = json_decode($plugin['config'], true);
            } else {
                // Конфигурация по умолчанию
                $this->config = [
                    'enabled' => true,
                    'metaTitleField' => true,
                    'metaDescriptionField' => true,
                    'keywordsField' => true,
                    'ogTagsField' => true,
                    'twitterCardsField' => true,
                    'structuredDataField' => false,
                    'contentTypes' => ['page', 'post']
                ];
            }
        } catch (PDOException $e) {
            error_log('SEO Toolkit Plugin: ' . $e->getMessage());
            $this->config = ['enabled' => false];
        }
    }
    
    /**
     * Получение SEO-полей для формы редактирования контента
     */
    public function getSEOFields() {
        if (!$this->config['enabled']) {
            return [];
        }
        
        $fields = [];
        
        if ($this->config['metaTitleField']) {
            $fields[] = [
                'name' => 'seo_title',
                'label' => 'SEO Title',
                'type' => 'text',
                'description' => 'Заголовок страницы для поисковых систем (рекомендуется 50-60 символов)',
                'maxLength' => 60
            ];
        }
        
        if ($this->config['metaDescriptionField']) {
            $fields[] = [
                'name' => 'seo_description',
                'label' => 'Meta Description',
                'type' => 'textarea',
                'description' => 'Описание страницы для поисковых систем (рекомендуется 150-160 символов)',
                'maxLength' => 160
            ];
        }
        
        if ($this->config['keywordsField']) {
            $fields[] = [
                'name' => 'seo_keywords',
                'label' => 'Meta Keywords',
                'type' => 'text',
                'description' => 'Ключевые слова, разделенные запятыми',
            ];
        }
        
        if ($this->config['ogTagsField']) {
            $fields[] = [
                'name' => 'og_title',
                'label' => 'Open Graph Title',
                'type' => 'text',
                'description' => 'Заголовок для социальных сетей',
            ];
            
            $fields[] = [
                'name' => 'og_description',
                'label' => 'Open Graph Description',
                'type' => 'textarea',
                'description' => 'Описание для социальных сетей',
            ];
            
            $fields[] = [
                'name' => 'og_image',
                'label' => 'Open Graph Image',
                'type' => 'media',
                'description' => 'Изображение для социальных сетей (рекомендуемый размер 1200x630)',
            ];
        }
        
        if ($this->config['twitterCardsField']) {
            $fields[] = [
                'name' => 'twitter_card',
                'label' => 'Twitter Card Type',
                'type' => 'select',
                'options' => [
                    'summary' => 'Summary',
                    'summary_large_image' => 'Summary with Large Image',
                ],
                'description' => 'Тип карточки Twitter',
            ];
        }
        
        if ($this->config['structuredDataField']) {
            $fields[] = [
                'name' => 'structured_data',
                'label' => 'Structured Data (JSON-LD)',
                'type' => 'code',
                'language' => 'json',
                'description' => 'Структурированные данные в формате JSON-LD',
            ];
        }
        
        return $fields;
    }
    
    /**
     * Получение SEO-метаданных для контента
     */
    public function getSEOMetadata($contentId) {
        if (!$this->config['enabled']) {
            return [];
        }
        
        try {
            $stmt = $this->db->prepare("SELECT meta_key, meta_value FROM content_meta WHERE content_id = ? AND meta_key LIKE 'seo_%' OR meta_key LIKE 'og_%' OR meta_key LIKE 'twitter_%' OR meta_key = 'structured_data'");
            $stmt->execute([$contentId]);
            $metaRows = $stmt->fetchAll();
            
            $metadata = [];
            foreach ($metaRows as $row) {
                $metadata[$row['meta_key']] = $row['meta_value'];
            }
            
            return $metadata;
        } catch (PDOException $e) {
            error_log('SEO Toolkit Plugin: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Генерация HTML-кода для мета-тегов
     */
    public function generateMetaTags($contentId) {
        if (!$this->config['enabled']) {
            return '';
        }
        
        $metadata = $this->getSEOMetadata($contentId);
        if (empty($metadata)) {
            return '';
        }
        
        $html = "<!-- SEO Meta Tags -->\n";
        
        // Основные мета-теги
        if (isset($metadata['seo_title'])) {
            $html .= "<title>" . htmlspecialchars($metadata['seo_title']) . "</title>\n";
        }
        
        if (isset($metadata['seo_description'])) {
            $html .= "<meta name=\"description\" content=\"" . htmlspecialchars($metadata['seo_description']) . "\">\n";
        }
        
        if (isset($metadata['seo_keywords'])) {
            $html .= "<meta name=\"keywords\" content=\"" . htmlspecialchars($metadata['seo_keywords']) . "\">\n";
        }
        
        // Open Graph теги
        if (isset($metadata['og_title']) || isset($metadata['og_description']) || isset($metadata['og_image'])) {
            $html .= "\n<!-- Open Graph / Facebook -->\n";
            
            if (isset($metadata['og_title'])) {
                $html .= "<meta property=\"og:title\" content=\"" . htmlspecialchars($metadata['og_title']) . "\">\n";
            }
            
            if (isset($metadata['og_description'])) {
                $html .= "<meta property=\"og:description\" content=\"" . htmlspecialchars($metadata['og_description']) . "\">\n";
            }
            
            if (isset($metadata['og_image'])) {
                $html .= "<meta property=\"og:image\" content=\"" . htmlspecialchars($metadata['og_image']) . "\">\n";
            }
            
            $html .= "<meta property=\"og:type\" content=\"website\">\n";
        }
        
        // Twitter Card теги
        if (isset($metadata['twitter_card'])) {
            $html .= "\n<!-- Twitter -->\n";
            $html .= "<meta name=\"twitter:card\" content=\"" . htmlspecialchars($metadata['twitter_card']) . "\">\n";
            
            if (isset($metadata['og_title'])) {
                $html .= "<meta name=\"twitter:title\" content=\"" . htmlspecialchars($metadata['og_title']) . "\">\n";
            }
            
            if (isset($metadata['og_description'])) {
                $html .= "<meta name=\"twitter:description\" content=\"" . htmlspecialchars($metadata['og_description']) . "\">\n";
            }
            
            if (isset($metadata['og_image'])) {
                $html .= "<meta name=\"twitter:image\" content=\"" . htmlspecialchars($metadata['og_image']) . "\">\n";
            }
        }
        
        // Structured Data
        if (isset($metadata['structured_data'])) {
            $html .= "\n<!-- Structured Data -->\n";
            $html .= "<script type=\"application/ld+json\">\n";
            $html .= $metadata['structured_data'] . "\n";
            $html .= "</script>\n";
        }
        
        return $html;
    }
    
    /**
     * Анализ SEO-оптимизации контента
     */
    public function analyzeSEO($contentId, $content) {
        if (!$this->config['enabled']) {
            return ['score' => 0, 'issues' => ['SEO-плагин отключен']];
        }
        
        $metadata = $this->getSEOMetadata($contentId);
        $issues = [];
        $score = 0;
        $maxScore = 0;
        
        // Проверка наличия и длины мета-заголовка
        if ($this->config['metaTitleField']) {
            $maxScore += 20;
            if (!isset($metadata['seo_title']) || empty($metadata['seo_title'])) {
                $issues[] = 'Отсутствует SEO-заголовок';
            } elseif (strlen($metadata['seo_title']) < 30) {
                $issues[] = 'SEO-заголовок слишком короткий (рекомендуется 50-60 символов)';
                $score += 10;
            } elseif (strlen($metadata['seo_title']) > 60) {
                $issues[] = 'SEO-заголовок слишком длинный (рекомендуется 50-60 символов)';
                $score += 10;
            } else {
                $score += 20;
            }
        }
        
        // Проверка наличия и длины мета-описания
        if ($this->config['metaDescriptionField'])