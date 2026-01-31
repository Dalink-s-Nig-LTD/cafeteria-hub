import { query, mutation } from "./_generated/server";
import * as auth from "./auth";
import { v } from "convex/values";
// Users system - not currently used with simple access code auth

// Get current authenticated user with their role
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    // Get user's role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return {
      ...user,
      role: userRole?.role ?? null,
    };
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return {
      ...user,
      role: userRole?.role ?? null,
    };
  },
});

// Get all users with roles (for admin management)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // Return all users with their roles (no auth check)
    const users = await ctx.db.query("users").collect();
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const role = await ctx.db
          .query("userRoles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .first();
        return {
          ...user,
          role: role?.role ?? null,
        };
      })
    );
    return usersWithRoles;
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.patch(userId, {
      name: args.name,
    });
    
    return { success: true };
  },
});
