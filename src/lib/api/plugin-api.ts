/**
 * API client for interacting with the plugin system backend
 */

// Base URL for API requests
const API_BASE_URL = "/server/api";

// Types
export interface MarketplacePlugin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version: string;
  author: string;
  category?: string;
  tags?: string;
  price?: string;
  downloads?: number;
  rating?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  thumbnail_url?: string;
  documentation_url?: string;
}

export interface ProjectPlugin {
  id: number;
  project_id: string;
  plugin_id: string;
  is_active: boolean;
  installed_at: string;
  updated_at: string;
  config?: string;
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  category?: string;
}

export interface PluginSettings {
  [key: string]: string | boolean | number;
}

export interface ContentMetadata {
  [key: string]: string;
}

/**
 * Get all marketplace plugins with optional filtering
 */
export async function getMarketplacePlugins(options?: {
  category?: string;
  published?: boolean;
  search?: string;
  sort?: "downloads" | "rating" | "newest";
}): Promise<MarketplacePlugin[]> {
  let url = `${API_BASE_URL}/plugins.php`;
  const params = new URLSearchParams();

  if (options?.category) {
    params.append("category", options.category);
  }

  if (options?.published !== undefined) {
    params.append("published", options.published.toString());
  }

  if (options?.search) {
    params.append("search", options.search);
  }

  if (options?.sort) {
    params.append("sort", options.sort);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch plugins: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching marketplace plugins:", error);
    return [];
  }
}

/**
 * Get a specific marketplace plugin by ID
 */
export async function getMarketplacePlugin(
  id: string,
): Promise<MarketplacePlugin | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch plugin: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching plugin ${id}:`, error);
    return null;
  }
}

/**
 * Get all plugins installed for a specific project
 */
export async function getProjectPlugins(
  projectId: string,
): Promise<ProjectPlugin[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/plugins.php?project_id=${projectId}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch project plugins: ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching plugins for project ${projectId}:`, error);
    return [];
  }
}

/**
 * Install a plugin for a project
 */
export async function installPlugin(
  projectId: string,
  pluginId: string,
  isActive: boolean = false,
  config?: any,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        plugin_id: pluginId,
        is_active: isActive,
        config: config,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to install plugin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(
      `Error installing plugin ${pluginId} for project ${projectId}:`,
      error,
    );
    return false;
  }
}

/**
 * Uninstall a plugin from a project
 */
export async function uninstallPlugin(
  projectId: string,
  pluginId: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        plugin_id: pluginId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to uninstall plugin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(
      `Error uninstalling plugin ${pluginId} from project ${projectId}:`,
      error,
    );
    return false;
  }
}

/**
 * Update plugin status (activate/deactivate)
 */
export async function updatePluginStatus(
  projectId: string,
  pluginId: string,
  isActive: boolean,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        id: pluginId,
        is_active: isActive,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update plugin status: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`Error updating status for plugin ${pluginId}:`, error);
    return false;
  }
}

/**
 * Update plugin settings
 */
export async function updatePluginSettings(
  projectId: string,
  pluginId: string,
  settings: PluginSettings,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plugin_id: pluginId,
        project_id: projectId,
        settings: settings,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update plugin settings: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`Error updating settings for plugin ${pluginId}:`, error);
    return false;
  }
}

/**
 * Add metadata to content (for SEO and other plugins)
 */
export async function addContentMetadata(
  contentId: string,
  pluginId: string,
  metadata: ContentMetadata,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_id: contentId,
        plugin_id: pluginId,
        metadata: metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add content metadata: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`Error adding metadata to content ${contentId}:`, error);
    return false;
  }
}

/**
 * Create a new marketplace plugin (admin only)
 */
export async function createMarketplacePlugin(
  plugin: MarketplacePlugin,
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plugin),
    });

    if (!response.ok) {
      throw new Error(`Failed to create plugin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id || null;
  } catch (error) {
    console.error("Error creating marketplace plugin:", error);
    return null;
  }
}

/**
 * Update a marketplace plugin (admin only)
 */
export async function updateMarketplacePlugin(
  id: string,
  updates: Partial<MarketplacePlugin>,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update plugin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`Error updating marketplace plugin ${id}:`, error);
    return false;
  }
}

/**
 * Delete a marketplace plugin (admin only)
 */
export async function deleteMarketplacePlugin(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins.php?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete plugin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`Error deleting marketplace plugin ${id}:`, error);
    return false;
  }
}
