import { PremiumCard } from "~/components/ui/premium-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Gift, ShoppingCart, DollarSign } from "lucide-react";
import { cn } from "~/lib/utils";

interface GiftCardProps {
  gift: {
    _id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    media?: string;
    type?: string;
    active?: boolean;
  };
  creator: {
    name: string;
    handle: string;
  };
  onPurchase: (gift: any) => void;
  className?: string;
}

export function GiftCard({ gift, creator, onPurchase, className = "" }: GiftCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  // Use gift media as background if available, otherwise use a default gift-themed background
  const backgroundImage = gift.media && gift.type === 'image' ? gift.media : undefined;

  return (
    <div className={cn("relative", className)}>
      <PremiumCard
        backgroundImage={backgroundImage}
        icon={Gift}
        category="Gift Item"
        title={gift.title}
        description={gift.description}
        leftInfo={{
          label: "Creator",
          value: creator.name
        }}
        rightInfo={{
          label: "Price",
          value: formatPrice(gift.price, gift.currency)
        }}
        actionLabel="Buy Gift"
        onAction={gift.active ? () => onPurchase(gift) : undefined}
        className={cn(
          gift.active ? "hover:border-emerald-600/50" : "opacity-75",
          !backgroundImage && "bg-gradient-to-br from-slate-800/90 to-slate-900/95 backdrop-blur-sm"
        )}
      >
        {/* Custom bottom section for gift card specific content */}
        <div className="mt-4 flex items-center justify-between">
          {/* Status and Purchase Button */}
          <div className="flex items-center gap-3">
            {!gift.active && (
              <Badge variant="secondary" className="bg-red-900/20 text-red-400 border-red-600/30 text-xs">
                Inactive
              </Badge>
            )}
            {gift.active && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">
                  Available
                </span>
              </div>
            )}
          </div>
          
          {gift.active && (
            <Button
              onClick={() => onPurchase(gift)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 h-auto"
              size="sm"
            >
              <ShoppingCart className="w-3 h-3 mr-1.5" />
              Purchase
            </Button>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}