import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Add banner_url column to apps table
 */
export async function runMigration() {
  try {
    // Check if banner_url column already exists
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'apps' AND column_name = 'banner_url'
    `);

    if (result.rows.length === 0) {
      console.log('Adding banner_url column to apps table...');
      
      // Add banner_url column
      await db.execute(sql`
        ALTER TABLE apps 
        ADD COLUMN banner_url TEXT
      `);
      
      console.log('banner_url column added successfully!');
    } else {
      console.log('banner_url column already exists in apps table');
    }
    
    return true; // Return true to indicate success
  } catch (error) {
    console.error('Error adding banner_url column:', error);
    return false; // Return false to indicate failure
  }
}