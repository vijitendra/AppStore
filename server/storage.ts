import { 
  users, type User, type InsertUser,
  apps, type App, type InsertApp,
  reviews, type Review, type InsertReview,
  appDailyStats, type AppDailyStats, type InsertAppDailyStats,
  appDeviceStats, type AppDeviceStats, type InsertAppDeviceStats,
  appGeoStats, type AppGeoStats, type InsertAppGeoStats,
  appAcquisitionStats, type AppAcquisitionStats, type InsertAppAcquisitionStats,
  appVersions, type AppVersion, type InsertAppVersion
} from "@shared/schema";
import { videos, type Video, type InsertVideo } from "@shared/schema.videos";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, like, desc, and, sql, or, not } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getMasterAdmin(): Promise<User | undefined>;
  
  // App operations
  getApp(id: number): Promise<App | undefined>;
  getAppByPackageName(packageName: string): Promise<App | undefined>;
  getAppsByDeveloper(developerId: number): Promise<App[]>;
  getAllApps(): Promise<App[]>;
  getPendingApprovalApps(): Promise<App[]>;
  getFeaturedApps(limit?: number): Promise<App[]>;
  getTopApps(limit?: number): Promise<App[]>;
  getAppsByCategory(category: string): Promise<App[]>;
  searchApps(query: string): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: number, appData: Partial<App>): Promise<App | undefined>;
  deleteApp(id: number): Promise<boolean>;
  incrementDownloads(id: number): Promise<App | undefined>;
  
  // Review operations
  getReviewsByApp(appId: number): Promise<any[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Analytics operations
  // Daily stats
  getDailyStats(appId: number, startDate: Date, endDate: Date): Promise<AppDailyStats[]>;
  addDailyStats(stats: InsertAppDailyStats): Promise<AppDailyStats>;
  updateDailyStats(appId: number, date: Date, data: Partial<AppDailyStats>): Promise<AppDailyStats | undefined>;
  
  // Device stats
  getDeviceStats(appId: number, startDate: Date, endDate: Date): Promise<AppDeviceStats[]>;
  addDeviceStats(stats: InsertAppDeviceStats): Promise<AppDeviceStats>;
  updateDeviceStats(appId: number, date: Date, deviceModel: string, androidVersion: string, count: number): Promise<AppDeviceStats | undefined>;
  
  // Geo stats
  getGeoStats(appId: number, startDate: Date, endDate: Date): Promise<AppGeoStats[]>;
  addGeoStats(stats: InsertAppGeoStats): Promise<AppGeoStats>;
  updateGeoStats(appId: number, date: Date, country: string, count: number): Promise<AppGeoStats | undefined>;
  
  // Acquisition stats
  getAcquisitionStats(appId: number, startDate: Date, endDate: Date): Promise<AppAcquisitionStats[]>;
  addAcquisitionStats(stats: InsertAppAcquisitionStats): Promise<AppAcquisitionStats>;
  updateAcquisitionStats(appId: number, date: Date, source: string, count: number): Promise<AppAcquisitionStats | undefined>;
  
  // App version management
  getAppVersions(appId: number): Promise<AppVersion[]>;
  getAppVersion(id: number): Promise<AppVersion | undefined>;
  getAppVersionByVersion(appId: number, version: string): Promise<AppVersion | undefined>;
  getCurrentAppVersion(appId: number): Promise<AppVersion | undefined>;
  addAppVersion(version: InsertAppVersion): Promise<AppVersion>;
  updateAppVersion(id: number, versionData: Partial<AppVersion>): Promise<AppVersion | undefined>;
  setVersionAsLive(appId: number, versionId: number): Promise<boolean>;
  deleteAppVersion(id: number): Promise<boolean>;
  
  // Video operations
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByDeveloper(developerId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      // Check if we're trying to change isMasterAdmin status
      if (userData.isMasterAdmin !== undefined) {
        // If trying to set a user as master admin, ensure no other master admin exists
        if (userData.isMasterAdmin === true) {
          const [existingMasterAdmin] = await db
            .select()
            .from(users)
            .where(eq(users.isMasterAdmin, true));
          
          if (existingMasterAdmin && existingMasterAdmin.id !== id) {
            console.error("Cannot set user as master admin because one already exists");
            return undefined;
          }
        }
      }

      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  async getMasterAdmin(): Promise<User | undefined> {
    try {
      const [masterAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.isMasterAdmin, true));
      return masterAdmin;
    } catch (error) {
      console.error("Error getting master admin:", error);
      return undefined;
    }
  }

  async getApp(id: number): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } }) | undefined> {
    const [result] = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id))
      .where(eq(apps.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.app,
      developer: result.developer
    };
  }

  async getAppByPackageName(packageName: string): Promise<App | undefined> {
    const [app] = await db.select().from(apps).where(eq(apps.packageName, packageName));
    return app;
  }

  async getAppsByDeveloper(developerId: number): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    const results = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id))
      .where(eq(apps.developerId, developerId));
    
    return results.map(result => ({
      ...result.app,
      developer: result.developer
    }));
  }

  async getAllApps(): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    const results = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id));
    
    return results.map(result => ({
      ...result.app,
      developer: result.developer
    }));
  }
  
  async getPendingApprovalApps(): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    const results = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id))
      .where(eq(apps.isApproved, false))
      .orderBy(desc(apps.createdAt));
    
    return results.map(result => ({
      ...result.app,
      developer: result.developer
    }));
  }

  async getFeaturedApps(limit: number = 5): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    // In a real app, you might have a "featured" flag or algorithm
    // For now, return the most recently added approved apps
    const results = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id))
      .where(eq(apps.isApproved, true))
      .orderBy(desc(apps.createdAt))
      .limit(limit);
    
    return results.map(result => ({
      ...result.app,
      developer: result.developer
    }));
  }

  async getTopApps(limit: number = 5): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    // Return approved apps sorted by downloads
    const results = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id))
      .where(eq(apps.isApproved, true))
      .orderBy(desc(apps.downloads))
      .limit(limit);
    
    return results.map(result => ({
      ...result.app,
      developer: result.developer
    }));
  }

  async getAppsByCategory(category: string): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    // Log the category being queried to help debug
    console.log(`Getting apps for category: ${category}`);
    
    try {
      const results = await db
        .select({
          app: apps,
          developer: {
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            profilePicture: users.profilePicture
          }
        })
        .from(apps)
        .leftJoin(users, eq(apps.developerId, users.id))
        .where(
          and(
            eq(apps.category, category),
            eq(apps.isApproved, true)
          )
        );
      
      console.log(`Found ${results.length} apps in category ${category}`);
      
      return results.map(result => ({
        ...result.app,
        developer: result.developer
      }));
    } catch (error) {
      console.error(`Error getting apps by category ${category}:`, error);
      return []; // Return empty array on error
    }
  }

  async searchApps(query: string): Promise<(App & { developer?: { username: string, firstName?: string, lastName?: string, profilePicture?: string } })[]> {
    const searchPattern = `%${query}%`;
    
    const results = await db
      .select({
        app: apps,
        developer: {
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(apps)
      .leftJoin(users, eq(apps.developerId, users.id))
      .where(
        and(
          eq(apps.isApproved, true),
          sql`${apps.name} ILIKE ${searchPattern} OR 
              ${apps.description} ILIKE ${searchPattern} OR 
              ${apps.shortDescription} ILIKE ${searchPattern}`
        )
      );
    
    return results.map(result => ({
      ...result.app,
      developer: result.developer
    }));
  }

  async createApp(appData: InsertApp): Promise<App> {
    const [app] = await db
      .insert(apps)
      .values({
        ...appData,
        downloads: 0,
        rating: 0,
        reviewCount: 0
      })
      .returning();
    return app;
  }

  async updateApp(id: number, appData: Partial<App>): Promise<App | undefined> {
    const [updatedApp] = await db
      .update(apps)
      .set({
        ...appData,
        updatedAt: new Date()
      })
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  async deleteApp(id: number): Promise<boolean> {
    try {
      // First, check if the app exists
      const [app] = await db
        .select()
        .from(apps)
        .where(eq(apps.id, id));
        
      if (!app) {
        return false; // App doesn't exist
      }
      
      // Use a series of try-catch blocks for each type of data
      // This way, if a table doesn't exist, we can still proceed
      
      try {
        // Try to delete reviews
        await db.delete(reviews).where(eq(reviews.appId, id));
      } catch (err) {
        // Log but continue if table doesn't exist
        console.log("Note: Unable to delete from reviews table:", err.message);
      }
      
      try {
        // Try to delete versions
        await db.delete(appVersions).where(eq(appVersions.appId, id));
      } catch (err) {
        console.log("Note: Unable to delete from app_versions table:", err.message);
      }
      
      // Finally delete the app itself
      const [deletedApp] = await db
        .delete(apps)
        .where(eq(apps.id, id))
        .returning();
      
      return !!deletedApp;
    } catch (error) {
      console.error("Error deleting app and related records:", error);
      throw error;
    }
  }

  async incrementDownloads(id: number): Promise<App | undefined> {
    const [updatedApp] = await db
      .update(apps)
      .set({
        downloads: sql`${apps.downloads} + 1`,
        updatedAt: new Date()
      })
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  async getReviewsByApp(appId: number): Promise<any[]> {
    const results = await db
      .select({
        review: reviews,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.appId, appId))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(result => ({
      ...result.review,
      user: result.user
    }));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    
    // Update app rating
    const appReviews = await this.getReviewsByApp(reviewData.appId);
    const totalRating = appReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = Math.round(totalRating / appReviews.length);
    
    await this.updateApp(reviewData.appId, {
      rating: avgRating,
      reviewCount: appReviews.length
    });
    
    return review;
  }
  
  // Analytics methods implementation
  
  // Daily stats
  async getDailyStats(appId: number, startDate: Date, endDate: Date): Promise<AppDailyStats[]> {
    return await db
      .select()
      .from(appDailyStats)
      .where(
        and(
          eq(appDailyStats.appId, appId),
          sql`${appDailyStats.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${appDailyStats.date} <= ${endDate.toISOString().split('T')[0]}`
        )
      )
      .orderBy(appDailyStats.date);
  }
  
  async addDailyStats(stats: InsertAppDailyStats): Promise<AppDailyStats> {
    const [result] = await db
      .insert(appDailyStats)
      .values(stats)
      .returning();
    return result;
  }
  
  async updateDailyStats(appId: number, date: Date, data: Partial<AppDailyStats>): Promise<AppDailyStats | undefined> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const [result] = await db
        .update(appDailyStats)
        .set(data)
        .where(
          and(
            eq(appDailyStats.appId, appId),
            sql`${appDailyStats.date} = ${dateStr}`
          )
        )
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating daily stats:", error);
      return undefined;
    }
  }
  
  // Device stats
  async getDeviceStats(appId: number, startDate: Date, endDate: Date): Promise<AppDeviceStats[]> {
    return await db
      .select()
      .from(appDeviceStats)
      .where(
        and(
          eq(appDeviceStats.appId, appId),
          sql`${appDeviceStats.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${appDeviceStats.date} <= ${endDate.toISOString().split('T')[0]}`
        )
      )
      .orderBy(appDeviceStats.date);
  }
  
  async addDeviceStats(stats: InsertAppDeviceStats): Promise<AppDeviceStats> {
    const [result] = await db
      .insert(appDeviceStats)
      .values(stats)
      .returning();
    return result;
  }
  
  async updateDeviceStats(appId: number, date: Date, deviceModel: string, androidVersion: string, count: number): Promise<AppDeviceStats | undefined> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // First, check if the record exists
      const [existingRecord] = await db
        .select()
        .from(appDeviceStats)
        .where(
          and(
            eq(appDeviceStats.appId, appId),
            sql`${appDeviceStats.date} = ${dateStr}`,
            eq(appDeviceStats.deviceModel, deviceModel),
            eq(appDeviceStats.androidVersion, androidVersion)
          )
        );
      
      if (existingRecord) {
        // Update existing record
        const [result] = await db
          .update(appDeviceStats)
          .set({ count: sql`${appDeviceStats.count} + ${count}` })
          .where(eq(appDeviceStats.id, existingRecord.id))
          .returning();
        return result;
      } else {
        // Create new record
        const [result] = await db
          .insert(appDeviceStats)
          .values({
            appId,
            date,
            deviceModel,
            androidVersion,
            count
          })
          .returning();
        return result;
      }
    } catch (error) {
      console.error("Error updating device stats:", error);
      return undefined;
    }
  }
  
  // Geo stats
  async getGeoStats(appId: number, startDate: Date, endDate: Date): Promise<AppGeoStats[]> {
    return await db
      .select()
      .from(appGeoStats)
      .where(
        and(
          eq(appGeoStats.appId, appId),
          sql`${appGeoStats.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${appGeoStats.date} <= ${endDate.toISOString().split('T')[0]}`
        )
      )
      .orderBy(appGeoStats.date);
  }
  
  async addGeoStats(stats: InsertAppGeoStats): Promise<AppGeoStats> {
    const [result] = await db
      .insert(appGeoStats)
      .values(stats)
      .returning();
    return result;
  }
  
  async updateGeoStats(appId: number, date: Date, country: string, count: number): Promise<AppGeoStats | undefined> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // First, check if the record exists
      const [existingRecord] = await db
        .select()
        .from(appGeoStats)
        .where(
          and(
            eq(appGeoStats.appId, appId),
            sql`${appGeoStats.date} = ${dateStr}`,
            eq(appGeoStats.country, country)
          )
        );
      
      if (existingRecord) {
        // Update existing record
        const [result] = await db
          .update(appGeoStats)
          .set({ count: sql`${appGeoStats.count} + ${count}` })
          .where(eq(appGeoStats.id, existingRecord.id))
          .returning();
        return result;
      } else {
        // Create new record
        const [result] = await db
          .insert(appGeoStats)
          .values({
            appId,
            date,
            country,
            count
          })
          .returning();
        return result;
      }
    } catch (error) {
      console.error("Error updating geo stats:", error);
      return undefined;
    }
  }
  
  // Acquisition stats
  async getAcquisitionStats(appId: number, startDate: Date, endDate: Date): Promise<AppAcquisitionStats[]> {
    return await db
      .select()
      .from(appAcquisitionStats)
      .where(
        and(
          eq(appAcquisitionStats.appId, appId),
          sql`${appAcquisitionStats.date} >= ${startDate.toISOString().split('T')[0]}`,
          sql`${appAcquisitionStats.date} <= ${endDate.toISOString().split('T')[0]}`
        )
      )
      .orderBy(appAcquisitionStats.date);
  }
  
  async addAcquisitionStats(stats: InsertAppAcquisitionStats): Promise<AppAcquisitionStats> {
    const [result] = await db
      .insert(appAcquisitionStats)
      .values(stats)
      .returning();
    return result;
  }
  
  async updateAcquisitionStats(appId: number, date: Date, source: string, count: number): Promise<AppAcquisitionStats | undefined> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // First, check if the record exists
      const [existingRecord] = await db
        .select()
        .from(appAcquisitionStats)
        .where(
          and(
            eq(appAcquisitionStats.appId, appId),
            sql`${appAcquisitionStats.date} = ${dateStr}`,
            eq(appAcquisitionStats.source, source)
          )
        );
      
      if (existingRecord) {
        // Update existing record
        const [result] = await db
          .update(appAcquisitionStats)
          .set({ count: sql`${appAcquisitionStats.count} + ${count}` })
          .where(eq(appAcquisitionStats.id, existingRecord.id))
          .returning();
        return result;
      } else {
        // Create new record
        const [result] = await db
          .insert(appAcquisitionStats)
          .values({
            appId,
            date,
            source,
            count
          })
          .returning();
        return result;
      }
    } catch (error) {
      console.error("Error updating acquisition stats:", error);
      return undefined;
    }
  }

  // App version management methods
  async getAppVersions(appId: number): Promise<AppVersion[]> {
    return await db
      .select()
      .from(appVersions)
      .where(eq(appVersions.appId, appId))
      .orderBy(desc(appVersions.versionCode));
  }
  
  async getAppVersion(id: number): Promise<AppVersion | undefined> {
    const [version] = await db
      .select()
      .from(appVersions)
      .where(eq(appVersions.id, id));
    return version;
  }
  
  async getAppVersionByVersion(appId: number, version: string): Promise<AppVersion | undefined> {
    const [appVersion] = await db
      .select()
      .from(appVersions)
      .where(
        and(
          eq(appVersions.appId, appId),
          eq(appVersions.version, version)
        )
      );
    return appVersion;
  }
  
  async getCurrentAppVersion(appId: number): Promise<AppVersion | undefined> {
    const [version] = await db
      .select()
      .from(appVersions)
      .where(
        and(
          eq(appVersions.appId, appId),
          eq(appVersions.isLive, true)
        )
      );
    return version;
  }
  
  async addAppVersion(versionData: InsertAppVersion): Promise<AppVersion> {
    // If this is the first version for this app, make it live automatically
    const existingVersions = await this.getAppVersions(versionData.appId);
    const isFirstVersion = existingVersions.length === 0;
    
    const [version] = await db
      .insert(appVersions)
      .values({
        ...versionData,
        isLive: isFirstVersion
      })
      .returning();
    
    // Update the app's current version if this is set as live
    if (isFirstVersion) {
      await db
        .update(apps)
        .set({
          version: versionData.version,
          minAndroidVersion: versionData.minAndroidVersion,
          filePath: versionData.filePath,
          fileSize: versionData.fileSize,
          updatedAt: new Date()
        })
        .where(eq(apps.id, versionData.appId));
    }
    
    return version;
  }
  
  async updateAppVersion(id: number, versionData: Partial<AppVersion>): Promise<AppVersion | undefined> {
    const [updatedVersion] = await db
      .update(appVersions)
      .set({
        ...versionData,
        updatedAt: new Date()
      })
      .where(eq(appVersions.id, id))
      .returning();
    
    // If version is being made live, update the app's current version
    if (updatedVersion && versionData.isLive === true) {
      await this.setVersionAsLive(updatedVersion.appId, updatedVersion.id);
    }
    
    return updatedVersion;
  }
  
  async setVersionAsLive(appId: number, versionId: number): Promise<boolean> {
    try {
      // Get the version to be set as live
      const [versionToActivate] = await db
        .select()
        .from(appVersions)
        .where(eq(appVersions.id, versionId));
      
      if (!versionToActivate) {
        return false;
      }
      
      // First, set all versions of this app to not live
      await db
        .update(appVersions)
        .set({ isLive: false })
        .where(eq(appVersions.appId, appId));
      
      // Then set the specified version to live
      await db
        .update(appVersions)
        .set({ isLive: true })
        .where(eq(appVersions.id, versionId));
      
      // Update the app record with the new version information
      await db
        .update(apps)
        .set({
          version: versionToActivate.version,
          minAndroidVersion: versionToActivate.minAndroidVersion,
          filePath: versionToActivate.filePath,
          fileSize: versionToActivate.fileSize,
          updatedAt: new Date()
        })
        .where(eq(apps.id, appId));
      
      return true;
    } catch (error) {
      console.error("Error setting version as live:", error);
      return false;
    }
  }
  
  async deleteAppVersion(id: number): Promise<boolean> {
    try {
      // Check if this is the currently live version
      const [versionToDelete] = await db
        .select()
        .from(appVersions)
        .where(eq(appVersions.id, id));
      
      if (!versionToDelete) {
        return false;
      }
      
      // Don't allow deleting the live version
      if (versionToDelete.isLive) {
        console.error("Cannot delete the currently active version");
        return false;
      }
      
      // Delete the version
      const result = await db
        .delete(appVersions)
        .where(eq(appVersions.id, id));
      
      return result.count > 0;
    } catch (error) {
      console.error("Error deleting app version:", error);
      return false;
    }
  }

  // Video operations
  async getVideo(id: number): Promise<Video | undefined> {
    try {
      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, id));
      return video;
    } catch (error) {
      console.error("Error getting video:", error);
      return undefined;
    }
  }

  async getVideosByDeveloper(developerId: number): Promise<Video[]> {
    try {
      const results = await db
        .select()
        .from(videos)
        .where(eq(videos.developerId, developerId))
        .orderBy(desc(videos.createdAt));
      return results;
    } catch (error) {
      console.error("Error getting videos by developer:", error);
      return [];
    }
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    try {
      const [video] = await db
        .insert(videos)
        .values({
          ...videoData,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0
        })
        .returning();
      return video;
    } catch (error) {
      console.error("Error creating video:", error);
      throw error;
    }
  }

  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined> {
    try {
      const [updatedVideo] = await db
        .update(videos)
        .set({
          ...videoData,
          updatedAt: new Date()
        })
        .where(eq(videos.id, id))
        .returning();
      return updatedVideo;
    } catch (error) {
      console.error("Error updating video:", error);
      return undefined;
    }
  }

  async deleteVideo(id: number): Promise<boolean> {
    try {
      const [deletedVideo] = await db
        .delete(videos)
        .where(eq(videos.id, id))
        .returning();
      return !!deletedVideo;
    } catch (error) {
      console.error("Error deleting video:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();