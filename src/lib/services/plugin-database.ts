import prisma from "./database";
import { Plugin } from "@prisma/client";

export interface PluginData {
  id: string;
  name: string;
  description?: string;
  version: string;
  author: string;
  category?: string;
  isActive?: boolean;
  config?: Record<string, any>;
}

export class PluginDatabase {
  /**
   * Get all installed plugins
   */
  static async getAllPlugins(): Promise<Plugin[]> {
    try {
      return await prisma.plugin.findMany();
    } catch (error) {
      console.error("Failed to get plugins from database:", error);
      return [];
    }
  }

  /**
   * Get a plugin by ID
   */
  static async getPluginById(id: string): Promise<Plugin | null> {
    try {
      return await prisma.plugin.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error(`Failed to get plugin ${id} from database:`, error);
      return null;
    }
  }

  /**
   * Save a plugin to the database
   */
  static async savePlugin(plugin: PluginData): Promise<Plugin | null> {
    try {
      // Check if plugin already exists
      const existingPlugin = await prisma.plugin.findUnique({
        where: { id: plugin.id },
      });

      if (existingPlugin) {
        // Update existing plugin
        return await prisma.plugin.update({
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
            config: plugin.config
              ? JSON.stringify(plugin.config)
              : existingPlugin.config,
          },
        });
      } else {
        // Create new plugin
        return await prisma.plugin.create({
          data: {
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            version: plugin.version,
            author: plugin.author,
            category: plugin.category,
            isActive: plugin.isActive || false,
            config: plugin.config ? JSON.stringify(plugin.config) : null,
          },
        });
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
        data: { isActive },
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

      // Merge with existing config if it exists
      let newConfig = config;
      if (plugin.config) {
        try {
          const existingConfig = JSON.parse(plugin.config);
          newConfig = { ...existingConfig, ...config };
        } catch (e) {
          console.error("Error parsing existing config:", e);
        }
      }

      await prisma.plugin.update({
        where: { id },
        data: {
          config: JSON.stringify(newConfig),
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
