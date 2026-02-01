import React, { useContext, useState, ReactNode } from "react";
import { useMutation } from "@/lib/convexApi";
import { api } from "@/lib/convexApi";
import { CartItem, MenuItem, Order } from "@/types/cafeteria";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./AuthContext";

// Define the CartContext type
interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  orders: Order[];
  completeOrder: (paymentMethod: "cash" | "card" | "transfer") => Order;
}

// Create the CartContext with an initial undefined value
export const CartContext = React.createContext<CartContextType | undefined>(
  undefined,
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const createOrder = useMutation(api.orders.createOrder);
  const { code: cashierCode } = useAuth();

  const addItem = (item: MenuItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
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
      items: items.map(({ id, name, price, quantity }) => ({
        menuItemId: id as Id<"menuItems">,
        name,
        price,
        quantity,
      })),
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// useCart hook moved to a separate file (useCart.ts)
