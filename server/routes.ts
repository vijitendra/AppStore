import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { insertAppSchema, appUploadSchema, appVersionUploadSchema, users, reviews, insertAppVersionSchema, appSubCategories } from "@shared/schema";
import { videos, insertVideoSchema, videoUploadSchema } from "@shared/schema.videos";
import { ZodError } from "zod";
import { db } from "./db";
import { promoteUser } from "./migrate-master-admin";
import { eq, asc } from "drizzle-orm";

// Configure file storage
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Different directories for different file types
    let destDir = uploadsDir;
    if (file.fieldname === 'apkFile') {
      destDir = path.join(uploadsDir, 'apk');
    } else if (file.fieldname === 'icon') {
      destDir = path.join(uploadsDir, 'icons');
    } else if (file.fieldname === 'banner') {
      destDir = path.join(uploadsDir, 'banners');
    } else if (file.fieldname === 'screenshots') {
      destDir = path.join(uploadsDir, 'screenshots');
    } else if (file.fieldname === 'profilePicture') {
      destDir = path.join(uploadsDir, 'profiles');
    } else if (file.fieldname === 'videoFile') {
      destDir = path.join(uploadsDir, 'videos');
    } else if (file.fieldname === 'thumbnailFile') {
      destDir = path.join(uploadsDir, 'thumbnails');
    }
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    cb(null, destDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueFilename = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'apkFile') {
      // Accept APK and AAB files
      if (file.mimetype === 'application/vnd.android.package-archive' || 
          file.originalname.endsWith('.apk') || 
          file.originalname.endsWith('.aab')) {
        return cb(null, true);
      }
      return cb(new Error('Only APK and AAB files are allowed'));
    } else if (file.fieldname === 'icon') {
      // Accept image files for icons
      if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
      }
      return cb(new Error('Only image files are allowed for app icons'));
    } else if (file.fieldname === 'banner') {
      // Accept image files for banners
      if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
      }
      return cb(new Error('Only image files are allowed for app banners'));
    } else if (file.fieldname === 'screenshots') {
      // Accept image files for screenshots
      if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
      }
      return cb(new Error('Only image files are allowed for screenshots'));
    } else if (file.fieldname === 'profilePicture') {
      // Accept image files for profile pictures
      if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
      }
      return cb(new Error('Only image files are allowed for profile pictures'));
    } else if (file.fieldname === 'videoFile') {
      // Accept video files
      if (file.mimetype.startsWith('video/')) {
        return cb(null, true);
      }
      return cb(new Error('Only video files are allowed'));
    } else if (file.fieldname === 'thumbnailFile') {
      // Accept image files for thumbnails
      if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
      }
      return cb(new Error('Only image files are allowed for thumbnails'));
    }
    
    cb(null, true);
  }
});

// Check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Check if user is a developer
const isDeveloper = (req: Request, res: Response, next: any) => {
  console.log("isDeveloper middleware called");
  console.log("isAuthenticated:", req.isAuthenticated());
  console.log("user:", req.user);
  
  if (req.isAuthenticated() && req.user?.isDeveloper) {
    console.log("User is a developer, proceeding...");
    return next();
  }
  console.log("Developer access denied");
  res.status(403).json({ message: "Developer access required" });
};

// Check if app belongs to the current developer
const isAppOwner = async (req: Request, res: Response, next: any) => {
  console.log("isAppOwner middleware called");
  
  const appId = parseInt(req.params.id);
  console.log("Checking app ID:", appId);
  
  if (isNaN(appId)) {
    console.log("Invalid app ID");
    return res.status(400).json({ message: "Invalid app ID" });
  }
  
  try {
    const app = await storage.getApp(appId);
    console.log("App found:", app ? "yes" : "no");
    
    if (!app) {
      console.log("App not found");
      return res.status(404).json({ message: "App not found" });
    }
    
    console.log("App developer ID:", app.developerId);
    console.log("Current user ID:", req.user?.id);
    
    if (app.developerId !== req.user!.id) {
      console.log("Permission denied - not app owner");
      return res.status(403).json({ message: "You don't have permission to manage this app" });
    }
    
    console.log("User is app owner, proceeding...");
    next();
  } catch (error) {
    console.error("Error in isAppOwner middleware:", error);
    res.status(500).json({ message: "Server error checking app ownership" });
  }
};

// Check if user is an admin
const isAdmin = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

// Check if user is the master admin
const isMasterAdmin = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user?.isMasterAdmin) {
    return next();
  }
  res.status(403).json({ message: "Master admin access required" });
};

