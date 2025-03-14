# Database Services Documentation

## Overview

This document describes the service layer that provides a clean API for interacting with the database models. These services encapsulate database operations and integrate with the event system to enable plugin hooks.

## Service Structure

Each service follows a similar pattern:

1. Static methods for CRUD operations
2. Integration with the event system
3. Type-safe interfaces for input data
4. Error handling for common scenarios

## Available Services

### ContentService

Manages content items such as pages, blog posts, forms, etc.

```typescript
import { ContentService } from "@/lib/services";
```

**Methods:**

- `create(data: ContentCreateInput): Promise<Content>`
  - Creates a new content item
  - Emits `content:beforeCreate` and `content:afterCreate` events

- `getById(id: string): Promise<Content | null>`
  - Retrieves a content item by ID

- `getBySlug(slug: string): Promise<Content | null>`
  - Retrieves a content item by slug

- `getAll({ type, status, authorId }): Promise<Content[]>`
  - Retrieves all content items with optional filtering

- `update(id: string, data: ContentUpdateInput): Promise<Content>`
  - Updates a content item
  - Emits `content:beforeUpdate` and `content:afterUpdate` events

- `delete(id: string): Promise<Content>`
  - Deletes a content item
  - Emits `content:beforeDelete` and `content:afterDelete` events

### UserService

Manages user accounts and authentication.

```typescript
import { UserService } from "@/lib/services";
```

**Methods:**

- `create(data: UserCreateInput): Promise<User>`
  - Creates a new user account
  - Emits `user:beforeCreate` and `user:afterCreate` events

- `getById(id: string): Promise<User | null>`
  - Retrieves a user by ID

- `getByEmail(email: string): Promise<User | null>`
  - Retrieves a user by email

- `getAll({ role, status }): Promise<User[]>`
  - Retrieves all users with optional filtering

- `update(id: string, data: UserUpdateInput): Promise<User>`
  - Updates a user account
  - Emits `user:beforeUpdate` and `user:afterUpdate` events

- `delete(id: string): Promise<User>`
  - Deletes a user account
  - Emits `user:beforeDelete` and `user:afterDelete` events

- `updateLastLogin(id: string): Promise<User>`
  - Updates a user's last login time

### PluginService

Manages plugins and user-plugin relationships.

```typescript
import { PluginService } from "@/lib/services";
```

**Methods:**

- `create(data: PluginCreateInput): Promise<Plugin>`
  - Creates a new plugin in the marketplace
  - Emits `plugin:beforeCreate` and `plugin:afterCreate` events

- `getById(id: string): Promise<Plugin | null>`
  - Retrieves a plugin by ID

- `getBySlug(slug: string): Promise<Plugin | null>`
  - Retrieves a plugin by slug

- `getAll({ category, isPublished }): Promise<Plugin[]>`
  - Retrieves all plugins with optional filtering

- `update(id: string, data: PluginUpdateInput): Promise<Plugin>`
  - Updates a plugin
  - Emits `plugin:beforeUpdate` and `plugin:afterUpdate` events

- `delete(id: string): Promise<Plugin>`
  - Deletes a plugin
  - Emits `plugin:beforeDelete` and `plugin:afterDelete` events

- `incrementDownloads(id: string): Promise<Plugin>`
  - Increments the download count for a plugin

- `installForUser(data: UserPluginCreateInput): Promise<UserPlugin>`
  - Installs a plugin for a user
  - Emits `plugin:beforeInstall` and `plugin:afterInstall` events

- `uninstallForUser(userId: string, pluginId: string): Promise<UserPlugin>`
  - Uninstalls a plugin for a user
  - Emits `plugin:beforeUninstall` and `plugin:afterUninstall` events

- `updateUserPlugin(userId: string, pluginId: string, data: UserPluginUpdateInput): Promise<UserPlugin>`
  - Updates a user's plugin settings
  - Emits activation/deactivation events as needed

- `getUserPlugins(userId: string): Promise<UserPlugin[]>`
  - Retrieves all plugins installed by a user

- `getActiveUserPlugins(userId: string): Promise<UserPlugin[]>`
  - Retrieves all active plugins for a user

### MediaService

Manages media files such as images, videos, documents, etc.

```typescript
import { MediaService } from "@/lib/services";
```

**Methods:**

- `create(data: MediaCreateInput): Promise<Media>`
  - Creates a new media item
  - Emits `media:beforeUpload` and `media:afterUpload` events

- `getById(id: string): Promise<Media | null>`
  - Retrieves a media item by ID

