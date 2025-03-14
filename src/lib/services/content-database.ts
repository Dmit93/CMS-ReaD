import prisma from "./database";
import { Content, ContentMetadata } from "@prisma/client";

export interface ContentData {
  id?: string;
  title: string;
  slug: string;
  type: string;
  status?: string;
  content?: string;
  authorId: string;
}

export interface MetadataData {
  contentId: string;
  pluginId: string;
  metadata: Record<string, any>;
}

export class ContentDatabase {
  /**
   * Get all content items with optional filtering
   */
  static async getAllContent(filters?: {
    type?: string;
    status?: string;
    authorId?: string;
  }): Promise<Content[]> {
    try {
      return await prisma.content.findMany({
        where: {
          ...(filters?.type ? { type: filters.type } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
          ...(filters?.authorId ? { authorId: filters.authorId } : {}),
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } catch (error) {
      console.error("Failed to get content from database:", error);
      return [];
    }
  }

  /**
   * Get content by ID
   */
  static async getContentById(id: string): Promise<Content | null> {
    try {
      return await prisma.content.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error(`Failed to get content ${id} from database:`, error);
      return null;
    }
  }

  /**
   * Get content by slug
   */
  static async getContentBySlug(slug: string): Promise<Content | null> {
    try {
      return await prisma.content.findUnique({
        where: { slug },
      });
    } catch (error) {
      console.error(
        `Failed to get content with slug ${slug} from database:`,
        error,
      );
      return null;
    }
  }

  /**
   * Create or update content
   */
  static async saveContent(contentData: ContentData): Promise<Content | null> {
    try {
      if (contentData.id) {
        // Update existing content
        return await prisma.content.update({
          where: { id: contentData.id },
          data: {
            title: contentData.title,
            slug: contentData.slug,
            type: contentData.type,
            status: contentData.status,
            content: contentData.content,
            authorId: contentData.authorId,
          },
        });
      } else {
        // Create new content
        return await prisma.content.create({
          data: {
            title: contentData.title,
            slug: contentData.slug,
            type: contentData.type,
            status: contentData.status || "draft",
            content: contentData.content,
            authorId: contentData.authorId,
          },
        });
      }
    } catch (error) {
      console.error("Failed to save content to database:", error);
      return null;
    }
  }

  /**
   * Delete content
   */
  static async deleteContent(id: string): Promise<boolean> {
    try {
      await prisma.content.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete content ${id} from database:`, error);
      return false;
    }
  }

  /**
   * Get metadata for content
   */
  static async getContentMetadata(
    contentId: string,
    pluginId?: string,
  ): Promise<ContentMetadata[]> {
    try {
      return await prisma.contentMetadata.findMany({
        where: {
          contentId,
          ...(pluginId ? { pluginId } : {}),
        },
      });
    } catch (error) {
      console.error(`Failed to get metadata for content ${contentId}:`, error);
      return [];
    }
  }

  /**
   * Save metadata for content
   */
  static async saveContentMetadata(
    metadataData: MetadataData,
  ): Promise<ContentMetadata | null> {
    try {
      // Check if metadata already exists
      const existingMetadata = await prisma.contentMetadata.findUnique({
        where: {
          contentId_pluginId: {
            contentId: metadataData.contentId,
            pluginId: metadataData.pluginId,
          },
        },
      });

      const metadataString = JSON.stringify(metadataData.metadata);

      if (existingMetadata) {
        // Update existing metadata
        return await prisma.contentMetadata.update({
          where: {
            id: existingMetadata.id,
          },
          data: {
            metadata: metadataString,
          },
        });
      } else {
        // Create new metadata
        return await prisma.contentMetadata.create({
          data: {
            contentId: metadataData.contentId,
            pluginId: metadataData.pluginId,
            metadata: metadataString,
          },
        });
      }
    } catch (error) {
      console.error("Failed to save content metadata to database:", error);
      return null;
    }
  }

  /**
   * Delete metadata for content
   */
  static async deleteContentMetadata(
    contentId: string,
    pluginId?: string,
  ): Promise<boolean> {
    try {
      await prisma.contentMetadata.deleteMany({
        where: {
          contentId,
          ...(pluginId ? { pluginId } : {}),
        },
      });
      return true;
    } catch (error) {
      console.error(
        `Failed to delete metadata for content ${contentId}:`,
        error,
      );
      return false;
    }
  }
}