// Check if video belongs to the current developer
const isVideoOwner = async (req: Request, res: Response, next: any) => {
  const videoId = parseInt(req.params.id);
  
  if (isNaN(videoId)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }
  
  try {
    const video = await storage.getVideo(videoId);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    if (video.developerId !== req.user!.id) {
      return res.status(403).json({ message: "You don't have permission to manage this video" });
    }
    
    next();
  } catch (error) {
    console.error("Error in isVideoOwner middleware:", error);
    res.status(500).json({ message: "Server error checking video ownership" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // User profile routes
  
  // Upload profile picture
  app.post("/api/user/profile-picture", isAuthenticated, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No profile picture uploaded" });
      }
      
      // Create the path to the uploaded file
      const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
      
      // Update user's profile picture
      const updatedUser = await storage.updateUser(req.user!.id, { 
        profilePicture: profilePicturePath 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "Profile picture updated successfully",
        profilePicture: profilePicturePath
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  
  // Update user profile
  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const { firstName, lastName, email, username } = req.body;
      
      // Check if email is already in use by another user
      if (email && email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user!.id) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }
      
      // Check if username is already in use by another user
      if (username && username !== req.user!.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== req.user!.id) {
          return res.status(400).json({ message: "Username is already in use" });
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(req.user!.id, {
        firstName,
        lastName,
        email,
        username
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Request developer status
  app.post("/api/user/request-developer", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is already a developer
      if (user.isDeveloper) {
        return res.status(400).json({ message: "You are already a developer" });
      }
      
      // Check if user already has a pending request
      if (user.hasDeveloperRequest) {
        return res.status(400).json({ message: "You already have a pending developer request" });
      }
      
      // Update user with developer request
      const updatedUser = await storage.updateUser(req.user!.id, {
        hasDeveloperRequest: true,
        developerRequestDate: new Date()
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to submit developer request" });
      }
      
      res.json({
        success: true,
        message: "Developer request submitted successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error requesting developer status:", error);
      res.status(500).json({ 
        message: "Failed to submit developer request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // App routes
  
  // Get all apps
  app.get("/api/apps", async (req, res) => {
    try {
      const apps = await storage.getAllApps();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch apps" });
    }
  });
  
  // Get featured apps
  app.get("/api/apps/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const apps = await storage.getFeaturedApps(limit);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured apps" });
    }
  });
  
  // Get top apps
  app.get("/api/apps/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const apps = await storage.getTopApps(limit);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top apps" });
    }
  });
  
  // Get apps by category and optional subcategory
  app.get("/api/apps/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const subcategory = req.query.subcategory as string | undefined;
      
      console.log(`Fetching apps for category: ${category}, subcategory: ${subcategory || 'none'}`);
      
      // If subcategory is provided, filter by both category and subcategory
      if (subcategory) {
        const allCategoryApps = await storage.getAppsByCategory(category);
        // Filter apps by subcategory (client-side filtering for now)
        const filteredApps = allCategoryApps.filter(app => 
          app.subCategory === subcategory
        );
        console.log(`Found ${filteredApps.length} apps in subcategory ${subcategory}`);
        return res.json(filteredApps);
      }
      
      // Otherwise, just get all apps in the category
      const apps = await storage.getAppsByCategory(category);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps by category/subcategory:", error);
      res.status(500).json({ message: "Failed to fetch apps by category" });
    }
  });
  
  // Get apps by developer ID
  app.get("/api/apps/developer/:developerId", async (req, res) => {
    try {
      const developerId = parseInt(req.params.developerId);
      if (isNaN(developerId)) {
        return res.status(400).json({ message: "Invalid developer ID" });
      }
      
      // Get developer info
      const developer = await storage.getUser(developerId);
      if (!developer) {
        return res.status(404).json({ message: "Developer not found" });
      }
      
      // Get apps by this developer
      const apps = await storage.getAppsByDeveloper(developerId);
      
      // Return only approved apps for public view
      const approvedApps = apps.filter(app => app.isApproved);
      res.json({
        developer: {
          username: developer.username,
          firstName: developer.firstName,
          lastName: developer.lastName
        },
        apps: approvedApps
      });
    } catch (error) {
      console.error("Error fetching developer apps:", error);
      res.status(500).json({ message: "Failed to fetch developer apps" });
    }
  });
  
  // Search apps
  app.get("/api/apps/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const apps = await storage.searchApps(query);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to search apps" });
    }
  });
  
  // Get app details
  app.get("/api/apps/:id", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      res.json(app);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch app details" });
    }
  });
  
  // Get app version history
  app.get("/api/apps/:id/versions", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // Only return version history for approved apps
      if (!app.isApproved) {
        return res.status(403).json({ message: "App is not available" });
      }
      
      const versions = await storage.getAppVersions(appId);
      
      // For public API, don't expose file paths or sensitive information
      const sanitizedVersions = versions.map(version => ({
        id: version.id,
        version: version.version,
        versionCode: version.versionCode,
        minAndroidVersion: version.minAndroidVersion,
        changelog: version.changelog,
        fileSize: version.fileSize,
        isLive: version.isLive,
        createdAt: version.createdAt
      }));
      
      res.json(sanitizedVersions);
    } catch (error) {
      console.error("Error fetching app version history:", error);
      res.status(500).json({ message: "Failed to fetch app version history" });
    }
  });
  
  // Get app reviews
  app.get("/api/apps/:id/reviews", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const reviews = await storage.getReviewsByApp(appId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch app reviews" });
    }
  });
  
  // Download app (increment download count)
  app.post("/api/apps/:id/download", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      const updatedApp = await storage.incrementDownloads(appId);
      res.json({ 
        success: true, 
        downloads: updatedApp?.downloads,
        // Include the direct download URL for the APK
        downloadUrl: `/api/apps/${appId}/download-apk`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to record download" });
    }
  });
  
  // Direct APK download with auto-installation for Android
  app.get("/api/apps/:id/download-apk", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app || !app.filePath) {
        return res.status(404).json({ message: "App or APK file not found" });
      }
      
      const isProduction = process.env.NODE_ENV === 'production';
      console.log(`Environment: ${isProduction ? 'Production' : 'Development'}, Node Path: ${process.cwd()}`);
      console.log(`Original file path from database: ${app.filePath}`);
      
      // Try multiple file path possibilities to handle different environments
      const possiblePaths = [];
      
      // 1. Absolute path with leading slash removed
      if (app.filePath.startsWith('/')) {
        possiblePaths.push(path.join(process.cwd(), app.filePath.substring(1)));
      }
      
      // 2. Path directly from cwd
      possiblePaths.push(path.join(process.cwd(), app.filePath));
      
      // 3. Just the uploads folder with basename
      possiblePaths.push(path.join(process.cwd(), 'uploads', path.basename(app.filePath)));
      
      // 4. For Replit deployment
      if (isProduction) {
        // Try direct path without cwd
        possiblePaths.push(app.filePath);
        
        // Try replit-specific path if in production
        if (process.env.REPL_SLUG) {
          possiblePaths.push(path.join('/home', 'runner', process.env.REPL_SLUG, app.filePath.startsWith('/') ? app.filePath.substring(1) : app.filePath));
        }
      }
      
      // 5. Directly from uploads folder
      possiblePaths.push(path.join('uploads', path.basename(app.filePath)));
      
      // 6. Directly use the relative path as stored
      possiblePaths.push(app.filePath.startsWith('/') ? app.filePath.substring(1) : app.filePath);
      
      // Log all possible paths we're going to try
      console.log('Trying the following paths:');
      possiblePaths.forEach((p, i) => console.log(`Path ${i+1}: ${p}`));
      
      // Find the first path that exists
      let filePath = null;
      for (const testPath of possiblePaths) {
        try {
          console.log(`Checking if path exists: ${testPath}`);
          if (fs.existsSync(testPath)) {
            filePath = testPath;
            console.log(`Found APK file at: ${filePath}`);
            break;
          } else {
            console.log(`Path does not exist: ${testPath}`);
          }
        } catch (err) {
          console.error(`Error checking path ${testPath}:`, err);
        }
      }
      
      if (!filePath) {
        console.error('APK file not found at any of the possible paths');
        return res.status(404).json({ 
          message: "APK file not found",
          debug: {
            appId,
            storedPath: app.filePath,
            triedPaths: possiblePaths
          }
        });
      }
      
      // Set headers for auto-installation on Android
      // For Android devices, use the Android-specific MIME type
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      
      // Force the APK extension in the filename to ensure proper handling
      const sanitizedAppName = app.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${sanitizedAppName}_v${app.version}.apk`;
      
      // Set Content-Disposition header with the enforced .apk extension
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Add security and download-related headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache');
      
      console.log(`Initiating download of ${fileName} from ${filePath}`);
      
      // Read and stream the file directly
      try {
        const fileStream = fs.createReadStream(filePath);
        
        // Handle file reading errors
        fileStream.on('error', (err) => {
          console.error('Error reading APK file:', err);
          if (!res.headersSent) {
            res.status(500).json({
              message: "Failed to read APK file",
              error: err.message
            });
          }
        });
        
        // Pipe the file to the response
        console.log(`Streaming APK file: ${filePath}`);
        fileStream.pipe(res);
      } catch (err) {
        console.error('Error creating read stream:', err);
        res.status(500).json({ 
          message: "Failed to process APK file",
          error: err instanceof Error ? err.message : String(err) 
        });
      }
    } catch (error) {
      console.error("Error in download APK route:", error);
      res.status(500).json({ 
        message: "Failed to download APK file", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Add review
  app.post("/api/apps/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      const review = await storage.createReview({
        appId,
        userId: req.user!.id,
        rating: req.body.rating,
        comment: req.body.comment
      });
      
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to add review" });
    }
  });
  
  // Developer routes
  
  // Get developer apps
  app.get("/api/developer/apps", isAuthenticated, isDeveloper, async (req, res) => {
    try {
      const apps = await storage.getAppsByDeveloper(req.user!.id);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch developer apps" });
    }
  });
  
  // Analytics routes
  
  // Get app daily statistics
  app.get("/api/developer/apps/:id/analytics/daily", isAuthenticated, isDeveloper, isAppOwner, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago by default
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(); // Today by default
      
      const stats = await storage.getDailyStats(appId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching daily analytics:", error);
      res.status(500).json({ message: "Failed to fetch daily analytics" });
    }
  });
  
  // Get app device statistics
  app.get("/api/developer/apps/:id/analytics/devices", isAuthenticated, isDeveloper, isAppOwner, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago by default
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(); // Today by default
      
      const stats = await storage.getDeviceStats(appId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching device analytics:", error);
      res.status(500).json({ message: "Failed to fetch device analytics" });
    }
  });
  
  // Get app geographic statistics
  app.get("/api/developer/apps/:id/analytics/geo", isAuthenticated, isDeveloper, isAppOwner, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago by default
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(); // Today by default
      
      const stats = await storage.getGeoStats(appId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching geographic analytics:", error);
      res.status(500).json({ message: "Failed to fetch geographic analytics" });
    }
  });
  
  // Get app acquisition statistics
  app.get("/api/developer/apps/:id/analytics/acquisition", isAuthenticated, isDeveloper, isAppOwner, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago by default
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(); // Today by default
      
      const stats = await storage.getAcquisitionStats(appId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching acquisition analytics:", error);
      res.status(500).json({ message: "Failed to fetch acquisition analytics" });
    }
  });
  
  // Add analytics data when app is downloaded
  app.post("/api/developer/apps/:id/analytics/record", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      const { 
        deviceModel = "Unknown", 
        androidVersion = "Unknown",
        country = "Unknown", 
        source = "direct",
        sessionDuration = 0,
        isNewUser = false,
        hasCrashed = false,
        hasANR = false
      } = req.body;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day
      
      // Update daily stats
      let dailyStats = await storage.getDailyStats(appId, today, today);
      if (dailyStats.length === 0) {
        // Create new daily stats entry
        await storage.addDailyStats({
          appId,
          date: today,
          downloads: 1,
          activeUsers: 1,
          newUsers: isNewUser ? 1 : 0,
          sessions: 1,
          avgSessionDuration: sessionDuration,
          crashCount: hasCrashed ? 1 : 0,
          anrCount: hasANR ? 1 : 0
        });
      } else {
        // Update existing stats
        const existingStats = dailyStats[0];
        await storage.updateDailyStats(appId, today, {
          downloads: existingStats.downloads + 1,
          activeUsers: existingStats.activeUsers + 1,
          newUsers: existingStats.newUsers + (isNewUser ? 1 : 0),
          sessions: existingStats.sessions + 1,
          avgSessionDuration: Math.round((existingStats.avgSessionDuration * existingStats.sessions + sessionDuration) / (existingStats.sessions + 1)),
          crashCount: existingStats.crashCount + (hasCrashed ? 1 : 0),
          anrCount: existingStats.anrCount + (hasANR ? 1 : 0)
        });
      }
      
      // Update device stats
      await storage.updateDeviceStats(appId, today, deviceModel, androidVersion, 1);
      
      // Update geo stats
      await storage.updateGeoStats(appId, today, country, 1);
      
      // Update acquisition stats
      await storage.updateAcquisitionStats(appId, today, source, 1);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording analytics:", error);
      res.status(500).json({ message: "Failed to record analytics data" });
    }
  });
  
  // Create new app
  app.post(
    "/api/developer/apps", 
    isAuthenticated, 
    isDeveloper, 
    upload.fields([
      { name: 'apkFile', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'screenshots', maxCount: 5 }
    ]), 
    async (req, res) => {
      try {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        
        if (!files.apkFile || !files.icon) {
          return res.status(400).json({ message: "APK file and icon are required" });
        }
        
        const apkFile = files.apkFile[0];
        const iconFile = files.icon[0];
        const bannerFile = files.banner ? files.banner[0] : null;
        const screenshotFiles = files.screenshots || [];
        
        // Try to extract metadata from the APK file
        let apkMetadata = null;
        try {
          const { extractApkMetadata } = require('./util/apk-reader');
          apkMetadata = await extractApkMetadata(apkFile.path);
          console.log('Extracted APK metadata:', apkMetadata);
        } catch (error) {
          console.error('Failed to extract APK metadata:', error);
          // We'll continue without the metadata - just log the error
        }
        
        // Parse and validate app data
        try {
          // Prepare data for validation - use extracted metadata if available
          let formData = { ...req.body };
          
          // If we have APK metadata, use it to populate/override certain fields
          if (apkMetadata) {
            console.log('Using extracted metadata from APK file');
            
            // APK metadata takes precedence over form data for these fields
            formData = {
              ...formData,
              packageName: apkMetadata.packageName,
              version: apkMetadata.versionName,
              versionCode: apkMetadata.versionCode
            };
            
            // If we have SDK version info and it's not already set, use it
            if (apkMetadata.minSdkVersion) {
              const { sdkToAndroidVersion } = require('./util/apk-reader');
              const minAndroidVersion = sdkToAndroidVersion(apkMetadata.minSdkVersion);
              if (minAndroidVersion && !formData.minAndroidVersion) {
                formData.minAndroidVersion = minAndroidVersion;
              }
            }
          } else {
            // No metadata, still ensure versionCode is a number if it's a string
            if (typeof formData.versionCode === 'string') {
              formData.versionCode = parseInt(formData.versionCode, 10);
            }
          }
          
          const validatedData = appUploadSchema.parse(formData);
          
          const iconUrl = `/uploads/icons/${path.basename(iconFile.path)}`;
          const bannerUrl = bannerFile ? `/uploads/banners/${path.basename(bannerFile.path)}` : null;
          const screenshotUrls = screenshotFiles.map(file => 
            `/uploads/screenshots/${path.basename(file.path)}`
          );
          
          // Create app in storage
          const newApp = await storage.createApp({
            developerId: req.user!.id,
            name: validatedData.name,
            description: validatedData.description,
            shortDescription: validatedData.shortDescription || "",
            version: validatedData.version,
            packageName: validatedData.packageName,
            category: validatedData.category,
            subCategory: validatedData.subCategory || null,
            iconUrl: iconUrl,
            bannerUrl: bannerUrl,
            screenshotUrls: screenshotUrls,
            fileSize: apkFile.size,
            filePath: `/uploads/apk/${path.basename(apkFile.path)}`,
            minAndroidVersion: validatedData.minAndroidVersion,
            isApproved: false // App needs admin approval before being published
          });
          
          res.status(201).json(newApp);
        } catch (error) {
          // Clean up uploaded files if validation fails
          if (apkFile) fs.unlinkSync(apkFile.path);
          if (iconFile) fs.unlinkSync(iconFile.path);
          if (bannerFile) fs.unlinkSync(bannerFile.path);
          screenshotFiles.forEach(file => fs.unlinkSync(file.path));
          
          if (error instanceof ZodError) {
            console.error("ZodError validation failed:", JSON.stringify(error.errors, null, 2));
            console.error("Request body:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({ 
              message: "Invalid app data", 
              errors: error.errors,
              debugInfo: {
                receivedFields: Object.keys(req.body),
                requiredFields: ['name', 'description', 'version', 'versionCode', 'packageName', 'category']
              } 
            });
          }
          throw error;
        }
      } catch (error) {
        console.error("Error uploading app:", error);
        res.status(500).json({ message: "Failed to upload app" });
      }
    }
  );
  
  // Fetch app info from Play Store by package name
  app.get("/api/developer/play-store-info", isAuthenticated, isDeveloper, async (req, res) => {
    try {
      const { packageName } = req.query;
      
      if (!packageName || typeof packageName !== 'string') {
        return res.status(400).json({ message: "Package name is required" });
      }
      
      // Import the Play Store scraper
      const { getPlayStoreAppInfo } = await import('./util/play-store-scraper');
      
      // Get app info from Play Store
      const appInfo = await getPlayStoreAppInfo(packageName);
      
      if (!appInfo) {
        return res.status(404).json({ 
          message: "App not found on Play Store or couldn't retrieve information" 
        });
      }
      
      // Return the app info
      res.json({
        success: true,
        data: appInfo
      });
    } catch (error) {
      console.error("Error fetching Play Store app info:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch app info from Play Store", 
        error: error.message 
      });
    }
  });

  // Update app
  app.put(
    "/api/developer/apps/:id", 
    isAuthenticated, 
    isDeveloper, 
    isAppOwner,
    upload.fields([
      { name: 'apkFile', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'screenshots', maxCount: 5 }
    ]), 
    async (req, res) => {
      try {
        const appId = parseInt(req.params.id);
        const app = await storage.getApp(appId);
        if (!app) {
          return res.status(404).json({ message: "App not found" });
        }
        
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        
        // Start with existing app data
        let updateData: Partial<any> = { ...req.body };
        
        // If category has changed but subcategory is for the old category, clear it
        if (updateData.category && updateData.category !== app.category && updateData.subCategory) {
          if (!appSubCategories[updateData.category]?.includes(updateData.subCategory)) {
            updateData.subCategory = null;
          }
        }
        
        // If category is not "Video", clear subcategory
        if (updateData.category && updateData.category !== "Video") {
          updateData.subCategory = null;
        }
        
        // Handle file uploads if present
        if (files.apkFile && files.apkFile[0]) {
          const apkFile = files.apkFile[0];
          updateData.fileSize = apkFile.size;
          updateData.filePath = `/uploads/apk/${path.basename(apkFile.path)}`;
          // Delete old file if exists and different
          if (app.filePath && app.filePath !== updateData.filePath) {
            const oldPath = path.join(process.cwd(), app.filePath.replace('/uploads', 'uploads'));
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
        }
        
        if (files.icon && files.icon[0]) {
          const iconFile = files.icon[0];
          updateData.iconUrl = `/uploads/icons/${path.basename(iconFile.path)}`;
          // Delete old icon if exists and different
          if (app.iconUrl && app.iconUrl !== updateData.iconUrl) {
            const oldPath = path.join(process.cwd(), app.iconUrl.replace('/uploads', 'uploads'));
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
        }
        
        if (files.banner && files.banner[0]) {
          const bannerFile = files.banner[0];
          updateData.bannerUrl = `/uploads/banners/${path.basename(bannerFile.path)}`;
          // Delete old banner if exists and different
          if (app.bannerUrl && app.bannerUrl !== updateData.bannerUrl) {
            const oldPath = path.join(process.cwd(), app.bannerUrl.replace('/uploads', 'uploads'));
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
        }
        
        if (files.screenshots && files.screenshots.length > 0) {
          const screenshotUrls = files.screenshots.map(file => 
            `/uploads/screenshots/${path.basename(file.path)}`
          );
          // If merging with existing screenshots
          if (req.body.keepExistingScreenshots === 'true') {
            updateData.screenshotUrls = [...app.screenshotUrls, ...screenshotUrls];
          } else {
            // Delete old screenshots
            app.screenshotUrls.forEach(url => {
              const oldPath = path.join(process.cwd(), url.replace('/uploads', 'uploads'));
              if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
              }
            });
            updateData.screenshotUrls = screenshotUrls;
          }
        }
        
        // Update app
        const updatedApp = await storage.updateApp(appId, updateData);
        res.json(updatedApp);
      } catch (error) {
        console.error("Error updating app:", error);
        res.status(500).json({ message: "Failed to update app" });
      }
    }
  );
  
  // Delete app
  app.delete("/api/developer/apps/:id", isAuthenticated, isDeveloper, isAppOwner, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // Delete associated files
      if (app.filePath) {
        const filePath = path.join(process.cwd(), app.filePath.replace('/uploads', 'uploads'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      if (app.iconUrl) {
        const iconPath = path.join(process.cwd(), app.iconUrl.replace('/uploads', 'uploads'));
        if (fs.existsSync(iconPath)) {
          fs.unlinkSync(iconPath);
        }
      }
      
      app.screenshotUrls.forEach(url => {
        const screenshotPath = path.join(process.cwd(), url.replace('/uploads', 'uploads'));
        if (fs.existsSync(screenshotPath)) {
          fs.unlinkSync(screenshotPath);
        }
      });
      
      // Delete app from storage
      const success = await storage.deleteApp(appId);
      if (success) {
        res.json({ success: true, message: "App successfully deleted" });
      } else {
        res.status(404).json({ success: false, message: "App not found or could not be deleted" });
      }
    } catch (error) {
      console.error("Error deleting app:", error);
      
      // Provide a more helpful error message
      let errorMessage = "Failed to delete app due to an internal error";
      
      if (error instanceof Error) {
        if (error.message.includes("foreign key constraint")) {
          errorMessage = "Failed to delete app because it still has associated records (reviews, stats, etc.)";
        } else {
          errorMessage = `Failed to delete app: ${error.message}`;
        }
      }
      
      res.status(500).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  });
  
  // App version management routes
  
  // Get all versions of an app
  app.get("/api/developer/apps/:id/versions", isAuthenticated, isDeveloper, isAppOwner, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const versions = await storage.getAppVersions(appId);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching app versions:", error);
      res.status(500).json({ message: "Failed to fetch app versions" });
    }
  });
  
  // Get specific version
  app.get("/api/developer/apps/versions/:versionId", isAuthenticated, isDeveloper, async (req, res) => {
    try {
      const versionId = parseInt(req.params.versionId);
      if (isNaN(versionId)) {
        return res.status(400).json({ message: "Invalid version ID" });
      }
      
      const version = await storage.getAppVersion(versionId);
      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }
      
      // Check if the user owns the app this version belongs to
      const app = await storage.getApp(version.appId);
      if (!app || app.developerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to access this version" });
      }
      
      res.json(version);
    } catch (error) {
      console.error("Error fetching app version:", error);
      res.status(500).json({ message: "Failed to fetch app version" });
    }
  });
  
  // Upload new app version
  // Extract metadata from APK file
  app.post("/api/developer/extract-apk-metadata", isAuthenticated, isDeveloper, upload.single('apkFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No APK file provided" });
      }
      
      console.log('Extracting metadata from APK file:', req.file.path);
      const { extractApkMetadata } = require('./util/apk-reader');
      
      // Extract metadata from the uploaded APK file
      const metadata = await extractApkMetadata(req.file.path);
      
      // Return the extracted metadata
      res.json(metadata);
      
      // Clean up the temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error removing temporary APK file:', err);
      });
    } catch (error) {
      console.error("Error extracting APK metadata:", error);
      
      // Clean up the temporary file if it exists
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error removing temporary APK file:', err);
        });
      }
      
      res.status(500).json({ message: "Failed to extract metadata from APK file" });
    }
  });
  
  app.post("/api/developer/apps/:id/versions", isAuthenticated, isDeveloper, isAppOwner, upload.single('apkFile'), async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      // Check if app exists
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // Validate request data
      if (!req.file) {
        return res.status(400).json({ message: "No APK file uploaded" });
      }
      
      try {
        // Try to extract metadata from the APK file
        let apkMetadata = null;
        try {
          const { extractApkMetadata } = require('./util/apk-reader');
          apkMetadata = await extractApkMetadata(req.file.path);
          console.log('Extracted version APK metadata:', apkMetadata);
        } catch (error) {
          console.error('Failed to extract version APK metadata:', error);
          // We'll continue without the metadata - just log the error
        }
        
        // Prepare data for validation - use extracted metadata if available
        let formData = { ...req.body, appId };
        
        // If we have APK metadata, use it to populate/override certain fields
        if (apkMetadata) {
          console.log('Using extracted metadata from version APK file');
          
          // APK metadata takes precedence over form data for these fields
          formData = {
            ...formData,
            version: apkMetadata.versionName,
            versionCode: apkMetadata.versionCode
          };
          
          // If we have SDK version info and it's not already set, use it
          if (apkMetadata.minSdkVersion) {
            const { sdkToAndroidVersion } = require('./util/apk-reader');
            const minAndroidVersion = sdkToAndroidVersion(apkMetadata.minSdkVersion);
            if (minAndroidVersion && !formData.minAndroidVersion) {
              formData.minAndroidVersion = minAndroidVersion;
            }
          }
        } else {
          // No metadata, still ensure versionCode is a number if it's a string
          if (typeof formData.versionCode === 'string') {
            formData.versionCode = parseInt(formData.versionCode, 10);
          }
        }
        
        // Parse the version data
        const versionData = appVersionUploadSchema.parse(formData);
        
        // Get the file details
        const apkFile = req.file;
        const filePath = `/uploads/apk/${apkFile.filename}`;
        const fileSize = apkFile.size;
        
        // Check if this version number already exists for this app
        const existingVersion = await storage.getAppVersionByVersion(appId, versionData.version);
        if (existingVersion) {
          // Remove the uploaded file since we're not going to use it
          const fullPath = path.join(process.cwd(), filePath.replace('/uploads', 'uploads'));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
          return res.status(400).json({ message: "Version number already exists for this app" });
        }
        
        // Create the new version
        const newVersion = await storage.addAppVersion({
          appId,
          version: versionData.version,
          versionCode: versionData.versionCode,
          minAndroidVersion: versionData.minAndroidVersion,
          changeLog: versionData.changeLog,
          filePath,
          fileSize,
          isLive: false, // New versions are not live by default
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.status(201).json(newVersion);
      } catch (error) {
        // If validation fails, remove the uploaded file
        if (req.file) {
          const fullPath = path.join(process.cwd(), `/uploads/apk/${req.file.filename}`);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
        
        if (error instanceof ZodError) {
          return res.status(400).json({ 
            message: "Invalid version data", 
            errors: error.errors 
          });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error adding app version:", error);
      res.status(500).json({ message: "Failed to add app version" });
    }
  });
  
  // Update app version
  app.patch("/api/developer/apps/versions/:versionId", isAuthenticated, isDeveloper, async (req, res) => {
    try {
      const versionId = parseInt(req.params.versionId);
      if (isNaN(versionId)) {
        return res.status(400).json({ message: "Invalid version ID" });
      }
      
      // Get the version
      const version = await storage.getAppVersion(versionId);
      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }
      
      // Check if the user owns the app this version belongs to
      const app = await storage.getApp(version.appId);
      if (!app || app.developerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this version" });
      }
      
      // Only allow updating certain fields
      const { changeLog, isLive } = req.body;
      const updateData: Partial<typeof version> = {};
      
      if (changeLog !== undefined) updateData.changeLog = changeLog;
      if (isLive !== undefined) updateData.isLive = isLive;
      
      const updatedVersion = await storage.updateAppVersion(versionId, updateData);
      
      res.json(updatedVersion);
    } catch (error) {
      console.error("Error updating app version:", error);
      res.status(500).json({ message: "Failed to update app version" });
    }
  });
  
  // Set a version as live
  app.post("/api/developer/apps/:appId/versions/:versionId/set-live", isAuthenticated, isDeveloper, async (req, res) => {
    try {
      const appId = parseInt(req.params.appId);
      const versionId = parseInt(req.params.versionId);
      
      if (isNaN(appId) || isNaN(versionId)) {
        return res.status(400).json({ message: "Invalid app ID or version ID" });
      }
      
      // Check app ownership
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      if (app.developerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to manage this app" });
      }
      
      // Check if version exists and belongs to this app
      const version = await storage.getAppVersion(versionId);
      if (!version || version.appId !== appId) {
        return res.status(404).json({ message: "Version not found for this app" });
      }
      
      // Set this version as live
      const success = await storage.setVersionAsLive(appId, versionId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to set version as live" });
      }
      
      // Get the updated app with the new version
      const updatedApp = await storage.getApp(appId);
      
      res.json({
        message: "Version set as live successfully",
        app: updatedApp
      });
    } catch (error) {
      console.error("Error setting version as live:", error);
      res.status(500).json({ message: "Failed to set version as live" });
    }
  });
  
  // Delete an app version
  app.delete("/api/developer/apps/versions/:versionId", isAuthenticated, isDeveloper, async (req, res) => {
    try {
      const versionId = parseInt(req.params.versionId);
      if (isNaN(versionId)) {
        return res.status(400).json({ message: "Invalid version ID" });
      }
      
      // Get the version
      const version = await storage.getAppVersion(versionId);
      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }
      
      // Check if the user owns the app this version belongs to
      const app = await storage.getApp(version.appId);
      if (!app || app.developerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this version" });
      }
      
      // Don't allow deleting the live version
      if (version.isLive) {
        return res.status(400).json({ message: "Cannot delete the currently active version" });
      }
      
      // Delete the APK file
      if (version.filePath) {
        const filePath = path.join(process.cwd(), version.filePath.replace('/uploads', 'uploads'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Delete the version
      const success = await storage.deleteAppVersion(versionId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete app version" });
      }
      
      res.json({ message: "Version deleted successfully" });
    } catch (error) {
      console.error("Error deleting app version:", error);
      res.status(500).json({ message: "Failed to delete app version" });
    }
  });
  
  // Admin routes
  
  // Helper route to seed a pending app for testing
  app.post("/api/admin/seed-pending-app", async (req, res) => {
    try {
      // Create a test app that needs approval
      const devUser = await storage.getUserByUsername("devtest");
      if (!devUser) {
        return res.status(404).json({ message: "Developer test user not found" });
      }
      
      const randomNum = Math.floor(Math.random() * 10000);
      const pendingApp = await storage.createApp({
        developerId: devUser.id,
        name: `Test Pending App ${randomNum}`,
        description: "This is a test app waiting for approval. It demonstrates the admin approval workflow.",
        shortDescription: "Test app for admin approval",
        version: "1.0.0",
        packageName: `com.test.pendingapp${randomNum}`,
        category: "Tools",
        iconUrl: "/uploads/demo/pending_app_icon.svg",
        screenshotUrls: JSON.parse('["\/uploads\/demo\/pending_screenshot1.svg", "\/uploads\/demo\/pending_screenshot2.svg"]'),
        fileSize: 5242880, // 5MB
        filePath: "/uploads/demo/pending_app.apk",
        minAndroidVersion: "6.0",
        isApproved: false
      });
      
      res.json({ message: "Pending app created for testing", app: pendingApp });
    } catch (error) {
      console.error("Error creating pending test app:", error);
      res.status(500).json({ message: "Failed to create pending test app" });
    }
  });
  
  // Admin - Get pending app approvals
  app.get("/api/admin/pending-approvals", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pendingApps = await storage.getPendingApprovalApps();
      res.json(pendingApps);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });
  
  // Admin - Approve or reject an app
  app.put("/api/admin/apps/:id/approval", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const { approve, reason } = req.body;
      
      if (typeof approve !== 'boolean') {
        return res.status(400).json({ message: "Missing 'approve' parameter (boolean)" });
      }
      
      // Get the app
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // If rejected and no reason is provided, require one
      if (!approve && (!reason || reason.trim() === '')) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      // Update the app's approval status
      const updatedApp = await storage.updateApp(appId, { 
        isApproved: approve,
        rejectionReason: approve ? null : reason
      });
      
      // TODO: Send notification to the developer
      
      res.json({ 
        success: true, 
        message: approve ? "App has been approved" : "App has been rejected",
        app: updatedApp
      });
    } catch (error) {
      console.error("Error updating app approval:", error);
      res.status(500).json({ message: "Failed to update app approval status" });
    }
  });
  
  // Get all developers
  app.get("/api/admin/developers", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get all users that are developers
      const developers = await db.select().from(users);
      res.json(developers);
    } catch (error) {
      console.error("Error fetching developers:", error);
      res.status(500).json({ message: "Failed to fetch developers" });
    }
  });
  
  // Get all apps for admin
  app.get("/api/admin/apps", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allApps = await storage.getAllApps();
      res.json(allApps);
    } catch (error) {
      console.error("Error fetching apps for admin:", error);
      res.status(500).json({ message: "Failed to fetch apps" });
    }
  });
  
  // Delete all demo apps from the database
  app.post("/api/admin/delete-demo-apps", isAuthenticated, isMasterAdmin, async (req, res) => {
    try {
      // Get the current directory and build the path to clean-demo-apps.js
      const cleanDemoAppsPath = path.resolve(process.cwd(), './clean-demo-apps.js');
      console.log("Loading demo apps script from:", cleanDemoAppsPath);
      
      // Import using a dynamic import
      const demoAppModule = await import(`file://${cleanDemoAppsPath}`);
      const deleteAllDemoApps = demoAppModule.deleteAllDemoApps;
      
      console.log("Successfully loaded deleteAllDemoApps function");
      
      // Execute the deletion
      const result = await deleteAllDemoApps({ 
        db, 
        keepDeveloperId: null, // Don't keep any developer's apps
        closePool: false // Don't close the pool as we need it for the server
      });
      
      if (result.success) {
        console.log(`Successfully deleted ${result.deletedCount} demo apps`);
        res.status(200).json({ 
          message: `Successfully deleted ${result.deletedCount} demo apps`,
          ...result 
        });
      } else {
        console.log("Failed to delete some or all demo apps");
        res.status(500).json({ 
          message: "Failed to delete some or all demo apps",
          ...result 
        });
      }
    } catch (error) {
      console.error("Error deleting demo apps:", error);
      res.status(500).json({ message: "Error deleting demo apps", error: error.message });
    }
  });
  
  // Get all reviews for admin
  app.get("/api/admin/reviews", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allReviews = await db.select().from(reviews);
      res.json(allReviews);
    } catch (error) {
      console.error("Error fetching reviews for admin:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Get apps pending approval
  app.get("/api/admin/apps/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pendingApps = await storage.getPendingApprovalApps();
      res.json(pendingApps);
    } catch (error) {
      console.error("Error fetching pending apps:", error);
      res.status(500).json({ message: "Failed to fetch pending apps" });
    }
  });
  
  // Approve an app
  app.post("/api/admin/apps/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      const updatedApp = await storage.updateApp(appId, { 
        isApproved: true 
      });
      
      if (!updatedApp) {
        return res.status(500).json({ message: "Failed to approve app" });
      }
      
      res.status(200).json(updatedApp);
    } catch (error) {
      console.error("Error approving app:", error);
      res.status(500).json({ message: "Failed to approve app" });
    }
  });
  
  // Reject an app
  app.post("/api/admin/apps/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      const { reason } = req.body;
      
      if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      // Update the app with rejection reason and set isApproved to false explicitly
      const updatedApp = await storage.updateApp(appId, { 
        isApproved: false,
        rejectionReason: reason
      });
      
      if (!updatedApp) {
        return res.status(500).json({ message: "Failed to reject app" });
      }
      
      res.status(200).json({ 
        message: "App rejected",
        app: updatedApp
      });
    } catch (error) {
      console.error("Error rejecting app:", error);
      res.status(500).json({ message: "Failed to reject app" });
    }
  });
  
  // Suspend an app (temporary removal from listings)
  app.post("/api/admin/apps/:id/suspend", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // Update app to suspended state
      const updatedApp = await storage.updateApp(appId, { isSuspended: true });
      
      if (!updatedApp) {
        return res.status(500).json({ message: "Failed to suspend app" });
      }
      
      res.status(200).json({ message: "App suspended successfully", app: updatedApp });
    } catch (error) {
      console.error("Error suspending app:", error);
      res.status(500).json({ message: "Failed to suspend app" });
    }
  });
  
  // Unsuspend an app (restore to listings)
  app.post("/api/admin/apps/:id/unsuspend", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // Update app to unsuspended state
      const updatedApp = await storage.updateApp(appId, { isSuspended: false });
      
      if (!updatedApp) {
        return res.status(500).json({ message: "Failed to unsuspend app" });
      }
      
      res.status(200).json({ message: "App unsuspended successfully", app: updatedApp });
    } catch (error) {
      console.error("Error unsuspending app:", error);
      res.status(500).json({ message: "Failed to unsuspend app" });
    }
  });
  
  // Permanently remove an app and all associated data
  app.delete("/api/admin/apps/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid app ID" });
      }
      
      const app = await storage.getApp(appId);
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }
      
      // Delete the app and all associated data
      const success = await storage.deleteApp(appId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete app" });
      }
      
      res.status(200).json({ 
        success: true,
        message: `App "${app.name}" (ID: ${appId}) has been permanently deleted`
      });
    } catch (error) {
      console.error("Error deleting app:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete app", 
        error: error.message || "Unknown error" 
      });
    }
  });
  
  // Make a user admin
  app.put("/api/admin/users/:id/make-admin", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { isAdmin: true });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Make a user developer
  app.put("/api/admin/users/:id/make-developer", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { 
        isDeveloper: true,
        hasDeveloperRequest: false  // Clear the request flag when approved
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error making user developer:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Get users with pending developer requests
  app.get("/api/admin/developer-requests", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Using db directly for the query
      const pendingRequests = await db.select()
        .from(users)
        .where(eq(users.hasDeveloperRequest, true))
        .orderBy(asc(users.developerRequestDate));
      
      res.json(pendingRequests);
    } catch (error) {
      console.error("Error fetching developer requests:", error);
      res.status(500).json({ 
        message: "Failed to fetch developer requests",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Deny a developer request
  app.put("/api/admin/users/:id/deny-developer-request", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Clear the developer request flag
      const updatedUser = await storage.updateUser(userId, { 
        hasDeveloperRequest: false
      });
      
      res.json({
        success: true,
        message: "Developer request denied",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error denying developer request:", error);
      res.status(500).json({ message: "Failed to deny developer request" });
    }
  });
  
  // Remove admin role from user
  app.put("/api/admin/users/:id/remove-admin", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if this is the master admin - cannot remove admin role from master admin
      const masterAdmin = await storage.getMasterAdmin();
      if (masterAdmin && masterAdmin.id === userId) {
        return res.status(403).json({ message: "Cannot remove admin role from master admin" });
      }
      
      const updatedUser = await storage.updateUser(userId, { isAdmin: false });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error removing admin role:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Remove developer role from user
  app.put("/api/admin/users/:id/remove-developer", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { isDeveloper: false });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error removing developer role:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Block a user account
  app.put("/api/admin/users/:id/block", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow blocking the master admin
      if (user.isMasterAdmin) {
        return res.status(403).json({ 
          message: "Cannot block the master administrator account"
        });
      }
      
      const updatedUser = await storage.updateUser(userId, { isBlocked: true });
      res.json({ 
        message: "User blocked successfully", 
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });
  
  // Unblock a user account
  app.put("/api/admin/users/:id/unblock", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { isBlocked: false });
      res.json({ 
        message: "User unblocked successfully", 
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });
  
  // Master Admin routes
  
  // Get info about the master admin
  app.get("/api/master-admin", isAuthenticated, isMasterAdmin, async (req, res) => {
    try {
      res.json({
        status: "success",
        isMasterAdmin: true,
        message: "You are the master administrator"
      });
    } catch (error) {
      console.error("Error checking master admin status:", error);
      res.status(500).json({ message: "Error checking master admin status" });
    }
  });

  // Promote user to admin (only master admin can do this)
  app.put("/api/master-admin/users/:id/promote", isAuthenticated, isMasterAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { role } = req.body;
      if (!role || (role !== 'admin' && role !== 'developer')) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'developer'" });
      }
      
      const success = await promoteUser(userId, role);
      
      if (success) {
        const updatedUser = await storage.getUser(userId);
        res.json({
          success: true,
          message: `User successfully promoted to ${role}`,
          user: updatedUser
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: `User could not be promoted to ${role}. They might already have this role.` 
        });
      }
    } catch (error) {
      console.error(`Error promoting user:`, error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });
  
  // Video routes
  
  // Get all videos by the current developer
  app.get("/api/videos/developer", isDeveloper, async (req, res) => {
    try {
      const videos = await storage.getVideosByDeveloper(req.user!.id);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching developer videos:", error);
      res.status(500).json({ message: "Failed to fetch developer videos" });
    }
  });
  
  // Get video details
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video details:", error);
      res.status(500).json({ message: "Failed to fetch video details" });
    }
  });
  
  // Upload a new video
  app.post("/api/videos", isDeveloper, upload.fields([
    { name: 'videoFile', maxCount: 1 }, 
    { name: 'thumbnailFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Validate the request
      if (!req.files) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.videoFile || files.videoFile.length === 0) {
        return res.status(400).json({ message: "Video file is required" });
      }
      
      if (!files.thumbnailFile || files.thumbnailFile.length === 0) {
        return res.status(400).json({ message: "Thumbnail file is required" });
      }
      
      // Parse and validate the form data
      try {
        const { title, description, category, tags } = await videoUploadSchema.parseAsync(req.body);
        
        // Create paths to the uploaded files
        const videoPath = `/uploads/videos/${files.videoFile[0].filename}`;
        const thumbnailPath = `/uploads/thumbnails/${files.thumbnailFile[0].filename}`;
        
        // Create video record
        const video = await storage.createVideo({
          title,
          description,
          category,
          tags: tags || "",
          developerId: req.user!.id,
          videoPath,
          thumbnailPath,
          duration: 0, // This would typically be extracted from the video file
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.status(201).json(video);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({ 
            message: "Invalid video data", 
            errors: err.errors 
          });
        }
        throw err;
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });
  
  // Update video details
  app.patch("/api/videos/:id", isDeveloper, isVideoOwner, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      // Update video
      const updatedVideo = await storage.updateVideo(videoId, req.body);
      
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });
  
  // Update video thumbnail
  app.post("/api/videos/:id/thumbnail", isDeveloper, isVideoOwner, upload.single('thumbnailFile'), async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "No thumbnail file uploaded" });
      }
      
      // Create path to the uploaded file
      const thumbnailPath = `/uploads/thumbnails/${req.file.filename}`;
      
      // Update video with new thumbnail
      const updatedVideo = await storage.updateVideo(videoId, { 
        thumbnailPath,
        updatedAt: new Date()
      });
      
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json({ 
        message: "Thumbnail updated successfully",
        thumbnailPath: updatedVideo.thumbnailPath
      });
    } catch (error) {
      console.error("Error updating video thumbnail:", error);
      res.status(500).json({ message: "Failed to update video thumbnail" });
    }
  });
  
  // Delete a video
  app.delete("/api/videos/:id", isDeveloper, isVideoOwner, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      // Get the video to find file paths
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Delete the files
      try {
        // Convert relative paths to absolute paths
        const videoFilePath = path.join(process.cwd(), video.videoPath.substring(1));
        const thumbnailFilePath = path.join(process.cwd(), video.thumbnailPath.substring(1));
        
        // Delete video file
        if (fs.existsSync(videoFilePath)) {
          fs.unlinkSync(videoFilePath);
        }
        
        // Delete thumbnail file
        if (fs.existsSync(thumbnailFilePath)) {
          fs.unlinkSync(thumbnailFilePath);
        }
      } catch (error) {
        console.error("Error deleting video files:", error);
        // Continue with deletion from database even if file deletion fails
      }
      
      // Delete from database
      const success = await storage.deleteVideo(videoId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete video" });
      }
      
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}
