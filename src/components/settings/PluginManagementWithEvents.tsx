import React, { useState, useEffect } from "react";
import PluginManagement from "./PluginManagement";
import events from "@/lib/events";
import cmsCore from "@/lib/cms-core";

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isActive: boolean;
  category: string;
  lastUpdated: string;
}

const PluginManagementWithEvents = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    // Load initial plugins
    const defaultPlugins: Plugin[] = [
      {
        id: "1",
        name: "Advanced Editor",
        description:
          "Enhances the content editor with additional formatting options and templates.",
        version: "1.2.0",
        author: "CMS Team",
        isActive: true,
        category: "Editor",
        lastUpdated: "2023-05-15",
      },
      {
        id: "2",
        name: "SEO Toolkit",
        description:
          "Provides SEO analysis and recommendations for your content.",
        version: "2.0.1",
        author: "SEO Experts Inc.",
        isActive: true,
        category: "SEO",
        lastUpdated: "2023-06-22",
      },
      // Add more default plugins as needed
    ];

    setPlugins(defaultPlugins);

    // Set up event listeners
    const unsubscribeInstall = events.on("plugin:afterInstall", (plugin) => {
      // Add the newly installed plugin to the list
      setPlugins((prevPlugins) => [
        ...prevPlugins,
        {
          id: plugin.id,
          name: plugin.name,
          description: plugin.description,
          version: plugin.version,
          author: plugin.author,
          isActive: false, // Newly installed plugins are inactive by default
          category: plugin.category || "Other",
          lastUpdated: new Date().toISOString().split("T")[0],
        },
      ]);
    });

    const unsubscribeUninstall = events.on(
      "plugin:afterUninstall",
      (pluginId) => {
        // Remove the uninstalled plugin from the list
        setPlugins((prevPlugins) =>
          prevPlugins.filter((p) => p.id !== pluginId),
        );
      },
    );

    const unsubscribeActivate = events.on("plugin:afterActivate", (plugin) => {
      // Update the plugin's active status
      setPlugins((prevPlugins) =>
        prevPlugins.map((p) =>
          p.id === plugin.id ? { ...p, isActive: true } : p,
        ),
      );
    });

    const unsubscribeDeactivate = events.on(
      "plugin:afterDeactivate",
      (pluginId) => {
        // Update the plugin's active status
        setPlugins((prevPlugins) =>
          prevPlugins.map((p) =>
            p.id === pluginId ? { ...p, isActive: false } : p,
          ),
        );
      },
    );

    // Clean up event listeners on unmount
    return () => {
      unsubscribeInstall();
      unsubscribeUninstall();
      unsubscribeActivate();
      unsubscribeDeactivate();
    };
  }, []);

  // Handle plugin toggle (activate/deactivate)
  const handleTogglePlugin = async (id: string) => {
    const plugin = plugins.find((p) => p.id === id);

    if (plugin) {
      if (plugin.isActive) {
        // Deactivate the plugin
        events.emit("plugin:beforeDeactivate", id);

        // In a real implementation, you would deactivate the plugin here
        console.log(`Deactivating plugin: ${id}`);

        // Update the plugin's active status
        setPlugins((prevPlugins) =>
          prevPlugins.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
        );

        events.emit("plugin:afterDeactivate", id);
      } else {
        // Activate the plugin
        events.emit("plugin:beforeActivate", id);

        // In a real implementation, you would activate the plugin here
        console.log(`Activating plugin: ${id}`);

        // Update the plugin's active status
        setPlugins((prevPlugins) =>
          prevPlugins.map((p) => (p.id === id ? { ...p, isActive: true } : p)),
        );

        events.emit("plugin:afterActivate", plugin);
      }
    }
  };

  // Handle plugin uninstall
  const handleUninstallPlugin = async (id: string) => {
    try {
      // Uninstall the plugin
      await cmsCore.uninstallPlugin(id);

      // The plugin will be removed from the list by the event listener
    } catch (error) {
      console.error(`Failed to uninstall plugin ${id}:`, error);
      // In a real implementation, you would show an error message to the user
    }
  };

  return (
    <PluginManagement
      plugins={plugins}
      // In a real implementation, you would pass these handlers to the PluginManagement component
      // and modify it to use them instead of its internal state management
    />
  );
};

export default PluginManagementWithEvents;
