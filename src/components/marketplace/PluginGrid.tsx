import React, { useState } from "react";
import PluginCard from "./PluginCard";
import { Pagination } from "../ui/pagination";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

interface PluginGridProps {
  plugins?: Plugin[];
  itemsPerPage?: number;
  onInstall?: (id: string) => void;
  isLoading?: boolean;
}

const PluginGrid = ({
  plugins = [
    {
      id: "plugin-1",
      name: "Content Editor Pro",
      description:
        "Advanced content editing features with markdown support and AI-powered suggestions.",
      author: "CMS Solutions",
      rating: 4.5,
      downloads: 1250,
      category: "Editor",
      version: "1.2.0",
      imageUrl:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
    },
    {
      id: "plugin-2",
      name: "Media Optimizer",
      description:
        "Automatically optimize and compress uploaded media files for faster loading times.",
      author: "WebPerf Tools",
      rating: 4.8,
      downloads: 3420,
      category: "Media",
      version: "2.1.3",
      imageUrl:
        "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?w=400&q=80",
    },
    {
      id: "plugin-3",
      name: "SEO Toolkit",
      description:
        "Comprehensive SEO analysis and recommendations for your content.",
      author: "RankBooster",
      rating: 4.2,
      downloads: 5680,
      category: "SEO",
      version: "3.0.1",
      imageUrl:
        "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&q=80",
    },
    {
      id: "plugin-4",
      name: "Form Builder",
      description:
        "Drag and drop form builder with validation and submission handling.",
      author: "FormCraft",
      rating: 4.7,
      downloads: 2890,
      category: "Forms",
      version: "1.5.2",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
    },
    {
      id: "plugin-5",
      name: "Analytics Dashboard",
      description:
        "Detailed analytics and insights about your content performance and user engagement.",
      author: "DataViz",
      rating: 4.4,
      downloads: 1870,
      category: "Analytics",
      version: "2.2.0",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
    },
    {
      id: "plugin-6",
      name: "Social Media Integration",
      description:
        "Connect and publish content directly to various social media platforms.",
      author: "SocialConnect",
      rating: 4.1,
      downloads: 3250,
      category: "Integration",
      version: "1.3.4",
      imageUrl:
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
    },
    {
      id: "plugin-7",
      name: "E-commerce Tools",
      description:
        "Add product listings, shopping cart, and payment processing to your CMS.",
      author: "ShopSuite",
      rating: 4.6,
      downloads: 4120,
      category: "E-commerce",
      version: "2.4.1",
      imageUrl:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    },
    {
      id: "plugin-8",
      name: "Multilingual Content",
      description:
        "Tools for managing and translating content into multiple languages.",
      author: "LangTech",
      rating: 4.3,
      downloads: 2760,
      category: "Localization",
      version: "1.7.0",
      imageUrl:
        "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&q=80",
    },
  ],
  itemsPerPage = 6,
  onInstall = () => {},
  isLoading = false,
}: PluginGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(plugins.length / itemsPerPage);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlugins = plugins.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle plugin installation
  const handleInstall = (id: string) => {
    onInstall(id);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="w-full bg-white p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(itemsPerPage)
            .fill(0)
            .map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="w-full h-[320px] bg-gray-100 animate-pulse rounded-lg"
              ></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6">
      {plugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-xl font-medium text-gray-700">
            No plugins found
          </h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPlugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                id={plugin.id}
                name={plugin.name}
                description={plugin.description}
                author={plugin.author}
                rating={plugin.rating}
                downloads={plugin.downloads}
                category={plugin.category}
                version={plugin.version}
                imageUrl={plugin.imageUrl}
                onInstall={handleInstall}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={`page-${page}`}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PluginGrid;
