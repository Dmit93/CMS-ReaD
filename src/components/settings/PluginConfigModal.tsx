import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Plugin name is required" }),
  version: z.string(),
  enabled: z.boolean().default(true),
  priority: z.string(),
  apiKey: z.string().optional(),
  customEndpoint: z.string().optional(),
  advancedSettings: z.string().optional(),
});

type PluginConfigFormValues = z.infer<typeof formSchema>;

interface PluginConfigModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  plugin?: {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    priority: string;
    apiKey?: string;
    customEndpoint?: string;
    advancedSettings?: string;
  };
  onSave?: (values: PluginConfigFormValues) => void;
}

const PluginConfigModal = ({
  open = true,
  onOpenChange,
  plugin = {
    id: "plugin-1",
    name: "Content Analyzer",
    version: "1.2.0",
    enabled: true,
    priority: "medium",
    apiKey: "",
    customEndpoint: "",
    advancedSettings:
      '{\n  "cacheTimeout": 3600,\n  "maxRetries": 3,\n  "debugMode": false\n}',
  },
  onSave = () => {},
}: PluginConfigModalProps) => {
  const form = useForm<PluginConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plugin.name,
      version: plugin.version,
      enabled: plugin.enabled,
      priority: plugin.priority,
      apiKey: plugin.apiKey || "",
      customEndpoint: plugin.customEndpoint || "",
      advancedSettings: plugin.advancedSettings || "",
    },
  });

  function onSubmit(values: PluginConfigFormValues) {
    onSave(values);
    if (onOpenChange) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Plugin: {plugin.name}
          </DialogTitle>
          <DialogDescription>
            Adjust the settings for this plugin. Changes will take effect
            immediately after saving.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plugin Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Plugin name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} readOnly />
                    </FormControl>
                    <FormDescription>Current installed version</FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription>
                        Toggle to enable or disable this plugin
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Sets the execution priority relative to other plugins
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter API key if required" {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for plugins that connect to external services
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Endpoint (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.example.com/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Override the default API endpoint if needed
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="advancedSettings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advanced Settings (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"setting1": "value1", "setting2": "value2"}'
                      className="font-mono h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional configuration in JSON format
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PluginConfigModal;
