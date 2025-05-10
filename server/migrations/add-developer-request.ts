import { db } from "../db";
import { sql } from "drizzle-orm";
import { log } from "../vite";

/**
 * Add developer request columns to users table
 */
export async function runMigration() {
  try {
    log("Adding developer request columns to users table...");

    // Check if the has_developer_request column exists
    const hasRequestColumnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'has_developer_request'
    `);

    if (hasRequestColumnExists.rows.length === 0) {
      // Add has_developer_request column
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN has_developer_request BOOLEAN NOT NULL DEFAULT false
      `);
      log("Added has_developer_request column to users table");
    } else {
      log("has_developer_request column already exists in users table");
    }

    // Check if the developer_request_date column exists
    const requestDateColumnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'developer_request_date'
    `);

    if (requestDateColumnExists.rows.length === 0) {
      // Add developer_request_date column
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN developer_request_date TIMESTAMP
      `);
      log("Added developer_request_date column to users table");
    } else {
      log("developer_request_date column already exists in users table");
    }

    log("Developer request columns migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Error adding developer request columns:", error);
    return false;
  }
}