import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Copy,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: "published" | "draft" | "scheduled" | "archived";
  author: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface ContentManagementProps {
  initialContent?: ContentItem[];
}

const ContentManagement = ({ initialContent }: ContentManagementProps) => {
  const defaultContent: ContentItem[] = [
    {
      id: "1",
      title: "Welcome to Our Website",
      type: "Page",
      status: "published",
      author: "John Doe",
      createdAt: "2023-06-15",
      updatedAt: "2023-06-15",
      slug: "/welcome",
    },
    {
      id: "2",
      title: "About Our Company",
      type: "Page",
      status: "published",
      author: "Jane Smith",
      createdAt: "2023-06-14",
      updatedAt: "2023-06-14",
      slug: "/about",
    },
    {
      id: "3",
      title: "Latest Product Announcement",
      type: "Blog Post",
      status: "published",
      author: "Mike Johnson",
      createdAt: "2023-06-13",
      updatedAt: "2023-06-13",
      slug: "/blog/product-announcement",
    },
    {
      id: "4",
      title: "Upcoming Events",
      type: "Page",
      status: "draft",
      author: "Sarah Williams",
      createdAt: "2023-06-12",
      updatedAt: "2023-06-12",
      slug: "/events",
    },
    {
      id: "5",
      title: "Contact Form",
      type: "Form",
      status: "published",
      author: "John Doe",
      createdAt: "2023-06-11",
      updatedAt: "2023-06-11",
      slug: "/contact",
    },
    {
      id: "6",
      title: "Product Catalog",
      type: "Page",
      status: "scheduled",
      author: "Jane Smith",
      createdAt: "2023-06-10",
      updatedAt: "2023-06-10",
      slug: "/products",
    },
    {
      id: "7",
      title: "Customer Testimonials",
      type: "Page",
      status: "published",
      author: "Mike Johnson",
      createdAt: "2023-06-09",
      updatedAt: "2023-06-09",
      slug: "/testimonials",
    },
    {
      id: "8",
      title: "Privacy Policy",
      type: "Page",
      status: "published",
      author: "Sarah Williams",
      createdAt: "2023-06-08",
      updatedAt: "2023-06-08",
      slug: "/privacy-policy",
    },
    {
      id: "9",
      title: "How to Get Started",
      type: "Blog Post",
      status: "draft",
      author: "John Doe",
      createdAt: "2023-06-07",
      updatedAt: "2023-06-07",
      slug: "/blog/getting-started",
    },
    {
      id: "10",
      title: "Old Promotion Page",
      type: "Page",
      status: "archived",
      author: "Jane Smith",
      createdAt: "2023-05-15",
      updatedAt: "2023-05-15",
      slug: "/promotions/spring-2023",
    },
  ];

  const [content, setContent] = useState<ContentItem[]>(
    initialContent || defaultContent,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredContent = content.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      (typeFilter === "all" || item.type === typeFilter) &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleDeleteContent = (id: string) => {
    setContent(content.filter((item) => item.id !== id));
  };

  const handleStatusChange = (
    id: string,
    newStatus: "published" | "draft" | "scheduled" | "archived",
  ) => {
    setContent(
      content.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : item,
      ),
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Scheduled
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Archived
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your website content
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Page">Page</SelectItem>
                <SelectItem value="Blog Post">Blog Post</SelectItem>
                <SelectItem value="Form">Form</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>{item.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.status !== "published" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(item.id, "published")
                            }
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                        {item.status !== "draft" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(item.id, "draft")}
                          >
                            Move to Draft
                          </DropdownMenuItem>
                        )}
                        {item.status !== "archived" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(item.id, "archived")
                            }
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteContent(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredContent.length} of {content.length} items
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
