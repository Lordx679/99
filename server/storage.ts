import {
  users,
  projects,
  projectLikes,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ProjectLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, ilike, and, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(category?: string, search?: string, limit?: number, offset?: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectWithAuthor(id: number): Promise<(Project & { author: User }) | undefined>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  incrementProjectViews(id: number): Promise<void>;
  
  // Project likes
  likeProject(projectId: number, userId: string): Promise<ProjectLike>;
  unlikeProject(projectId: number, userId: string): Promise<boolean>;
  isProjectLiked(projectId: number, userId: string): Promise<boolean>;
  
  // Admin operations
  isUserAdmin(userId: string): Promise<boolean>;
  getProjectStats(): Promise<{ totalProjects: number; totalUsers: number; totalViews: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProjects(category?: string, search?: string, limit = 50, offset = 0): Promise<Project[]> {
    // Build where conditions
    const whereConditions = [eq(projects.isPublished, true)];
    
    if (category && category !== 'all') {
      whereConditions.push(eq(projects.category, category));
    }
    
    if (search) {
      whereConditions.push(ilike(projects.title, `%${search}%`));
    }

    const result = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        fullDescription: projects.fullDescription,
        category: projects.category,
        githubUrl: projects.githubUrl,
        imageUrl: projects.imageUrl,
        projectFileUrl: projects.projectFileUrl,
        additionalImageUrl: projects.additionalImageUrl,
        features: projects.features,
        installationSteps: projects.installationSteps,
        authorId: projects.authorId,
        views: projects.views,
        likes: projects.likes,
        isPublished: projects.isPublished,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(and(...whereConditions))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getProjectWithAuthor(id: number): Promise<(Project & { author: User }) | undefined> {
    const [result] = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        fullDescription: projects.fullDescription,
        category: projects.category,
        githubUrl: projects.githubUrl,
        imageUrl: projects.imageUrl,
        projectFileUrl: projects.projectFileUrl,
        additionalImageUrl: projects.additionalImageUrl,
        features: projects.features,
        installationSteps: projects.installationSteps,
        authorId: projects.authorId,
        views: projects.views,
        likes: projects.likes,
        isPublished: projects.isPublished,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        author: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(projects)
      .innerJoin(users, eq(projects.authorId, users.id))
      .where(eq(projects.id, id));

    return result as (Project & { author: User }) | undefined;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementProjectViews(id: number): Promise<void> {
    await db
      .update(projects)
      .set({ views: sql`${projects.views} + 1` })
      .where(eq(projects.id, id));
  }

  // Project likes
  async likeProject(projectId: number, userId: string): Promise<ProjectLike> {
    const [like] = await db
      .insert(projectLikes)
      .values({ projectId, userId })
      .returning();

    // Update project likes count
    await db
      .update(projects)
      .set({ likes: sql`${projects.likes} + 1` })
      .where(eq(projects.id, projectId));

    return like;
  }

  async unlikeProject(projectId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

    if ((result.rowCount ?? 0) > 0) {
      // Update project likes count
      await db
        .update(projects)
        .set({ likes: sql`${projects.likes} - 1` })
        .where(eq(projects.id, projectId));
      return true;
    }
    return false;
  }

  async isProjectLiked(projectId: number, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));
    return !!like;
  }

  // Admin operations
  async isUserAdmin(userId: string): Promise<boolean> {
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId));
    return user?.isAdmin || false;
  }

  async getProjectStats(): Promise<{ totalProjects: number; totalUsers: number; totalViews: number }> {
    const [projectCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.isPublished, true));

    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    const [viewsSum] = await db
      .select({ sum: sql<number>`sum(${projects.views})` })
      .from(projects)
      .where(eq(projects.isPublished, true));

    return {
      totalProjects: projectCount.count,
      totalUsers: userCount.count,
      totalViews: viewsSum.sum || 0,
    };
  }
}

export const storage = new DatabaseStorage();
