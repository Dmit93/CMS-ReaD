import { prisma } from "../db";
import events from "../events";
import type { Media } from "@prisma/client";

export interface MediaCreateInput {
  name: string;
  type: string;
  url: string;
  size: number;
  dimensions?: string;
  uploadedBy: string;
  tags?: string;
}

export interface MediaUpdateInput {
  name?: string;
  type?: string;
  url?: string;
  size?: number;
  dimensions?: string;
  tags?: string;
}

export class MediaService {
  /**
   * Create a new media item
   */
  static async create(data: MediaCreateInput): Promise<Media> {
    // Emit before upload event
    events.emit("media:beforeUpload", data);

    const media = await prisma.media.create({
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        size: data.size,
        dimensions: data.dimensions,
        uploadedBy: data.uploadedBy,
        tags: data.tags,
      },
    });

    // Emit after upload event
    events.emit("media:afterUpload", media);

    return media;
  }

  /**
   * Get media by ID
   */
  static async getById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({
      where: { id },
    });
  }

  /**
   * Get all media items with optional filtering
   */
  static async getAll({
    type,
    uploadedBy,
  }: {
    type?: string;
    uploadedBy?: string;
  } = {}): Promise<Media[]> {
    return prisma.media.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(uploadedBy ? { uploadedBy } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update media
   */
  static async update(id: string, data: MediaUpdateInput): Promise<Media> {
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    });

    if (!existingMedia) {
      throw new Error(`Media with ID ${id} not found`);
    }

    const updatedMedia = await prisma.media.update({
      where: { id },
      data,
    });

    return updatedMedia;
  }

  /**
   * Delete media
   */
  static async delete(id: string): Promise<Media> {
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    });

    if (!existingMedia) {
      throw new Error(`Media with ID ${id} not found`);
    }

    // Emit before delete event
    events.emit("media:beforeDelete", id);

    const deletedMedia = await prisma.media.delete({
      where: { id },
    });

    // Emit after delete event
    events.emit("media:afterDelete", id);

    return deletedMedia;
  }

  /**
   * Search media by name or tags
   */
  static async search(query: string): Promise<Media[]> {
    return prisma.media.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            tags: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
