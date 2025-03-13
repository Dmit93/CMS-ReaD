import React from "react";
import { Star, Download, Settings, ExternalLink, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PluginReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface PluginVersion {
  version: string;
  date: string;
  changes: string[];
}

interface PluginDetailsProps {
  id?: string;
  name?: string;
  description?: string;
  author?: string;
  authorAvatar?: string;
  version?: string;
  rating?: number;
  downloads?: number;
  category?: string;
  tags?: string[];
  price?: string;
  screenshots?: string[];
  features?: string[];
  reviews?: PluginReview[];
  versionHistory?: PluginVersion[];
  lastUpdated?: string;
  compatibility?: string;
  requirements?: string[];
}

const PluginDetails = ({
  id = "plugin-123",
  name = "Advanced Content Editor",
  description = "A powerful WYSIWYG editor with advanced formatting, media embedding, and collaborative editing features.",
  author = "CMS Solutions",
  authorAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=cms-solutions",
  version = "2.3.1",
  rating = 4.7,
  downloads = 12583,
  category = "Content Editing",
  tags = ["editor", "wysiwyg", "collaboration", "media"],
  price = "Free",
  screenshots = [
    "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=800&q=80",
  ],
  features = [
    "Rich text editing with advanced formatting",
    "Real-time collaborative editing",
    "Media embedding and management",
    "Version history and change tracking",
    "Custom templates and styles",
    "Markdown support",
  ],
  reviews = [
    {
      id: "rev1",
      author: "Jane Cooper",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      rating: 5,
      date: "2023-05-15",
      comment:
        "This plugin has completely transformed our content creation workflow. The collaborative features are outstanding.",
    },
    {
      id: "rev2",
      author: "Alex Morgan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      rating: 4,
      date: "2023-04-22",
      comment:
        "Great editor with lots of features. Would be perfect with better mobile support.",
    },
    {
      id: "rev3",
      author: "Sam Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
      rating: 5,
      date: "2023-03-10",
      comment:
        "The best content editor I've used. Seamless integration with our CMS.",
    },
  ],
  versionHistory = [
    {
      version: "2.3.1",
      date: "2023-05-01",
      changes: [
        "Fixed image upload bug",
        "Improved performance",
        "Added new text formatting options",
      ],
    },
    {
      version: "2.2.0",
      date: "2023-03-15",
      changes: [
        "Added collaborative editing feature",
        "New UI design",
        "Support for more media types",
      ],
    },
    {
      version: "2.1.0",
      date: "2023-01-20",
      changes: [
        "Added version history",
        "Bug fixes",
        "Performance improvements",
      ],
    },
  ],
  lastUpdated = "2023-05-01",
  compatibility = "CMS Platform v3.0+",
  requirements = ["Media Library Plugin", "User Management System"],
}: PluginDetailsProps) => {
  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white w-full p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Plugin header section */}
        <div className="md:w-2/3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <img
                    src={authorAvatar}
                    alt={author}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600">{author}</span>
                </div>
                <Badge variant="secondary">{category}</Badge>
                <span className="text-sm text-gray-600">v{version}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Plugin stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Downloads</div>
              <div className="text-xl font-semibold mt-1">
                {downloads.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Rating</div>
              <div className="mt-1">{renderStars(rating)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Price</div>
              <div className="text-xl font-semibold mt-1">{price}</div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Plugin screenshot */}
        <div className="md:w-1/3">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={screenshots[0]}
              alt={`${name} screenshot`}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="flex mt-2 gap-2 overflow-x-auto pb-2">
            {screenshots.slice(1).map((screenshot, index) => (
              <img
                key={index}
                src={screenshot}
                alt={`${name} screenshot ${index + 2}`}
                className="w-24 h-16 object-cover rounded cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="mt-8">
        <Tabs defaultValue="features">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          {/* Features tab */}
          <TabsContent value="features" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{feature}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Reviews tab */}
          <TabsContent value="reviews" className="mt-4">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Reviews</h3>
                <Button variant="outline" size="sm">
                  Write a Review
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{rating.toFixed(1)}</div>
                  <div className="mt-1">{renderStars(rating)}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {reviews.length} reviews
                  </div>
                </div>

                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => Math.floor(r.rating) === star,
                    ).length;
                    const percentage = (count / reviews.length) * 100;

                    return (
                      <div key={star} className="flex items-center mb-1">
                        <div className="w-8 text-sm text-right mr-2">
                          {star} ★
                        </div>
                        <Progress value={percentage} className="h-2 flex-1" />
                        <div className="w-8 text-sm text-right ml-2">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <img
                          src={review.avatar}
                          alt={review.author}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <CardTitle className="text-base">
                            {review.author}
                          </CardTitle>
                          <CardDescription>{review.date}</CardDescription>
                        </div>
                      </div>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Version History tab */}
          <TabsContent value="versions" className="mt-4">
            <div className="space-y-4">
              {versionHistory.map((version, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">
                        Version {version.version}
                      </CardTitle>
                      <CardDescription>{version.date}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {version.changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Requirements tab */}
          <TabsContent value="requirements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
                <CardDescription>
                  Make sure your system meets these requirements before
                  installing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Compatibility</h4>
                    <p>{compatibility}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Required Plugins</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="mr-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Check Compatibility
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PluginDetails;
