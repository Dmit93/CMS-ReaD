import { prisma } from "./db";

export type ContentStatus = "published" | "draft" | "scheduled" | "archived";

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: ContentStatus;
  author: string;
  content?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ContentFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: Record<string, any>;
}

export async function getAllContent(): Promise<ContentItem[]> {
  return prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  return prisma.content.findUnique({
    where: { id },
  });
}

export async function getContentBySlug(
  slug: string,
): Promise<ContentItem | null> {
  return prisma.content.findUnique({
    where: { slug },
  });
}

export async function createContent(
  data: Omit<ContentItem, "id" | "createdAt" | "updatedAt">,
): Promise<ContentItem> {
  return prisma.content.create({
    data: {
      ...data,
      publishedAt: data.status === "published" ? new Date() : null,
    },
  });
}

export async function updateContent(
  id: string,
  data: Partial<Omit<ContentItem, "id" | "createdAt" | "updatedAt">>,
): Promise<ContentItem> {
  // If status is being changed to published and there's no publishedAt date, set it
  const updateData = { ...data };
  if (data.status === "published") {
    const existingContent = await prisma.content.findUnique({ where: { id } });
    if (!existingContent?.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  return prisma.content.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteContent(id: string): Promise<ContentItem> {
  return prisma.content.delete({
    where: { id },
  });
}

export async function getAllContentFields(): Promise<ContentFieldDefinition[]> {
  return prisma.contentField.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createContentField(
  data: Omit<ContentFieldDefinition, "id" | "createdAt" | "updatedAt">,
): Promise<ContentFieldDefinition> {
  return prisma.contentField.create({
    data,
  });
}

export async function updateContentField(
  id: string,
  data: Partial<Omit<ContentFieldDefinition, "id" | "createdAt" | "updatedAt">>,
): Promise<ContentFieldDefinition> {
  return prisma.contentField.update({
    where: { id },
    data,
  });
}

export async function deleteContentField(
  id: string,
): Promise<ContentFieldDefinition> {
  return prisma.contentField.delete({
    where: { id },
  });
}
