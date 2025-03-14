import { EventSystem } from "../events";

// Plugin metadata interface
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string; // Lucide icon name
  dependencies?: string[];
}

// Plugin API interface that plugins can use to interact with the CMS
export interface PluginAPI {
  // Event system methods
  events: EventSystem;

  // Register a menu item in the sidebar
  registerMenuItem: (menuItem: MenuItem) => void;

  // Register a settings panel in the admin area
  registerSettingsPanel: (panel: SettingsPanel) => void;

  // Register a content editor extension
  registerEditorExtension: (extension: EditorExtension) => void;

  // Register a custom route in the frontend
  registerRoute: (route: CustomRoute) => void;

  // Get plugin storage directory
  getStorageDir: () => string;

  // Get plugin configuration
  getConfig: () => Record<string, any>;

  // Save plugin configuration
  saveConfig: (config: Record<string, any>) => Promise<void>;
}

// Plugin instance interface
export interface Plugin {
  metadata: PluginMetadata;
  initialize: (api: PluginAPI) => void | Promise<void> | (() => void);
  cleanup?: () => void | Promise<void>;
}

// Menu item interface
export interface MenuItem {
  id: string;
  pluginId: string;
  title: string;
  icon?: string; // Lucide icon name
  path: string;
  order?: number;
  parent?: string; // Parent menu ID for nested menus
}

// Settings panel interface
export interface SettingsPanel {
  id: string;
  pluginId: string;
  title: string;
  icon?: string; // Lucide icon name
  component: React.ComponentType<any>;
  order?: number;
}

// Editor extension interface
export interface EditorExtension {
  id: string;
  pluginId: string;
  type: "toolbar" | "sidebar" | "block";
  component: React.ComponentType<any>;
}

// Custom route interface
export interface CustomRoute {
  id: string;
  pluginId: string;
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

// Plugin installation status
export enum PluginStatus {
  INSTALLED = "installed",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
}

// Plugin installation info
export interface PluginInstallation {
  pluginId: string;
  status: PluginStatus;
  installedAt: Date;
  updatedAt: Date;
  config: Record<string, any>;
  error?: string;
}
