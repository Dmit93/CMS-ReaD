import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, ArrowLeft, Eye, Clock, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ContentItem,
  ContentStatus,
  ContentFieldDefinition,
  getContentById,
  createContent,
  updateContent,
} from "@/lib/content";

// Define the form schema
const contentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z
    .string()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
  type: z.string().min(1, { message: "Content type is required" }),
  status: z.enum(["published", "draft", "scheduled", "archived"]),
  content: z.string().optional(),
  // We'll add dynamic fields based on content type later
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

interface ContentEditorProps {
  initialData?: ContentItem;
  contentFields?: ContentFieldDefinition[];
  onSave?: (data: ContentItem) => void;
}

const ContentEditor = ({
  initialData,
  contentFields = [],
  onSave,
}: ContentEditorProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize form with default values or existing content data
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      type: initialData?.type || "Page",
      status: (initialData?.status as ContentStatus) || "draft",
      content: initialData?.content || "",
    },
  });

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    // Only auto-generate slug if it's a new content item and slug is empty
    if (!initialData && !form.getValues("slug")) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchTitle, form, initialData]);

  // Handle form submission
  const onSubmit = async (values: ContentFormValues) => {
    setIsLoading(true);
    try {
      let savedContent;

      if (id) {
        // Update existing content
        savedContent = await updateContent(id, values);
      } else {
        // Create new content
        savedContent = await createContent({
          ...values,
          author: "Current User", // This would come from auth context in a real app
        });
      }

      if (onSave) {
        onSave(savedContent);
      }

      navigate("/content");
    } catch (error) {
      console.error("Error saving content:", error);
      // Here you would show an error notification
    } finally {
      setIsLoading(false);
    }
  };

  // Handle content deletion
  const handleDelete = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // This would call your delete API
      // await deleteContent(id);
      navigate("/content");
    } catch (error) {
      console.error("Error deleting content:", error);
      // Here you would show an error notification
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/content")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </Button>

          <div className="flex items-center gap-2">
            {id && (
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this content item and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button
              type="submit"
              form="content-form"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{id ? "Edit Content" : "Create New Content"}</CardTitle>
            <CardDescription>
              {id
                ? "Make changes to your content item"
                : "Create a new content item for your website"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="content-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title of your content as it will appear to users.
                        </FormDescription>
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
                          The URL-friendly version of the title. Used in the
                          page URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <SelectItem value="Page">Page</SelectItem>
                            <SelectItem value="Blog Post">Blog Post</SelectItem>
                            <SelectItem value="News">News</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of content determines its structure and where
                          it appears.
                        </FormDescription>
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
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The current status of this content.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
                    <TabsTrigger value="settings">
                      Advanced Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your content here..."
                              className="min-h-[300px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The main content of your page. Supports markdown
                            formatting.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 pt-4">
                    {/* SEO fields would go here */}
                    <p className="text-muted-foreground">
                      SEO and metadata fields will be added here.
                    </p>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 pt-4">
                    {/* Advanced settings would go here */}
                    <p className="text-muted-foreground">
                      Advanced settings will be added here.
                    </p>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {initialData ? (
                <span>
                  Last updated:{" "}
                  {new Date(initialData.updatedAt).toLocaleString()}
                </span>
              ) : (
                <span>New content</span>
              )}
            </div>
            <Button
              type="submit"
              form="content-form"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ContentEditor;
