import events from "./events";

/**
 * Plugin API interface that plugins can use to interact with the CMS
 */
interface PluginAPI {
  // Event system methods
  events: {
    on: typeof events.on;
    once: typeof events.once;
    off: typeof events.off;
    emit: typeof events.emit;
  };

  // Plugin registration and metadata
  registerPlugin: (pluginConfig: PluginConfig) => void;
  getPluginConfig: (pluginId: string) => PluginConfig | undefined;

  // Extension points
  registerContentType: (contentType: ContentTypeDefinition) => void;
  registerMenuItem: (menuItem: MenuItem) => void;
  registerSettingsPanel: (panel: SettingsPanel) => void;
  registerEditorExtension: (extension: EditorExtension) => void;
}

// Plugin configuration interface
export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  dependencies?: string[];
  initialize?: (api: PluginAPI) => void | Promise<void>;
}

// Content type definition interface
export interface ContentTypeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: ContentField[];
  pluginId: string;
}

// Content field interface
export interface ContentField {
  id: string;
  name: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "date"
    | "select"
    | "media"
    | "relation"
    | string;
  required?: boolean;
  defaultValue?: any;
  options?: Record<string, any>;
}

// Menu item interface
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  parent?: string;
  order?: number;
  pluginId: string;
}

// Settings panel interface
export interface SettingsPanel {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  order?: number;
  pluginId: string;
}

// Editor extension interface
export interface EditorExtension {
  id: string;
  type: "toolbar" | "sidebar" | "block" | string;
  component: React.ComponentType<any>;
  pluginId: string;
}

// Plugin registry to store registered plugins
class PluginRegistry {
  private plugins: Map<string, PluginConfig> = new Map();
  private contentTypes: Map<string, ContentTypeDefinition> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private settingsPanels: Map<string, SettingsPanel> = new Map();
  private editorExtensions: Map<string, EditorExtension> = new Map();

  // Create plugin API instance for a specific plugin
  createPluginAPI(pluginId: string): PluginAPI {
    return {
      events: {
        on: events.on.bind(events),
        once: events.once.bind(events),
        off: events.off.bind(events),
        emit: events.emit.bind(events),
      },

      registerPlugin: (config: PluginConfig) => {
        if (config.id !== pluginId) {
          throw new Error(`Plugin ID mismatch: ${config.id} vs ${pluginId}`);
        }
        this.plugins.set(config.id, config);
      },

      getPluginConfig: (id: string) => {
        return this.plugins.get(id);
      },

      registerContentType: (contentType: ContentTypeDefinition) => {
        contentType.pluginId = pluginId;
        this.contentTypes.set(contentType.id, contentType);
        events.emit("plugin:contentTypeRegistered", contentType);
      },

      registerMenuItem: (menuItem: MenuItem) => {
        menuItem.pluginId = pluginId;
        this.menuItems.set(menuItem.id, menuItem);
        events.emit("plugin:menuItemRegistered", menuItem);
      },

      registerSettingsPanel: (panel: SettingsPanel) => {
        panel.pluginId = pluginId;
        this.settingsPanels.set(panel.id, panel);
        events.emit("plugin:settingsPanelRegistered", panel);
      },

      registerEditorExtension: (extension: EditorExtension) => {
        extension.pluginId = pluginId;
        this.editorExtensions.set(extension.id, extension);
        events.emit("plugin:editorExtensionRegistered", extension);
      },
    };
  }

  // Get all registered plugins
  getPlugins(): PluginConfig[] {
    return Array.from(this.plugins.values());
  }

  // Get all registered content types
  getContentTypes(): ContentTypeDefinition[] {
    return Array.from(this.contentTypes.values());
  }

  // Get all registered menu items
  getMenuItems(): MenuItem[] {
    return Array.from(this.menuItems.values());
  }

  // Get all registered settings panels
  getSettingsPanels(): SettingsPanel[] {
    return Array.from(this.settingsPanels.values());
  }

  // Get all registered editor extensions
  getEditorExtensions(): EditorExtension[] {
    return Array.from(this.editorExtensions.values());
  }
}

// Create a singleton instance
const pluginRegistry = new PluginRegistry();

export default pluginRegistry;
