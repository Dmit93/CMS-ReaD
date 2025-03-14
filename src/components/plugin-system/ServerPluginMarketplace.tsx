import React, { useState, useEffect } from "react";
import { Search, Tag, Download, Star, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMarketplacePlugins,
  installPlugin,
  MarketplacePlugin,
} from "@/lib/api/plugin-api";
import InstallationModal from "../marketplace/InstallationModal";

interface ServerPluginMarketplaceProps {
  projectId?: string;
  onInstallComplete?: () => void;
}

const ServerPluginMarketplace: React.FC<ServerPluginMarketplaceProps> = ({
  projectId = "default",
  onInstallComplete,
}) => {
  const [plugins, setPlugins] = useState<MarketplacePlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("downloads");
  const [installDialog, setInstallDialog] = useState<{
    open: boolean;
    plugin: MarketplacePlugin | null;
  }>({
    open: false,
    plugin: null,
  });

  useEffect(() => {
    loadPlugins();
  }, [selectedCategory, sortOption]);

  const loadPlugins = async () => {
    setLoading(true);
    setError(null);

    try {
      const options: any = {
        published: true,
        sort: sortOption as "downloads" | "rating" | "newest",
      };

      if (selectedCategory !== "all") {
        options.category = selectedCategory;
      }

      const marketplacePlugins = await getMarketplacePlugins(options);
      setPlugins(marketplacePlugins);
    } catch (err) {
      console.error("Failed to load marketplace plugins:", err);
      setError("Failed to load plugins from marketplace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlugins();
  };

  const handleInstall = (plugin: MarketplacePlugin) => {
    setInstallDialog({ open: true, plugin });
  };

  const handleInstallComplete = async (activated: boolean) => {
    if (!installDialog.plugin) return;

    try {
      const success = await installPlugin(
        projectId,
        installDialog.plugin.id,
        activated,
      );

      if (success) {
        // Call the onInstallComplete callback if provided
        if (onInstallComplete) {
          onInstallComplete();
        }
      } else {
        setError("Failed to install plugin. Please try again.");
      }
    } catch (err) {
      console.error("Error installing plugin:", err);
      setError("An error occurred while installing the plugin.");
    } finally {
      setInstallDialog({ open: false, plugin: null });
    }
  };

  // Filter plugins based on search query
  const filteredPlugins = plugins.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plugin.description &&
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Render star rating
  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-xs">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <div className="h-32 bg-gray-100">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search plugins..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Content">Content</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="SEO">SEO</SelectItem>
              <SelectItem value="Analytics">Analytics</SelectItem>
              <SelectItem value="Social">Social Media</SelectItem>
              <SelectItem value="E-commerce">E-Commerce</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downloads">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Plugin grid */}
      {filteredPlugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <p className="text-muted-foreground">
            No plugins found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.map((plugin) => (
            <Card key={plugin.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{plugin.name}</CardTitle>
                  <Badge>{plugin.category || "Other"}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    by {plugin.author}
                  </span>
                  {renderStars(plugin.rating)}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-sm">{plugin.description}</p>

                <div className="flex items-center mt-4 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3 mr-1" />
                  <span className="mr-3">v{plugin.version}</span>

                  <Download className="h-3 w-3 mr-1" />
                  <span className="mr-3">
                    {plugin.downloads?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  className="w-full"
                  onClick={() => handleInstall(plugin)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Installation Dialog */}
      <Dialog
        open={installDialog.open}
        onOpenChange={(open) =>
          !open && setInstallDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          {installDialog.plugin && (
            <InstallationModal
              isOpen={true}
              onOpenChange={(open) =>
                setInstallDialog((prev) => ({ ...prev, open }))
              }
              pluginName={installDialog.plugin.name}
              pluginId={installDialog.plugin.id}
              onComplete={handleInstallComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServerPluginMarketplace;
