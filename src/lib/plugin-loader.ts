import events from "./events";
import pluginRegistry, { PluginConfig } from "./plugin-api";

/**
 * Plugin loader responsible for loading and initializing plugins
 */
class PluginLoader {
  private loadedPlugins: Map<string, boolean> = new Map();

  /**
   * Load and initialize a plugin
   * @param pluginConfig The plugin configuration
   */
  async loadPlugin(pluginConfig: PluginConfig): Promise<void> {
    if (this.loadedPlugins.has(pluginConfig.id)) {
      console.warn(`Plugin ${pluginConfig.id} is already loaded`);
      return;
    }

    try {
      // Emit before install event
      events.emit("plugin:beforeInstall", pluginConfig.id);

      // Check dependencies
      if (pluginConfig.dependencies && pluginConfig.dependencies.length > 0) {
        for (const dependency of pluginConfig.dependencies) {
          if (!this.loadedPlugins.has(dependency)) {
            throw new Error(
              `Plugin ${pluginConfig.id} depends on ${dependency}, but it's not loaded`,
            );
          }
        }
      }

      // Create plugin API instance for this plugin
      const api = pluginRegistry.createPluginAPI(pluginConfig.id);

      // Register the plugin
      api.registerPlugin(pluginConfig);

      // Initialize the plugin if it has an initialize function
      if (pluginConfig.initialize) {
        await pluginConfig.initialize(api);
      }

      // Mark plugin as loaded
      this.loadedPlugins.set(pluginConfig.id, true);

      // Emit after install event
      events.emit("plugin:afterInstall", pluginConfig);

      console.log(`Plugin ${pluginConfig.id} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load plugin ${pluginConfig.id}:`, error);
      throw error;
    }
  }

  /**
   * Unload a plugin
   * @param pluginId The ID of the plugin to unload
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    if (!this.loadedPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} is not loaded`);
      return;
    }

    try {
      // Emit before uninstall event
      events.emit("plugin:beforeUninstall", pluginId);

      // Check if other plugins depend on this one
      const plugins = pluginRegistry.getPlugins();
      const dependentPlugins = plugins.filter((p) =>
        p.dependencies?.includes(pluginId),
      );

      if (dependentPlugins.length > 0) {
        const dependentIds = dependentPlugins.map((p) => p.id).join(", ");
        throw new Error(
          `Cannot unload plugin ${pluginId} because it's required by: ${dependentIds}`,
        );
      }

      // Remove plugin from loaded plugins
      this.loadedPlugins.delete(pluginId);

      // Emit after uninstall event
      events.emit("plugin:afterUninstall", pluginId);

      console.log(`Plugin ${pluginId} unloaded successfully`);
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a plugin is loaded
   * @param pluginId The ID of the plugin to check
   * @returns True if the plugin is loaded, false otherwise
   */
  isPluginLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }

  /**
   * Get all loaded plugin IDs
   * @returns An array of loaded plugin IDs
   */
  getLoadedPluginIds(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }
}

// Create a singleton instance
const pluginLoader = new PluginLoader();

export default pluginLoader;
