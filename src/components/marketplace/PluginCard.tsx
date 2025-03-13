import React from "react";
import { Star, Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface PluginCardProps {
  id?: string;
  name?: string;
  description?: string;
  author?: string;
  rating?: number;
  downloads?: number;
  category?: string;
  version?: string;
  imageUrl?: string;
  onInstall?: (id: string) => void;
}

const PluginCard = ({
  id = "plugin-1",
  name = "Content Editor Pro",
  description = "Advanced content editing features with markdown support and AI-powered suggestions.",
  author = "CMS Solutions",
  rating = 4.5,
  downloads = 1250,
  category = "Editor",
  version = "1.2.0",
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  onInstall = () => {},
}: PluginCardProps) => {
  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative">
          <Star className="w-4 h-4 text-yellow-400" />
          <Star
            className="absolute top-0 left-0 w-4 h-4 fill-yellow-400 text-yellow-400 overflow-hidden"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="w-4 h-4 text-gray-300" />,
      );
    }

    return stars;
  };

  const handleInstall = () => {
    onInstall(id);
  };

  return (
    <Card className="w-[280px] h-[320px] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg bg-white">
      <div className="h-32 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={`${name} plugin thumbnail`}
          className="w-full h-full object-cover"
        />
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{name}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {renderStars()}
          <span className="text-xs text-gray-500 ml-1">({rating})</span>
        </div>
        <CardDescription className="text-xs text-gray-500 mt-1">
          by {author} • v{version}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          <Download className="w-3 h-3 mr-1" />
          <span>{downloads.toLocaleString()}</span>
        </div>
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PluginCard;
