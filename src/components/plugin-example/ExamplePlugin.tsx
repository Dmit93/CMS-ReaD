import React, { useEffect } from "react";
import events from "@/lib/events";
import type { PluginAPI, PluginConfig } from "@/lib/plugin-api";

/**
 * Example plugin that demonstrates how to use the event system
 */
const ExamplePlugin: React.FC = () => {
  useEffect(() => {
    console.log("Example plugin component mounted");

    // Clean up when component unmounts
    return () => {
      console.log("Example plugin component unmounted");
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Example Plugin</h2>
      <p className="text-gray-600">
        This is an example plugin that demonstrates how to use the event system.
      </p>
    </div>
  );
};

export default ExamplePlugin;

/**
 * Plugin initialization function
 * This would be called when the plugin is loaded
 */
export const initialize = (api: PluginAPI) => {
  console.log("Example plugin initializing...");

  // Subscribe to content events
  const unsubscribeCreate = api.events.on("content:afterCreate", (content) => {
    console.log("Content created:", content);
  });

  const unsubscribeUpdate = api.events.on("content:afterUpdate", (content) => {
    console.log("Content updated:", content);
  });

  const unsubscribeDelete = api.events.on(
    "content:afterDelete",
    (contentId) => {
      console.log("Content deleted:", contentId);
    },
  );

  // Register a menu item
  api.registerMenuItem({
    id: "example-plugin",
    name: "Example Plugin",
    path: "/example-plugin",
    icon: "Puzzle",
    order: 100,
    pluginId: "example-plugin",
  });

  // Register a settings panel
  api.registerSettingsPanel({
    id: "example-plugin-settings",
    name: "Example Plugin Settings",
    icon: "Settings",
    component: () => (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Example Plugin Settings</h2>
        <p>Configure the example plugin here.</p>
      </div>
    ),
    order: 100,
    pluginId: "example-plugin",
  });

  // Return a cleanup function
  return () => {
    console.log("Example plugin cleaning up...");
    unsubscribeCreate();
    unsubscribeUpdate();
    unsubscribeDelete();
  };
};

/**
 * Plugin configuration
 */
export const pluginConfig: PluginConfig = {
  id: "example-plugin",
  name: "Example Plugin",
  version: "1.0.0",
  description:
    "An example plugin that demonstrates how to use the event system",
  author: "CMS Team",
  icon: "Puzzle",
  initialize,
};
