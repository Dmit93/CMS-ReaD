import React, { useState } from "react";
import { Helmet } from "react-helmet";
import PluginManagement from "@/components/settings/PluginManagement";
import PluginConfigModal from "@/components/settings/PluginConfigModal";

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

const PluginsPage = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Sample plugins data - in a real app, this would come from an API
  const plugins: Plugin[] = [
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
    {
      id: "3",
      name: "Image Optimizer",
      description:
        "Automatically optimizes uploaded images for better performance.",
      version: "1.0.5",
      author: "Media Solutions",
      isActive: false,
      category: "Media",
      lastUpdated: "2023-04-10",
    },
    {
      id: "4",
      name: "Social Media Integration",
      description:
        "Enables direct publishing to various social media platforms.",
      version: "1.3.2",
      author: "Social Connect",
      isActive: true,
      category: "Integration",
      lastUpdated: "2023-07-05",
    },
    {
      id: "5",
      name: "Analytics Dashboard",
      description:
        "Provides detailed analytics about your content performance.",
      version: "2.1.0",
      author: "Data Insights",
      isActive: false,
      category: "Analytics",
      lastUpdated: "2023-06-30",
    },
  ];

  const handleConfigurePlugin = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = (values: any) => {
    console.log("Saving plugin configuration:", values);
    // In a real app, this would update the plugin configuration in the backend
    setConfigModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Plugin Management - CMS Platform</title>
      </Helmet>

      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Plugin Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your installed plugins, configure their settings, and control
            which ones are active.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border">
          <PluginManagement plugins={plugins} />
        </div>

        {selectedPlugin && (
          <PluginConfigModal
            open={configModalOpen}
            onOpenChange={setConfigModalOpen}
            plugin={{
              id: selectedPlugin.id,
              name: selectedPlugin.name,
              version: selectedPlugin.version,
              enabled: selectedPlugin.isActive,
              priority: "medium",
              apiKey: "",
              customEndpoint: "",
              advancedSettings:
                '{\n  "cacheTimeout": 3600,\n  "maxRetries": 3,\n  "debugMode": false\n}',
            }}
            onSave={handleSaveConfig}
          />
        )}
      </main>
    </div>
  );
};

export default PluginsPage;
