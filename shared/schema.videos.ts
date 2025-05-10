import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Video table definition
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailPath: text("thumbnail_path").notNull(),
  videoPath: text("video_path").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  tags: text("tags"),
  duration: text("duration"),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  isRejected: boolean("is_rejected").default(false).notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create video insert schema
export const insertVideoSchema = createInsertSchema(videos)
  .omit({ id: true, viewCount: true, likeCount: true, commentCount: true, isApproved: true, isRejected: true, rejectionReason: true, createdAt: true, updatedAt: true });

// Define types
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

// Schema for frontend video upload form
export const videoUploadSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100, { message: "Title must be less than 100 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(5000, { message: "Description must be less than 5000 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  tags: z.string().optional(),
});