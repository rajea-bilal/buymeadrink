import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Heart, 
  Share2, 
  ExternalLink, 
  Instagram, 
  Twitter, 
  Youtube, 
  Twitch,
  Facebook,
  Linkedin
} from "lucide-react";

interface CreatorHeaderProps {
  creator: {
    _id: string;
    name: string;
    handle: string;
    bio?: string;
    tagline?: string;
    avatar?: string;
    banner?: string;
    socialLinks?: Array<{
      platform: string;
      url: string;
    }>;
  };
  stats?: {
    totalEarnings?: number;
    giftCount?: number;
    subscriptionCount?: number;
  };
  className?: string;
}

export function CreatorHeader({ creator, stats, className = "" }: CreatorHeaderProps) {
  const getSocialIcon = (platform: string) => {
    const normalizedPlatform = platform.toLowerCase();
    switch (normalizedPlatform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'twitter':
      case 'x':
        return <Twitter className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'twitch':
        return <Twitch className="w-5 h-5" />;
      case 'discord':
        return <ExternalLink className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <Card className={`bg-[#232323] border-[#2a2a2a] overflow-hidden ${className}`}>
      {/* Banner */}
      {creator.banner && (
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-blue-600 relative">
          <img 
            src={creator.banner} 
            alt={`${creator.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="relative">
              <img 
                src={creator.avatar || "/default-avatar.png"} 
                alt={creator.name}
                className="w-20 h-20 rounded-full border-4 border-[#2a2a2a]"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full border-2 border-[#232323]"></div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-white text-2xl font-bold">{creator.name}</h1>
                <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 border-emerald-600/30">
                  @{creator.handle}
                </Badge>
              </div>

              {creator.tagline && (
                <p className="text-emerald-400 font-medium mb-2">{creator.tagline}</p>
              )}

              {creator.bio && (
                <p className="text-slate-300 text-sm leading-relaxed">{creator.bio}</p>
              )}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-emerald-400 font-bold text-lg">
                    {stats.totalEarnings ? formatCurrency(stats.totalEarnings) : "$0"}
                  </div>
                  <div className="text-slate-400 text-xs">Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-lg">
                    {stats.giftCount || 0}
                  </div>
                  <div className="text-slate-400 text-xs">Gifts</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-lg">
                    {stats.subscriptionCount || 0}
                  </div>
                  <div className="text-slate-400 text-xs">Supporters</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                <Heart className="w-4 h-4 mr-2" />
                Follow
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {creator.socialLinks && creator.socialLinks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <h3 className="text-white font-medium mb-3">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {creator.socialLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-[#333] text-white hover:bg-[#333]"
                >
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    {getSocialIcon(link.platform)}
                    <span className="capitalize">{link.platform}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}