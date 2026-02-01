import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import * as auth from "./auth";

// Roles system - simplified for access code auth

// Get current user's role (placeholder - not used with access code auth)
export const getCurrentRole = query({
  args: {},
  handler: async (ctx) => {
    // Access code auth handles roles differently
    return null;
  },
});

// Assign role to user (admin only) - for adminUsers
export const assignRole = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), args.adminUserId as any))
      .first();
    
    if (existingRole) {
      // Update existing role
      await ctx.db.patch(existingRole._id, {
        role: args.role,
      });
    } else {
      // Create new role assignment
      await ctx.db.insert("userRoles", {
        userId: args.adminUserId as any,
        role: args.role,
        createdAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Remove role from user
export const removeRole = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    const existingRole = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), args.adminUserId as any))
      .first();
    
    if (existingRole) {
      await ctx.db.delete(existingRole._id);
    }
    
    return { success: true };
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    const roleAssignments = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    
    return roleAssignments;
  },
});

// Initialize first superadmin
export const initializeSuperadmin = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    // Check if any superadmin exists
    const existingSuperadmin = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "superadmin"))
      .first();
    
    if (existingSuperadmin) {
      throw new Error("Superadmin already exists");
    }
    
    // Make user superadmin
    await ctx.db.insert("userRoles", {
      userId: args.adminUserId as any,
      role: "superadmin",
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});
