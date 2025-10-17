import { Button } from "~/components/ui/button";
import { ExternalLink, Store, Utensils, Coffee, Zap } from "lucide-react";
import { cn } from "~/lib/utils";
import type { SponsorTier } from "~/lib/sponsorTiers";

interface SponsorTierCardProps {
  tier: SponsorTier;
  className?: string;
}

const getIconAndGradient = (name: string) => {
  const brandName = name.toLowerCase();
  
  if (brandName.includes("mcdonald")) {
    return {
      icon: Store,
      iconBg: "bg-amber-500/15",
      iconRing: "ring-amber-400/20",
      iconColor: "text-amber-300",
      gradient: "from-amber-500/15 to-yellow-400/10"
    };
  }
  
  if (brandName.includes("kfc")) {
    return {
      icon: Utensils,
      iconBg: "bg-rose-500/15",
      iconRing: "ring-rose-400/20",
      iconColor: "text-rose-300",
      gradient: "from-rose-500/15 to-red-400/10"
    };
  }
  
  if (brandName.includes("costa") || brandName.includes("coffee")) {
    return {
      icon: Coffee,
      iconBg: "bg-rose-600/15",
      iconRing: "ring-rose-500/20",
      iconColor: "text-rose-300",
      gradient: "from-rose-600/15 to-fuchsia-500/10"
    };
  }
  
  if (brandName.includes("red bull") || brandName.includes("energy")) {
    return {
      icon: Zap,
      iconBg: "bg-blue-500/15",
      iconRing: "ring-blue-400/20",
      iconColor: "text-blue-300",
      gradient: "from-blue-500/15 to-cyan-400/10"
    };
  }
  
  return {
    icon: Store,
    iconBg: "bg-amber-500/15",
    iconRing: "ring-amber-400/20",
    iconColor: "text-amber-300",
    gradient: "from-amber-500/15 to-yellow-400/10"
  };
};

export function SponsorTierCard({ tier, className }: SponsorTierCardProps) {
  const { icon: Icon, iconBg, iconRing, iconColor, gradient } = getIconAndGradient(tier.name);
  
  const handleClick = () => {
    window.open(tier.url, "_blank", "noopener,noreferrer");
  };
  
  const formatPrice = (priceStr: string) => {
    const match = priceStr.match(/\$(\d+)/);
    return match ? `$${match[1]}` : priceStr;
  };
  
  return (
    <article 
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-[#0f0f0f] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)]",
        "p-5 sm:p-6 md:p-7 transition-all duration-300",
        "hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)]",
        className
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={cn(
          "absolute -bottom-20 -right-12 h-56 w-56 rounded-full blur-2xl",
          `bg-gradient-to-tr ${gradient}`
        )} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
            iconBg,
            iconRing
          )}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <div className="flex-1">
            <h2 className="text-[22px] md:text-[24px] tracking-tight font-semibold text-white">
              {tier.name}
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-400">Sponsored Partner</p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/5" />

        <p className="mt-5 text-sm leading-6 text-slate-300/80">
          {tier.description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-end justify-between rounded-lg bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/5">
            <span className="text-slate-400">Price</span>
            <span className="font-medium text-white">{formatPrice(tier.price)}</span>
          </div>
          <div className="rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/5">
            <Button
              onClick={handleClick}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full h-full bg-transparent hover:bg-white/10",
                "text-white text-xs border-0 rounded-lg",
                "transition-colors duration-200"
              )}
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
