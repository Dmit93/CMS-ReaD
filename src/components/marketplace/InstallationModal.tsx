import React, { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface InstallationModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  pluginName?: string;
  pluginId?: string;
  onComplete?: (activated: boolean) => void;
}

type InstallationStatus = "pending" | "installing" | "success" | "error";

const InstallationModal = ({
  isOpen = true,
  onOpenChange,
  pluginName = "Content Editor Pro",
  pluginId = "editor-pro-123",
  onComplete = () => {},
}: InstallationModalProps) => {
  const [status, setStatus] = useState<InstallationStatus>("pending");
  const [progress, setProgress] = useState(0);

  // Simulate installation process
  const startInstallation = () => {
    setStatus("installing");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;

        if (newProgress >= 100) {
          clearInterval(interval);
          setStatus("success");
          return 100;
        }

        return newProgress;
      });
    }, 500);
  };

  const handleActivateNow = () => {
    onComplete(true);
    onOpenChange?.(false);
  };

  const handleActivateLater = () => {
    onComplete(false);
    onOpenChange?.(false);
  };

  const handleRetry = () => {
    startInstallation();
  };

  const handleCancel = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {status === "pending" && "Install Plugin"}
            {status === "installing" && "Installing Plugin..."}
            {status === "success" && "Installation Complete"}
            {status === "error" && "Installation Failed"}
          </DialogTitle>
          <DialogDescription>
            {status === "pending" && `You are about to install ${pluginName}.`}
            {status === "installing" &&
              "Please wait while we install the plugin."}
            {status === "success" &&
              `${pluginName} has been successfully installed.`}
            {status === "error" && "There was an error installing the plugin."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {status === "pending" && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-lg">{pluginName}</h3>
                <p className="text-sm text-gray-500">ID: {pluginId}</p>
                <p className="mt-2 text-sm">
                  This plugin will extend your content editing capabilities with
                  advanced formatting options.
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  By installing this plugin, you agree to the plugin's terms of
                  service and privacy policy.
                </p>
              </div>
            </div>
          )}

          {status === "installing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-center text-sm text-gray-500">
                {progress}% complete
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center">
                The plugin has been successfully installed and is ready to use.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center">
                We couldn't complete the installation. Please try again or
                contact support.
              </p>
              <div className="border rounded-lg p-4 bg-red-50 w-full">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Error details</h4>
                    <p className="text-sm text-gray-700">
                      Connection timeout while downloading plugin resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === "pending" && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={startInstallation}>Install Now</Button>
            </>
          )}

          {status === "installing" && (
            <Button variant="outline" onClick={handleCancel} disabled>
              Cancel
            </Button>
          )}

          {status === "success" && (
            <>
              <Button variant="outline" onClick={handleActivateLater}>
                Activate Later
              </Button>
              <Button onClick={handleActivateNow}>Activate Now</Button>
            </>
          )}

          {status === "error" && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleRetry}>Retry</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstallationModal;
