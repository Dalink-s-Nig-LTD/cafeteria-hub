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

  // Print daily sales report (receipt style)
  const downloadDailySalesPDF = () => {
    const todaysOrders = getTodaysOrders();
    let grandTotal = 0;
    todaysOrders.forEach((order) => (grandTotal += order.total));

    // Create a printable window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Sales Report</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 80mm;
              margin: 0 auto;
              padding: 10px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .title {
              font-size: 18px;
              font-weight: 900;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .date {
              font-size: 11px;
              margin-top: 5px;
            }
            .order {
              margin-bottom: 15px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .order-header {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 11px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 11px;
            }
            .item-name {
              flex: 1;
            }
            .item-qty {
              width: 30px;
              text-align: center;
            }
            .item-total {
              width: 70px;
              text-align: right;
            }
            .order-total {
              font-weight: bold;
              text-align: right;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px solid #000;
            }
            .grand-total {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 2px solid #000;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              border-top: 2px dashed #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">NEW ERA CAFETERIA</div>
            <div class="subtitle">Daily Sales Report</div>
            <div class="date">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>

          ${todaysOrders
            .map((order) => {
              const orderTime =
                order.timestamp instanceof Date
                  ? order.timestamp.toLocaleTimeString()
                  : new Date(order.timestamp).toLocaleTimeString();

              return `
              <div class="order">
                <div class="order-header">
                  Order #${order.id}<br>
                  ${orderTime} - ${order.paymentMethod.toUpperCase()}
                </div>
                ${order.items
                  .map(
                    (item) => `
                  <div class="item-row">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">x${item.quantity}</span>
                    <span class="item-total">₦${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                `,
                  )
                  .join("")}
                <div class="order-total">
                  Order Total: ₦${order.total.toLocaleString()}
                </div>
              </div>
            `;
            })
            .join("")}

          <div class="grand-total">
            Total Orders: ${todaysOrders.length}<br>
            GRAND TOTAL: ₦${grandTotal.toLocaleString()}
          </div>

          <div class="footer">
            Redeemers University, Ede<br>
            Thank you for your business!
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
