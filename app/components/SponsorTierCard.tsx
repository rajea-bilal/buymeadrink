import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import type { SponsorTier } from "~/lib/sponsorTiers";

interface SponsorTierCardProps {
  tier: SponsorTier;
}

export function SponsorTierCard({ tier }: SponsorTierCardProps) {
  return (
    <div className="bg-[#1f1f1f] border border-amber-600/30 rounded-lg p-4 hover:border-amber-500/50 transition-colors">
      {/* Logo and Sponsored Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
          <img 
            src={tier.logo} 
            alt={tier.name}
            className="w-full h-full object-contain"
          />
        </div>
        <Badge className="bg-amber-600/20 text-amber-400 border border-amber-500/50 text-xs">
          Sponsored
        </Badge>
      </div>

      {/* Headline */}
      <h3 className="text-white font-medium mb-2">{tier.headline}</h3>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{tier.description}</p>

      {/* Price and CTA */}
      <div className="flex items-center justify-between">
        <span className="text-amber-400 font-semibold text-sm">
          {tier.price}
        </span>
        <Button
          onClick={() => window.open(tier.url, "_blank")}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Learn More
        </Button>
      </div>
    </div>
  );
}
