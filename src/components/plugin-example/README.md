# Plugin System and Event Architecture

## Overview

This CMS platform includes a robust plugin system with an event-driven architecture that allows plugins to hook into various lifecycle stages and actions. This enables developers to extend the functionality of the CMS without modifying the core code.

## Event System

The event system is based on a publish-subscribe pattern, allowing components to emit events and subscribe to events emitted by other components.

### Core Event Types

- **Lifecycle Events**: `cms:beforeInit`, `cms:afterInit`, `cms:beforeRender`, `cms:afterRender`
- **Content Events**: `content:beforeCreate`, `content:afterCreate`, `content:beforeUpdate`, `content:afterUpdate`, `content:beforeDelete`, `content:afterDelete`
- **Media Events**: `media:beforeUpload`, `media:afterUpload`, `media:beforeDelete`, `media:afterDelete`
- **User Events**: `user:beforeLogin`, `user:afterLogin`, `user:beforeLogout`, `user:afterLogout`
- **Plugin Events**: `plugin:beforeInstall`, `plugin:afterInstall`, `plugin:beforeUninstall`, `plugin:afterUninstall`, `plugin:beforeActivate`, `plugin:afterActivate`, `plugin:beforeDeactivate`, `plugin:afterDeactivate`

### Using Events

```typescript
import events from '@/lib/events';

// Subscribe to an event
const unsubscribe = events.on('content:afterCreate', (content) => {
  console.log('Content created:', content);
});

// Emit an event
events.emit('content:beforeCreate', newContent);

// Unsubscribe when done
unsubscribe();
```

## Plugin API

Plugins can interact with the CMS through a standardized API that provides access to the event system and various extension points.

### Plugin Configuration

```typescript
const pluginConfig = {
  id: 'example-plugin',
  name: 'Example Plugin',
  version: '1.0.0',
  description: 'An example plugin',
  author: 'CMS Team',
  icon: 'Puzzle',
  dependencies: [], // Optional array of plugin IDs this plugin depends on
  initialize: (api) => {
    // Plugin initialization code
    // Return a cleanup function if needed
    return () => {
      // Cleanup code
    };
  },
};
```

### Extension Points

Plugins can extend the CMS in various ways:

1. **Content Types**: Register custom content types with their own fields and validation
2. **Menu Items**: Add new items to the navigation menu
3. **Settings Panels**: Add custom settings panels to the admin interface
4. **Editor Extensions**: Extend the content editor with custom functionality

```typescript
// Register a custom content type
api.registerContentType({
  id: 'product',
  name: 'Product',
  description: 'Product content type',
  icon: 'Package',
  fields: [
    {
      id: 'name',
      name: 'Product Name',
      type: 'text',
      required: true,
    },
    {
      id: 'price',
      name: 'Price',
      type: 'number',
      required: true,
    },
  ],
  pluginId: 'example-plugin',
});

// Register a menu item
api.registerMenuItem({
  id: 'example-plugin',
  name: 'Example Plugin',
  path: '/example-plugin',
  icon: 'Puzzle',
  order: 100,
  pluginId: 'example-plugin',
});
```

## React Hooks

For React components, we provide hooks to easily work with the event system:

```typescript
import { useEvent, useEventOnce, useEmitEvent } from '@/lib/hooks/useEvents';

function MyComponent() {
  // Subscribe to an event
  useEvent('content:afterCreate', (content) => {
    console.log('Content created:', content);
  });
  
  // Subscribe to an event once
  useEventOnce('cms:afterInit', () => {
    console.log('CMS initialized');
  });
  
  // Create a function to emit an event
  const handleCreateContent = useEmitEvent('content:beforeCreate', newContent);
  
  return (
    <button onClick={handleCreateContent}>Create Content</button>
  );
}
```

## Creating a Plugin

To create a plugin:

1. Create a plugin configuration object
2. Implement the initialize function
3. Register the plugin with the CMS

See the `ExamplePlugin.tsx` file for a complete example.

## Best Practices

1. **Clean Up**: Always return a cleanup function from your initialize function to remove event listeners
2. **Error Handling**: Handle errors gracefully in your event listeners
3. **Dependencies**: Specify any plugins your plugin depends on
4. **Performance**: Keep event listeners lightweight and avoid expensive operations
5. **Isolation**: Don't modify core CMS functionality directly; use the provided API
