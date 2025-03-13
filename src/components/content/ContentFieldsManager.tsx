import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import {
  ContentFieldDefinition,
  createContentField,
  updateContentField,
  deleteContentField,
} from "@/lib/content";

// Define the form schema
const fieldFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Field name is required" })
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
      message:
        "Field name must start with a letter and contain only letters, numbers, and underscores",
    }),
  label: z.string().min(1, { message: "Display label is required" }),
  type: z.string().min(1, { message: "Field type is required" }),
  required: z.boolean().default(false),
  options: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldFormSchema>;

interface ContentFieldsManagerProps {
  fields: ContentFieldDefinition[];
  onFieldsChange?: () => void;
}

const ContentFieldsManager = ({
  fields = [],
  onFieldsChange,
}: ContentFieldsManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] =
    useState<ContentFieldDefinition | null>(null);

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "text",
      required: false,
      options: "",
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: "",
    });
    setEditingField(null);
  };

  const openEditDialog = (field: ContentFieldDefinition) => {
    setEditingField(field);
    form.reset({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options ? JSON.stringify(field.options, null, 2) : "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteField = async (id: string) => {
    try {
      await deleteContentField(id);
      if (onFieldsChange) onFieldsChange();
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const onSubmit = async (values: FieldFormValues) => {
    try {
      // Parse options JSON if provided
      let parsedOptions = undefined;
      if (values.options) {
        try {
          parsedOptions = JSON.parse(values.options);
        } catch (e) {
          form.setError("options", {
            type: "manual",
            message: "Invalid JSON format",
          });
          return;
        }
      }

      const fieldData = {
        name: values.name,
        label: values.label,
        type: values.type,
        required: values.required,
        options: parsedOptions,
      };

      if (editingField) {
        await updateContentField(editingField.id, fieldData);
      } else {
        await createContentField(fieldData);
      }

      resetForm();
      setIsDialogOpen(false);
      if (onFieldsChange) onFieldsChange();
    } catch (error) {
      console.error("Error saving field:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Content Fields</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingField ? "Edit Field" : "Add New Field"}
              </DialogTitle>
              <DialogDescription>
                {editingField
                  ? "Update this content field's properties"
                  : "Define a new field for your content types"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="field_name"
                            {...field}
                            disabled={!!editingField}
                          />
                        </FormControl>
                        <FormDescription>
                          The technical name used in the database
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Display Label" {...field} />
                        </FormControl>
                        <FormDescription>
                          How the field appears to content editors
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="relation">Relation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of input field to display
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-8">
                        <div className="space-y-0.5">
                          <FormLabel>Required Field</FormLabel>
                          <FormDescription>
                            Content cannot be saved without this field
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Options (JSON)</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                          placeholder='{"placeholder": "Enter value", "default": ""} or for select: {"options": ["Option 1", "Option 2"]})'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional configuration for this field in JSON format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {editingField ? "Update Field" : "Add Field"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No custom fields defined yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Field
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-mono text-sm">
                    {field.name}
                  </TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{field.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {field.required ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ContentFieldsManager;
