import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Users system - simplified for access code auth

// Get admin user by ID
export const getAdminUser = query({
  args: { adminUserId: v.id("adminUsers") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.adminUserId);
    if (!user) return null;
    
    const userRole = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), args.adminUserId as any))
      .first();
    
    return {
      ...user,
      role: userRole?.role ?? null,
    };
  },
});

// Get all admin users with roles
export const getAllAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("adminUsers").collect();
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const role = await ctx.db
          .query("userRoles")
          .filter((q) => q.eq(q.field("userId"), user._id as any))
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

// Update admin user profile
export const updateAdminProfile = mutation({
  args: {
    adminUserId: v.id("adminUsers"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminUserId, {
      name: args.name,
    });
    
    return { success: true };
  },
});
