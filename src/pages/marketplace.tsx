import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import PluginGrid from "@/components/marketplace/PluginGrid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Download, Clock } from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  category: string;
  version: string;
  imageUrl: string;
}

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [filters, setFilters] = useState({
    freeOnly: false,
    newReleases: false,
    topRated: false,
    verified: false,
  });

  // Mock featured plugins
  const featuredPlugins: Plugin[] = [
    {
      id: "featured-1",
      name: "Advanced Analytics Suite",
      description:
        "Comprehensive analytics dashboard with user behavior tracking and conversion optimization tools.",
      author: "DataInsight",
      rating: 4.9,
      downloads: 12500,
      category: "Analytics",
      version: "3.2.1",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
    },
    {
      id: "featured-2",
      name: "Content Scheduler Pro",
      description:
        "Plan and schedule your content with an intuitive calendar interface and team collaboration features.",
      author: "PublishPro",
      rating: 4.8,
      downloads: 8750,
      category: "Content",
      version: "2.5.0",
      imageUrl:
        "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&q=80",
    },
    {
      id: "featured-3",
      name: "SEO Powerpack",
      description:
        "All-in-one SEO toolkit with keyword research, content analysis, and performance tracking.",
      author: "RankMaster",
      rating: 4.7,
      downloads: 15200,
      category: "SEO",
      version: "4.1.3",
      imageUrl:
        "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&q=80",
    },
  ];

  // Mock trending plugins
  const trendingPlugins: Plugin[] = [
    {
      id: "trending-1",
      name: "AI Content Generator",
      description:
        "Generate high-quality content with AI assistance and smart templates.",
      author: "NeuralText",
      rating: 4.6,
      downloads: 5680,
      category: "Content",
      version: "1.0.2",
      imageUrl:
        "https://images.unsplash.com/photo-1677442135136-760c813dce95?w=400&q=80",
    },
    {
      id: "trending-2",
      name: "Social Media Autopilot",
      description:
        "Automatically share your content across multiple social platforms with smart scheduling.",
      author: "SocialBoost",
      rating: 4.5,
      downloads: 4320,
      category: "Social",
      version: "2.3.1",
      imageUrl:
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
    },
    {
      id: "trending-3",
      name: "E-commerce Essentials",
      description:
        "Add product listings, shopping cart, and payment processing to your CMS.",
      author: "ShopSuite",
      rating: 4.7,
      downloads: 7890,
      category: "E-commerce",
      version: "3.1.0",
      imageUrl:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    },
  ];

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  };

  // Handle sort change
  const handleSortChange = (sortOption: string) => {
    setSelectedSort(sortOption);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Record<string, boolean>) => {
    setFilters(newFilters);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  };

  // Handle plugin installation
  const handleInstall = (id: string) => {
    // Navigate to plugin detail page
    navigate(`/plugin/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Marketplace Header with search and filters */}
          <MarketplaceHeader
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
          />

          {/* Featured and Trending Sections */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Plugins</TabsTrigger>
                  <TabsTrigger value="featured">
                    Featured
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-amber-100 text-amber-800"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Top Picks
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="trending">
                    Trending
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-100 text-blue-800"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {Math.floor(Math.random() * 50000) + 10000} Total Downloads
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Updated {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <PluginGrid isLoading={isLoading} onInstall={handleInstall} />
              </TabsContent>

              <TabsContent value="featured" className="mt-0">
                <PluginGrid
                  plugins={featuredPlugins}
                  isLoading={isLoading}
                  onInstall={handleInstall}
                />
              </TabsContent>

              <TabsContent value="trending" className="mt-0">
                <PluginGrid
                  plugins={trendingPlugins}
                  isLoading={isLoading}
                  onInstall={handleInstall}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Call to Action for Developers */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">
                  Are you a developer?
                </h2>
                <p className="text-blue-100 max-w-xl">
                  Create and publish your own plugins to the marketplace. Reach
                  thousands of users and grow your developer profile.
                </p>
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="bg-transparent border-white hover:bg-white hover:text-blue-700"
                >
                  Developer Docs
                </Button>
                <Button className="bg-white text-blue-700 hover:bg-blue-50">
                  Submit a Plugin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
