import { prisma } from "../db";
import events from "../events";
import type { User } from "@prisma/client";

export interface UserCreateInput {
  email: string;
  name?: string;
  password: string;
  role?: string;
  status?: string;
}

export interface UserUpdateInput {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
  status?: string;
  lastLogin?: Date;
}

export class UserService {
  /**
   * Create a new user
   */
  static async create(data: UserCreateInput): Promise<User> {
    // In a real app, you would hash the password here
    // const hashedPassword = await bcrypt.hash(data.password, 10);

    // Emit before create event
    events.emit("user:beforeCreate", data);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password, // Should be hashedPassword in production
        role: data.role || "user",
        status: data.status || "pending",
      },
    });

    // Emit after create event
    events.emit("user:afterCreate", user);

    return user;
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by email
   */
  static async getByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get all users with optional filtering
   */
  static async getAll({
    role,
    status,
  }: {
    role?: string;
    status?: string;
  } = {}): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update user
   */
  static async update(id: string, data: UserUpdateInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Emit before update event
    events.emit("user:beforeUpdate", existingUser, data);

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    // Emit after update event
    events.emit("user:afterUpdate", updatedUser);

    return updatedUser;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Emit before delete event
    events.emit("user:beforeDelete", id);

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    // Emit after delete event
    events.emit("user:afterDelete", id);

    return deletedUser;
  }

  /**
   * Update user's last login time
   */
  static async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
  }
}
