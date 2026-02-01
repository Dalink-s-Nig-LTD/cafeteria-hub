import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a secure 6-character alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars (0/O, 1/I/l)
  let code = '';
  for (let i = 0; i < 6; i++) {
    // Use crypto-secure random if available
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

// Validate an access code (for login)
export const validateCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const accessCode = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!accessCode) {
      return { valid: false, error: "Invalid access code" };
    }

    if (!accessCode.isActive) {
      return { valid: false, error: "Access code has been deactivated" };
    }

    if (accessCode.expiresAt && accessCode.expiresAt < Date.now()) {
      return { valid: false, error: "Access code has expired" };
    }

    if (accessCode.maxUses && accessCode.usedCount >= accessCode.maxUses) {
      return { valid: false, error: "Access code has reached maximum uses" };
    }

    return {
      valid: true,
      role: accessCode.role,
      code: args.code,
    };
  },
});

// Record usage of an access code
export const useCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const accessCode = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!accessCode) {
      return {
        error: "Invalid code, please contact admin.",
        sessionId: null,
        code: args.code,
        role: null
      };
    }

    await ctx.db.patch(accessCode._id, {
      usedCount: accessCode.usedCount + 1,
    });

    // Create session (expires in 8 hours)
    const sessionId = await ctx.db.insert("sessions", {
      code: args.code,
      role: accessCode.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    });

    return { sessionId, code: args.code, role: accessCode.role };
  },
});

// Generate a new access code
export const generateAccessCode = mutation({
  args: {
    role: v.union(v.literal("admin"), v.literal("cashier")),
    shift: v.optional(v.union(v.literal("morning"), v.literal("evening"))),
    expiresInDays: v.optional(v.number()),
    maxUses: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate unique 4-digit code
    let code = generateCode();
    let existingCode = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    // Keep generating until we get a unique code
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

    await ctx.db.insert("accessCodes", {
      code,
      role: args.role,
      shift: args.shift,
      createdAt: Date.now(),
      expiresAt,
      usedCount: 0,
      maxUses: args.maxUses,
      isActive: true,
    });

    return { code, shift: args.shift, expiresAt, maxUses: args.maxUses };
  },
});

// Get all access codes
export const listAccessCodes = query({
  handler: async (ctx) => {
    const codes = await ctx.db.query("accessCodes").collect();
    return codes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Deactivate an access code
export const deactivateCode = mutation({
  args: {
    codeId: v.id("accessCodes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.codeId, {
      isActive: false,
    });
    return { success: true };
  },
});

// Delete an access code
export const deleteCode = mutation({
  args: {
    codeId: v.id("accessCodes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.codeId);
    return { success: true };
  },
});
