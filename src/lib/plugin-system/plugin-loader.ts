import { Plugin, PluginMetadata } from "./plugin-types";
import events from "../events";
import fs from "fs";
import path from "path";

// In a browser environment, we'll use dynamic imports instead of fs
const isServer = typeof window === "undefined";

export class PluginLoader {
  private pluginsDir: string;

  constructor(pluginsDir: string = "plugins") {
    this.pluginsDir = pluginsDir;

    // Create plugins directory if it doesn't exist (server-side only)
    if (isServer) {
      try {
        if (!fs.existsSync(pluginsDir)) {
          fs.mkdirSync(pluginsDir, { recursive: true });
        }
      } catch (error) {
        console.error("Failed to create plugins directory:", error);
      }
    }
  }

  /**
   * Load a plugin from a directory
   */
  async loadPlugin(pluginId: string): Promise<Plugin | null> {
    try {
      // Emit before load event
      events.emit("plugin:beforeLoad", pluginId);

      let plugin: Plugin | null = null;

      if (isServer) {
        // Server-side loading using fs
        const pluginDir = path.join(this.pluginsDir, pluginId);
        const indexPath = path.join(pluginDir, "index.js");

        if (!fs.existsSync(indexPath)) {
          throw new Error(`Plugin index file not found: ${indexPath}`);
        }

        // Dynamic require (in Node.js environment)
        const pluginModule = require(indexPath);
        plugin = pluginModule.default || pluginModule;
      } else {
        // Browser-side loading using dynamic import
        const pluginModule = await import(`/plugins/${pluginId}/index.js`);
        plugin = pluginModule.default || pluginModule;
      }

      // Validate plugin structure
      if (!plugin || !plugin.metadata || !plugin.initialize) {
        throw new Error(`Invalid plugin structure for ${pluginId}`);
      }

      // Emit after load event
      events.emit("plugin:afterLoad", plugin);

      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
      events.emit("plugin:loadError", { pluginId, error });
      return null;
    }
  }

  /**
   * Install a plugin from the marketplace
   */
  async installFromMarketplace(pluginId: string): Promise<boolean> {
    try {
      // Emit before install event
      events.emit("plugin:beforeInstall", pluginId);

      // In a real implementation, this would download the plugin from a marketplace API
      // For now, we'll simulate the installation process

      if (isServer) {
        const pluginDir = path.join(this.pluginsDir, pluginId);

        // Create plugin directory
        if (!fs.existsSync(pluginDir)) {
          fs.mkdirSync(pluginDir, { recursive: true });
        }

        // In a real implementation, we would download and extract the plugin files here
        // For now, we'll just create a dummy index.js file
        const indexContent = `
          export default {
            metadata: {
              id: "${pluginId}",
              name: "${pluginId}",
              version: "1.0.0",
              description: "A plugin installed from the marketplace",
              author: "Marketplace"
            },
            initialize: (api) => {
              console.log("Plugin ${pluginId} initialized");
            }
          };
        `;

        fs.writeFileSync(path.join(pluginDir, "index.js"), indexContent);
      } else {
        // In browser environment, we would use fetch to download the plugin
        console.log(
          `Installing plugin ${pluginId} from marketplace (simulated)`,
        );
        // This would be implemented with actual API calls in a real application
      }

      // Emit after install event
      events.emit("plugin:afterInstall", pluginId);

      return true;
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      events.emit("plugin:installError", { pluginId, error });
      return false;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string): Promise<boolean> {
    try {
      // Emit before uninstall event
      events.emit("plugin:beforeUninstall", pluginId);

      if (isServer) {
        const pluginDir = path.join(this.pluginsDir, pluginId);

        // Check if plugin directory exists
        if (fs.existsSync(pluginDir)) {
          // In a real implementation, we would recursively delete the directory
          // For simplicity, we'll just remove the index.js file
          const indexPath = path.join(pluginDir, "index.js");
          if (fs.existsSync(indexPath)) {
            fs.unlinkSync(indexPath);
          }

          // Remove the directory
          fs.rmdirSync(pluginDir, { recursive: true });
        }
      } else {
        // In browser environment, we would use an API call to uninstall the plugin
        console.log(`Uninstalling plugin ${pluginId} (simulated)`);
        // This would be implemented with actual API calls in a real application
      }

      // Emit after uninstall event
      events.emit("plugin:afterUninstall", pluginId);

      return true;
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error);
      events.emit("plugin:uninstallError", { pluginId, error });
      return false;
    }
  }

  /**
   * Get metadata for all installed plugins
   */
  async getInstalledPluginsMetadata(): Promise<PluginMetadata[]> {
    const metadata: PluginMetadata[] = [];

    if (isServer) {
      try {
        // Read plugins directory
        const pluginDirs = fs.readdirSync(this.pluginsDir);

        for (const pluginId of pluginDirs) {
          const pluginDir = path.join(this.pluginsDir, pluginId);
          const indexPath = path.join(pluginDir, "index.js");

          if (
            fs.existsSync(indexPath) &&
            fs.statSync(pluginDir).isDirectory()
          ) {
            try {
              // Load plugin metadata
              const pluginModule = require(indexPath);
              const plugin = pluginModule.default || pluginModule;

              if (plugin && plugin.metadata) {
                metadata.push(plugin.metadata);
              }
            } catch (error) {
              console.error(
                `Failed to load metadata for plugin ${pluginId}:`,
                error,
              );
            }
          }
        }
      } catch (error) {
        console.error("Failed to read plugins directory:", error);
      }
    } else {
      // In browser environment, we would use an API call to get installed plugins
      // This would be implemented with actual API calls in a real application
    }

    return metadata;
  }
}

// Create a singleton instance
export const pluginLoader = new PluginLoader();
