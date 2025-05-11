import { pgTable, text, serial, integer, boolean, timestamp, json, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for both regular users and developers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePicture: text("profile_picture"),
  isDeveloper: boolean("is_developer").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isMasterAdmin: boolean("is_master_admin").default(false).notNull(),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  hasDeveloperRequest: boolean("has_developer_request").default(false).notNull(),
  developerRequestDate: timestamp("developer_request_date"),
  // Developer community engagement metrics
  developerBio: text("developer_bio"),
  totalApps: integer("total_apps").default(0).notNull(),
  totalDownloads: integer("total_downloads").default(0).notNull(),
  averageRating: integer("average_rating").default(0).notNull(),  // Stored as rating * 10 (e.g. 4.5 = 45)
  engagementScore: integer("engagement_score").default(0).notNull(),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The application table
export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  version: text("version").notNull(),
  packageName: text("package_name").notNull().unique(),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  iconUrl: text("icon_url").notNull(),
  bannerUrl: text("banner_url"), // Banner image URL
  screenshotUrls: json("screenshot_urls").default([]).notNull().$type<string[]>(),
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: text("file_path").notNull(),
  minAndroidVersion: text("min_android_version").default("5.0").notNull(),
  downloads: integer("downloads").default(0).notNull(),
  rating: integer("rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => apps.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily app analytics table
export const appDailyStats = pgTable("app_daily_stats", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => apps.id),
  date: date("date").notNull(),
  downloads: integer("downloads").default(0).notNull(),
  activeUsers: integer("active_users").default(0).notNull(),
  newUsers: integer("new_users").default(0).notNull(),
  sessions: integer("sessions").default(0).notNull(),
  avgSessionDuration: integer("avg_session_duration").default(0).notNull(), // in seconds
  crashCount: integer("crash_count").default(0).notNull(),
  anrCount: integer("anr_count").default(0).notNull(), // Application Not Responding events
}, (table) => {
  return {
    appDateIdx: uniqueIndex("app_date_idx").on(table.appId, table.date),
  }
});

// Device analytics table
export const appDeviceStats = pgTable("app_device_stats", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => apps.id),
  date: date("date").notNull(),
  deviceModel: text("device_model").notNull(),
  androidVersion: text("android_version").notNull(),
  count: integer("count").default(0).notNull(),
}, (table) => {
  return {
    appDeviceIdx: uniqueIndex("app_device_idx").on(table.appId, table.date, table.deviceModel, table.androidVersion),
  }
});

// Geographic analytics table
export const appGeoStats = pgTable("app_geo_stats", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => apps.id),
  date: date("date").notNull(),
  country: text("country").notNull(),
  count: integer("count").default(0).notNull(),
}, (table) => {
  return {
    appGeoIdx: uniqueIndex("app_geo_idx").on(table.appId, table.date, table.country),
  }
});

// Acquisition channel analytics table
export const appAcquisitionStats = pgTable("app_acquisition_stats", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => apps.id),
  date: date("date").notNull(),
  source: text("source").notNull(), // 'organic', 'referral', 'play_store', etc.
  count: integer("count").default(0).notNull(),
}, (table) => {
  return {
    appAcquisitionIdx: uniqueIndex("app_acquisition_idx").on(table.appId, table.date, table.source),
  }
});

// App versions table to track version history
export const appVersions = pgTable("app_versions", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull().references(() => apps.id),
  version: text("version").notNull(),
  versionCode: integer("version_code").notNull(), // Numeric code for version comparison (e.g., 1, 2, 3)
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  changeLog: text("change_log"), // What's new in this version
  isLive: boolean("is_live").default(false).notNull(), // Whether this is the currently active version
  minAndroidVersion: text("min_android_version").default("5.0").notNull(),
  releaseDate: timestamp("release_date").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    appVersionIdx: uniqueIndex("app_version_idx").on(table.appId, table.version),
  }
});

// Define schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, isBlocked: true });

export const insertAppSchema = createInsertSchema(apps)
  .omit({ id: true, downloads: true, rating: true, reviewCount: true, isSuspended: true, createdAt: true, updatedAt: true });

export const insertReviewSchema = createInsertSchema(reviews)
  .omit({ id: true, createdAt: true });

export const insertAppDailyStatsSchema = createInsertSchema(appDailyStats)
  .omit({ id: true });

export const insertAppDeviceStatsSchema = createInsertSchema(appDeviceStats)
  .omit({ id: true });

export const insertAppGeoStatsSchema = createInsertSchema(appGeoStats)
  .omit({ id: true });

export const insertAppAcquisitionStatsSchema = createInsertSchema(appAcquisitionStats)
  .omit({ id: true });
  
export const insertAppVersionSchema = createInsertSchema(appVersions)
  .omit({ id: true, releaseDate: true, updatedAt: true });



// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type AppDailyStats = typeof appDailyStats.$inferSelect;
export type InsertAppDailyStats = z.infer<typeof insertAppDailyStatsSchema>;

export type AppDeviceStats = typeof appDeviceStats.$inferSelect;
export type InsertAppDeviceStats = z.infer<typeof insertAppDeviceStatsSchema>;

export type AppGeoStats = typeof appGeoStats.$inferSelect;
export type InsertAppGeoStats = z.infer<typeof insertAppGeoStatsSchema>;

export type AppAcquisitionStats = typeof appAcquisitionStats.$inferSelect;
export type InsertAppAcquisitionStats = z.infer<typeof insertAppAcquisitionStatsSchema>;

export type AppVersion = typeof appVersions.$inferSelect;
export type InsertAppVersion = z.infer<typeof insertAppVersionSchema>;



// Frontend specific types for forms and responses
export const appUploadSchema = z.object({
  name: z.string().min(1, "App name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  // Version and versionCode are now optional as they can be extracted from the APK
  version: z.string().optional(),
  versionCode: z.number().optional(),
  // Package name can be extracted from APK as well
  packageName: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  minAndroidVersion: z.string().default("5.0"),
  changeLog: z.string().optional(),
  // Banner is optional 
  bannerUrl: z.string().optional(),
}).refine(data => {
  // If not provided in form, these fields must be extracted from APK
  // This validation happens on the server after extraction
  return true;
});

// Schema for app version updates
export const appVersionUploadSchema = z.object({
  // Version and versionCode are now optional as they can be extracted from the APK
  version: z.string().optional(),
  versionCode: z.number().optional(),
  minAndroidVersion: z.string().default("5.0"),
  changeLog: z.string().min(1, "Change log is required"),
}).refine(data => {
  // If not provided in form, these fields must be extracted from APK
  // This validation happens on the server after extraction
  return true;
});

// Export categories list for use in forms
export const appCategories = [
  "Games",
  "Social",
  "Communication",
  "Productivity",
  "Education",
  "Entertainment",
  "Music",
  "Photography",
  "Tools",
  "Finance",
  "Health & Fitness",
  "Books & Reference",
  "News & Magazines",
  "Video"
];

// Export subcategories for each main category
export const appSubCategories: Record<string, string[]> = {
  "Video": [
    "Movies",
    "Short Videos",
    "Videos"
  ],
  // Add other category subcategories here as needed
};


