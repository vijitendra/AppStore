import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed-data";
import { runMigration as runMasterAdminMigration } from "./migrations/add-master-admin";
import { runMigration as runSchemaUpdateMigration } from "./migrations/update-schema";
import { runMigration as runDeveloperRequestMigration } from "./migrations/add-developer-request";
import { runMigration as runBannerUrlMigration } from "./migrations/add-banner-url";
import { runMigration as runCreateVideosTableMigration } from "./migrations/create-videos-table";
import { runMigration as runUpdateVideosTableMigration } from "./migrations/update-videos-table";
import { createMasterAdmin } from "./migrate-master-admin";

const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: false, limit: '500mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run database migrations
  try {
    // First run the migration to add the master admin column
    const masterAdminMigrationResult = await runMasterAdminMigration();
    if (!masterAdminMigrationResult) {
      console.error("Failed to run migration to add master admin column");
    }
    
    // Run the schema update migration to add new columns
    const schemaUpdateResult = await runSchemaUpdateMigration();
    if (!schemaUpdateResult) {
      console.error("Failed to run schema update migration");
    }
    
    // Run the migration to add developer request columns
    const developerRequestResult = await runDeveloperRequestMigration();
    if (!developerRequestResult) {
      console.error("Failed to run developer request migration");
    }
    
    // Run the migration to add banner_url column
    try {
      const bannerUrlResult = await runBannerUrlMigration();
      if (!bannerUrlResult) {
        console.error("Failed to run banner URL migration");
      }
    } catch (error) {
      console.error("Error running banner URL migration:", error);
    }
    
    // Run the migration to create videos table
    try {
      await runCreateVideosTableMigration();
    } catch (error) {
      console.error("Error creating videos table:", error);
    }
    
    // Run the migration to update videos table with missing columns
    try {
      await runUpdateVideosTableMigration();
    } catch (error) {
      console.error("Error updating videos table:", error);
    }
  } catch (error) {
    console.error("Error running migrations:", error);
  }

  // Seed database with demo data
  // Disabling demo data seeding as we've cleaned up the demo apps
  console.log("Demo app seeding skipped - previously cleaned up");
  // try {
  //   await seedDatabase(true); // Force seeding to ensure we have demo apps
  // } catch (error) {
  //   console.error("Error seeding database:", error);
  // }
  
  // Create master admin if it doesn't exist
  try {
    const masterAdmin = await createMasterAdmin();
    if (masterAdmin) {
      console.log("Master admin account is set up: " + masterAdmin.username);
    } else {
      console.error("Failed to set up master admin account");
    }
  } catch (error) {
    console.error("Error creating master admin:", error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve on port 5000, but allow fallback to other ports
  // if 5000 is already in use
  const tryPort = (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const testServer = server.listen({ 
        port, 
        host: "0.0.0.0", 
        reusePort: true 
      }, () => {
        testServer.close(() => {
          resolve();
        });
      });
      
      testServer.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is already in use, trying alternative port...`);
          reject(err);
        } else {
          reject(err);
        }
      });
    });
  };
  
  // Try ports in sequence
  let port = 5000;
  let maxPort = 5010; // Try up to port 5010
  
  const startServer = async () => {
    while (port <= maxPort) {
      try {
        await tryPort(port);
        server.listen({
          port,
          host: "0.0.0.0",
          reusePort: true,
        }, () => {
          log(`serving on port ${port}`);
        });
        break;
      } catch (err) {
        port++;
        if (port > maxPort) {
          console.error("No available ports found. Server could not be started.");
          process.exit(1);
        }
      }
    }
  };
  
  startServer();
})();