- `getAll({ type, uploadedBy }): Promise<Media[]>`
  - Retrieves all media items with optional filtering

- `update(id: string, data: MediaUpdateInput): Promise<Media>`
  - Updates a media item

- `delete(id: string): Promise<Media>`
  - Deletes a media item
  - Emits `media:beforeDelete` and `media:afterDelete` events

- `search(query: string): Promise<Media[]>`
  - Searches for media items by name or tags

### SettingsService

Manages user and system settings.

```typescript
import { SettingsService } from "@/lib/services";
```

**Methods:**

- `getSystemSetting(key: string): Promise<string | null>`
  - Retrieves a system setting by key

- `setSystemSetting(key: string, value: string): Promise<SystemSetting>`
  - Sets a system setting

- `getAllSystemSettings(): Promise<SystemSetting[]>`
  - Retrieves all system settings

- `getUserSetting(userId: string, key: string): Promise<string | null>`
  - Retrieves a user setting

- `setUserSetting(userId: string, key: string, value: string): Promise<UserSetting>`
  - Sets a user setting

- `getAllUserSettings(userId: string): Promise<UserSetting[]>`
  - Retrieves all settings for a user

- `deleteUserSetting(userId: string, key: string): Promise<UserSetting>`
  - Deletes a user setting

- `deleteSystemSetting(key: string): Promise<SystemSetting>`
  - Deletes a system setting

## Usage Examples

### Creating a New Content Item

```typescript
import { ContentService } from "@/lib/services";

async function createNewPage(userId: string) {
  try {
    const newContent = await ContentService.create({
      title: "Welcome to Our Website",
      slug: "welcome",
      type: "page",
      status: "published",
      content: "<h1>Welcome</h1><p>This is our website.</p>",
      authorId: userId,
    });
    
    console.log("Created new content:", newContent);
    return newContent;
  } catch (error) {
    console.error("Failed to create content:", error);
    throw error;
  }
}
```

### Installing a Plugin for a User

```typescript
import { PluginService } from "@/lib/services";

async function installPluginForUser(userId: string, pluginId: string) {
  try {
    const userPlugin = await PluginService.installForUser({
      userId,
      pluginId,
      isActive: true,
      config: JSON.stringify({ enableFeatureX: true }),
    });
    
    console.log("Installed plugin:", userPlugin);
    return userPlugin;
  } catch (error) {
    console.error("Failed to install plugin:", error);
    throw error;
  }
}
```

### Uploading a Media File

```typescript
import { MediaService } from "@/lib/services";

async function uploadImage(userId: string, fileData: {
  name: string;
  url: string;
  size: number;
  dimensions: string;
}) {
  try {
    const media = await MediaService.create({
      name: fileData.name,
      type: "image",
      url: fileData.url,
      size: fileData.size,
      dimensions: fileData.dimensions,
      uploadedBy: userId,
      tags: "hero,banner",
    });
    
    console.log("Uploaded media:", media);
    return media;
  } catch (error) {
    console.error("Failed to upload media:", error);
    throw error;
  }
}
```

### Managing System Settings

```typescript
import { SettingsService } from "@/lib/services";

async function updateSiteSettings(siteName: string, siteDescription: string) {
  try {
    await SettingsService.setSystemSetting("site.name", siteName);
    await SettingsService.setSystemSetting("site.description", siteDescription);
    
    console.log("Updated site settings");
  } catch (error) {
    console.error("Failed to update site settings:", error);
    throw error;
  }
}
```

## Error Handling

All services include error handling for common scenarios:

- Not found errors when trying to update or delete non-existent records
- Validation errors for required fields
- Unique constraint violations

It's recommended to wrap service calls in try/catch blocks to handle these errors gracefully in your application.

## Event Integration

Many service methods emit events that plugins can hook into. For example:

- `ContentService.create()` emits `content:beforeCreate` and `content:afterCreate`
- `PluginService.installForUser()` emits `plugin:beforeInstall` and `plugin:afterInstall`

This allows plugins to extend the functionality of the CMS without modifying the core code.

## Transaction Support

For operations that require multiple database changes, you can use Prisma's transaction support:

```typescript
import { prisma } from "@/lib/db";

async function complexOperation() {
  return prisma.$transaction(async (tx) => {
    // Perform multiple database operations in a transaction
    const user = await tx.user.create({ ... });
    const content = await tx.content.create({ ... });
    return { user, content };
  });
}
```

## Next Steps

- Extend the services with additional methods as needed
- Add more sophisticated filtering and pagination options
- Implement caching for frequently accessed data
- Add more event hooks for plugin integration
