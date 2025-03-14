import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { pluginManager } from "@/lib/plugin-system/plugin-manager";
import { PluginStatus } from "@/lib/plugin-system/plugin-types";

interface PluginConfigFormProps {
  pluginId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const PluginConfigForm: React.FC<PluginConfigFormProps> = ({
  pluginId,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load plugin configuration
    const pluginStatus = pluginManager.getPluginStatus(pluginId);
    setConfig(pluginStatus.config || {});
    setLoading(false);
  }, [pluginId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const success = await pluginManager.updatePluginConfig(pluginId, config);

      if (success) {
        onSave?.();
      } else {
        setError("Failed to save configuration");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading configuration...</div>
    );
  }

  // Get plugin status to show plugin info
  const pluginStatus = pluginManager.getPluginStatus(pluginId);
  const isActive = pluginStatus.status === PluginStatus.ACTIVE;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plugin Configuration: {pluginId}</CardTitle>
        <CardDescription>
          Configure settings for this plugin. Changes will take effect after
          saving.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plugin Info Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Plugin Information</h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm">{isActive ? "Active" : "Inactive"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Installed On</p>
              <p className="text-sm">
                {new Date(pluginStatus.installedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Configuration Options</h3>

          {/* Example configuration fields - in a real app, these would be dynamic based on the plugin */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="pluginEnabled">Enable Plugin Features</Label>
              <div className="flex items-center">
                <Switch
                  id="pluginEnabled"
                  checked={config.enabled !== false}
                  onCheckedChange={(checked) =>
                    handleChange("enabled", checked)
                  }
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {config.enabled !== false ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key (if required)</Label>
              <Input
                id="apiKey"
                value={config.apiKey || ""}
                onChange={(e) => handleChange("apiKey", e.target.value)}
                placeholder="Enter API key"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customEndpoint">Custom Endpoint URL</Label>
              <Input
                id="customEndpoint"
                value={config.customEndpoint || ""}
                onChange={(e) => handleChange("customEndpoint", e.target.value)}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="advancedSettings">Advanced Settings (JSON)</Label>
              <Textarea
                id="advancedSettings"
                value={config.advancedSettings || ""}
                onChange={(e) =>
                  handleChange("advancedSettings", e.target.value)
                }
                placeholder='{"setting1": "value1", "setting2": "value2"}'
                className="font-mono h-32"
              />
              <p className="text-xs text-muted-foreground">
                Enter advanced configuration in JSON format
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PluginConfigForm;
