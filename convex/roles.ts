import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
// Roles system - not currently used with simple access code auth

// Get current user's role
export const getCurrentRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return userRole?.role ?? null;
  },
});

// Assign role to user (superadmin only)
export const assignRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    
    // Check if current user is superadmin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .first();
    
    if (currentUserRole?.role !== "superadmin") {
      throw new Error("Only superadmin can assign roles");
    }
    
    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existingRole) {
      // Update existing role
      await ctx.db.patch(existingRole._id, {
        role: args.role,
      });
    } else {
      // Create new role assignment
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
        createdBy: currentUserId,
      });
    }
    
    return { success: true };
  },
});

// Remove role from user (superadmin only)
export const removeRole = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    
    // Check if current user is superadmin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .first();
    
    if (currentUserRole?.role !== "superadmin") {
      throw new Error("Only superadmin can remove roles");
    }
    
    // Cannot remove own role
    if (args.userId === currentUserId) {
      throw new Error("Cannot remove your own role");
    }
    
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if user has admin/superadmin access
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!currentUserRole || currentUserRole.role === "cashier") {
      throw new Error("Not authorized");
    }
    
    const roleAssignments = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    
    const users = await Promise.all(
      roleAssignments.map(async (ra) => {
        const user = await ctx.db.get(ra.userId);
        return user ? { ...user, role: ra.role } : null;
      })
    );
    
    return users.filter(Boolean);
  },
});

// Initialize first superadmin (only works if no superadmin exists)
export const initializeSuperadmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if any superadmin exists
    const existingSuperadmin = await ctx.db
      .query("userRoles")
      .withIndex("by_role", (q) => q.eq("role", "superadmin"))
      .first();
    
    if (existingSuperadmin) {
      throw new Error("Superadmin already exists");
    }
    
    // Make current user superadmin
    await ctx.db.insert("userRoles", {
      userId,
      role: "superadmin",
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});
