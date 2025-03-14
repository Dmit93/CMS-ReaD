import { prisma } from "../db";
import type { SystemSetting, UserSetting } from "@prisma/client";

export class SettingsService {
  /**
   * Get a system setting by key
   */
  static async getSystemSetting(key: string): Promise<string | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    return setting?.value || null;
  }

  /**
   * Set a system setting
   */
  static async setSystemSetting(
    key: string,
    value: string,
  ): Promise<SystemSetting> {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  /**
   * Get all system settings
   */
  static async getAllSystemSettings(): Promise<SystemSetting[]> {
    return prisma.systemSetting.findMany();
  }

  /**
   * Get a user setting
   */
  static async getUserSetting(
    userId: string,
    key: string,
  ): Promise<string | null> {
    const setting = await prisma.userSetting.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    return setting?.value || null;
  }

  /**
   * Set a user setting
   */
  static async setUserSetting(
    userId: string,
    key: string,
    value: string,
  ): Promise<UserSetting> {
    return prisma.userSetting.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      update: { value },
      create: { userId, key, value },
    });
  }

  /**
   * Get all settings for a user
   */
  static async getAllUserSettings(userId: string): Promise<UserSetting[]> {
    return prisma.userSetting.findMany({
      where: { userId },
    });
  }

  /**
   * Delete a user setting
   */
  static async deleteUserSetting(
    userId: string,
    key: string,
  ): Promise<UserSetting> {
    return prisma.userSetting.delete({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });
  }

  /**
   * Delete a system setting
   */
  static async deleteSystemSetting(key: string): Promise<SystemSetting> {
    return prisma.systemSetting.delete({
      where: { key },
    });
  }
}
