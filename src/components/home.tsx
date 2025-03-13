import React from "react";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardSummary from "./dashboard/DashboardSummary";
import { Helmet } from "react-helmet";

interface HomeProps {
  username?: string;
  userAvatar?: string;
  notificationCount?: number;
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

const Home = ({
  username = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  notificationCount = 3,
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
}: HomeProps) => {
  return (
    <>
      <Helmet>
        <title>Dashboard | CMS Platform</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <DashboardLayout
          username={username}
          userAvatar={userAvatar}
          notificationCount={notificationCount}
        >
          <DashboardSummary
            recentContent={recentContent}
            recentMedia={recentMedia}
            recentUsers={recentUsers}
            stats={stats}
          />
        </DashboardLayout>
      </div>
    </>
  );
};

export default Home;
