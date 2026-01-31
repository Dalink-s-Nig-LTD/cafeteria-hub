import { query } from "./_generated/server";
import { v } from "convex/values";

// Get recent orders
export const getRecentOrders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    
    return orders;
  },
});

// Get orders statistics
export const getOrdersStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    // Get all orders
    const allOrders = await ctx.db.query("orders").collect();
    
    // Today's orders
    const todayOrders = allOrders.filter(order => order.createdAt >= oneDayAgo);
    
    // This week's orders
    const weekOrders = allOrders.filter(order => order.createdAt >= oneWeekAgo);
    
    // Last week's orders for comparison
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    const lastWeekOrders = allOrders.filter(
      order => order.createdAt >= twoWeeksAgo && order.createdAt < oneWeekAgo
    );
    
    // Calculate totals
    const totalRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = weekOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const dailyCustomers = todayOrders.length;
    
    // Calculate last week totals for percentage change
    const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + order.total, 0);
    const lastWeekOrderCount = lastWeekOrders.length;
    const lastWeekAvg = lastWeekOrderCount > 0 ? lastWeekRevenue / lastWeekOrderCount : 0;
    
    // Calculate percentage changes
    const revenueChange = lastWeekRevenue > 0 
      ? ((totalRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(1)
      : "0";
    const ordersChange = lastWeekOrderCount > 0
      ? ((totalOrders - lastWeekOrderCount) / lastWeekOrderCount * 100).toFixed(1)
      : "0";
    const avgChange = lastWeekAvg > 0
      ? ((avgOrderValue - lastWeekAvg) / lastWeekAvg * 100).toFixed(1)
      : "0";
    
    return {
      totalRevenue,
      revenueChange: `${revenueChange >= "0" ? "+" : ""}${revenueChange}%`,
      totalOrders,
      ordersChange: `${ordersChange >= "0" ? "+" : ""}${ordersChange}%`,
      avgOrderValue: Math.round(avgOrderValue),
      avgChange: `${avgChange >= "0" ? "+" : ""}${avgChange}%`,
      dailyCustomers,
      dailyChange: "+0%", // We don't have yesterday's data to compare
    };
  },
});

// Get weekly sales data for chart
export const getWeeklySales = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.gte(q.field("createdAt"), oneWeekAgo))
      .collect();
    
    // Group orders by day
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const salesByDay: Record<string, { revenue: number; orders: number }> = {};
    
    // Initialize all days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      const dayName = dayNames[date.getDay()];
      salesByDay[dayName] = { revenue: 0, orders: 0 };
    }
    
    // Aggregate orders
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const dayName = dayNames[date.getDay()];
      if (salesByDay[dayName]) {
        salesByDay[dayName].revenue += order.total;
        salesByDay[dayName].orders += 1;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(salesByDay).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));
  },
});

// Get category sales data
export const getCategorySales = query({
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.gte(q.field("createdAt"), oneWeekAgo))
      .collect();
    
    // Get all menu items to map categories
    const menuItems = await ctx.db.query("menuItems").collect();
    const categoryMap = new Map(menuItems.map(item => [item._id, item.category]));
    
    // Aggregate sales by category
    const categorySales = new Map<string, number>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = categoryMap.get(item.menuItemId) || "Other";
        const currentAmount = categorySales.get(category) || 0;
        categorySales.set(category, currentAmount + (item.price * item.quantity));
      });
    });
    
    // Calculate total and percentages
    const total = Array.from(categorySales.values()).reduce((sum, val) => sum + val, 0);
    
    return Array.from(categorySales.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  },
});
