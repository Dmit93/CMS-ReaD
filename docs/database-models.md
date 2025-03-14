# Database Models Documentation

## Overview

This document provides detailed information about the database models used in the CMS platform. These models are defined using Prisma ORM and represent the core data structures of the application.

## Models

### User

Represents user accounts in the system.

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  password      String
  role          String    @default("user") // admin, editor, author, contributor, viewer
  status        String    @default("pending") // active, inactive, pending
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userPlugins   UserPlugin[]
  userSettings  UserSetting[]
  contents      Content[]
}
```

**Fields:**
- `id`: Unique identifier for the user
- `email`: User's email address (unique)
- `name`: User's display name (optional)
- `password`: Hashed password for authentication
- `role`: User's role in the system (admin, editor, author, contributor, viewer)
- `status`: Account status (active, inactive, pending)
- `lastLogin`: Timestamp of the user's last login
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated
- `userPlugins`: Relation to installed plugins for this user
- `userSettings`: Relation to user-specific settings
- `contents`: Relation to content items created by this user

### Content

Represents content items such as pages, blog posts, forms, etc.

```prisma
model Content {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  type        String   // page, post, form, etc.
  status      String   @default("draft") // published, draft, scheduled, archived
  content     String?  @db.Text
  metadata    String?  @db.Text // JSON string for SEO and other metadata
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier for the content item
- `title`: Content title
- `slug`: URL-friendly identifier (unique)
- `type`: Content type (page, post, form, etc.)
- `status`: Publication status (published, draft, scheduled, archived)
- `content`: The actual content (stored as text)
- `metadata`: Additional metadata as a JSON string (SEO, etc.)
- `author`: Relation to the user who created the content
- `authorId`: Foreign key to the user table
- `createdAt`: Timestamp when the content was created
- `updatedAt`: Timestamp when the content was last updated

### Media

Represents media files such as images, videos, documents, etc.

```prisma
model Media {
  id          String   @id @default(uuid())
  name        String
  type        String   // image, video, document, audio, archive
  url         String
  size        Int
  dimensions  String?  // JSON string for width x height
  uploadedBy  String
  tags        String?  // Comma-separated tags
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier for the media item
- `name`: File name
- `type`: Media type (image, video, document, audio, archive)
- `url`: URL to access the media file
- `size`: File size in bytes
- `dimensions`: Image dimensions as a JSON string (width x height)
- `uploadedBy`: ID of the user who uploaded the file
- `tags`: Comma-separated list of tags
- `createdAt`: Timestamp when the media was uploaded
- `updatedAt`: Timestamp when the media was last updated

### Plugin

Represents plugins available in the marketplace.

```prisma
model Plugin {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  version     String
  author      String
  category    String?
  tags        String?  // Comma-separated tags
  price       String   @default("Free")
  downloads   Int      @default(0)
  rating      Float    @default(0)
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userPlugins UserPlugin[]
}
```

**Fields:**
- `id`: Unique identifier for the plugin
- `name`: Plugin name
- `slug`: URL-friendly identifier (unique)
- `description`: Plugin description
- `version`: Plugin version
- `author`: Plugin author
- `category`: Plugin category
- `tags`: Comma-separated list of tags
- `price`: Plugin price ("Free" or a price value)
- `downloads`: Number of downloads
- `rating`: Average rating (0-5)
- `isPublished`: Whether the plugin is published in the marketplace
- `createdAt`: Timestamp when the plugin was created
- `updatedAt`: Timestamp when the plugin was last updated
- `userPlugins`: Relation to users who have installed this plugin

### UserPlugin

Represents plugins installed by users.

```prisma
model UserPlugin {
  id          String   @id @default(uuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  plugin      Plugin   @relation(fields: [pluginId], references: [id])
  pluginId    String
  isActive    Boolean  @default(false)
  config      String?  @db.Text // JSON string for plugin configuration
  installedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, pluginId])
}
```

**Fields:**
- `id`: Unique identifier for the user-plugin relationship
- `user`: Relation to the user
- `userId`: Foreign key to the user table
- `plugin`: Relation to the plugin
- `pluginId`: Foreign key to the plugin table
- `isActive`: Whether the plugin is active for this user
- `config`: Plugin configuration as a JSON string
- `installedAt`: Timestamp when the plugin was installed
- `updatedAt`: Timestamp when the plugin was last updated
- `@@unique([userId, pluginId])`: Ensures a user can't install the same plugin twice

### UserSetting

Represents user-specific settings.

```prisma
model UserSetting {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  key       String
  value     String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, key])
}
```

**Fields:**
- `id`: Unique identifier for the setting
- `user`: Relation to the user
- `userId`: Foreign key to the user table
- `key`: Setting key
- `value`: Setting value
- `createdAt`: Timestamp when the setting was created
- `updatedAt`: Timestamp when the setting was last updated
- `@@unique([userId, key])`: Ensures a user can't have duplicate settings

### SystemSetting

Represents global system settings.

```prisma
model SystemSetting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier for the setting
- `key`: Setting key (unique)
- `value`: Setting value
- `createdAt`: Timestamp when the setting was created
- `updatedAt`: Timestamp when the setting was last updated

## Relationships

### One-to-Many Relationships

- A `User` can create many `Content` items
- A `User` can have many `UserSetting` entries
- A `User` can install many `Plugin`s (through `UserPlugin`)
- A `Plugin` can be installed by many `User`s (through `UserPlugin`)

### Many-to-Many Relationships

- `User` and `Plugin` have a many-to-many relationship through the `UserPlugin` join table

## Database Indexes and Constraints

- `User.email` is unique
- `Content.slug` is unique
- `Plugin.slug` is unique
- `UserPlugin` has a unique constraint on `[userId, pluginId]`
- `UserSetting` has a unique constraint on `[userId, key]`
- `SystemSetting.key` is unique

## Data Types

- Text fields that may contain large amounts of data use `@db.Text`
- JSON data is stored as strings and parsed/stringified in the application code
- Dates are stored as `DateTime` and handled by Prisma

## Service Layer

The database models are accessed through service classes that provide a clean API for interacting with the data:

- `ContentService`: Manages content items
- `UserService`: Manages user accounts
- `PluginService`: Manages plugins and user-plugin relationships
- `MediaService`: Manages media files
- `SettingsService`: Manages user and system settings

These services handle database operations and emit events for the event system to enable plugin hooks.
