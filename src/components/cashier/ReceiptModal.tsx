import React, { useRef } from "react";
// Helper to format order ID as 'New Era- 0000A01'
function formatOrderId(id: string) {
  // Use last 5-7 chars, pad with zeros, prefix
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const short = clean.slice(-6);
  return `New Era- ${short.padStart(7, "0")}`;
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, X, CheckCircle } from "lucide-react";
import { Order } from "@/types/cafeteria";
import { format } from "date-fns";

// Helper to categorize items into food and drinks
function categorizeItems(
  items: { name: string; price: number; quantity: number; category?: string }[],
) {
  const food: typeof items = [];
  const drinks: typeof items = [];
  items.forEach((item) => {
    // You can adjust the logic below based on your actual item structure
    if (
      item.category?.toLowerCase() === "drink" ||
      item.category?.toLowerCase() === "drinks"
    ) {
      drinks.push(item);
    } else {
      food.push(item);
    }
  });
  return { food, drinks };
}

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// POS Receipt Component
const POSReceipt = ({
  order,
  type,
}: {
  order: Order;
  type: "food" | "drinks";
}) => {
  const { food, drinks } = categorizeItems(order.items);
  const items = type === "food" ? food : drinks;
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (items.length === 0) return null;

  return (
    <div
      className="pos-receipt bg-white font-mono text-[11px] relative"
      style={{ width: "58mm", maxWidth: "58mm", margin: 0, padding: 0 }}
    >
      {/* Single Watermark Logo (background) */}
      <div className="absolute inset-0 z-0" style={{ opacity: 0.13 }}>
        <img
          src="/logo.png"
          alt="Watermark"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "none",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Header: Name and Location */}
      <div className="text-center font-extrabold text-[14px] mb-1 relative z-10 leading-tight tracking-wide">
        <div>Redeemer's University</div>
        <div className="text-[12px]">New Era Cafeteria</div>
        <div className="font-normal text-[10px]">Main Campus, Ede</div>
      </div>

      <div className="border-t border-black border-dashed my-1 relative z-10"></div>

      {/* Order Details */}
      <div className="mb-1 text-[10px] relative z-10">
        <div className="flex justify-between">
          <span>Order ID:</span>
          <span className="font-semibold">{formatOrderId(order.id)}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(order.timestamp, "dd/MM/yyyy HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment:</span>
          <span className="capitalize">{order.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t border-black border-dashed my-1 relative z-10"></div>

      {/* Items */}
      <div className="mb-1 relative z-10">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-0.5 text-[11px]">
            <span className="flex-1">
              {item.quantity}x {item.name}
            </span>
            <span className="ml-2 text-right font-medium">
              ₦{(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-black border-dashed my-1 relative z-10"></div>

      {/* Total */}
      <div className="flex justify-between font-extrabold text-[13px] mb-2 relative z-10">
        <span>TOTAL</span>
        <span>₦{total.toLocaleString()}</span>
      </div>

      <div className="border-t border-black border-dashed my-1 relative z-10"></div>

      {/* Footer */}
      <div className="text-center text-[10px] relative z-10 mt-1">
        <p className="font-semibold">Thank you for your patronage!</p>
        <p className="mt-0.5">Please come again 🙏</p>
      </div>
    </div>
  );
};

export function ReceiptModal({ order, isOpen, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const { food, drinks } = categorizeItems(order.items);
  const hasBoth = food.length > 0 && drinks.length > 0;

  const handlePrint = (type?: "food" | "drinks") => {
    // Create a hidden iframe for printing
    // Note: Browsers do not allow bypassing the print dialog for security reasons.
    // The print window will open and focus, but the user must confirm printing.
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const printDoc =
      printFrame.contentDocument || printFrame.contentWindow?.document;
    if (!printDoc) return;

    // Add print styles for POS receipt size
    printDoc.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 58mm auto;
                margin: 0;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 58mm;
                min-height: 0 !important;
                height: auto !important;
              }
              .pos-receipt {
                width: 58mm !important;
                max-width: 58mm !important;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                padding: 0.5mm 0.5mm;
                margin: 0;
                box-sizing: border-box;
                min-height: 0 !important;
                height: auto !important;
                overflow: visible !important;
                position: relative;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 0;
            }
            .pos-receipt {
              width: 58mm;
              max-width: 58mm;
              background: white;
              padding: 0.5mm 0.5mm;
              margin: 0;
              font-size: 10px;
              box-sizing: border-box;
              min-height: 0 !important;
              height: auto !important;
              overflow: visible !important;
              position: relative;
            }
          </style>
        </head>
        <body>
    `);

    // Get the receipt content
    const receipts = receiptRef.current?.querySelectorAll(".pos-receipt");
    if (receipts) {
      if (type) {
        // Print specific type
        const idx = type === "food" ? 0 : 1;
        if (receipts[idx]) {
          printDoc.write(receipts[idx].outerHTML);
        }
      } else {
        // Print all receipts
        receipts.forEach((receipt) => {
          printDoc.write(receipt.outerHTML);
          printDoc.write('<div style="page-break-after: always;"></div>');
        });
      }
    }

    printDoc.write("</body></html>");
    printDoc.close();

    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();

    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            Order Complete
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="space-y-4">
          {food.length > 0 && <POSReceipt order={order} type="food" />}
          {drinks.length > 0 && <POSReceipt order={order} type="drinks" />}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          {hasBoth ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePrint("food")}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Food
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePrint("drinks")}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Drinks
              </Button>
            </>
          ) : (
            <Button className="flex-1" onClick={() => handlePrint()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
