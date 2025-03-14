import { prisma } from "../db";
import type { Plugin, PluginStatus } from "../plugin-system/plugin-types";

export interface StoredPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  isActive: boolean;
  installedAt: Date;
  updatedAt: Date;
  config: Record<string, any>;
}

export class PluginDB {
  /**
   * Get all installed plugins
   */
  static async getAllPlugins(): Promise<StoredPlugin[]> {
    try {
      const plugins = await prisma.plugin.findMany();
      return plugins.map((plugin) => ({
        id: plugin.id,
        name: plugin.name,
        description: plugin.description || "",
        version: plugin.version,
        author: plugin.author,
        category: plugin.category || "Other",
        isActive: plugin.isActive,
        installedAt: plugin.installedAt,
        updatedAt: plugin.updatedAt,
        config: plugin.config ? JSON.parse(plugin.config) : {},
      }));
    } catch (error) {
      console.error("Failed to get plugins from database:", error);
      return [];
    }
  }

  /**
   * Get a plugin by ID
   */
  static async getPluginById(id: string): Promise<StoredPlugin | null> {
    try {
      const plugin = await prisma.plugin.findUnique({
        where: { id },
      });

      if (!plugin) return null;

      return {
        id: plugin.id,
        name: plugin.name,
        description: plugin.description || "",
        version: plugin.version,
        author: plugin.author,
        category: plugin.category || "Other",
        isActive: plugin.isActive,
        installedAt: plugin.installedAt,
        updatedAt: plugin.updatedAt,
        config: plugin.config ? JSON.parse(plugin.config) : {},
      };
    } catch (error) {
      console.error(`Failed to get plugin ${id} from database:`, error);
      return null;
    }
  }

  /**
   * Save a plugin to the database
   */
  static async savePlugin(plugin: {
    id: string;
    name: string;
    description?: string;
    version: string;
    author: string;
    category?: string;
    isActive?: boolean;
    config?: Record<string, any>;
  }): Promise<StoredPlugin | null> {
    try {
      const now = new Date();
      const existingPlugin = await prisma.plugin.findUnique({
        where: { id: plugin.id },
      });

      if (existingPlugin) {
        // Update existing plugin
        const updatedPlugin = await prisma.plugin.update({
          where: { id: plugin.id },
          data: {
            name: plugin.name,
            description: plugin.description,
            version: plugin.version,
            author: plugin.author,
            category: plugin.category,
            isActive:
              plugin.isActive !== undefined
                ? plugin.isActive
                : existingPlugin.isActive,
            updatedAt: now,
            config: plugin.config
              ? JSON.stringify(plugin.config)
              : existingPlugin.config,
          },
        });

        return {
          id: updatedPlugin.id,
          name: updatedPlugin.name,
          description: updatedPlugin.description || "",
          version: updatedPlugin.version,
          author: updatedPlugin.author,
          category: updatedPlugin.category || "Other",
          isActive: updatedPlugin.isActive,
          installedAt: updatedPlugin.installedAt,
          updatedAt: updatedPlugin.updatedAt,
          config: updatedPlugin.config ? JSON.parse(updatedPlugin.config) : {},
        };
      } else {
        // Create new plugin
        const newPlugin = await prisma.plugin.create({
          data: {
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            version: plugin.version,
            author: plugin.author,
            category: plugin.category,
            isActive: plugin.isActive || false,
            installedAt: now,
            updatedAt: now,
            config: plugin.config ? JSON.stringify(plugin.config) : "{}",
          },
        });

        return {
          id: newPlugin.id,
          name: newPlugin.name,
          description: newPlugin.description || "",
          version: newPlugin.version,
          author: newPlugin.author,
          category: newPlugin.category || "Other",
          isActive: newPlugin.isActive,
          installedAt: newPlugin.installedAt,
          updatedAt: newPlugin.updatedAt,
          config: newPlugin.config ? JSON.parse(newPlugin.config) : {},
        };
      }
    } catch (error) {
      console.error(`Failed to save plugin ${plugin.id} to database:`, error);
      return null;
    }
  }

  /**
   * Update plugin status (active/inactive)
   */
  static async updatePluginStatus(
    id: string,
    isActive: boolean,
  ): Promise<boolean> {
    try {
      await prisma.plugin.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error(`Failed to update status for plugin ${id}:`, error);
      return false;
    }
  }

  /**
   * Update plugin configuration
   */
  static async updatePluginConfig(
    id: string,
    config: Record<string, any>,
  ): Promise<boolean> {
    try {
      const plugin = await prisma.plugin.findUnique({
        where: { id },
      });

      if (!plugin) return false;

      // Merge with existing config
      const existingConfig = plugin.config ? JSON.parse(plugin.config) : {};
      const newConfig = { ...existingConfig, ...config };

      await prisma.plugin.update({
        where: { id },
        data: {
          config: JSON.stringify(newConfig),
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error(`Failed to update config for plugin ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete a plugin from the database
   */
  static async deletePlugin(id: string): Promise<boolean> {
    try {
      await prisma.plugin.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete plugin ${id} from database:`, error);
      return false;
    }
  }
}
