# Руководство по установке CMS с плагинами

## Требования

- PHP 7.4 или выше
- MySQL 5.7 или выше (или SQLite для разработки)
- Composer
- Node.js 16 или выше
- npm или yarn

## Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/ваш-репозиторий/cms-platform.git
cd cms-platform
```

## Шаг 2: Установка зависимостей

### Установка PHP зависимостей

```bash
composer install
```

### Установка JavaScript зависимостей

```bash
npm install
# или
yarn install
```

## Шаг 3: Настройка базы данных

### Вариант 1: MySQL

1. Создайте базу данных MySQL:

```sql
CREATE DATABASE cms_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cms_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON cms_platform.* TO 'cms_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Настройте файл `.env`:

```
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=cms_platform
DATABASE_USER=cms_user
DATABASE_PASSWORD=your_password
```

3. Импортируйте схему базы данных:

```bash
php server/database/init_mysql.php
```

### Вариант 2: SQLite (для разработки)

1. Настройте файл `.env`:

```
DATABASE_TYPE=sqlite
DATABASE_PATH=./database.sqlite
```

2. Инициализируйте базу данных SQLite:

```bash
php server/database/init_sqlite.php
```

## Шаг 4: Настройка Prisma (для React клиента)

1. Обновите файл `prisma/schema.prisma` с правильными настройками подключения к базе данных.

2. Сгенерируйте клиент Prisma:

```bash
npx prisma generate
```

3. Примените миграции:

```bash
npx prisma migrate dev --name init
```

## Шаг 5: Настройка PHP сервера

### Вариант 1: Встроенный сервер PHP (для разработки)

```bash
php -S localhost:8000 -t server/
```

### Вариант 2: Apache

1. Настройте виртуальный хост в Apache:

```apache
<VirtualHost *:80>
    ServerName cms.local
    DocumentRoot /path/to/cms-platform/server
    
    <Directory /path/to/cms-platform/server>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/cms-error.log
    CustomLog ${APACHE_LOG_DIR}/cms-access.log combined
</VirtualHost>
```

2. Добавьте запись в файл hosts:

```
127.0.0.1 cms.local
```

### Вариант 3: Nginx

1. Настройте сервер Nginx:

```nginx
server {
    listen 80;
    server_name cms.local;
    root /path/to/cms-platform/server;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
```

2. Добавьте запись в файл hosts:

```
127.0.0.1 cms.local
```

## Шаг 6: Запуск React клиента

```bash
npm run dev
# или
yarn dev
```

## Шаг 7: Настройка плагинов

1. Плагины хранятся в директориях:
   - `/plugins` - серверные плагины PHP
   - `/src/plugins` - клиентские плагины React

2. Для установки нового плагина:
   - Скопируйте файлы плагина в соответствующую директорию
   - Перейдите в админ-панель CMS по адресу `http://localhost:5173/settings/plugins`
   - Активируйте плагин через интерфейс

## Шаг 8: Создание собственного плагина

### Структура клиентского плагина (React)

```
src/plugins/my-plugin/
├── components/
│   └── MyComponent.jsx
├── database/
│   └── index.js
├── index.js
└── store/
    └── index.js
```

Пример файла `index.js`:

```javascript
export default {
  name: 'my-plugin',
  displayName: 'Мой плагин',
  description: 'Описание моего плагина',
  version: '1.0.0',
  author: 'Ваше имя',
  components: {
    // Компоненты плагина
  },
  hooks: {
    // Хуки для интеграции с CMS
  },
  init: (api) => {
    // Инициализация плагина
    console.log('Плагин инициализирован');
  }
};
```

### Структура серверного плагина (PHP)

```
plugins/my-plugin/
├── index.php
└── components/
    └── MyComponent.php
```

Пример файла `index.php`:

```php
<?php

class MyPlugin {
  public $name = 'my-plugin';
  public $displayName = 'Мой плагин';
  public $description = 'Описание моего плагина';
  public $version = '1.0.0';
  public $author = 'Ваше имя';
  
  public function init() {
    // Инициализация плагина
    echo "Плагин инициализирован";
  }
  
  public function registerHooks() {
    // Регистрация хуков
    return [
      'content.before_save' => [$this, 'beforeContentSave'],
    ];
  }
  
  public function beforeContentSave($content) {
    // Обработка контента перед сохранением
    return $content;
  }
}

return new MyPlugin();
```

## Шаг 9: Сборка для продакшена

```bash
npm run build
# или
yarn build
```

После сборки файлы будут доступны в директории `dist/`.

## Шаг 10: Развертывание на продакшен-сервере

1. Скопируйте файлы на сервер
2. Настройте базу данных на продакшен-сервере
3. Настройте веб-сервер (Apache или Nginx) для обслуживания PHP и статических файлов
4. Обновите файл `.env` с продакшен-настройками

## Устранение неполадок

### Проблемы с базой данных

1. Проверьте настройки подключения в файле `.env`
2. Убедитесь, что база данных создана и пользователь имеет необходимые права
3. Проверьте логи ошибок PHP и MySQL

### Проблемы с плагинами

1. Проверьте структуру плагина и соответствие требованиям API
2. Проверьте консоль браузера на наличие ошибок JavaScript
3. Убедитесь, что все зависимости плагина установлены

### Проблемы с PHP

1. Проверьте версию PHP (требуется 7.4 или выше)
2. Убедитесь, что все необходимые расширения PHP включены
3. Проверьте логи ошибок PHP

## Дополнительная информация

Дополнительную документацию можно найти в директории `docs/`.
