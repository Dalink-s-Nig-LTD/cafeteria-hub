import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ShoppingBag, DollarSign, Users } from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '₦347,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'primary',
  },
  {
    title: 'Total Orders',
    value: '402',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingBag,
    color: 'accent',
  },
  {
    title: 'Avg. Order Value',
    value: '₦863',
    change: '+4.1%',
    trend: 'up',
    icon: TrendingUp,
    color: 'success',
  },
  {
    title: 'Daily Customers',
    value: '127',
    change: '+15.3%',
    trend: 'up',
    icon: Users,
    color: 'navy',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card
            key={stat.title}
            className="border-border shadow-card hover:shadow-card-hover transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change} from last week
                  </p>
                </div>
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${stat.color === 'primary' ? 'bg-primary/10' : ''}
                  ${stat.color === 'accent' ? 'bg-accent/20' : ''}
                  ${stat.color === 'success' ? 'bg-success/10' : ''}
                  ${stat.color === 'navy' ? 'bg-navy/10' : ''}
                `}>
                  <Icon className={`
                    w-6 h-6
                    ${stat.color === 'primary' ? 'text-primary' : ''}
                    ${stat.color === 'accent' ? 'text-accent' : ''}
                    ${stat.color === 'success' ? 'text-success' : ''}
                    ${stat.color === 'navy' ? 'text-navy' : ''}
                  `} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
