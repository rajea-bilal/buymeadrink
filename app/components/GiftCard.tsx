import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Gift, DollarSign, ShoppingCart } from "lucide-react";

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

  return (
    <Card className={`bg-[#232323] border-[#2a2a2a] hover:border-emerald-600/50 transition-colors ${className}`}>
      <div className="p-6">
        {/* Media */}
        {gift.media && (
          <div className="mb-4">
            {gift.type === 'image' ? (
              <img 
                src={gift.media} 
                alt={gift.title}
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-32 bg-[#1f1f1f] rounded-lg flex items-center justify-center">
                <Gift className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-white font-semibold text-lg">{gift.title}</h3>
            {!gift.active && (
              <Badge variant="secondary" className="bg-red-900/20 text-red-400 border-red-600/30">
                Inactive
              </Badge>
            )}
          </div>

          <p className="text-slate-400 text-sm line-clamp-2">{gift.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-lg">
                {formatPrice(gift.price, gift.currency)}
              </span>
            </div>

            <Button
              onClick={() => onPurchase(gift)}
              disabled={!gift.active}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Gift
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}