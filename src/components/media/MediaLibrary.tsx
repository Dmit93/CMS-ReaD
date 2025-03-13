import React, { useState } from "react";
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  MoreVertical,
  Trash2,
  Download,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "audio" | "archive";
  url: string;
  size: string;
  dimensions?: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
}

interface MediaLibraryProps {
  initialMedia?: MediaItem[];
}

const MediaLibrary = ({ initialMedia }: MediaLibraryProps) => {
  const defaultMedia: MediaItem[] = [
    {
      id: "1",
      name: "hero-banner.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
      size: "1.2 MB",
      dimensions: "1920 × 1080",
      uploadedBy: "John Doe",
      uploadDate: "2023-06-15",
      tags: ["banner", "homepage"],
    },
    {
      id: "2",
      name: "product-demo.mp4",
      type: "video",
      url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
      size: "24.5 MB",
      dimensions: "1280 × 720",
      uploadedBy: "Jane Smith",
      uploadDate: "2023-06-14",
      tags: ["product", "demo"],
    },
    {
      id: "3",
      name: "annual-report-2023.pdf",
      type: "document",
      url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
      size: "3.7 MB",
      uploadedBy: "Mike Johnson",
      uploadDate: "2023-06-13",
      tags: ["report", "finance"],
    },
    {
      id: "4",
      name: "company-logo.svg",
      type: "image",
      url: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=800&q=80",
      size: "256 KB",
      dimensions: "512 × 512",
      uploadedBy: "Sarah Williams",
      uploadDate: "2023-06-12",
      tags: ["logo", "branding"],
    },
    {
      id: "5",
      name: "podcast-episode-12.mp3",
      type: "audio",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      size: "18.3 MB",
      uploadedBy: "Alex Turner",
      uploadDate: "2023-06-11",
      tags: ["podcast", "interview"],
    },
    {
      id: "6",
      name: "product-photos.zip",
      type: "archive",
      url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
      size: "45.8 MB",
      uploadedBy: "Emma Davis",
      uploadDate: "2023-06-10",
      tags: ["product", "photos"],
    },
    {
      id: "7",
      name: "team-photo.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
      size: "2.4 MB",
      dimensions: "2048 × 1365",
      uploadedBy: "John Doe",
      uploadDate: "2023-06-09",
      tags: ["team", "about"],
    },
    {
      id: "8",
      name: "user-guide.pdf",
      type: "document",
      url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
      size: "5.2 MB",
      uploadedBy: "Jane Smith",
      uploadDate: "2023-06-08",
      tags: ["guide", "documentation"],
    },
  ];

  const [media, setMedia] = useState<MediaItem[]>(initialMedia || defaultMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  const filteredMedia = media
    .filter(
      (item) =>
        (selectedType === "all" || item.type === selectedType) &&
        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          )),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-asc":
          return (
            new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          );
        case "date-desc":
        default:
          return (
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
      }
    });

  const handleDeleteMedia = (id: string) => {
    setMedia(media.filter((item) => item.id !== id));
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Film className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "audio":
        return <Music className="h-5 w-5" />;
      case "archive":
        return <Archive className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "video":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "document":
        return "bg-green-50 text-green-700 border-green-200";
      case "audio":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "archive":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">
              Manage your media files and assets
            </p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="archive">Archives</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Media</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-100">
                          {getMediaIcon(item.type)}
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className="font-medium truncate"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={getMediaTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>{item.size}</div>
                          <div>{item.uploadDate}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Type</th>
                      <th className="py-3 px-4 text-left font-medium">Size</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Uploaded By
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedia.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded bg-muted">
                              {item.type === "image" ? (
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="object-cover w-full h-full rounded"
                                />
                              ) : (
                                getMediaIcon(item.type)
                              )}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={getMediaTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{item.size}</td>
                        <td className="py-3 px-4">{item.uploadedBy}</td>
                        <td className="py-3 px-4">{item.uploadDate}</td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteMedia(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            {/* Similar content as "all" but filtered for images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia
                .filter((item) => item.type === "image")
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className="font-medium truncate"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={getMediaTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>{item.size}</div>
                          <div>{item.uploadDate}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Other tab contents would be similar */}
          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia
                .filter((item) => item.type === "video")
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {/* Video card content */}
                    <div className="relative aspect-video bg-muted flex items-center justify-center">
                      <Film className="h-10 w-10 text-muted-foreground" />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className="font-medium truncate"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={getMediaTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>{item.size}</div>
                          <div>{item.uploadDate}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            {/* Documents tab content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia
                .filter((item) => item.type === "document")
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted flex items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className="font-medium truncate"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={getMediaTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>{item.size}</div>
                          <div>{item.uploadDate}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            {/* Audio tab content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia
                .filter((item) => item.type === "audio")
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted flex items-center justify-center">
                      <Music className="h-10 w-10 text-muted-foreground" />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMedia(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className="font-medium truncate"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={getMediaTypeColor(item.type)}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>{item.size}</div>
                          <div>{item.uploadDate}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MediaLibrary;
