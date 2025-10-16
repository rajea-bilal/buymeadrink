import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Crown, DollarSign, Users, Check } from "lucide-react";

interface TierCardProps {
  tier: {
    _id: string;
    name: string;
    price: number;
    currency: string;
    perks: string[];
    description?: string;
    highlighted?: boolean;
    active?: boolean;
  };
  creator: {
    name: string;
    handle: string;
  };
  onSubscribe: (tier: any) => void;
  className?: string;
}

export function TierCard({ tier, creator, onSubscribe, className = "" }: TierCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  return (
    <Card className={`bg-[#232323] border-[#2a2a2a] hover:border-emerald-600/50 transition-colors ${
      tier.highlighted ? 'border-emerald-600/50 ring-1 ring-emerald-600/20' : ''
    } ${className}`}>
      <div className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            {tier.highlighted && (
              <Badge className="bg-emerald-600 text-white mb-2">
                <Crown className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
            
            <h3 className="text-white font-semibold text-xl">{tier.name}</h3>
            
            <div className="flex items-center justify-center gap-2 mt-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-2xl">
                {formatPrice(tier.price, tier.currency)}
              </span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>

            {tier.description && (
              <p className="text-slate-400 text-sm mt-2">{tier.description}</p>
            )}
          </div>

          {/* Perks */}
          {tier.perks && tier.perks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">What's included:</h4>
              <ul className="space-y-1">
                {tier.perks.map((perk, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Subscribe Button */}
          <Button
            onClick={() => onSubscribe(tier)}
            disabled={!tier.active}
            className={`w-full ${
              tier.highlighted 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-slate-700 hover:bg-slate-600'
            } text-white`}
          >
            <Users className="w-4 h-4 mr-2" />
            {tier.active ? 'Subscribe' : 'Coming Soon'}
          </Button>
        </div>
      </div>
    </Card>
  );
}