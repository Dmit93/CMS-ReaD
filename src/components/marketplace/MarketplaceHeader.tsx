import React, { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketplaceHeaderProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sortOption: string) => void;
  onFilterChange?: (filters: Record<string, boolean>) => void;
}

const MarketplaceHeader = ({
  onSearch = () => {},
  onCategoryChange = () => {},
  onSortChange = () => {},
  onFilterChange = () => {},
}: MarketplaceHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [filters, setFilters] = useState({
    freeOnly: false,
    newReleases: false,
    topRated: false,
    verified: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange(value);
  };

  const handleFilterChange = (key: string, checked: boolean) => {
    const newFilters = { ...filters, [key]: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-full bg-white p-6 shadow-sm rounded-lg">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Plugin Marketplace</h1>
        <p className="text-gray-500">
          Discover and install plugins to extend your CMS functionality
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Search Bar */}
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

          {/* Category Selector */}
          <div className="w-full md:w-48">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-48">
            <Select value={selectedSort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={filters.freeOnly}
                onCheckedChange={(checked) =>
                  handleFilterChange("freeOnly", !!checked)
                }
              >
                Free Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.newReleases}
                onCheckedChange={(checked) =>
                  handleFilterChange("newReleases", !!checked)
                }
              >
                New Releases
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.topRated}
                onCheckedChange={(checked) =>
                  handleFilterChange("topRated", !!checked)
                }
              >
                Top Rated
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.verified}
                onCheckedChange={(checked) =>
                  handleFilterChange("verified", !!checked)
                }
              >
                Verified Plugins
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters Button */}
          <Button variant="ghost" className="w-full md:w-auto">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Advanced
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;
