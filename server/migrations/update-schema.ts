import { db } from "../db";
import { sql } from "drizzle-orm";

export async function runMigration() {
  try {
    console.log("Running schema update migration...");

    // Add isBlocked column to users table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='is_blocked'
        ) THEN 
          ALTER TABLE users ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END $$;
    `);
    console.log("Updated users table with is_blocked column");

    // Add isSuspended column to apps table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='apps' AND column_name='is_suspended'
        ) THEN 
          ALTER TABLE apps ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END $$;
    `);
    console.log("Updated apps table with is_suspended column");

    // Add rejection_reason column to apps table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='apps' AND column_name='rejection_reason'
        ) THEN 
          ALTER TABLE apps ADD COLUMN rejection_reason TEXT;
        END IF;
      END $$;
    `);
    console.log("Updated apps table with rejection_reason column");

    // Add profilePicture column to users table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='profile_picture'
        ) THEN 
          ALTER TABLE users ADD COLUMN profile_picture TEXT;
        END IF;
      END $$;
    `);
    console.log("Updated users table with profile_picture column");

    // Create app_versions table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_versions (
        id SERIAL PRIMARY KEY,
        app_id INTEGER NOT NULL REFERENCES apps(id),
        version TEXT NOT NULL,
        version_code INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        change_log TEXT,
        is_live BOOLEAN NOT NULL DEFAULT false,
        min_android_version TEXT NOT NULL DEFAULT '5.0',
        release_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(app_id, version)
      );
    `);
    console.log("Created app_versions table if it didn't exist");

    // Add subCategory column to apps table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='apps' AND column_name='sub_category'
        ) THEN 
          ALTER TABLE apps ADD COLUMN sub_category TEXT;
        END IF;
      END $$;
    `);

    // Create videos table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        developer_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        thumbnail_path TEXT NOT NULL,
        video_path TEXT NOT NULL,
        duration INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Schema update completed successfully!");
    return true;
  } catch (error) {
    console.error("Migration error:", error);
    return false;
  }
}