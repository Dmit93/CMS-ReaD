import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ContentDatabase } from "@/lib/services/content-database";
import { SEOMetadataPanel } from "../../../plugins/seo-toolkit/components";
import events from "@/lib/events";

const contentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  type: z.string().min(1, { message: "Content type is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  content: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

interface ContentEditorProps {
  contentId?: string;
  onSave?: (contentId: string) => void;
  onCancel?: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  contentId,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: "page",
      status: "draft",
      content: "",
    },
  });

  useEffect(() => {
    if (contentId) {
      loadContent(contentId);
    }
  }, [contentId]);

  const loadContent = async (id: string) => {
    setLoading(true);
    try {
      const contentData = await ContentDatabase.getContentById(id);
      if (contentData) {
        form.reset({
          title: contentData.title,
          slug: contentData.slug,
          type: contentData.type,
          status: contentData.status,
          content: contentData.content || "",
        });

        // Load SEO metadata
        const metadata = await ContentDatabase.getContentMetadata(
          id,
          "seo-toolkit",
        );
        if (metadata && metadata.length > 0) {
          try {
            const seoMetadata = JSON.parse(metadata[0].metadata);
            setSeoData(seoMetadata);
          } catch (e) {
            console.error("Error parsing SEO metadata:", e);
          }
        }

        setContent(contentData);
      }
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSEOChange = (updatedContent: any) => {
    setSeoData(updatedContent.seo);
  };

  const onSubmit = async (values: ContentFormValues) => {
    setSaving(true);
    try {
      // Emit before create/update event
      events.emit(contentId ? "content:beforeUpdate" : "content:beforeCreate", {
        ...values,
        id: contentId,
        seo: seoData,
      });

      // Save content
      const savedContent = await ContentDatabase.saveContent({
        id: contentId,
        ...values,
        authorId: "current-user", // In a real app, this would be the current user's ID
      });

      if (savedContent && seoData) {
        // Save SEO metadata
        await ContentDatabase.saveContentMetadata({
          contentId: savedContent.id,
          pluginId: "seo-toolkit",
          metadata: seoData,
        });
      }

      // Emit after create/update event
      events.emit(
        contentId ? "content:afterUpdate" : "content:afterCreate",
        savedContent,
      );

      if (onSave && savedContent) {
        onSave(savedContent.id);
      }
    } catch (error) {
      console.error("Failed to save content:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading content...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {contentId ? "Edit Content" : "Create New Content"}
          </h1>
          <p className="text-muted-foreground">
            {contentId
              ? "Update existing content"
              : "Create a new content item"}
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="enter-slug" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL-friendly identifier for this content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="page">Page</SelectItem>
                              <SelectItem value="post">Blog Post</SelectItem>
                              <SelectItem value="form">Form</SelectItem>
                              <SelectItem value="product">Product</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">
                                Published
                              </SelectItem>
                              <SelectItem value="scheduled">
                                Scheduled
                              </SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter content here..."
                              className="min-h-[300px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            HTML content is supported
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Content"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <Tabs defaultValue="seo">
            <TabsList className="w-full">
              <TabsTrigger value="seo" className="flex-1">
                SEO
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="seo">
              <Card>
                <CardContent className="pt-6">
                  <SEOMetadataPanel
                    content={{
                      ...form.getValues(),
                      id: contentId,
                      seo: seoData,
                    }}
                    onChange={handleSEOChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardContent className="pt-6">
                  <p>Additional settings will go here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
