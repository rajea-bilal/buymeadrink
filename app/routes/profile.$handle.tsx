import type { Route } from "./+types/profile.$handle";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Twitch,
  Share2,
} from "lucide-react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { data } from "react-router";

// Initialize Convex client - use import.meta.env for Vite
const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL!);

// Type definitions for mock data
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  url: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: any;
}

interface Post {
  id: string;
  platform: string;
  thumbnail: string;
  timestamp: string;
  url: string;
}

interface Gift {
  id: string;
  title: string;
  price: number;
  description: string;
  media: string;
  currency: string;
}

interface Tier {
  id: string;
  name: string;
  price: number;
  currency: string;
  perks: string[];
  highlighted?: boolean;
}

interface Callout {
  id: string;
  type: string;
  price: number;
  duration: string;
  description: string;
  currency: string;
  featured?: boolean;
}

interface SpoilItem {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  image: string;
  shareAmount: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  amount: number;
  avatar?: string;
}

interface CreatorData {
  handle: string;
  name: string;
  tagline: string;
  avatar: string;
  banner: string;
  sponsors: Sponsor[];
  socialLinks: SocialLink[];
  posts: Post[];
  gifts: Gift[];
  tiers: Tier[];
  callouts: Callout[];
  spoilItems: SpoilItem[];
  leaderboards: {
    week: LeaderboardEntry[];
    month: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  };
  recentPurchases: Array<{
    id: string;
    buyer: string;
    item: string;
    amount: number;
  }>;
}

// Map platform names to icon components
const iconMap: Record<string, any> = {
  Instagram: Instagram,
  Twitter: Twitter,
  YouTube: Youtube,
  Facebook: Facebook,
  Twitch: Twitch,
};

// Loader with real Convex data
export async function loader({ params }: Route.LoaderArgs) {
  const { handle } = params;

  console.log("Loading profile for handle:", handle);

  try {
    // Fetch creator profile from Convex
    const profile = await convex.query(api.creators.getCreatorProfile, { handle });
    console.log("Profile data received:", profile);

    // If creator not found, throw 404
    if (!profile) {
      console.log("No profile found for handle:", handle);
      throw new Response("Creator not found", { status: 404 });
    }

  // Fetch leaderboards in parallel
  const [weekLeaderboard, monthLeaderboard, allTimeLeaderboard] = await Promise.all([
    convex.query(api.creators.getLeaderboard, { 
      creatorId: profile.creator._id, 
      timeframe: "week" 
    }),
    convex.query(api.creators.getLeaderboard, { 
      creatorId: profile.creator._id, 
      timeframe: "month" 
    }),
    convex.query(api.creators.getLeaderboard, { 
      creatorId: profile.creator._id, 
      timeframe: "allTime" 
    }),
  ]);

  // Helper to format timestamp as relative time
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  // Map Convex data to component format
  const creatorData: CreatorData = {
    handle: profile.creator.handle,
    name: profile.creator.name,
    tagline: profile.creator.tagline || "",
    avatar: profile.creator.avatar || "/kaizen.png",
    banner: profile.creator.banner || "/kaizen.png",
    sponsors: profile.sponsors.map((s) => ({
      id: s._id,
      name: s.name,
      logo: s.logo,
      url: s.url,
    })),
    socialLinks: profile.socialLinks.map((sl) => ({
      platform: sl.platform,
      url: sl.url,
      icon: iconMap[sl.platform] || Instagram,
    })),
    posts: profile.posts.map((p) => ({
      id: p._id,
      platform: p.platform,
      thumbnail: p.thumbnail,
      timestamp: getRelativeTime(p.publishedAt),
      url: p.url,
    })),
    gifts: profile.gifts.map((g) => ({
      id: g._id,
      title: g.title,
      price: g.price / 100, // Convert cents to dollars
      description: g.description,
      media: g.media,
      currency: g.currency,
    })),
    tiers: profile.tiers.map((t) => ({
      id: t._id,
      name: t.name,
      price: t.price / 100, // Convert cents to dollars
      currency: t.currency,
      perks: t.perks,
      highlighted: t.highlighted,
    })),
    callouts: profile.callouts.map((c) => ({
      id: c._id,
      type: c.type,
      price: c.price / 100, // Convert cents to dollars
      duration: c.duration,
      description: c.description,
      currency: c.currency,
      featured: c.featured,
    })),
    spoilItems: profile.spoilItems.map((si) => ({
      id: si._id,
      title: si.title,
      description: si.description,
      targetAmount: si.targetAmount / 100, // Convert cents to pounds
      currentAmount: si.currentAmount / 100,
      currency: si.currency,
      image: si.image,
      shareAmount: si.shareAmount / 100,
    })),
    leaderboards: {
      week: weekLeaderboard.map((entry) => ({
        rank: entry.rank,
        name: entry.fanName,
        handle: entry.fanName, // Use fanName as handle for now
        amount: entry.totalAmount / 100,
      })),
      month: monthLeaderboard.map((entry) => ({
        rank: entry.rank,
        name: entry.fanName,
        handle: entry.fanName,
        amount: entry.totalAmount / 100,
      })),
      allTime: allTimeLeaderboard.map((entry) => ({
        rank: entry.rank,
        name: entry.fanName,
        handle: entry.fanName,
        amount: entry.totalAmount / 100,
      })),
    },
    recentPurchases: profile.recentPurchases.map((p) => ({
      id: p._id,
      buyer: p.fanName || "Anonymous",
      item: "Gift", // We don't have gift title in recent purchases yet
      amount: p.totalAmount / 100,
    })),
  };

  return creatorData;
  } catch (error) {
    console.error("Loader error:", error);
    throw error;
  }
}

