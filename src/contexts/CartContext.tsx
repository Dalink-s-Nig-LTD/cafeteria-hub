import React, { useContext, useState, ReactNode } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMutation } from "@/lib/convexApi";
import { api } from "@/lib/convexApi";
import { CartItem, MenuItem, Order, CustomCartItem } from "@/types/cafeteria";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./AuthContext";

// CartContext definition
interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem | CustomCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  orders: Order[];
  completeOrder: (paymentMethod: "cash" | "card" | "transfer") => Order;
  downloadDailySalesPDF: () => void;
}

// CustomCartItem type moved to types/cafeteria.ts

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Helper to get today's orders
  const getTodaysOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter((order) => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= today;
    });
  };

  // PDF generation for daily sales
  const downloadDailySalesPDF = () => {
    const todaysOrders = getTodaysOrders();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text("New Era Cafeteria", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text("Daily Sales Report", pageWidth / 2, 28, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 36, {
      align: "center",
    });

    // Prepare table data
    const tableData: (string | Record<string, unknown>)[][] = [];
    let grandTotal = 0;

    todaysOrders.forEach((order, idx) => {
      const orderTime =
        order.timestamp instanceof Date
          ? order.timestamp.toLocaleTimeString()
          : new Date(order.timestamp).toLocaleTimeString();

      const orderHeader = `Order #${order.id} - ${orderTime} - ${order.paymentMethod}`;

      tableData.push([
        {
          content: orderHeader,
          colSpan: 4,
          styles: { fontStyle: "bold", fillColor: [220, 220, 220] },
        },
      ]);

      order.items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        tableData.push([
          item.name,
          item.quantity.toString(),
          `N${item.price.toLocaleString()}`,
          `N${itemTotal.toLocaleString()}`,
        ]);
      });

      tableData.push([
        {
          content: "Order Total:",
          colSpan: 3,
          styles: { fontStyle: "bold", halign: "right" },
        },
        {
          content: `N${order.total.toLocaleString()}`,
          styles: { fontStyle: "bold" },
        },
      ]);

      grandTotal += order.total;

      if (idx < todaysOrders.length - 1) {
        tableData.push([
          { content: "", colSpan: 4, styles: { minCellHeight: 2 } },
        ]);
      }
    });

    autoTable(doc, {
      startY: 44,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      foot: [
        ["", "", "", ""],
        [
          "Total Orders:",
          todaysOrders.length.toString(),
          "Grand Total:",
          `N${grandTotal.toLocaleString()}`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [66, 139, 202],
        fontStyle: "bold",
        fontSize: 11,
        textColor: [255, 255, 255],
      },
      footStyles: {
        fillColor: [240, 240, 240],
        fontStyle: "bold",
        fontSize: 11,
        textColor: [0, 0, 0],
      },
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 40, halign: "right" },
      },
    });

    doc.save(
      `Daily_Sales_${new Date().toLocaleDateString().replace(/\//g, "_")}.pdf`,
    );
  };
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const createOrder = useMutation(api.orders.createOrder);
  const { code: cashierCode } = useAuth();

  const addItem = (item: MenuItem | CustomCartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      // If it's a custom item, mark isCustom
      if ((item as CustomCartItem).isCustom || item.id.startsWith("custom-")) {
        return [...current, { ...item, quantity: 1, isCustom: true }];
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const completeOrder = (
    paymentMethod: "cash" | "card" | "transfer",
  ): Order => {
    const now = Date.now();
    const order: Order = {
      id: `ORD-${now.toString(36).toUpperCase()}`,
      items: [...items],
      total,
      timestamp: new Date(),
      paymentMethod,
      status: "completed",
    };
    // Save to backend with correct schema
    createOrder({
      items: items.map((item) => {
        // Always send menuItemId, for custom use a placeholder
        const isCustom =
          (item as CustomCartItem).isCustom ||
          (typeof item.id === "string" && item.id?.startsWith("custom-"));
        return {
          menuItemId: isCustom
            ? ("custom" as Id<"menuItems">)
            : (item.id as Id<"menuItems">),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        };
      }),
      total,
      paymentMethod,
      status: "completed",
      cashierCode: cashierCode || "",
      createdAt: now,
    });
    setOrders((current) => [order, ...current]);
    clearCart();
    return order;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        orders,
        completeOrder,
        downloadDailySalesPDF,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
