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
      className="pos-receipt"
      style={{
        width: "80mm",
        maxWidth: "80mm",
        margin: 0,
        padding: "3mm",
        backgroundColor: "white",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "12px",
        color: "#000",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Header: Name and Location */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "14px",
          marginBottom: "4px",
          lineHeight: "1.2",
        }}
      >
        <div>New Era Cafeteria</div>
        <div style={{ fontSize: "12px" }}>Redeemer's University</div>
        <div style={{ fontWeight: "normal", fontSize: "10px" }}>
          Main Campus, Ede
        </div>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }}></div>

      {/* Order Details */}
      <div style={{ fontSize: "10px", marginBottom: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Order ID:</span>
          <span style={{ fontWeight: "600" }}>{formatOrderId(order.id)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date:</span>
          <span>{format(order.timestamp, "dd/MM/yyyy HH:mm")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Payment:</span>
          <span style={{ textTransform: "capitalize" }}>
            {order.paymentMethod}
          </span>
        </div>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }}></div>

      {/* Items */}
      <div style={{ marginBottom: "4px" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
              fontSize: "11px",
            }}
          >
            <span style={{ flex: 1 }}>
              {item.quantity}x {item.name}
            </span>
            <span
              style={{
                marginLeft: "8px",
                textAlign: "right",
                fontWeight: "500",
              }}
            >
              ₦{(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }}></div>

      {/* Total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        <span>TOTAL</span>
        <span>₦{total.toLocaleString()}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }}></div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "10px", marginTop: "4px" }}>
        <p style={{ fontWeight: "600" }}>Thank you for your patronage!</p>
        <p style={{ marginTop: "2px" }}>Please come again</p>
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
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 80mm !important;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 80mm;
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #000;
              background: white;
            }
            .pos-receipt {
              width: 80mm !important;
              max-width: 80mm !important;
              padding: 3mm !important;
              margin: 0 !important;
              background: white !important;
              font-family: 'Courier New', Courier, monospace !important;
              font-size: 12px !important;
              color: #000 !important;
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
      <DialogContent
        className="max-w-md max-h-[80vh] overflow-y-auto"
        aria-describedby="receipt-modal-desc"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            Order Complete
          </DialogTitle>
        </DialogHeader>
        <span id="receipt-modal-desc" style={{ display: "none" }}>
          Receipt details and print options for the completed order.
        </span>

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
