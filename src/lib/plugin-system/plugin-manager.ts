import {
  Plugin,
  PluginAPI,
  PluginStatus,
  PluginInstallation,
  MenuItem,
  SettingsPanel,
  EditorExtension,
  CustomRoute,
} from "./plugin-types";
import { pluginLoader } from "./plugin-loader";
import events from "../events";
import { PluginDB, StoredPlugin } from "../db/plugin-db";

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginInstances: Map<string, PluginAPI> = new Map();
  private pluginStatus: Map<string, PluginInstallation> = new Map();
  private cleanupFunctions: Map<string, () => void> = new Map();

  // Registered items from plugins
  private menuItems: MenuItem[] = [];
  private settingsPanels: SettingsPanel[] = [];
  private editorExtensions: EditorExtension[] = [];
  private customRoutes: CustomRoute[] = [];

  constructor() {
    // Initialize event listeners
    events.on("plugin:afterInstall", this.handlePluginInstalled.bind(this));
    events.on("plugin:afterUninstall", this.handlePluginUninstalled.bind(this));
  }

  /**
   * Initialize the plugin manager
   */
  async initialize(): Promise<void> {
    try {
      // Load plugins from database
      await this.loadPluginsFromDB();

      // Load installed plugins metadata
      const pluginsMetadata = await pluginLoader.getInstalledPluginsMetadata();

      // Load and initialize active plugins
      for (const metadata of pluginsMetadata) {
        const pluginId = metadata.id;
        const status = this.getPluginStatus(pluginId);

        if (status.status === PluginStatus.ACTIVE) {
          await this.activatePlugin(pluginId);
        }
      }

      console.log(`Initialized ${this.plugins.size} plugins`);
    } catch (error) {
      console.error("Failed to initialize plugin manager:", error);
    }
  }

  /**
   * Load plugins from database
   */
  private async loadPluginsFromDB(): Promise<void> {
    try {
      const storedPlugins = await PluginDB.getAllPlugins();

      for (const plugin of storedPlugins) {
        this.pluginStatus.set(plugin.id, {
          pluginId: plugin.id,
          status: plugin.isActive ? PluginStatus.ACTIVE : PluginStatus.INACTIVE,
          installedAt: plugin.installedAt,
          updatedAt: plugin.updatedAt,
          config: plugin.config || {},
        });
      }

      console.log(`Loaded ${storedPlugins.length} plugins from database`);
    } catch (error) {
      console.error("Failed to load plugins from database:", error);
    }
  }

  /**
   * Install a plugin from the marketplace
   */
  async installPlugin(
    pluginId: string,
    pluginData: {
      name: string;
      description: string;
      version: string;
      author: string;
      category: string;
    },
  ): Promise<boolean> {
    try {
      // Check if plugin is already installed
      if (this.pluginStatus.has(pluginId)) {
        console.warn(`Plugin ${pluginId} is already installed`);
        return false;
      }

      // Emit before install event
      events.emit("plugin:beforeInstall", pluginId);

      // Install plugin from marketplace
      const success = await pluginLoader.installFromMarketplace(pluginId);

      if (success) {
        // Create plugin status
        const pluginStatus: PluginInstallation = {
          pluginId,
          status: PluginStatus.INSTALLED,
          installedAt: new Date(),
          updatedAt: new Date(),
          config: {},
        };

        // Update in-memory status
        this.pluginStatus.set(pluginId, pluginStatus);

        // Save to database
        await PluginDB.savePlugin({
          id: pluginId,
          name: pluginData.name,
          description: pluginData.description,
          version: pluginData.version,
          author: pluginData.author,
          category: pluginData.category,
          isActive: false,
          config: {},
        });

        // Emit after install event
        events.emit("plugin:afterInstall", pluginId);

        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<boolean> {
    try {
      // Check if plugin is already active
      const status = this.getPluginStatus(pluginId);
      if (status.status === PluginStatus.ACTIVE) {
        console.warn(`Plugin ${pluginId} is already active`);
        return true;
      }

      // Emit before activate event
      events.emit("plugin:beforeActivate", pluginId);

      // Load plugin
      const plugin = await pluginLoader.loadPlugin(pluginId);

      if (!plugin) {
        throw new Error(`Failed to load plugin ${pluginId}`);
      }

      // Check dependencies
      if (
        plugin.metadata.dependencies &&
        plugin.metadata.dependencies.length > 0
      ) {
        for (const dependency of plugin.metadata.dependencies) {
          const dependencyStatus = this.getPluginStatus(dependency);
          if (dependencyStatus.status !== PluginStatus.ACTIVE) {
            throw new Error(
              `Plugin ${pluginId} depends on ${dependency}, but it's not active`,
            );
          }
        }
      }

      // Create plugin API instance
      const api = this.createPluginAPI(pluginId);

      // Initialize plugin
      const cleanup = await plugin.initialize(api);

      // Store cleanup function if provided
      if (typeof cleanup === "function") {
        this.cleanupFunctions.set(pluginId, cleanup);
      }

      // Store plugin instance
      this.plugins.set(pluginId, plugin);
      this.pluginInstances.set(pluginId, api);

      // Update plugin status
      status.status = PluginStatus.ACTIVE;
      status.updatedAt = new Date();
      this.pluginStatus.set(pluginId, status);

      // Update in database
      await PluginDB.updatePluginStatus(pluginId, true);

      // Emit after activate event
      events.emit("plugin:afterActivate", pluginId);

      return true;
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);

      // Update plugin status to error
      const status = this.getPluginStatus(pluginId);
      status.status = PluginStatus.ERROR;
      status.error = error.message;
      status.updatedAt = new Date();
      this.pluginStatus.set(pluginId, status);

      return false;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginId: string): Promise<boolean> {
    try {
      // Check if plugin is active
      const status = this.getPluginStatus(pluginId);
      if (status.status !== PluginStatus.ACTIVE) {
        console.warn(`Plugin ${pluginId} is not active`);
        return true;
      }

      // Check if other plugins depend on this one
      const dependentPlugins = this.findDependentPlugins(pluginId);
      if (dependentPlugins.length > 0) {
        throw new Error(
          `Cannot deactivate plugin ${pluginId} because it's required by: ${dependentPlugins.join(", ")}`,
        );
      }

      // Emit before deactivate event
      events.emit("plugin:beforeDeactivate", pluginId);

      // Run cleanup function if available
      const cleanup = this.cleanupFunctions.get(pluginId);
      if (cleanup) {
        await cleanup();
        this.cleanupFunctions.delete(pluginId);
      }

      // Run plugin's cleanup method if available
      const plugin = this.plugins.get(pluginId);
      if (plugin && plugin.cleanup) {
        await plugin.cleanup();
      }

      // Remove registered items from this plugin
      this.menuItems = this.menuItems.filter(
        (item) => item.pluginId !== pluginId,
      );
      this.settingsPanels = this.settingsPanels.filter(
        (panel) => panel.pluginId !== pluginId,
      );
      this.editorExtensions = this.editorExtensions.filter(
        (ext) => ext.pluginId !== pluginId,
      );
      this.customRoutes = this.customRoutes.filter(
        (route) => route.pluginId !== pluginId,
      );

      // Remove plugin instances
      this.plugins.delete(pluginId);
      this.pluginInstances.delete(pluginId);

      // Update plugin status
      status.status = PluginStatus.INACTIVE;
      status.updatedAt = new Date();
      this.pluginStatus.set(pluginId, status);

      // Update in database
      await PluginDB.updatePluginStatus(pluginId, false);

      // Emit after deactivate event
      events.emit("plugin:afterDeactivate", pluginId);

      return true;
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string): Promise<boolean> {
    try {
      // Check if plugin is active
      const status = this.getPluginStatus(pluginId);
      if (status.status === PluginStatus.ACTIVE) {
        // Deactivate plugin first
        const deactivated = await this.deactivatePlugin(pluginId);
        if (!deactivated) {
          throw new Error(`Failed to deactivate plugin ${pluginId}`);
        }
      }

      // Emit before uninstall event
      events.emit("plugin:beforeUninstall", pluginId);

      // Uninstall plugin
      const success = await pluginLoader.uninstallPlugin(pluginId);

      if (success) {
        // Remove plugin status
        this.pluginStatus.delete(pluginId);

        // Remove from database
        await PluginDB.deletePlugin(pluginId);

        // Emit after uninstall event
        events.emit("plugin:afterUninstall", pluginId);

        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): PluginInstallation[] {
    return Array.from(this.pluginStatus.values());
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): PluginInstallation[] {
    return Array.from(this.pluginStatus.values()).filter(
      (status) => status.status === PluginStatus.ACTIVE,
    );
  }

  /**
   * Get plugin status
   */
  getPluginStatus(pluginId: string): PluginInstallation {
    if (!this.pluginStatus.has(pluginId)) {
      // Create default status
      this.pluginStatus.set(pluginId, {
        pluginId,
        status: PluginStatus.INSTALLED,
        installedAt: new Date(),
        updatedAt: new Date(),
        config: {},
      });
    }

    return this.pluginStatus.get(pluginId)!;
  }

  /**
   * Update plugin configuration
   */
  async updatePluginConfig(
    pluginId: string,
    config: Record<string, any>,
  ): Promise<boolean> {
    try {
      const status = this.getPluginStatus(pluginId);
      status.config = { ...status.config, ...config };
      status.updatedAt = new Date();
      this.pluginStatus.set(pluginId, status);

      // Update in database
      await PluginDB.updatePluginConfig(pluginId, config);

      return true;
    } catch (error) {
      console.error(`Failed to update plugin config for ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Get registered menu items
   */
  getMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  /**
   * Get registered settings panels
   */
  getSettingsPanels(): SettingsPanel[] {
    return this.settingsPanels;
  }

  /**
   * Get registered editor extensions
   */
  getEditorExtensions(): EditorExtension[] {
    return this.editorExtensions;
  }

  /**
   * Get registered custom routes
   */
  getCustomRoutes(): CustomRoute[] {
    return this.customRoutes;
  }

  /**
   * Find plugins that depend on a specific plugin
   */
  private findDependentPlugins(pluginId: string): string[] {
    const dependentPlugins: string[] = [];

    for (const [id, plugin] of this.plugins.entries()) {
      if (
        plugin.metadata.dependencies &&
        plugin.metadata.dependencies.includes(pluginId)
      ) {
        dependentPlugins.push(id);
      }
    }

    return dependentPlugins;
  }

  /**
   * Create a plugin API instance for a specific plugin
   */
  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      events,

      registerMenuItem: (menuItem: MenuItem) => {
        this.menuItems.push({ ...menuItem, pluginId });
        events.emit("plugin:menuItemRegistered", { ...menuItem, pluginId });
      },

      registerSettingsPanel: (panel: SettingsPanel) => {
        this.settingsPanels.push({ ...panel, pluginId });
        events.emit("plugin:settingsPanelRegistered", { ...panel, pluginId });
      },

      registerEditorExtension: (extension: EditorExtension) => {
        this.editorExtensions.push({ ...extension, pluginId });
        events.emit("plugin:editorExtensionRegistered", {
          ...extension,
          pluginId,
        });
      },

      registerRoute: (route: CustomRoute) => {
        this.customRoutes.push({ ...route, pluginId });
        events.emit("plugin:routeRegistered", { ...route, pluginId });
      },

      getStorageDir: () => {
        return `plugins/${pluginId}/storage`;
      },

      getConfig: () => {
        return this.getPluginStatus(pluginId).config;
      },

      saveConfig: async (config: Record<string, any>) => {
        await this.updatePluginConfig(pluginId, config);
      },
    };
  }

  /**
   * Handle plugin installed event
   */
  private handlePluginInstalled(pluginId: string): void {
    // This method is called when a plugin is installed
    console.log(`Plugin ${pluginId} installed`);
  }

  /**
   * Handle plugin uninstalled event
   */
  private handlePluginUninstalled(pluginId: string): void {
    // This method is called when a plugin is uninstalled
    console.log(`Plugin ${pluginId} uninstalled`);
  }
}

// Create a singleton instance
export const pluginManager = new PluginManager();
