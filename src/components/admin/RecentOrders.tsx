import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { recentOrders } from '@/data/salesData';
import { formatDistanceToNow } from 'date-fns';

const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  transfer: Smartphone,
};

export function RecentOrders() {
  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Clock className="w-5 h-5 text-primary" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const PaymentIcon = paymentIcons[order.paymentMethod];
              
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(order.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 capitalize"
                    >
                      <PaymentIcon className="w-3 h-3" />
                      {order.paymentMethod}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-xs text-muted-foreground">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">
                      ₦{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
