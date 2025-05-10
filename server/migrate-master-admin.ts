import { db } from "./db";
import { users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { storage } from "./storage";
import { hashPassword } from "./auth";

/**
 * Creates a master admin user if one doesn't exist already
 * Only one user can be the master admin in the system
 */
export async function createMasterAdmin() {
  console.log("Checking for existing master admin...");
  
  try {
    // First check if we already have a master admin
    const existingMasterAdmin = await storage.getMasterAdmin();
    
    if (existingMasterAdmin) {
      console.log(`Existing master admin found: ${existingMasterAdmin.username}`);
      return existingMasterAdmin;
    }
    
    // If no master admin exists, check if we have a user with username "masteradmin"
    const potentialAdmin = await storage.getUserByUsername("masteradmin");
    
    if (potentialAdmin) {
      // Promote existing user to master admin
      await db.update(users)
        .set({ 
          isMasterAdmin: true,
          isAdmin: true,
          isDeveloper: true
        })
        .where(eq(users.id, potentialAdmin.id));
      
      console.log(`Existing user promoted to master admin: ${potentialAdmin.username}`);
      
      // Return the updated user
      return {
        ...potentialAdmin,
        isMasterAdmin: true,
        isAdmin: true,
        isDeveloper: true
      };
    }
    
    // If no suitable user exists, create a new master admin
    const masterAdminData = {
      username: "masteradmin",
      email: "masteradmin@appstore.com",
      password: await hashPassword("admin123"), // Default password, should be changed immediately
      firstName: "Master",
      lastName: "Admin",
      isDeveloper: true,
      isAdmin: true,
      isMasterAdmin: true,
      createdAt: new Date()
    };
    
    const newMasterAdmin = await storage.createUser(masterAdminData);
    console.log(`Created new master admin: ${newMasterAdmin.username}`);
    
    return newMasterAdmin;
  } catch (error) {
    console.error("Error creating master admin:", error);
    return null;
  }
}

/**
 * Checks if a user can be promoted to the given role
 */
export async function canPromoteUser(userId: number, role: 'admin' | 'developer'): Promise<boolean> {
  try {
    // Get the user by ID
    const user = await storage.getUser(userId);
    
    if (!user) {
      return false; // User doesn't exist
    }
    
    // Check if user already has the requested role
    if (role === 'admin' && user.isAdmin) {
      return false; // Already an admin
    }
    
    if (role === 'developer' && user.isDeveloper) {
      return false; // Already a developer
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if user can be promoted to ${role}:`, error);
    return false;
  }
}

/**
 * Promotes a user to the given role
 */
export async function promoteUser(userId: number, role: 'admin' | 'developer'): Promise<boolean> {
  try {
    // Check if the user can be promoted
    const canBePromoted = await canPromoteUser(userId, role);
    
    if (!canBePromoted) {
      return false;
    }
    
    // Update the user's role
    const updateData: Partial<typeof users.$inferSelect> = {};
    
    if (role === 'admin') {
      updateData.isAdmin = true;
    }
    
    if (role === 'developer') {
      updateData.isDeveloper = true;
    }
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error(`Error promoting user to ${role}:`, error);
    return false;
  }
}