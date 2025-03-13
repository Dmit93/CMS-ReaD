import React, { useState } from "react";
import { Settings, Power, Trash2, Settings2, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface PluginManagementProps {
  plugins?: Plugin[];
}

const PluginManagement = ({ plugins = [] }: PluginManagementProps) => {
  // Default plugins if none are provided
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

  const [managedPlugins, setManagedPlugins] = useState<Plugin[]>(
    plugins.length > 0 ? plugins : defaultPlugins,
  );
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showUninstallDialog, setShowUninstallDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredPlugins =
    activeTab === "all"
      ? managedPlugins
      : activeTab === "active"
        ? managedPlugins.filter((plugin) => plugin.isActive)
        : managedPlugins.filter((plugin) => !plugin.isActive);

  const togglePluginStatus = (id: string) => {
    setManagedPlugins((prevPlugins) =>
      prevPlugins.map((plugin) =>
        plugin.id === id ? { ...plugin, isActive: !plugin.isActive } : plugin,
      ),
    );
  };

  const openConfigModal = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setShowConfigModal(true);
  };

  const confirmUninstall = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setShowUninstallDialog(true);
  };

  const uninstallPlugin = () => {
    if (selectedPlugin) {
      setManagedPlugins((prevPlugins) =>
        prevPlugins.filter((plugin) => plugin.id !== selectedPlugin.id),
      );
      setShowUninstallDialog(false);
    }
  };

  return (
    <div className="w-full p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Plugin Management</h1>
        <p className="text-muted-foreground">
          Manage your installed plugins and their settings
        </p>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Plugins</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onToggle={togglePluginStatus}
                onConfigure={openConfigModal}
                onUninstall={confirmUninstall}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onToggle={togglePluginStatus}
                onConfigure={openConfigModal}
                onUninstall={confirmUninstall}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onToggle={togglePluginStatus}
                onConfigure={openConfigModal}
                onUninstall={confirmUninstall}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Plugin Configuration Modal */}
      {selectedPlugin && showConfigModal && (
        <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Configure {selectedPlugin.name}</DialogTitle>
              <DialogDescription>
                Adjust the settings for this plugin according to your needs.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Plugin Information</h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Version: {selectedPlugin.version}</p>
                    <p>Author: {selectedPlugin.author}</p>
                    <p>Category: {selectedPlugin.category}</p>
                    <p>Last Updated: {selectedPlugin.lastUpdated}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Configuration Options</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is a placeholder for plugin-specific configuration
                    options.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowConfigModal(false)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Uninstall Confirmation Dialog */}
      <Dialog open={showUninstallDialog} onOpenChange={setShowUninstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uninstall Plugin</DialogTitle>
            <DialogDescription>
              Are you sure you want to uninstall {selectedPlugin?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUninstallDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={uninstallPlugin}>
              Uninstall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PluginCardProps {
  plugin: Plugin;
  onToggle: (id: string) => void;
  onConfigure: (plugin: Plugin) => void;
  onUninstall: (plugin: Plugin) => void;
}

const PluginCard = ({
  plugin,
  onToggle,
  onConfigure,
  onUninstall,
}: PluginCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{plugin.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{plugin.category}</Badge>
              <span className="text-xs text-muted-foreground">
                v{plugin.version}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Switch
              checked={plugin.isActive}
              onCheckedChange={() => onToggle(plugin.id)}
              aria-label={`${plugin.isActive ? "Deactivate" : "Activate"} ${plugin.name}`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{plugin.description}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Author: {plugin.author}</p>
          <p>Last Updated: {plugin.lastUpdated}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={() => onConfigure(plugin)}>
          <Settings className="h-4 w-4 mr-1" />
          Configure
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => onUninstall(plugin)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Uninstall
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PluginManagement;
