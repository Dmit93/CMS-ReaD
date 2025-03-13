import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Users,
  FileText,
  Image,
  Package,
  Settings,
} from "lucide-react";

interface DashboardSummaryProps {
  recentContent?: {
    id: string;
    title: string;
    type: string;
    date: string;
  }[];
  recentMedia?: {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
  }[];
  recentUsers?: {
    id: string;
    name: string;
    email: string;
    role: string;
    date: string;
  }[];
  stats?: {
    content: number;
    media: number;
    users: number;
    plugins: number;
  };
}

const DashboardSummary = ({
  recentContent = [
    { id: "1", title: "Welcome Page", type: "Page", date: "2023-06-15" },
    { id: "2", title: "About Us", type: "Page", date: "2023-06-14" },
    { id: "3", title: "Latest News", type: "Blog Post", date: "2023-06-13" },
    { id: "4", title: "Contact Form", type: "Form", date: "2023-06-12" },
  ],
  recentMedia = [
    {
      id: "1",
      name: "hero-image.jpg",
      type: "Image",
      size: "1.2MB",
      date: "2023-06-15",
    },
    {
      id: "2",
      name: "product-demo.mp4",
      type: "Video",
      size: "8.5MB",
      date: "2023-06-14",
    },
    {
      id: "3",
      name: "brochure.pdf",
      type: "Document",
      size: "3.7MB",
      date: "2023-06-13",
    },
    {
      id: "4",
      name: "logo.svg",
      type: "Image",
      size: "0.5MB",
      date: "2023-06-12",
    },
  ],
  recentUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      date: "2023-06-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Editor",
      date: "2023-06-14",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Author",
      date: "2023-06-13",
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "Contributor",
      date: "2023-06-12",
    },
  ],
  stats = {
    content: 42,
    media: 156,
    users: 18,
    plugins: 7,
  },
}: DashboardSummaryProps) => {
  return (
    <div className="p-6 bg-background w-full">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.content}</div>
            <p className="text-xs text-muted-foreground">items in your CMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.media}</div>
            <p className="text-xs text-muted-foreground">
              files in your library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plugins</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plugins}</div>
            <p className="text-xs text-muted-foreground">
              installed extensions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Content Activity</CardTitle>
            <CardDescription>
              Content creation and updates over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center border border-dashed rounded-md">
              <LineChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Activity Chart</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Types</CardTitle>
            <CardDescription>Distribution by content type</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center border border-dashed rounded-md">
              <PieChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Content Distribution
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>
              Recently created or updated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentContent.map((item) => (
                <li key={item.id} className="flex items-center">
                  <div className="mr-2 h-9 w-9 flex items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} • {item.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View All Content
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Media</CardTitle>
            <CardDescription>Recently uploaded media files</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentMedia.map((item) => (
                <li key={item.id} className="flex items-center">
                  <div className="mr-2 h-9 w-9 flex items-center justify-center rounded-full bg-primary/10">
                    {item.type === "Image" ? (
                      <Image className="h-5 w-5 text-primary" />
                    ) : item.type === "Video" ? (
                      <Activity className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} • {item.size} • {item.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Media Library
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Recently active users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentUsers.map((item) => (
                <li key={item.id} className="flex items-center">
                  <div className="mr-2 h-9 w-9 overflow-hidden rounded-full bg-primary/10">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.role} • {item.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Manage Users
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSummary;
