import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, X, CheckCircle } from 'lucide-react';
import { Order } from '@/types/cafeteria';
import { format } from 'date-fns';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ order, isOpen, onClose }: ReceiptModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            Order Complete
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card border border-border rounded-lg p-6 font-mono text-sm">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="font-display font-bold text-lg text-foreground">
              Redeemers University
            </h2>
            <p className="text-muted-foreground text-xs">New Era Cafeteria</p>
            <p className="text-muted-foreground text-xs">Ede, Osun State, Nigeria</p>
          </div>

          <Separator className="my-4 border-dashed" />

          {/* Order Details */}
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Date:</span>
              <span>{format(order.timestamp, 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Time:</span>
              <span>{format(order.timestamp, 'HH:mm:ss')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Payment:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>

          <Separator className="my-4 border-dashed" />

          {/* Items */}
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4 border-dashed" />

          {/* Total */}
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL</span>
            <span className="text-primary">₦{order.total.toLocaleString()}</span>
          </div>

          <Separator className="my-4 border-dashed" />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Thank you for your patronage!</p>
            <p className="mt-1">Please come again 🙏</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
