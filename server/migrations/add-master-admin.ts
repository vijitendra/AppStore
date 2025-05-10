import { db } from "../db";
import { sql } from "drizzle-orm";

export async function runMigration() {
  console.log("Adding master admin column to users table...");
  try {
    // First check if the column already exists
    const checkColumnQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_master_admin'
    `;
    const result = await db.execute(checkColumnQuery);
    
    if (result.rows.length === 0) {
      // Column doesn't exist, add it
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN is_master_admin BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log("Successfully added is_master_admin column to users table");
    } else {
      console.log("is_master_admin column already exists in users table");
    }
    
    return true;
  } catch (error) {
    console.error("Error adding is_master_admin column:", error);
    return false;
  }
}