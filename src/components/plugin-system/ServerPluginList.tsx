import React, { useState, useEffect } from "react";
import { AlertCircle, Settings, Trash2, Power } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProjectPlugins,
  updatePluginStatus,
  uninstallPlugin,
} from "@/lib/api/plugin-api";
import type { ProjectPlugin } from "@/lib/api/plugin-api";

interface ServerPluginListProps {
  projectId?: string;
  onConfigurePlugin?: (pluginId: string) => void;
  onRefresh?: () => void;
}

const ServerPluginList: React.FC<ServerPluginListProps> = ({
  projectId = "default",
  onConfigurePlugin,
  onRefresh,
}) => {
  const [plugins, setPlugins] = useState<ProjectPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    loadPlugins();
  }, [projectId]);

  const loadPlugins = async () => {
    setLoading(true);
    setError(null);

    try {
      const installedPlugins = await getProjectPlugins(projectId);
      setPlugins(installedPlugins);
    } catch (err) {
      console.error("Failed to load plugins:", err);
      setError("Failed to load installed plugins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlugin = async (pluginId: string, isActive: boolean) => {
    try {
      const success = await updatePluginStatus(projectId, pluginId, !isActive);

      if (success) {
        // Update local state
        setPlugins((prevPlugins) =>
          prevPlugins.map((plugin) =>
            plugin.plugin_id === pluginId
              ? { ...plugin, is_active: !isActive }
              : plugin,
          ),
        );

        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setError("Failed to update plugin status. Please try again.");
      }
    } catch (err) {
      console.error(`Failed to toggle plugin ${pluginId}:`, err);
      setError("An error occurred while updating plugin status.");
    }
  };

  const confirmUninstall = (pluginId: string, pluginName: string) => {
    setUninstallDialog({ open: true, pluginId, pluginName });
  };

  const handleUninstallPlugin = async () => {
    const { pluginId } = uninstallDialog;

    try {
      const success = await uninstallPlugin(projectId, pluginId);

      if (success) {
        // Remove plugin from local state
        setPlugins((prevPlugins) =>
          prevPlugins.filter((plugin) => plugin.plugin_id !== pluginId),
        );

        // Call refresh callback if provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setError("Failed to uninstall plugin. Please try again.");
      }
    } catch (err) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, err);
      setError("An error occurred while uninstalling the plugin.");
    } finally {
      setUninstallDialog({ open: false, pluginId: "", pluginName: "" });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-gray-50 text-gray-700 border-gray-200"
      >
        Inactive
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24 ml-2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => loadPlugins()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
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
      {plugins.map((plugin) => (
        <Card key={plugin.plugin_id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{plugin.name}</CardTitle>
                <CardDescription>
                  Installed on{" "}
                  {new Date(plugin.installed_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center">
                {getStatusBadge(plugin.is_active)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">
              {plugin.description || "No description available"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{plugin.category || "Other"}</Badge>
              <span className="text-xs text-muted-foreground">
                v{plugin.version}
              </span>
              <span className="text-xs text-muted-foreground">
                by {plugin.author}
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <div className="flex items-center">
              <Switch
                checked={plugin.is_active}
                onCheckedChange={() =>
                  handleTogglePlugin(plugin.plugin_id, plugin.is_active)
                }
              />
              <span className="ml-2 text-sm">
                {plugin.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigurePlugin?.(plugin.plugin_id)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() =>
                  confirmUninstall(
                    plugin.plugin_id,
                    plugin.name || plugin.plugin_id,
                  )
                }
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Uninstall
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

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

export default ServerPluginList;
