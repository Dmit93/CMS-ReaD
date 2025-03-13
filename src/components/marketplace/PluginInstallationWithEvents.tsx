import React, { useState } from "react";
import InstallationModal from "./InstallationModal";
import events from "@/lib/events";
import cmsCore from "@/lib/cms-core";
import type { PluginConfig } from "@/lib/plugin-api";

interface PluginInstallationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pluginData: {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
  };
  onComplete: (activated: boolean) => void;
}

const PluginInstallationWithEvents = ({
  isOpen,
  onOpenChange,
  pluginData,
  onComplete,
}: PluginInstallationProps) => {
  const [installationStatus, setInstallationStatus] = useState<
    "pending" | "installing" | "success" | "error"
  >("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleInstall = async () => {
    setInstallationStatus("installing");

    try {
      // Create a plugin config object
      const pluginConfig: PluginConfig = {
        id: pluginData.id,
        name: pluginData.name,
        version: pluginData.version,
        description: pluginData.description,
        author: pluginData.author,
        // In a real implementation, you would have more properties and an initialize function
      };

      // Install the plugin
      await cmsCore.installPlugin(pluginConfig);

      // Set success status
      setInstallationStatus("success");
    } catch (error) {
      console.error("Plugin installation failed:", error);
      setInstallationStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleActivate = async (activate: boolean) => {
    if (activate) {
      // Emit plugin activation events
      events.emit("plugin:beforeActivate", pluginData.id);

      // In a real implementation, you would activate the plugin here
      console.log(`Activating plugin: ${pluginData.id}`);

      // Emit after activation event
      events.emit("plugin:afterActivate", pluginData);
    }

    // Call the onComplete callback
    onComplete(activate);
  };

  return (
    <InstallationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      pluginName={pluginData.name}
      pluginId={pluginData.id}
      onComplete={handleActivate}
      // In a real implementation, you would pass the installation status and error message
      // and modify the InstallationModal component to use them
    />
  );
};

export default PluginInstallationWithEvents;