export default function CreatorProfile({ loaderData }: Route.ComponentProps) {
  const creator = loaderData;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-purple-900 to-blue-900 relative overflow-hidden">
          <img
            src={creator.banner}
            alt={`${creator.name} banner`}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Profile Info */}
        <div className="relative -mt-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#1a1a1a]">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    {creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Creator Info */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {creator.name}
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-4">
                  {creator.tagline}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a2a] text-slate-200 hover:bg-[#2a2a2a] hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors Section */}
      {creator.sponsors.length > 0 && (
        <div className="py-8 border-b border-[#2a2a2a]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h3 className="text-xl font-semibold text-white mb-4">Sponsored By</h3>
            <div className="flex flex-wrap gap-4">
              {creator.sponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#252525] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-slate-200 text-sm">{sponsor.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Social Links Section */}
      {creator.socialLinks.length > 0 && (
        <div className="py-6 border-b border-[#2a2a2a]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex flex-wrap gap-3">
              {creator.socialLinks.map((link) => {
                const IconComponent = link.icon;
                if (!IconComponent) return null;
                return (
                  <Button
                    key={link.platform}
                    variant="outline"
                    size="sm"
                    className="border-[#2a2a2a] text-slate-200 hover:bg-[#2a2a2a] hover:text-white"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <IconComponent className="w-4 h-4 mr-2" />
                      {link.platform}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Latest Posts Carousel */}
      {creator.posts.length > 0 && (
        <div className="py-12 border-b border-[#2a2a2a]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Latest Posts</h2>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4">
                {creator.posts.map((post) => (
                  <div
                    key={post.id}
                    className="min-w-[200px] bg-[#252525] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    <div className="p-4">
                      <img
                        src={post.thumbnail}
                        alt={`${post.platform} post`}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-[#2a2a2a] text-slate-200 px-2 py-1 rounded">
                          {post.platform}
                        </span>
                        <span className="text-xs text-slate-400">{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info - Remove this later */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-[#252525] p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Debug Info:</h3>
          <p className="text-slate-300">Handle: {creator.handle}</p>
          <p className="text-slate-300">Gifts: {creator.gifts.length}</p>
          <p className="text-slate-300">Tiers: {creator.tiers.length}</p>
          <p className="text-slate-300">Callouts: {creator.callouts.length}</p>
          <p className="text-slate-300">Spoil Items: {creator.spoilItems.length}</p>
        </div>
      </div>
    </div>
  );
}

