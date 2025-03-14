import React, { useState } from "react";
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
import { Download, Star, Tag, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PluginInstaller from "./PluginInstaller";
import { PluginData } from "../marketplace/PluginCard";

// Mock marketplace plugins
const MARKETPLACE_PLUGINS: PluginData[] = [
  {
    id: "seo-toolkit",
    name: "SEO Toolkit",
    description: "Comprehensive SEO tools for optimizing your content",
    author: "SEO Experts",
    version: "1.2.0",
    rating: 4.8,
    downloads: 1250,
    category: "SEO",
    imageUrl:
      "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&q=80",
  },
  {
    id: "advanced-editor",
    name: "Advanced Editor",
    description: "Enhanced content editor with markdown support and templates",
    author: "Editor Team",
    version: "2.1.3",
    rating: 4.5,
    downloads: 3420,
    category: "Content",
    imageUrl:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  },
  {
    id: "media-optimizer",
    name: "Media Optimizer",
    description: "Automatically optimize and compress uploaded media files",
    author: "Media Tools",
    version: "1.0.5",
    rating: 4.2,
    downloads: 980,
    category: "Media",
    imageUrl:
      "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?w=400&q=80",
  },
  {
    id: "social-share",
    name: "Social Sharing",
    description: "Add social sharing buttons and preview cards to your content",
    author: "Social Connect",
    version: "1.3.2",
    rating: 4.7,
    downloads: 2150,
    category: "Social",
    imageUrl:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description:
      "Detailed analytics about your content performance and user engagement",
    author: "Data Insights",
    version: "2.0.1",
    rating: 4.6,
    downloads: 1870,
    category: "Analytics",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  },
  {
    id: "form-builder",
    name: "Form Builder",
    description: "Create custom forms with validation and submission handling",
    author: "Form Tools",
    version: "1.5.0",
    rating: 4.4,
    downloads: 1560,
    category: "Forms",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  },
];

interface PluginMarketplaceProps {
  onInstallComplete?: () => void;
}

const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({
  onInstallComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [installDialog, setInstallDialog] = useState<{
    open: boolean;
    plugin: PluginData | null;
  }>({
    open: false,
    plugin: null,
  });

  // Filter plugins based on category and search query
  const filteredPlugins = MARKETPLACE_PLUGINS.filter((plugin) => {
    const matchesCategory =
      !selectedCategory || plugin.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(MARKETPLACE_PLUGINS.map((plugin) => plugin.category)),
  );

  const handleInstall = (plugin: PluginData) => {
    setInstallDialog({ open: true, plugin });
  };

  const handleInstallComplete = (success: boolean) => {
    setInstallDialog({ open: false, plugin: null });
    if (success) {
      onInstallComplete?.();
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
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

  return (
    <div className="space-y-6">
      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search plugins..."
            className="w-full px-3 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>

          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Plugin grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <Card key={plugin.id} className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg">{plugin.name}</CardTitle>
                <Badge>{plugin.category}</Badge>
              </div>
              <CardDescription className="flex items-center justify-between">
                <span>by {plugin.author}</span>
                {renderStars(plugin.rating)}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <p className="text-sm">{plugin.description}</p>

              <div className="flex items-center mt-4 text-xs text-muted-foreground">
                <Tag className="h-3 w-3 mr-1" />
                <span className="mr-3">v{plugin.version}</span>

                <Download className="h-3 w-3 mr-1" />
                <span className="mr-3">
                  {plugin.downloads.toLocaleString()}
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button className="w-full" onClick={() => handleInstall(plugin)}>
                <Download className="mr-2 h-4 w-4" />
                Install
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <p className="text-muted-foreground">
            No plugins found matching your criteria
          </p>
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
            <PluginInstaller
              plugin={installDialog.plugin}
              onComplete={handleInstallComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PluginMarketplace;
