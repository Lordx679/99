import {
  UserModel,
  ProjectModel,
  ProjectLikeModel,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ProjectLike,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(category?: string, search?: string, limit?: number, offset?: number): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectWithAuthor(id: string): Promise<(Project & { author: User }) | undefined>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  incrementProjectViews(id: string): Promise<void>;
  
  // Project likes
  likeProject(projectId: string, userId: string): Promise<ProjectLike>;
  unlikeProject(projectId: string, userId: string): Promise<boolean>;
  isProjectLiked(projectId: string, userId: string): Promise<boolean>;
  
  // Admin operations
  isUserAdmin(userId: string): Promise<boolean>;
  getProjectStats(): Promise<{ totalProjects: number; totalUsers: number; totalViews: number }>;
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id }).exec();
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user = await UserModel.findOneAndUpdate(
      { id: userData.id },
      { ...userData, updatedAt: new Date() },
      { upsert: true, new: true }
    ).exec();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const newProject = new ProjectModel(project);
    await newProject.save();
    return newProject;
  }

  async getProjects(category?: string, search?: string, limit = 50, offset = 0): Promise<Project[]> {
    const query: any = { isPublished: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await ProjectModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    return projects;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const project = await ProjectModel.findById(id).exec();
    return project || undefined;
  }

  async getProjectWithAuthor(id: string): Promise<(Project & { author: User }) | undefined> {
    const project = await ProjectModel.findById(id).exec();
    if (!project) return undefined;

    const author = await UserModel.findOne({ id: project.authorId }).exec();
    if (!author) return undefined;

    return { ...project.toObject(), author: author.toObject() } as Project & { author: User };
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = await ProjectModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).exec();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await ProjectModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async incrementProjectViews(id: string): Promise<void> {
    await ProjectModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }
    ).exec();
  }

  // Project likes
  async likeProject(projectId: string, userId: string): Promise<ProjectLike> {
    const like = new ProjectLikeModel({ projectId, userId });
    await like.save();

    // Update project likes count
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $inc: { likes: 1 } }
    ).exec();

    return like;
  }

  async unlikeProject(projectId: string, userId: string): Promise<boolean> {
    const result = await ProjectLikeModel.findOneAndDelete({
      projectId,
      userId
    }).exec();

    if (result) {
      // Update project likes count
      await ProjectModel.findByIdAndUpdate(
        projectId,
        { $inc: { likes: -1 } }
      ).exec();
      return true;
    }
    return false;
  }

  async isProjectLiked(projectId: string, userId: string): Promise<boolean> {
    const like = await ProjectLikeModel.findOne({
      projectId,
      userId
    }).exec();
    return !!like;
  }

  // Admin operations
  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await UserModel.findOne({ id: userId }).select('isAdmin').exec();
    return user?.isAdmin || false;
  }

  async getProjectStats(): Promise<{ totalProjects: number; totalUsers: number; totalViews: number }> {
    const [projectCount, userCount, viewsSum] = await Promise.all([
      ProjectModel.countDocuments({ isPublished: true }),
      UserModel.countDocuments(),
      ProjectModel.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ])
    ]);

    return {
      totalProjects: projectCount,
      totalUsers: userCount,
      totalViews: viewsSum[0]?.total || 0,
    };
  }
}

export const storage = new MongoStorage();