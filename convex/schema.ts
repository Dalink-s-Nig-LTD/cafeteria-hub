import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  // User roles table - stores role assignments
  userRoles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("superadmin"), v.literal("admin"), v.literal("cashier")),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),
  
  // Access codes for cashier login
  accessCodes: defineTable({
    code: v.string(),
    role: v.union(v.literal("admin"), v.literal("cashier")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    usedAt: v.optional(v.number()),
    usedBy: v.optional(v.id("users")),
    isRevoked: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_createdBy", ["createdBy"])
    .index("by_role", ["role"]),
  
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
    cashierId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_cashier", ["cashierId"])
    .index("by_createdAt", ["createdAt"]),
});
