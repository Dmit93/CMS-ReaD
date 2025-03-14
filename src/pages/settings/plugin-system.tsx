import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PluginList from "@/components/plugin-system/PluginList";
import PluginMarketplace from "@/components/plugin-system/PluginMarketplace";
import PluginConfigForm from "@/components/plugin-system/PluginConfigForm";
import { pluginManager } from "@/lib/plugin-system/plugin-manager";

const PluginSystemPage = () => {
  const [activeTab, setActiveTab] = useState("installed");
  const [configurePluginId, setConfigurePluginId] = useState<string | null>(
    null,
  );

  // Initialize plugin manager when component mounts
  useEffect(() => {
    const initPlugins = async () => {
      await pluginManager.initialize();
    };

    initPlugins();
  }, []);

  const handleConfigurePlugin = (pluginId: string) => {
    setConfigurePluginId(pluginId);
    setActiveTab("configure");
  };

  const handleConfigSave = () => {
    setActiveTab("installed");
    setConfigurePluginId(null);
  };

  const handleConfigCancel = () => {
    setActiveTab("installed");
    setConfigurePluginId(null);
  };

  const handleInstallComplete = () => {
    setActiveTab("installed");
  };

  return (
    <>
      <Helmet>
        <title>Plugin System - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Plugin System</h1>
            <p className="text-muted-foreground mt-1">
              Manage plugins to extend your CMS functionality
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              {configurePluginId && (
                <TabsTrigger value="configure">Configure Plugin</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="installed" className="space-y-6">
              <PluginList onConfigurePlugin={handleConfigurePlugin} />
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-6">
              <PluginMarketplace onInstallComplete={handleInstallComplete} />
            </TabsContent>

            <TabsContent value="configure" className="space-y-6">
              {configurePluginId && (
                <PluginConfigForm
                  pluginId={configurePluginId}
                  onSave={handleConfigSave}
                  onCancel={handleConfigCancel}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PluginSystemPage;
