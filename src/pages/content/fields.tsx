import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ContentFieldsManager from "@/components/content/ContentFieldsManager";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAllContentFields, ContentFieldDefinition } from "@/lib/content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ContentFieldsPage = () => {
  const [fields, setFields] = useState<ContentFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFields = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fieldsData = await getAllContentFields();
      setFields(fieldsData);
    } catch (err) {
      console.error("Error loading content fields:", err);
      setError("Failed to load content fields. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  return (
    <>
      <Helmet>
        <title>Content Fields - CMS Platform</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Content Fields</h1>
            <p className="text-muted-foreground">
              Define custom fields for your content types
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Field Definitions</CardTitle>
              <CardDescription>
                Create and manage the fields that can be used across different
                content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <p>Loading fields...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-destructive">
                  <p>{error}</p>
                </div>
              ) : (
                <ContentFieldsManager
                  fields={fields}
                  onFieldsChange={loadFields}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ContentFieldsPage;
