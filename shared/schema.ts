import mongoose, { Schema, Document } from 'mongoose';
import { z } from "zod";

// User interface and schema
export interface User extends Document {
  _id: string;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export const UserModel = mongoose.model<User>('User', userSchema);

// Project interface and schema
export interface Project extends Document {
  _id: string;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  githubUrl?: string;
  imageUrl?: string;
  projectFileUrl?: string;
  additionalImageUrl?: string;
  features: string[];
  installationSteps?: string;
  authorId: string;
  views: number;
  likes: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<Project>({
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String, required: true },
  fullDescription: String,
  category: { type: String, required: true, maxlength: 50 },
  githubUrl: { type: String, maxlength: 500 },
  imageUrl: { type: String, maxlength: 500 },
  projectFileUrl: { type: String, maxlength: 500 },
  additionalImageUrl: { type: String, maxlength: 500 },
  features: [String],
  installationSteps: String,
  authorId: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export const ProjectModel = mongoose.model<Project>('Project', projectSchema);

// Project Like interface and schema
export interface ProjectLike extends Document {
  _id: string;
  projectId: string;
  userId: string;
  createdAt: Date;
}

const projectLikeSchema = new Schema<ProjectLike>({
  projectId: { type: String, required: true },
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

// Ensure unique combination of projectId and userId
projectLikeSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectLikeModel = mongoose.model<ProjectLike>('ProjectLike', projectLikeSchema);

// Zod schemas for validation
export const insertProjectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  fullDescription: z.string().optional(),
  category: z.string().min(1).max(50),
  githubUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  projectFileUrl: z.string().url().optional().or(z.literal("")),
  additionalImageUrl: z.string().url().optional().or(z.literal("")),
  features: z.array(z.string()).default([]),
  installationSteps: z.string().optional(),
  authorId: z.string(),
  isPublished: z.boolean().default(true),
});

export const insertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  isAdmin: z.boolean().default(false),
});

export type UpsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;