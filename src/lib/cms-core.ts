import events from "./events";
import pluginLoader from "./plugin-loader";
import type { PluginConfig } from "./plugin-api";

/**
 * CMS Core class that initializes the CMS and manages its lifecycle
 */
class CMSCore {
  private initialized = false;

  /**
   * Initialize the CMS
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn("CMS is already initialized");
      return;
    }

    try {
      // Emit before init event
      events.emit("cms:beforeInit");

      console.log("Initializing CMS...");

      // Load core plugins
      await this.loadCorePlugins();

      // Mark as initialized
      this.initialized = true;

      // Emit after init event
      events.emit("cms:afterInit");

      console.log("CMS initialized successfully");
    } catch (error) {
      console.error("Failed to initialize CMS:", error);
      throw error;
    }
  }

  /**
   * Load core plugins that are essential for the CMS
   */
  private async loadCorePlugins(): Promise<void> {
    // In a real implementation, you would load core plugins from a configuration
    // For now, we'll just log a message
    console.log("Loading core plugins...");
  }

  /**
   * Install a plugin
   * @param pluginConfig The plugin configuration
   */
  async installPlugin(pluginConfig: PluginConfig): Promise<void> {
    await pluginLoader.loadPlugin(pluginConfig);
  }

  /**
   * Uninstall a plugin
   * @param pluginId The ID of the plugin to uninstall
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    await pluginLoader.unloadPlugin(pluginId);
  }

  /**
   * Check if the CMS is initialized
   * @returns True if the CMS is initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Create a singleton instance
const cmsCore = new CMSCore();

export default cmsCore;
