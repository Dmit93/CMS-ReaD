import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import ContentEditor from "@/components/content/ContentEditor";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getContentById, ContentItem } from "@/lib/content";

const ContentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const contentData = await getContentById(id);
        setContent(contentData);
      } catch (err) {
        console.error("Error loading content:", err);
        setError("Failed to load content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [id]);

  return (
    <>
      <Helmet>
        <title>{id ? "Edit Content" : "Create Content"} - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading content...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <ContentEditor initialData={content || undefined} />
        )}
      </DashboardLayout>
    </>
  );
};

export default ContentEditPage;
