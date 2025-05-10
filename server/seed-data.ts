import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { apps, users, reviews } from "@shared/schema";
import { appCategories } from "@shared/schema";
import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Helper function to check if demo uploads directory exists
function ensureDemoUploadsDir() {
  const demoDirs = [
    'uploads/demo',
    'uploads/demo/icons',
    'uploads/demo/screenshots',
    'uploads/demo/apk'
  ];
  
  for (const dir of demoDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Function to create a simple color-coded SVG icon
function createDemoIcon(name: string, color: string): string {
  const filename = `uploads/demo/${name}_icon.svg`;
  const initials = name.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
    
  const svg = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
    <rect width="192" height="192" rx="42" fill="${color}"/>
    <text x="96" y="96" font-family="Arial" font-size="80" text-anchor="middle" dominant-baseline="central" fill="white">${initials}</text>
  </svg>`;
  
  fs.writeFileSync(filename, svg);
  return `/uploads/demo/${name}_icon.svg`;
}

// Function to create a simple demo screenshot
function createDemoScreenshot(name: string, index: number, color: string): string {
  const filename = `uploads/demo/${name}_${index}.svg`;
  
  const svg = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1920" fill="${color}"/>
    <rect x="40" y="80" width="1000" height="100" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="40" y="220" width="1000" height="400" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="40" y="660" width="480" height="200" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="560" y="660" width="480" height="200" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="40" y="900" width="1000" height="300" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="40" y="1240" width="1000" height="80" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="40" y="1360" width="1000" height="80" rx="10" fill="white" fill-opacity="0.2"/>
    <rect x="40" y="1480" width="1000" height="80" rx="10" fill="white" fill-opacity="0.2"/>
    <text x="540" y="1750" font-family="Arial" font-size="60" text-anchor="middle" fill="white">${name} - Screen ${index}</text>
  </svg>`;
  
  fs.writeFileSync(filename, svg);
  return `/uploads/demo/${name}_${index}.svg`;
}

// Function to create a simple APK placeholder file
function createDemoApk(name: string): string {
  const filename = `uploads/demo/${name}.txt`;
  fs.writeFileSync(filename, `This is a demo APK file for ${name}`);
  return `/uploads/demo/${name}.txt`;
}

export async function seedDatabase(force = false) {
  console.log("Seeding database with demo data...");
  
  try {
    // Check if apps already exist
    const existingApps = await db.select().from(apps);
    
    if (existingApps.length > 0 && !force) {
      console.log("Database already has app data, skipping seed. Use force=true to override.");
      return;
    }
    
    // Only proceed with seeding if there are no existing apps 
    // or the user has explicitly requested to reseed with the force flag
    if (existingApps.length > 0 && !force) {
      console.log("Apps already exist, skipping app seeding.");
      return;
    }
    
    // We're no longer going to delete existing apps
    // This prevents admin-approved apps from being lost on server restart
    console.log("Adding seed data while preserving existing apps...")
    
    // Ensure demo upload directories exist
    ensureDemoUploadsDir();
    
    // Get existing users or create new demo users
    console.log("Getting or creating users...");
    const existingUsers = await db.select().from(users);
    
    let createdUsers;
    
    if (existingUsers.length > 0) {
      console.log("Using existing users for demo data...");
      createdUsers = existingUsers;
      
      // Ensure at least one developer
      const developerExists = existingUsers.some(user => user.isDeveloper);
      if (!developerExists && existingUsers.length > 0) {
        console.log("Making first user a developer...");
        await db.update(users)
          .set({ isDeveloper: true })
          .where(eq(users.id, existingUsers[0].id));
        
        existingUsers[0].isDeveloper = true;
      }
    } else {
      // Create new demo users
      console.log("Creating demo users...");
      const demoUsers = [
        {
          username: "demo_admin",
          email: "admin@example.com",
          password: await hashPassword("password123"),
          firstName: "Admin",
          lastName: "User",
          isDeveloper: true,
          isAdmin: true,
          isMasterAdmin: false, // Not a master admin by default
          createdAt: new Date()
        },
        {
          username: "demo_user1",
          email: "user1@example.com",
          password: await hashPassword("password123"),
          firstName: "Regular",
          lastName: "User",
          isDeveloper: false,
          isAdmin: false,
          isMasterAdmin: false,
          createdAt: new Date()
        },
        {
          username: "demo_dev1",
          email: "dev1@example.com",
          password: await hashPassword("password123"),
          firstName: "Developer",
          lastName: "One",
          isDeveloper: true,
          bio: "Mobile app developer with 5 years of experience",
          createdAt: new Date()
        },
        {
          username: "demo_dev2",
          email: "dev2@example.com",
          password: await hashPassword("password123"),
          firstName: "Developer",
          lastName: "Two",
          isDeveloper: true,
          bio: "Game developer specializing in Android games",
          createdAt: new Date()
        }
      ];
      
      // Insert users
      createdUsers = await Promise.all(
        demoUsers.map(user => storage.createUser(user))
      );
      
      console.log(`Created ${createdUsers.length} users`);
    }
    
    // Create demo apps
    console.log("Creating apps...");
    
    // Make sure we have a developer ID for our apps
    const developerUserId = createdUsers[0].id;
    
    // App configuration data
    const appConfigs = [
      {
        name: "Fitness Tracker Pro",
        alias: "fitness",
        description: "Track your workouts, nutrition, and progress with this comprehensive fitness app. Features include workout plans, meal tracking, progress photos, and custom goals.",
        shortDescription: "Complete fitness tracking solution",
        version: "2.1.0",
        packageName: "com.demo.fitnesstracker",
        category: "Health & Fitness",
        color: "#4CAF50",
        screenshotCount: 3,
        fileSize: 15 * 1024 * 1024, // 15MB
        minAndroidVersion: "8.0",
        developerId: developerUserId,
        downloads: 87542,
        rating: 4.7,
        reviewCount: 12483,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        name: "Weather Now",
        alias: "weather",
        description: "Get accurate weather forecasts with hourly updates, 15-day predictions, severe weather alerts, and interactive radar maps. Customizable widgets for your home screen.",
        shortDescription: "Real-time weather forecasts and alerts",
        version: "3.4.2",
        packageName: "com.demo.weathernow",
        category: "Weather",
        color: "#03A9F4",
        screenshotCount: 2,
        fileSize: 8 * 1024 * 1024, // 8MB
        minAndroidVersion: "7.0",
        developerId: developerUserId,
        downloads: 236981,
        rating: 4.5,
        reviewCount: 42159,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
      },
      {
        name: "Pixel Warrior",
        alias: "game",
        description: "Embark on an epic adventure in this retro-style RPG. Fight monsters, collect treasures, and upgrade your character through 50+ levels of gameplay. Features pixel art graphics and chiptune music.",
        shortDescription: "Retro-style RPG adventure game",
        version: "1.2.0",
        packageName: "com.demo.pixelwarrior",
        category: "Games",
        color: "#9C27B0",
        screenshotCount: 4,
        fileSize: 45 * 1024 * 1024, // 45MB
        minAndroidVersion: "6.0",
        developerId: developerUserId,
        downloads: 152367,
        rating: 4.8,
        reviewCount: 28745,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        name: "Productivity Plus",
        alias: "productivity",
        description: "Boost your productivity with this all-in-one task manager, note-taking, and habit tracker app. Features include calendar integration, reminders, Pomodoro timer, and cloud sync.",
        shortDescription: "All-in-one productivity solution",
        version: "4.0.1",
        packageName: "com.demo.productivity",
        category: "Productivity",
        color: "#FF9800",
        screenshotCount: 2,
        fileSize: 12 * 1024 * 1024, // 12MB
        minAndroidVersion: "8.0",
        developerId: developerUserId,
        downloads: 198432,
        rating: 4.6,
        reviewCount: 35198,
        createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000), // 240 days ago
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        name: "Meditation Master",
        alias: "meditation",
        description: "Find peace and relaxation with guided meditation sessions, sleep stories, ambient sounds, and breathing exercises. Track your meditation streak and mindfulness progress.",
        shortDescription: "Guided meditation and mindfulness",
        version: "2.5.3",
        packageName: "com.demo.meditation",
        category: "Health & Fitness",
        color: "#673AB7",
        screenshotCount: 3,
        fileSize: 18 * 1024 * 1024, // 18MB
        minAndroidVersion: "7.0",
        developerId: developerUserId,
        downloads: 124578,
        rating: 4.9,
        reviewCount: 19853,
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        name: "Photo Editor Pro",
        alias: "photo",
        description: "Professional photo editing with filters, effects, adjustments, text overlays, and stickers. Edit like a pro with advanced tools including layers, masks, and selective editing.",
        shortDescription: "Advanced photo editor with pro tools",
        version: "3.2.0",
        packageName: "com.demo.photoeditor",
        category: "Photography",
        color: "#E91E63",
        screenshotCount: 2,
        fileSize: 28 * 1024 * 1024, // 28MB
        minAndroidVersion: "8.0",
        developerId: developerUserId,
        downloads: 345621,
        rating: 4.5,
        reviewCount: 56234,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      },
      {
        name: "Puzzle Challenge",
        alias: "puzzle",
        description: "Train your brain with 500+ puzzles including Sudoku, crosswords, word searches, jigsaw puzzles, and logic games. New puzzles added weekly.",
        shortDescription: "Brain training puzzles collection",
        version: "2.0.4",
        packageName: "com.demo.puzzle",
        category: "Games",
        color: "#3F51B5",
        screenshotCount: 2,
        fileSize: 22 * 1024 * 1024, // 22MB
        minAndroidVersion: "6.0",
        developerId: developerUserId,
        downloads: 189752,
        rating: 4.7,
        reviewCount: 31254,
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        name: "Budget Buddy",
        alias: "finance",
        description: "Take control of your finances with expense tracking, budgeting, bill reminders, and financial reports. Connect to your bank accounts for automatic transaction syncing.",
        shortDescription: "Personal finance and budget tracker",
        version: "4.1.2",
        packageName: "com.demo.budget",
        category: "Finance",
        color: "#4CAF50",
        screenshotCount: 3,
        fileSize: 16 * 1024 * 1024, // 16MB
        minAndroidVersion: "7.0",
        developerId: developerUserId,
        downloads: 215689,
        rating: 4.4,
        reviewCount: 38954,
        createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000), // 250 days ago
        updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
      }
    ];
    
    // Generate app data including SVG images
    const demoApps = appConfigs.map(config => {
      const iconUrl = createDemoIcon(config.alias, config.color);
      
      const screenshotUrls = Array.from({ length: config.screenshotCount }).map((_, index) => 
        createDemoScreenshot(config.alias, index + 1, config.color)
      );
      
      const filePath = createDemoApk(config.alias);
      
      return {
        name: config.name,
        description: config.description,
        shortDescription: config.shortDescription,
        version: config.version,
        packageName: config.packageName,
        category: config.category,
        iconUrl,
        screenshotUrls,
        fileSize: config.fileSize,
        filePath,
        minAndroidVersion: config.minAndroidVersion,
        developerId: config.developerId,
        downloads: config.downloads,
        rating: config.rating,
        reviewCount: config.reviewCount,
        isApproved: true, // Set all seeded apps to approved
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      };
    });
    
    // Get all existing app package names
    const existingPackageNames = existingApps.map(app => app.packageName);
    
    // Filter out apps that already exist by packageName
    const newAppsToCreate = demoApps.filter(app => !existingPackageNames.includes(app.packageName));
    
    console.log(`Skipping ${demoApps.length - newAppsToCreate.length} existing apps, creating ${newAppsToCreate.length} new ones`);
    
    // Insert only new apps
    const createdApps = newAppsToCreate.length > 0 
      ? await Promise.all(newAppsToCreate.map(app => storage.createApp(app)))
      : [];
    
    console.log(`Created ${createdApps.length} apps`);
    
    // Only create reviews if we created new apps
    let reviewCount = 0;
    
    if (createdApps.length > 0) {
      console.log("Creating reviews for new apps...");
      
      // Use single reviewer for all reviews since we're using the existing user
      const reviewerId = createdUsers[0].id;
      
      // Map of reviews per app index (only include indices that are valid)
      const reviewsMap: Record<number, {rating: number, comment: string, daysAgo: number}[]> = {
        0: [
          {
            rating: 5,
            comment: "This app transformed my fitness journey! The workout tracking is intuitive and the nutrition log is comprehensive. Highly recommend!",
            daysAgo: 60
          },
          {
            rating: 4,
            comment: "Great app overall, but could use more customization for workout plans. The progress tracking features are excellent though!",
            daysAgo: 45
          }
        ],
        1: [
          {
            rating: 5,
            comment: "The most accurate weather app I've ever used. The radar maps are incredibly detailed and the widgets are beautiful.",
            daysAgo: 90
          }
        ],
        2: [
          {
            rating: 5,
            comment: "Such a nostalgic game! The pixel art is beautiful and the gameplay is addictive. Can't stop playing!",
            daysAgo: 30
          },
          {
            rating: 4,
            comment: "Fun game with lots of levels. Would like to see more character customization options in future updates.",
            daysAgo: 20
          }
        ]
      };
      
      // Create reviews for each app that exists
      const demoReviews = createdApps.flatMap((app, index) => {
        const appReviews = reviewsMap[index];
        if (!appReviews) return [];
        
        return appReviews.map(review => ({
          appId: app.id,
          userId: reviewerId,
          rating: review.rating,
          comment: review.comment,
          createdAt: new Date(Date.now() - review.daysAgo * 24 * 60 * 60 * 1000)
        }));
      });
      
      // Insert reviews
      if (demoReviews.length > 0) {
        const createdReviews = await Promise.all(
          demoReviews.map(review => storage.createReview(review))
        );
        reviewCount = createdReviews.length;
        console.log(`Created ${reviewCount} reviews`);
      } else {
        console.log("No reviews to create for the new apps");
      }
    } else {
      console.log("No new apps created, skipping review creation");
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}