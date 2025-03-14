import { prisma } from "../db";
import events from "../events";
import type { Content } from "@prisma/client";

export interface ContentCreateInput {
  title: string;
  slug: string;
  type: string;
  status?: string;
  content?: string;
  metadata?: string;
  authorId: string;
}

export interface ContentUpdateInput {
  title?: string;
  slug?: string;
  type?: string;
  status?: string;
  content?: string;
  metadata?: string;
}

export class ContentService {
  /**
   * Create a new content item
   */
  static async create(data: ContentCreateInput): Promise<Content> {
    // Emit before create event
    events.emit("content:beforeCreate", data);

    const content = await prisma.content.create({
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        status: data.status || "draft",
        content: data.content,
        metadata: data.metadata,
        authorId: data.authorId,
      },
    });

    // Emit after create event
    events.emit("content:afterCreate", content);

    return content;
  }

  /**
   * Get content by ID
   */
  static async getById(id: string): Promise<Content | null> {
    return prisma.content.findUnique({
      where: { id },
    });
  }

  /**
   * Get content by slug
   */
  static async getBySlug(slug: string): Promise<Content | null> {
    return prisma.content.findUnique({
      where: { slug },
    });
  }

  /**
   * Get all content items with optional filtering
   */
  static async getAll({
    type,
    status,
    authorId,
  }: {
    type?: string;
    status?: string;
    authorId?: string;
  } = {}): Promise<Content[]> {
    return prisma.content.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(authorId ? { authorId } : {}),
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  /**
   * Update content
   */
  static async update(id: string, data: ContentUpdateInput): Promise<Content> {
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      throw new Error(`Content with ID ${id} not found`);
    }

    // Emit before update event
    events.emit("content:beforeUpdate", existingContent, data);

    const updatedContent = await prisma.content.update({
      where: { id },
      data,
    });

    // Emit after update event
    events.emit("content:afterUpdate", updatedContent);

    return updatedContent;
  }

  /**
   * Delete content
   */
  static async delete(id: string): Promise<Content> {
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      throw new Error(`Content with ID ${id} not found`);
    }

    // Emit before delete event
    events.emit("content:beforeDelete", id);

    const deletedContent = await prisma.content.delete({
      where: { id },
    });

    // Emit after delete event
    events.emit("content:afterDelete", id);

    return deletedContent;
  }
}
