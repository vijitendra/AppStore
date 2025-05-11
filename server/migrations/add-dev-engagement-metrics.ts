import { pool } from "../db";

/**
 * Add developer engagement metrics to users table
 */
export async function runMigration() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Add developer_bio column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS developer_bio TEXT
    `);
    
    // Add total_apps column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS total_apps INTEGER NOT NULL DEFAULT 0
    `);
    
    // Add total_downloads column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS total_downloads INTEGER NOT NULL DEFAULT 0
    `);
    
    // Add average_rating column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS average_rating INTEGER NOT NULL DEFAULT 0
    `);
    
    // Add engagement_score column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS engagement_score INTEGER NOT NULL DEFAULT 0
    `);
    
    // Add last_active_at column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP
    `);
    
    // Initialize metrics for existing developers based on their apps
    await client.query(`
      WITH developer_stats AS (
        SELECT 
          developer_id,
          COUNT(id) AS app_count,
          COALESCE(SUM(downloads), 0) AS total_downloads,
          COALESCE(AVG(rating), 0) AS avg_rating
        FROM 
          apps
        GROUP BY 
          developer_id
      )
      UPDATE users
      SET 
        total_apps = COALESCE(developer_stats.app_count, 0),
        total_downloads = COALESCE(developer_stats.total_downloads, 0),
        average_rating = COALESCE((developer_stats.avg_rating * 10)::INTEGER, 0),
        engagement_score = COALESCE(developer_stats.app_count, 0) * 10 + 
                           COALESCE((developer_stats.total_downloads / 100)::INTEGER, 0) +
                           COALESCE((developer_stats.avg_rating * 5)::INTEGER, 0),
        last_active_at = CURRENT_TIMESTAMP
      FROM 
        developer_stats
      WHERE 
        users.id = developer_stats.developer_id AND
        users.is_developer = true;
    `);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log("Developer engagement metrics added to users table successfully!");
    return { success: true };
    
  } catch (error: any) {
    // Roll back in case of error
    await client.query('ROLLBACK');
    console.error("Failed to add developer engagement metrics:", error);
    return { success: false, error: error.message };
  } finally {
    // Release the client back to the pool
    client.release();
  }
}