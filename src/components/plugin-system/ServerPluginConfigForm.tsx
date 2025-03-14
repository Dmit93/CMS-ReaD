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
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getProjectPlugins, updatePluginSettings } from "@/lib/api/plugin-api";
import type { ProjectPlugin } from "@/lib/api/plugin-api";

interface ServerPluginConfigFormProps {
  projectId?: string;
  pluginId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const ServerPluginConfigForm: React.FC<ServerPluginConfigFormProps> = ({
  projectId = "default",
  pluginId,
  onSave,
  onCancel,
}) => {
  const [plugin, setPlugin] = useState<ProjectPlugin | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlugin();
  }, [pluginId, projectId]);

  const loadPlugin = async () => {
    setLoading(true);
    setError(null);

    try {
      const plugins = await getProjectPlugins(projectId);
      const foundPlugin = plugins.find((p) => p.plugin_id === pluginId);

      if (foundPlugin) {
        setPlugin(foundPlugin);
        // Parse config if it exists
        if (foundPlugin.config) {
          try {
            const parsedConfig = JSON.parse(foundPlugin.config);
            setConfig(parsedConfig);
          } catch (e) {
            console.error("Error parsing plugin config:", e);
            setConfig({});
          }
        }
      } else {
        setError("Plugin not found");
      }
    } catch (err) {
      console.error("Failed to load plugin:", err);
      setError("Failed to load plugin configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
