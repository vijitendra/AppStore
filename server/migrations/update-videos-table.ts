import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Update videos table to add missing columns
 */
export async function runMigration() {
  console.log("Updating videos table with missing columns...");
  
  try {
    // Check if the videos table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'videos'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log("videos table doesn't exist yet, skipping update");
      return;
    }
    
    // Check if the sub_category column exists
    const subCategoryExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'videos' AND column_name = 'sub_category'
      );
    `);
    
    if (!subCategoryExists.rows[0].exists) {
      console.log("Adding sub_category column to videos table");
      await db.execute(sql`
        ALTER TABLE videos ADD COLUMN sub_category TEXT;
      `);
    } else {
      console.log("sub_category column already exists in videos table");
    }
    
    // Check if is_approved column exists
    const isApprovedExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'videos' AND column_name = 'is_approved'
      );
    `);
    
    if (!isApprovedExists.rows[0].exists) {
      console.log("Adding is_approved column to videos table");
      await db.execute(sql`
        ALTER TABLE videos ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;
      `);
    } else {
      console.log("is_approved column already exists in videos table");
    }
    
    // Check if is_rejected column exists
    const isRejectedExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'videos' AND column_name = 'is_rejected'
      );
    `);
    
    if (!isRejectedExists.rows[0].exists) {
      console.log("Adding is_rejected column to videos table");
      await db.execute(sql`
        ALTER TABLE videos ADD COLUMN is_rejected BOOLEAN NOT NULL DEFAULT false;
      `);
    } else {
      console.log("is_rejected column already exists in videos table");
    }
    
    // Check if rejection_reason column exists
    const rejectionReasonExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'videos' AND column_name = 'rejection_reason'
      );
    `);
    
    if (!rejectionReasonExists.rows[0].exists) {
      console.log("Adding rejection_reason column to videos table");
      await db.execute(sql`
        ALTER TABLE videos ADD COLUMN rejection_reason TEXT;
      `);
    } else {
      console.log("rejection_reason column already exists in videos table");
    }
    
    console.log("Videos table update completed successfully!");
    return true;
  } catch (error) {
    console.error("Error updating videos table:", error);
    throw error;
  }
}