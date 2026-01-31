import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Generate a random 6-character alphanumeric code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create access code (admin/superadmin only)
export const createAccessCode = mutation({
  args: {
    role: v.union(v.literal("admin"), v.literal("cashier")),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check permissions
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!userRole) throw new Error("No role assigned");
    
    // Only superadmin can create admin codes
    if (args.role === "admin" && userRole.role !== "superadmin") {
      throw new Error("Only superadmin can create admin access codes");
    }
    
    // Admins can only create cashier codes
    if (userRole.role === "cashier") {
      throw new Error("Cashiers cannot create access codes");
    }
    
    // Generate unique code
    let code = generateCode();
    let existingCode = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    
    while (existingCode) {
      code = generateCode();
      existingCode = await ctx.db
        .query("accessCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }
    
    const expiresAt = args.expiresInDays
      ? Date.now() + args.expiresInDays * 24 * 60 * 60 * 1000
      : undefined;
    
    const accessCode = await ctx.db.insert("accessCodes", {
      code,
      role: args.role,
      createdBy: userId,
      createdAt: Date.now(),
      expiresAt,
      isRevoked: false,
    });
    
    return { code, id: accessCode };
  },
});

// Get all access codes created by current user or all (for superadmin)
export const getAccessCodes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!userRole || userRole.role === "cashier") {
      throw new Error("Not authorized");
    }
    
    let codes;
    if (userRole.role === "superadmin") {
      // Superadmin sees all codes
      codes = await ctx.db.query("accessCodes").collect();
    } else {
      // Admin sees only their own codes
      codes = await ctx.db
        .query("accessCodes")
        .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
        .collect();
    }
    
    // Add creator info
    const codesWithCreator = await Promise.all(
      codes.map(async (code) => {
        const creator = await ctx.db.get(code.createdBy);
        const usedByUser = code.usedBy ? await ctx.db.get(code.usedBy) : null;
        return {
          ...code,
          creatorName: creator?.name ?? creator?.email ?? "Unknown",
          usedByName: usedByUser?.name ?? usedByUser?.email ?? null,
        };
      })
    );
    
    return codesWithCreator;
  },
});

// Revoke an access code
export const revokeAccessCode = mutation({
  args: {
    codeId: v.id("accessCodes"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!userRole || userRole.role === "cashier") {
      throw new Error("Not authorized");
    }
    
    const code = await ctx.db.get(args.codeId);
    if (!code) throw new Error("Code not found");
    
    // Only superadmin can revoke any code, admin can only revoke their own
    if (userRole.role !== "superadmin" && code.createdBy !== userId) {
      throw new Error("Not authorized to revoke this code");
    }
    
    await ctx.db.patch(args.codeId, { isRevoked: true });
    
    return { success: true };
  },
});

// Validate and use an access code (for cashier login)
export const validateAccessCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const accessCode = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    
    if (!accessCode) {
      return { valid: false, error: "Invalid access code" };
    }
    
    if (accessCode.isRevoked) {
      return { valid: false, error: "This code has been revoked" };
    }
    
    if (accessCode.usedAt) {
      return { valid: false, error: "This code has already been used" };
    }
    
    if (accessCode.expiresAt && accessCode.expiresAt < Date.now()) {
      return { valid: false, error: "This code has expired" };
    }
    
    // Mark code as used
    await ctx.db.patch(accessCode._id, {
      usedAt: Date.now(),
      usedBy: userId,
    });
    
    // Assign role to user
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existingRole) {
      await ctx.db.patch(existingRole._id, { role: accessCode.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId,
        role: accessCode.role,
        createdAt: Date.now(),
        createdBy: accessCode.createdBy,
      });
    }
    
    return { valid: true, role: accessCode.role };
  },
});
