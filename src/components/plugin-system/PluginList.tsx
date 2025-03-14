import React, { useState, useEffect } from "react";
import { AlertCircle, Settings, Trash2 } from "lucide-react";
import { pluginManager } from "@/lib/plugin-system/plugin-manager";
import {
  PluginStatus,
  PluginInstallation,
} from "@/lib/plugin-system/plugin-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PluginListProps {
  onConfigurePlugin?: (pluginId: string) => void;
}

const PluginList: React.FC<PluginListProps> = ({ onConfigurePlugin }) => {
  const [plugins, setPlugins] = useState<PluginInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uninstallDialog, setUninstallDialog] = useState<{
    open: boolean;
    pluginId: string;
    pluginName: string;
  }>({
    open: false,
    pluginId: "",
    pluginName: "",
  });

  useEffect(() => {
    // Load plugins when component mounts
    loadPlugins();
  }, []);

  const loadPlugins = () => {
    setLoading(true);
    const installedPlugins = pluginManager.getInstalledPlugins();
    setPlugins(installedPlugins);
    setLoading(false);
  };

  const handleTogglePlugin = async (pluginId: string, isActive: boolean) => {
    let success = false;

    if (isActive) {
      success = await pluginManager.deactivatePlugin(pluginId);
    } else {
      success = await pluginManager.activatePlugin(pluginId);
    }

    if (success) {
      loadPlugins();
    }
  };

  const handleUninstallPlugin = async () => {
    const { pluginId } = uninstallDialog;

    const success = await pluginManager.uninstallPlugin(pluginId);

    if (success) {
      loadPlugins();
    }

    setUninstallDialog({ open: false, pluginId: "", pluginName: "" });
  };

  const confirmUninstall = (pluginId: string, pluginName: string) => {
    setUninstallDialog({ open: true, pluginId, pluginName });
  };

  const getStatusBadge = (status: PluginStatus) => {
    switch (status) {
      case PluginStatus.ACTIVE:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case PluginStatus.INACTIVE:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Inactive
          </Badge>
        );
      case PluginStatus.ERROR:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Error
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Installed
          </Badge>
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading plugins...</div>;
  }

  if (plugins.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground mb-4">No plugins installed</p>
          <Button>Browse Marketplace</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plugins.map((plugin) => {
        const isActive = plugin.status === PluginStatus.ACTIVE;

        return (
          <Card
            key={plugin.pluginId}
            className={
              plugin.status === PluginStatus.ERROR ? "border-red-300" : ""
            }
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plugin.pluginId}</CardTitle>
                  <CardDescription>
                    Installed on{" "}
                    {new Date(plugin.installedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(plugin.status)}
                </div>
              </div>
            </CardHeader>

            {plugin.status === PluginStatus.ERROR && plugin.error && (
              <CardContent className="pt-0 pb-2">
                <div className="bg-red-50 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">{plugin.error}</p>
                  </div>
                </div>
              </CardContent>
            )}

            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center">
                <Switch
                  checked={isActive}
                  onCheckedChange={() =>
                    handleTogglePlugin(plugin.pluginId, isActive)
                  }
                  disabled={plugin.status === PluginStatus.ERROR}
                />
                <span className="ml-2 text-sm">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigurePlugin?.(plugin.pluginId)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() =>
                    confirmUninstall(plugin.pluginId, plugin.pluginId)
                  }
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Uninstall
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}

      {/* Uninstall Confirmation Dialog */}
      <Dialog
        open={uninstallDialog.open}
        onOpenChange={(open) =>
          !open && setUninstallDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uninstall Plugin</DialogTitle>
            <DialogDescription>
              Are you sure you want to uninstall {uninstallDialog.pluginName}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setUninstallDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUninstallPlugin}>
              Uninstall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PluginList;
