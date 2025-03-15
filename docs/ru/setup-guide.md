# Руководство по настройке CMS с плагинами

## Требования

- PHP 7.4 или выше
- MySQL 5.7 или выше (или SQLite для разработки)
- Composer
- Node.js 16 или выше
- npm или yarn

## Шаг 1: Подготовка проекта

1. Скачайте проект с Tempo, нажав на кнопку "Download" в верхнем правом углу интерфейса.
2. Распакуйте архив в нужную директорию.

## Шаг 2: Установка зависимостей

### Установка JavaScript зависимостей

```bash
npm install
# или
yarn install
```

### Установка PHP зависимостей (если используется Composer)

```bash
composer install
```

## Шаг 3: Настройка базы данных

### Вариант 1: SQLite (для разработки)

1. Создайте файл `.env` в корне проекта на основе `.env.example`:

```
DATABASE_TYPE=sqlite
DATABASE_PATH=./database.sqlite
```

2. Инициализируйте базу данных SQLite:

```bash
php server/database/init_sqlite.php
```

### Вариант 2: MySQL

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

## Шаг 4: Запуск PHP сервера

```bash
php -S localhost:8000 -t server/
```

Это запустит PHP сервер для API на порту 8000.

## Шаг 5: Запуск React клиента

В отдельном терминале:

```bash
npm run dev
# или
yarn dev
```

Это запустит React клиент на порту 5173.

## Шаг 6: Доступ к CMS

Откройте браузер и перейдите по адресу:
- Frontend: http://localhost:5173
- API: http://localhost:8000/api

### Учетные данные по умолчанию

- Логин: admin
- Пароль: password

## Шаг 7: Работа с плагинами

1. Плагины находятся в директориях:
   - `/plugins` - серверные плагины PHP
   - `/src/plugins` - клиентские плагины React

2. Для установки нового плагина:
   - Скопируйте файлы плагина в соответствующую директорию
   - Перейдите в админ-панель CMS по адресу `http://localhost:5173/settings/plugins`
   - Активируйте плагин через интерфейс

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
