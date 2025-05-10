import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Create videos table for storing developer video content
 */
export async function runMigration() {
  console.log("Creating videos table...");
  
  try {
    // Check if videos table already exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'videos'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log("videos table already exists");
      return;
    }
    
    // Create videos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        developer_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        thumbnail_path TEXT NOT NULL,
        video_path TEXT NOT NULL,
        category TEXT NOT NULL,
        sub_category TEXT,
        tags TEXT,
        duration TEXT,
        view_count INTEGER NOT NULL DEFAULT 0,
        like_count INTEGER NOT NULL DEFAULT 0,
        comment_count INTEGER NOT NULL DEFAULT 0,
        is_approved BOOLEAN NOT NULL DEFAULT false,
        is_rejected BOOLEAN NOT NULL DEFAULT false,
        rejection_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("Created videos table successfully!");
  } catch (error) {
    console.error("Error creating videos table:", error);
    throw error;
  }
}