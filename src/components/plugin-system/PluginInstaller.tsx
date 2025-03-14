import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { pluginManager } from "@/lib/plugin-system/plugin-manager";
import { PluginData } from "../marketplace/PluginCard";

interface PluginInstallerProps {
  plugin: PluginData;
  onComplete?: (success: boolean) => void;
}

type InstallationStatus = "pending" | "installing" | "success" | "error";

const PluginInstaller: React.FC<PluginInstallerProps> = ({
  plugin,
  onComplete = () => {},
}) => {
  const [status, setStatus] = useState<InstallationStatus>("pending");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startInstallation = async () => {
    setStatus("installing");
    setProgress(0);
    setError(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Install the plugin
      const success = await pluginManager.installPlugin(plugin.id, {
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        author: plugin.author,
        category: plugin.category,
      });

      // Clear the interval
      clearInterval(progressInterval);

      if (success) {
        setProgress(100);
        setStatus("success");
      } else {
        setStatus("error");
        setError("Failed to install plugin");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const activatePlugin = async () => {
    try {
      const success = await pluginManager.activatePlugin(plugin.id);
      onComplete(success);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to activate plugin",
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {status === "pending" && "Install Plugin"}
          {status === "installing" && "Installing Plugin..."}
          {status === "success" && "Installation Complete"}
          {status === "error" && "Installation Failed"}
        </CardTitle>
        <CardDescription>
          {status === "pending" && `You are about to install ${plugin.name}.`}
          {status === "installing" &&
            "Please wait while we install the plugin."}
          {status === "success" &&
            `${plugin.name} has been successfully installed.`}
          {status === "error" && "There was an error installing the plugin."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "pending" && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-lg">{plugin.name}</h3>
              <p className="text-sm text-gray-500">ID: {plugin.id}</p>
              <p className="text-sm text-gray-500">Version: {plugin.version}</p>
              <p className="text-sm text-gray-500">Author: {plugin.author}</p>
              <p className="mt-2 text-sm">{plugin.description}</p>
            </div>
          </div>
        )}

        {status === "installing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <Progress value={progress} className="h-2 w-full" />
            <p className="text-center text-sm text-gray-500">
              {progress}% complete
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-center">
              The plugin has been successfully installed and is ready to use.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <p className="text-center">
              We couldn't complete the installation. Please try again or contact
              support.
            </p>
            {error && (
              <div className="border rounded-lg p-4 bg-red-50 w-full">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Error details</h4>
                    <p className="text-sm text-gray-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {status === "pending" && (
          <>
            <Button variant="outline" onClick={() => onComplete(false)}>
              Cancel
            </Button>
            <Button onClick={startInstallation}>
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
          </>
        )}

        {status === "installing" && (
          <Button variant="outline" disabled>
            Installing...
          </Button>
        )}

        {status === "success" && (
          <>
            <Button variant="outline" onClick={() => onComplete(true)}>
              Close
            </Button>
            <Button onClick={activatePlugin}>Activate Now</Button>
          </>
        )}

        {status === "error" && (
          <>
            <Button variant="outline" onClick={() => onComplete(false)}>
              Cancel
            </Button>
            <Button onClick={startInstallation}>Retry</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default PluginInstaller;
