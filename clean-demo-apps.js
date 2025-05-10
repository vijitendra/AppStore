// Script to delete all demo apps from the database
// This is now a module that can be imported by server code
import path from 'path';
import { existsSync, unlinkSync } from 'fs';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

/**
 * Delete all demo apps (except user-created ones) from the database
 * @param {object} options Options for deletion
 * @param {object} options.db The database connection
 * @param {boolean} options.developerId Developer ID to keep apps for (optional)
 * @param {boolean} options.closePool Whether to close the pool after deletion
 * @returns {Promise<{success: boolean, deletedCount: number, errors: any[]}>}
 */
export async function deleteAllDemoApps({ db, keepDeveloperId = null, closePool = false }) {
  console.log('Starting demo app cleanup...');
  let deletedCount = 0;
  const errors = [];
  
  try {
    // Get all app IDs from developer_id = 2 (test user/demo apps)
    const queryResult = await db.execute(
      sql`SELECT id FROM apps WHERE developer_id = 2`
    );
    
    const appIds = queryResult.rows.map(row => row.id);
    console.log(`Found ${appIds.length} demo apps to delete`);
    
    // Use raw SQL for reliable deletion
    for (const id of appIds) {
      console.log(`Deleting app ID: ${id}`);
      
      try {
        // Get app data to delete files
        const appResult = await db.execute(sql`SELECT * FROM apps WHERE id = ${id}`);
        
        if (appResult.rowCount > 0) {
          const app = appResult.rows[0];
          
          // Delete icon file if exists
          if (app.icon_url) {
            const iconPath = path.join(process.cwd(), app.icon_url.replace('/uploads', 'uploads'));
            if (existsSync(iconPath)) {
              try {
                unlinkSync(iconPath);
                console.log(`  Deleted icon: ${iconPath}`);
              } catch (err) {
                console.log(`  Failed to delete icon: ${err.message}`);
              }
            }
          }
          
          // Delete screenshot files if exists
          if (app.screenshot_urls) {
            app.screenshot_urls.forEach(url => {
              const screenshotPath = path.join(process.cwd(), url.replace('/uploads', 'uploads'));
              if (existsSync(screenshotPath)) {
                try {
                  unlinkSync(screenshotPath);
                  console.log(`  Deleted screenshot: ${screenshotPath}`);
                } catch (err) {
                  console.log(`  Failed to delete screenshot: ${err.message}`);
                }
              }
            });
          }
          
          // Delete APK file if exists  
          if (app.file_path) {
            const apkPath = path.join(process.cwd(), app.file_path.replace('/uploads', 'uploads'));
            if (existsSync(apkPath)) {
              try {
                unlinkSync(apkPath);
                console.log(`  Deleted APK: ${apkPath}`);
              } catch (err) {
                console.log(`  Failed to delete APK: ${err.message}`);
              }
            }
          }
        }
        
        // Delete app and related data - use simpler approach to delete data
        try {
          await db.execute(sql`DELETE FROM reviews WHERE app_id = ${id}`);
        } catch (err) {
          console.log("Note: reviews table delete skipped:", err.message);
        }
        
        try {
          await db.execute(sql`DELETE FROM app_versions WHERE app_id = ${id}`);
        } catch (err) {
          console.log("Note: app_versions table delete skipped:", err.message);
        }
        
        // Finally, delete the app itself
        await db.execute(sql`DELETE FROM apps WHERE id = ${id}`);
        
        deletedCount++;
        console.log(`  Successfully deleted app ID: ${id} and all related data`);
      } catch (error) {
        console.error(`  Error deleting app ID: ${id}:`, error);
        errors.push({id, error: error.message});
      }
    }
    
    console.log(`Demo app cleanup complete! Deleted ${deletedCount} apps`);
    return {
      success: true,
      deletedCount,
      errors
    };
  } catch (error) {
    console.error('Error cleaning up demo apps:', error);
    return {
      success: false,
      deletedCount,
      errors: [...errors, error]
    };
  }
}

// For direct script execution - moved to the top level to prevent ES module issues
let isDirectExecution = false;
try {
  isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);
} catch (err) {
  // Not running directly, just continue
}

if (isDirectExecution) {
  const { db, pool } = await import('./server/db.js');
  
  deleteAllDemoApps({ db, closePool: true }).then(() => {
    console.log("Script execution complete");
    process.exit(0);
  }).catch(err => {
    console.error("Script execution failed:", err);
    process.exit(1);
  });
}