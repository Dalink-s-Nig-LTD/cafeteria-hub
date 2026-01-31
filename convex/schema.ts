import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Admin users table
  adminUsers: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Sessions table - stores active sessions
  sessions: defineTable({
    userId: v.optional(v.id("adminUsers")),
    code: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("cashier")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_userId", ["userId"]),
  
  // Access codes for cashier login
  accessCodes: defineTable({
    code: v.string(),
    role: v.union(v.literal("admin"), v.literal("cashier")),
    shift: v.optional(v.union(v.literal("morning"), v.literal("evening"))),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    usedCount: v.number(),
    maxUses: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"])
    .index("by_shift", ["shift"]),
  
  // Menu items stored in database
  menuItems: defineTable({
    name: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.optional(v.string()),
    available: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_available", ["available"]),
  
  // Orders table
  orders: defineTable({
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    total: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("card"), v.literal("transfer")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    cashierCode: v.string(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_cashierCode", ["cashierCode"])
    .index("by_createdAt", ["createdAt"]),
});
