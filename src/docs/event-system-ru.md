# Документация по системе событий CMS

## Содержание

1. [Введение](#введение)
2. [Архитектура системы событий](#архитектура-системы-событий)
3. [Основные типы событий](#основные-типы-событий)
4. [Использование событий](#использование-событий)
5. [Работа с ядром CMS](#работа-с-ядром-cms)
6. [API плагинов](#api-плагинов)
7. [Создание собственных событий](#создание-собственных-событий)
8. [React-хуки для работы с событиями](#react-хуки-для-работы-с-событиями)
9. [Примеры использования](#примеры-использования)
10. [Лучшие практики](#лучшие-практики)

## Введение

Система событий CMS представляет собой мощный механизм, позволяющий расширять функциональность платформы без изменения основного кода. Она основана на паттерне «издатель-подписчик» (publish-subscribe), который позволяет компонентам генерировать события и подписываться на события, генерируемые другими компонентами.

Эта архитектура обеспечивает:

- **Модульность**: компоненты могут взаимодействовать друг с другом, не имея прямых зависимостей
- **Расширяемость**: плагины могут добавлять новую функциональность, подписываясь на существующие события
- **Гибкость**: разработчики могут создавать собственные события для специфических нужд

## Архитектура системы событий

Система событий построена на следующих ключевых компонентах:

1. **EventSystem** (`src/lib/events.ts`) - основной класс, управляющий регистрацией и вызовом событий
2. **PluginAPI** (`src/lib/plugin-api.ts`) - интерфейс для взаимодействия плагинов с CMS
3. **PluginLoader** (`src/lib/plugin-loader.ts`) - загрузчик плагинов
4. **CMSCore** (`src/lib/cms-core.ts`) - ядро CMS, управляющее жизненным циклом системы

Все эти компоненты работают вместе, обеспечивая единую систему событий для всей платформы.

## Основные типы событий

В CMS предусмотрены следующие категории событий:

### События жизненного цикла

- `cms:beforeInit` - вызывается перед инициализацией CMS
- `cms:afterInit` - вызывается после успешной инициализации CMS
- `cms:beforeRender` - вызывается перед рендерингом приложения
- `cms:afterRender` - вызывается после рендеринга приложения

### События контента

- `content:beforeCreate` - перед созданием нового контента
- `content:afterCreate` - после создания нового контента
- `content:beforeUpdate` - перед обновлением существующего контента
- `content:afterUpdate` - после обновления существующего контента
- `content:beforeDelete` - перед удалением контента
- `content:afterDelete` - после удаления контента

### События медиа

- `media:beforeUpload` - перед загрузкой медиафайла
- `media:afterUpload` - после загрузки медиафайла
- `media:beforeDelete` - перед удалением медиафайла
- `media:afterDelete` - после удаления медиафайла

### События пользователей

- `user:beforeLogin` - перед входом пользователя в систему
- `user:afterLogin` - после успешного входа пользователя
- `user:beforeLogout` - перед выходом пользователя из системы
- `user:afterLogout` - после выхода пользователя из системы

### События плагинов

- `plugin:beforeInstall` - перед установкой плагина
- `plugin:afterInstall` - после установки плагина
- `plugin:beforeUninstall` - перед удалением плагина
- `plugin:afterUninstall` - после удаления плагина
- `plugin:beforeActivate` - перед активацией плагина
- `plugin:afterActivate` - после активации плагина
- `plugin:beforeDeactivate` - перед деактивацией плагина
- `plugin:afterDeactivate` - после деактивации плагина

## Использование событий

### Подписка на события

```typescript
import events from '@/lib/events';

// Подписка на событие
const unsubscribe = events.on('content:afterCreate', (content) => {
  console.log('Контент создан:', content);
});

// Отписка от события
unsubscribe();
```

### Однократная подписка на событие

```typescript
import events from '@/lib/events';

// Подписка на событие (сработает только один раз)
const unsubscribe = events.once('cms:afterInit', () => {
  console.log('CMS инициализирована');
});
```

### Генерация событий

```typescript
import events from '@/lib/events';

// Генерация события
events.emit('content:beforeCreate', newContent);
```

### Проверка наличия подписчиков

```typescript
import events from '@/lib/events';

// Проверка наличия подписчиков на событие
const hasListeners = events.hasListeners('content:afterCreate');
console.log(`Есть подписчики на событие: ${hasListeners}`);

// Получение количества подписчиков
const listenerCount = events.listenerCount('content:afterCreate');
console.log(`Количество подписчиков: ${listenerCount}`);
```

### Удаление всех подписчиков

```typescript
import events from '@/lib/events';

// Удаление всех подписчиков для конкретного события
events.removeAllListeners('content:afterCreate');

// Удаление всех подписчиков для всех событий
events.removeAllListeners();
```

## Работа с ядром CMS

Ядро CMS (`CMSCore`) управляет жизненным циклом системы и предоставляет методы для работы с плагинами.

### Инициализация CMS

```typescript
import cmsCore from '@/lib/cms-core';

// Инициализация CMS
await cmsCore.initialize();

// Проверка статуса инициализации
const isInitialized = cmsCore.isInitialized();
console.log(`CMS инициализирована: ${isInitialized}`);
```

### Установка и удаление плагинов

```typescript
import cmsCore from '@/lib/cms-core';
import type { PluginConfig } from '@/lib/plugin-api';

// Конфигурация плагина
const pluginConfig: PluginConfig = {
  id: 'example-plugin',
  name: 'Пример плагина',
  version: '1.0.0',
  description: 'Пример плагина для демонстрации',
  author: 'Команда CMS',
  initialize: (api) => {
    // Код инициализации плагина
    return () => {
      // Код очистки при выгрузке плагина
    };
  }
};

// Установка плагина
await cmsCore.installPlugin(pluginConfig);

// Удаление плагина
await cmsCore.uninstallPlugin('example-plugin');
```

## API плагинов

API плагинов (`PluginAPI`) предоставляет интерфейс для взаимодействия плагинов с CMS.

### Конфигурация плагина

```typescript
import type { PluginConfig, PluginAPI } from '@/lib/plugin-api';

const pluginConfig: PluginConfig = {
  id: 'example-plugin',
  name: 'Пример плагина',
  version: '1.0.0',
  description: 'Пример плагина для демонстрации',
  author: 'Команда CMS',
  icon: 'Puzzle', // Иконка из библиотеки Lucide
  dependencies: [], // Опциональный массив ID плагинов, от которых зависит этот плагин
  initialize: (api: PluginAPI) => {
    // Код инициализации плагина
    
    // Возвращаем функцию очистки, если необходимо
    return () => {
      // Код очистки при выгрузке плагина
    };
  },
};
```

### Точки расширения

Плагины могут расширять CMS различными способами:

#### Регистрация типов контента

```typescript
// Регистрация пользовательского типа контента
api.registerContentType({
  id: 'product',
  name: 'Продукт',
  description: 'Тип контента для продуктов',
  icon: 'Package',
  fields: [
    {
      id: 'name',
      name: 'Название продукта',
      type: 'text',
      required: true,
    },
    {
      id: 'price',
      name: 'Цена',
      type: 'number',
      required: true,
    },
  ],
  pluginId: 'example-plugin',
});
```

#### Регистрация пунктов меню

```typescript
// Регистрация пункта меню
api.registerMenuItem({
  id: 'example-plugin',
  name: 'Пример плагина',
  path: '/example-plugin',
  icon: 'Puzzle',
  order: 100,
  pluginId: 'example-plugin',
});
```

#### Регистрация панелей настроек

```typescript
// Регистрация панели настроек
api.registerSettingsPanel({
  id: 'example-plugin-settings',
  name: 'Настройки примера плагина',
  icon: 'Settings',
  component: () => (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Настройки примера плагина</h2>
      <p>Настройте пример плагина здесь.</p>
    </div>
  ),
  order: 100,
  pluginId: 'example-plugin',
});
```

#### Регистрация расширений редактора

```typescript
// Регистрация расширения редактора
api.registerEditorExtension({
  id: 'example-editor-extension',
  type: 'toolbar',
  component: () => (
    <button className="p-2 bg-blue-500 text-white rounded">
      Пример кнопки
    </button>
  ),
  pluginId: 'example-plugin',
});
```

## Создание собственных событий

Вы можете создавать собственные события для специфических нужд вашего приложения или плагина.

### Определение типа события

Сначала добавьте тип события в интерфейс `EventMap` в файле `src/lib/events.ts`:

```typescript
type EventMap = {
  // Существующие типы событий...
  
  // Ваши пользовательские события
  'myPlugin:beforeAction': [data: any];
  'myPlugin:afterAction': [result: any];
  
  // Другие пользовательские события...
};
```

### Использование пользовательских событий

```typescript
import events from '@/lib/events';

// Подписка на пользовательское событие
const unsubscribe = events.on('myPlugin:beforeAction', (data) => {
  console.log('Перед действием:', data);
});

// Генерация пользовательского события
events.emit('myPlugin:beforeAction', { id: 1, name: 'Тестовые данные' });

// Отписка от события
unsubscribe();
```

### Соглашение об именовании событий

Рекомендуется следовать соглашению об именовании событий:

- Используйте префикс с названием вашего плагина или модуля, например `myPlugin:`
- Используйте суффиксы `before` и `after` для событий, связанных с действиями
- Используйте camelCase для имен событий

Примеры: `myPlugin:beforeAction`, `myPlugin:afterAction`, `myPlugin:itemCreated`

## React-хуки для работы с событиями

Для удобства работы с событиями в React-компонентах предоставляются специальные хуки.

### Хук useEvent

```typescript
import { useEvent } from '@/lib/hooks/useEvents';

function MyComponent() {
  // Подписка на событие
  useEvent('content:afterCreate', (content) => {
    console.log('Контент создан:', content);
  });
  
  return <div>Мой компонент</div>;
}
```

### Хук useEventOnce

```typescript
import { useEventOnce } from '@/lib/hooks/useEvents';

function MyComponent() {
  // Подписка на событие один раз
  useEventOnce('cms:afterInit', () => {
    console.log('CMS инициализирована');
  });
  
  return <div>Мой компонент</div>;
}
```

### Хук useEmitEvent

```typescript
import { useEmitEvent } from '@/lib/hooks/useEvents';

function MyComponent() {
  // Создание функции для генерации события
  const handleCreateContent = useEmitEvent('content:beforeCreate', { title: 'Новый контент' });
  
  return (
    <button onClick={handleCreateContent}>Создать контент</button>
  );
}
```

## Примеры использования

### Пример плагина

```typescript
import React, { useEffect } from 'react';
import events from '@/lib/events';
import type { PluginAPI, PluginConfig } from '@/lib/plugin-api';

/**
 * Пример плагина, демонстрирующего использование системы событий
 */
const ExamplePlugin: React.FC = () => {
  useEffect(() => {
    console.log('Компонент примера плагина смонтирован');

    // Очистка при размонтировании компонента
    return () => {
      console.log('Компонент примера плагина размонтирован');
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Пример плагина</h2>
      <p className="text-gray-600">
        Это пример плагина, демонстрирующего использование системы событий.
      </p>
    </div>
  );
};

export default ExamplePlugin;

/**
 * Функция инициализации плагина
 * Вызывается при загрузке плагина
 */
export const initialize = (api: PluginAPI) => {
  console.log('Инициализация примера плагина...');

  // Подписка на события контента
  const unsubscribeCreate = api.events.on('content:afterCreate', (content) => {
    console.log('Контент создан:', content);
  });

  const unsubscribeUpdate = api.events.on('content:afterUpdate', (content) => {
    console.log('Контент обновлен:', content);
  });

  const unsubscribeDelete = api.events.on(
    'content:afterDelete',
    (contentId) => {
      console.log('Контент удален:', contentId);
    },
  );

  // Регистрация пункта меню
  api.registerMenuItem({
    id: 'example-plugin',
    name: 'Пример плагина',
    path: '/example-plugin',
    icon: 'Puzzle',
    order: 100,
    pluginId: 'example-plugin',
  });

  // Регистрация панели настроек
  api.registerSettingsPanel({
    id: 'example-plugin-settings',
    name: 'Настройки примера плагина',
    icon: 'Settings',
    component: () => (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Настройки примера плагина</h2>
        <p>Настройте пример плагина здесь.</p>
      </div>
    ),
    order: 100,
    pluginId: 'example-plugin',
  });

  // Возвращаем функцию очистки
  return () => {
    console.log('Очистка примера плагина...');
    unsubscribeCreate();
    unsubscribeUpdate();
    unsubscribeDelete();
  };
};

/**
 * Конфигурация плагина
 */
export const pluginConfig: PluginConfig = {
  id: 'example-plugin',
  name: 'Пример плагина',
  version: '1.0.0',
  description:
    'Пример плагина, демонстрирующего использование системы событий',
  author: 'Команда CMS',
  icon: 'Puzzle',
  initialize,
};
```

### Пример управления контентом с использованием событий

```typescript
import React, { useState, useEffect } from 'react';
import ContentManagement from './ContentManagement';
import events from '@/lib/events';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

const ContentManagementWithEvents = () => {
  const [content, setContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    // Загрузка начального контента
    const defaultContent: ContentItem[] = [
      {
        id: '1',
        title: 'Добро пожаловать на наш сайт',
        type: 'Page',
        status: 'published',
        author: 'Иван Иванов',
        createdAt: '2023-06-15',
        updatedAt: '2023-06-15',
        slug: '/welcome',
      },
      {
        id: '2',
        title: 'О нашей компании',
        type: 'Page',
        status: 'published',
        author: 'Мария Петрова',
        createdAt: '2023-06-14',
        updatedAt: '2023-06-14',
        slug: '/about',
      },
    ];

    setContent(defaultContent);
  }, []);

  // Обработка создания контента
  const handleCreateContent = (newContent: ContentItem) => {
    // Генерация события перед созданием
    events.emit('content:beforeCreate', newContent);

    // Добавление нового элемента контента
    const updatedContent = [...content, newContent];
    setContent(updatedContent);

    // Генерация события после создания
    events.emit('content:afterCreate', newContent);
  };

  // Обработка обновления контента
  const handleUpdateContent = (
    id: string,
    updatedContent: Partial<ContentItem>,
  ) => {
    // Поиск элемента контента для обновления
    const contentItem = content.find((item) => item.id === id);

    if (contentItem) {
      // Генерация события перед обновлением
      events.emit('content:beforeUpdate', contentItem, {
        ...contentItem,
        ...updatedContent,
      });

      // Обновление элемента контента
      const newContent = content.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedContent,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : item,
      );

      setContent(newContent);

      // Генерация события после обновления
      events.emit(
        'content:afterUpdate',
        newContent.find((item) => item.id === id),
      );
    }
  };

  // Обработка удаления контента
  const handleDeleteContent = (id: string) => {
    // Генерация события перед удалением
    events.emit('content:beforeDelete', id);

    // Удаление элемента контента
    const newContent = content.filter((item) => item.id !== id);
    setContent(newContent);

    // Генерация события после удаления
    events.emit('content:afterDelete', id);
  };

  return (
    <ContentManagement
      initialContent={content}
      // В реальной реализации вы бы передали эти обработчики компоненту ContentManagement
      // и модифицировали его для использования их вместо внутреннего управления состоянием
    />
  );
};

export default ContentManagementWithEvents;
```

## Лучшие практики

### Очистка ресурсов

Всегда возвращайте функцию очистки из функции инициализации плагина, чтобы удалить все подписки на события:

```typescript
export const initialize = (api: PluginAPI) => {
  const unsubscribe1 = api.events.on('event1', callback1);
  const unsubscribe2 = api.events.on('event2', callback2);
  
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};
```

### Обработка ошибок

Всегда обрабатывайте ошибки в обработчиках событий, чтобы предотвратить сбои в работе приложения:

```typescript
api.events.on('content:afterCreate', (content) => {
  try {
    // Ваш код обработки события
  } catch (error) {
    console.error('Ошибка при обработке события content:afterCreate:', error);
  }
});
```

### Зависимости плагинов

Указывайте все плагины, от которых зависит ваш плагин:

```typescript
export const pluginConfig: PluginConfig = {
  id: 'my-plugin',
  // ...
  dependencies: ['another-plugin', 'third-plugin'],
  // ...
};
```

### Производительность

Держите обработчики событий легковесными и избегайте выполнения дорогостоящих операций:

```typescript
// Плохо
api.events.on('content:afterCreate', (content) => {
  // Дорогостоящая операция, которая может замедлить приложение
  const result = heavyComputation(content);
  saveToDatabase(result);
});

// Хорошо
api.events.on('content:afterCreate', (content) => {
  // Запланировать дорогостоящую операцию на следующий тик
  setTimeout(() => {
    const result = heavyComputation(content);
    saveToDatabase(result);
  }, 0);
});
```

### Изоляция

Не модифицируйте напрямую функциональность ядра CMS; используйте предоставленный API:

```typescript
// Плохо
document.querySelector('#cms-editor').innerHTML = '<div>Мой пользовательский редактор</div>';

// Хорошо
api.registerEditorExtension({
  id: 'my-custom-editor',
  type: 'editor',
  component: () => <div>Мой пользовательский редактор</div>,
  pluginId: 'my-plugin',
});
```

### Именование событий

Используйте последовательное именование для ваших пользовательских событий:

```typescript
// Плохо
events.emit('doSomething', data);
events.emit('something_happened', result);

// Хорошо
events.emit('myPlugin:beforeAction', data);
events.emit('myPlugin:afterAction', result);
```

### Документирование событий

Документируйте все пользовательские события, которые генерирует ваш плагин:

```typescript
/**
 * События, генерируемые плагином myPlugin:
 * 
 * myPlugin:beforeAction - Вызывается перед выполнением действия
 *   Параметры: { id: string, data: any }
 * 
 * myPlugin:afterAction - Вызывается после выполнения действия
 *   Параметры: { id: string, result: any, success: boolean }
 */
```

---

Эта документация будет обновляться по мере развития системы событий CMS и добавления новых функций.