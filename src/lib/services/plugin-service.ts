import { prisma } from "../db";
import events from "../events";
import type { Plugin, UserPlugin } from "@prisma/client";

export interface PluginCreateInput {
  name: string;
  slug: string;
  description?: string;
  version: string;
  author: string;
  category?: string;
  tags?: string;
  price?: string;
  isPublished?: boolean;
}

export interface PluginUpdateInput {
  name?: string;
  slug?: string;
  description?: string;
  version?: string;
  author?: string;
  category?: string;
  tags?: string;
  price?: string;
  downloads?: number;
  rating?: number;
  isPublished?: boolean;
}

export interface UserPluginCreateInput {
  userId: string;
  pluginId: string;
  isActive?: boolean;
  config?: string;
}

export interface UserPluginUpdateInput {
  isActive?: boolean;
  config?: string;
}

export class PluginService {
  /**
   * Create a new plugin
   */
  static async create(data: PluginCreateInput): Promise<Plugin> {
    // Emit before create event
    events.emit("plugin:beforeCreate", data);

    const plugin = await prisma.plugin.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        version: data.version,
        author: data.author,
        category: data.category,
        tags: data.tags,
        price: data.price || "Free",
        isPublished: data.isPublished || false,
      },
    });

    // Emit after create event
    events.emit("plugin:afterCreate", plugin);

    return plugin;
  }

  /**
   * Get plugin by ID
   */
  static async getById(id: string): Promise<Plugin | null> {
    return prisma.plugin.findUnique({
      where: { id },
    });
  }

  /**
   * Get plugin by slug
   */
  static async getBySlug(slug: string): Promise<Plugin | null> {
    return prisma.plugin.findUnique({
      where: { slug },
    });
  }

  /**
   * Get all plugins with optional filtering
   */
  static async getAll({
    category,
    isPublished,
  }: {
    category?: string;
    isPublished?: boolean;
  } = {}): Promise<Plugin[]> {
    return prisma.plugin.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
      orderBy: {
        downloads: "desc",
      },
    });
  }

  /**
   * Update plugin
   */
  static async update(id: string, data: PluginUpdateInput): Promise<Plugin> {
    const existingPlugin = await prisma.plugin.findUnique({
      where: { id },
    });

    if (!existingPlugin) {
      throw new Error(`Plugin with ID ${id} not found`);
    }

    // Emit before update event
    events.emit("plugin:beforeUpdate", existingPlugin, data);

    const updatedPlugin = await prisma.plugin.update({
      where: { id },
      data,
    });

    // Emit after update event
    events.emit("plugin:afterUpdate", updatedPlugin);

    return updatedPlugin;
  }

  /**
   * Delete plugin
   */
  static async delete(id: string): Promise<Plugin> {
    const existingPlugin = await prisma.plugin.findUnique({
      where: { id },
    });

    if (!existingPlugin) {
      throw new Error(`Plugin with ID ${id} not found`);
    }

    // Emit before delete event
    events.emit("plugin:beforeDelete", id);

    const deletedPlugin = await prisma.plugin.delete({
      where: { id },
    });

    // Emit after delete event
    events.emit("plugin:afterDelete", id);

    return deletedPlugin;
  }

  /**
   * Increment plugin downloads
   */
  static async incrementDownloads(id: string): Promise<Plugin> {
    return prisma.plugin.update({
      where: { id },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Install plugin for user
   */
  static async installForUser(
    data: UserPluginCreateInput,
  ): Promise<UserPlugin> {
    // Emit before install event
    events.emit("plugin:beforeInstall", {
      userId: data.userId,
      pluginId: data.pluginId,
    });

    // Check if plugin is already installed for user
    const existingUserPlugin = await prisma.userPlugin.findUnique({
      where: {
        userId_pluginId: {
          userId: data.userId,
          pluginId: data.pluginId,
        },
      },
    });

    if (existingUserPlugin) {
      throw new Error(`Plugin is already installed for this user`);
    }

    // Install plugin for user
    const userPlugin = await prisma.userPlugin.create({
      data: {
        userId: data.userId,
        pluginId: data.pluginId,
        isActive: data.isActive || false,
        config: data.config,
      },
    });

    // Increment plugin downloads
    await this.incrementDownloads(data.pluginId);

    // Emit after install event
    events.emit("plugin:afterInstall", userPlugin);

    return userPlugin;
  }

  /**
   * Uninstall plugin for user
   */
  static async uninstallForUser(
    userId: string,
    pluginId: string,
  ): Promise<UserPlugin> {
    const existingUserPlugin = await prisma.userPlugin.findUnique({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
    });

    if (!existingUserPlugin) {
      throw new Error(`Plugin is not installed for this user`);
    }

    // Emit before uninstall event
    events.emit("plugin:beforeUninstall", { userId, pluginId });

    const deletedUserPlugin = await prisma.userPlugin.delete({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
    });

    // Emit after uninstall event
    events.emit("plugin:afterUninstall", { userId, pluginId });

    return deletedUserPlugin;
  }

  /**
   * Update user plugin
   */
  static async updateUserPlugin(
    userId: string,
    pluginId: string,
    data: UserPluginUpdateInput,
  ): Promise<UserPlugin> {
    const existingUserPlugin = await prisma.userPlugin.findUnique({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
    });

    if (!existingUserPlugin) {
      throw new Error(`Plugin is not installed for this user`);
    }

    // If activating plugin
    if (data.isActive && !existingUserPlugin.isActive) {
      // Emit before activate event
      events.emit("plugin:beforeActivate", { userId, pluginId });
    }

    // If deactivating plugin
    if (data.isActive === false && existingUserPlugin.isActive) {
      // Emit before deactivate event
      events.emit("plugin:beforeDeactivate", { userId, pluginId });
    }

    const updatedUserPlugin = await prisma.userPlugin.update({
      where: {
        userId_pluginId: {
          userId,
          pluginId,
        },
      },
      data,
    });

    // If plugin was activated
    if (data.isActive && !existingUserPlugin.isActive) {
      // Emit after activate event
      events.emit("plugin:afterActivate", updatedUserPlugin);
    }

    // If plugin was deactivated
    if (data.isActive === false && existingUserPlugin.isActive) {
      // Emit after deactivate event
      events.emit("plugin:afterDeactivate", { userId, pluginId });
    }

    return updatedUserPlugin;
  }

  /**
   * Get all plugins installed for a user
   */
  static async getUserPlugins(userId: string): Promise<UserPlugin[]> {
    return prisma.userPlugin.findMany({
      where: {
        userId,
      },
      include: {
        plugin: true,
      },
    });
  }

  /**
   * Get active plugins for a user
   */
  static async getActiveUserPlugins(userId: string): Promise<UserPlugin[]> {
    return prisma.userPlugin.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        plugin: true,
      },
    });
  }
}
