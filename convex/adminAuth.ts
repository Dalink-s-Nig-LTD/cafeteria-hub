import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple password hashing (for demo - in production use proper hashing)
function hashPassword(password: string): string {
  // Simple hash - in production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Sign up new admin
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Create admin user
    const userId = await ctx.db.insert("adminUsers", {
      email: args.email.toLowerCase(),
      passwordHash: hashPassword(args.password),
      name: args.name,
      createdAt: Date.now(),
    });

    // Create session (expires in 24 hours)
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      role: "admin",
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { 
      success: true, 
      userId,
      sessionId,
      user: {
        email: args.email,
        name: args.name,
      }
    };
  },
});

// Sign in admin
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const passwordHash = hashPassword(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Create session (expires in 24 hours)
    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      role: "admin",
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { 
      success: true,
      userId: user._id,
      sessionId,
      user: {
        email: user.email,
        name: user.name,
      }
    };
  },
});

// Get current admin user
export const getCurrentUser = query({
  args: {
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args) => {
    if (!args.sessionId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.userId) return null;

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      email: user.email,
      name: user.name,
      role: "admin" as const,
    };
  },
});

// Sign out
export const signOut = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
    return { success: true };
  },
});
