import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { menuItems, categories } from '@/data/menuItems';
import { useCart } from '@/contexts/CartContext';
import { MenuItem } from '@/types/cafeteria';

export function MenuGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem } = useCart();

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddItem = (item: MenuItem) => {
    if (!item.available) return;
    addItem(item);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Category Filter */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={`
              rounded-full font-medium shrink-0 min-h-[44px] px-4
              ${selectedCategory === category 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card hover:bg-secondary border-border'
              }
            `}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 overflow-y-auto pb-4 scrollbar-hide">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleAddItem(item)}
            className={`
              group relative overflow-hidden cursor-pointer transition-all duration-200
              border border-border hover:border-primary/30
              ${item.available 
                ? 'hover:shadow-card hover:-translate-y-1 active:scale-95' 
                : 'opacity-50 cursor-not-allowed'
              }
            `}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center mb-2 sm:mb-3">
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </div>
              
              <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-1 line-clamp-2">
                {item.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold text-sm sm:text-base">
                  ₦{item.price.toLocaleString()}
                </span>
                
                {!item.available && (
                  <Badge variant="secondary" className="text-xs">
                    Out
                  </Badge>
                )}
              </div>

              {item.available && (
                <div className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
