import React, { useState, useEffect } from "react";
import ContentManagement from "./ContentManagement";
import events from "@/lib/events";

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

const ContentManagementWithEvents = () => {
  const [content, setContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    // Load initial content
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
      // Add more default content items as needed
    ];

    setContent(defaultContent);
  }, []);

  // Handle content creation
  const handleCreateContent = (newContent: ContentItem) => {
    // Emit before create event
    events.emit("content:beforeCreate", newContent);

    // Add the new content item
    const updatedContent = [...content, newContent];
    setContent(updatedContent);

    // Emit after create event
    events.emit("content:afterCreate", newContent);
  };

  // Handle content update
  const handleUpdateContent = (
    id: string,
    updatedContent: Partial<ContentItem>,
  ) => {
    // Find the content item to update
    const contentItem = content.find((item) => item.id === id);

    if (contentItem) {
      // Emit before update event
      events.emit("content:beforeUpdate", contentItem, {
        ...contentItem,
        ...updatedContent,
      });

      // Update the content item
      const newContent = content.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedContent,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : item,
      );

      setContent(newContent);

      // Emit after update event
      events.emit(
        "content:afterUpdate",
        newContent.find((item) => item.id === id),
      );
    }
  };

  // Handle content deletion
  const handleDeleteContent = (id: string) => {
    // Emit before delete event
    events.emit("content:beforeDelete", id);

    // Remove the content item
    const newContent = content.filter((item) => item.id !== id);
    setContent(newContent);

    // Emit after delete event
    events.emit("content:afterDelete", id);
  };

  // Handle status change (which is a type of update)
  const handleStatusChange = (
    id: string,
    newStatus: "published" | "draft" | "scheduled" | "archived",
  ) => {
    handleUpdateContent(id, { status: newStatus });
  };

  return (
    <ContentManagement
      initialContent={content}
      // In a real implementation, you would pass these handlers to the ContentManagement component
      // and modify it to use them instead of its internal state management
    />
  );
};

export default ContentManagementWithEvents;
