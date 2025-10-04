import type { Route } from "./+types/profile.$handle";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { ClientOnly } from "~/components/ClientOnly";
import { ShareButton } from "~/components/ShareButton";
import { ProfileTabs } from "~/components/ProfileTabs";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL!);

interface CreatorData {
  handle: string;
  name: string;
  tagline: string;
  avatar: string;
  banner: string;
  sponsors: Array<{
    id: string;
    name: string;
    logo: string;
    url: string;
  }>;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  posts: Array<{
    id: string;
    platform: string;
    thumbnail: string;
    timestamp: string;
    url: string;
  }>;
  gifts: Array<{
    id: string;
    title: string;
    price: number;
    description: string;
    media: string;
    currency: string;
    type: string;
  }>;
  tiers: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    perks: string[];
    highlighted?: boolean;
  }>;
  callouts: Array<{
    id: string;
    type: string;
    price: number;
    duration: string;
    description: string;
    currency: string;
    featured?: boolean;
  }>;
  spoilItems: Array<{
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    image: string;
    shareAmount: number;
  }>;
  leaderboards: {
    week: Array<{
      rank: number;
      name: string;
      handle: string;
      amount: number;
    }>;
    month: Array<{
      rank: number;
      name: string;
      handle: string;
      amount: number;
    }>;
    allTime: Array<{
      rank: number;
      name: string;
      handle: string;
      amount: number;
    }>;
  };
  recentPurchases: Array<{
    id: string;
    buyer: string;
    item: string;
    amount: number;
  }>;
}

export async function loader({ params }: Route.LoaderArgs) {
  const { handle } = params;

  console.log("Loading profile for handle:", handle);

  try {
    const profile = await convex.query(api.creators.getCreatorProfile, { handle });
    console.log("Profile data received:", profile);

    if (!profile) {
      console.log("No profile found for handle:", handle);
      throw new Response("Creator not found", { status: 404 });
    }

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
        price: g.price / 100,
        description: g.description,
        media: g.media,
        currency: g.currency,
        type: g.type,
      })),
      tiers: profile.tiers.map((t) => ({
        id: t._id,
        name: t.name,
        price: t.price / 100,
        currency: t.currency,
        perks: t.perks,
        highlighted: t.highlighted,
      })),
      callouts: profile.callouts.map((c) => ({
        id: c._id,
        type: c.type,
        price: c.price / 100,
        duration: c.duration,
        description: c.description,
        currency: c.currency,
        featured: c.featured,
      })),
      spoilItems: profile.spoilItems.map((si) => ({
        id: si._id,
        title: si.title,
        description: si.description,
        targetAmount: si.targetAmount / 100,
        currentAmount: si.currentAmount / 100,
        currency: si.currency,
        image: si.image,
        shareAmount: si.shareAmount / 100,
      })),
      leaderboards: {
        week: weekLeaderboard.map((entry) => ({
          rank: entry.rank,
          name: entry.fanName,
          handle: entry.fanName,
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
        item: "Gift",
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
        <div className="h-64 md:h-80 bg-gradient-to-r from-purple-900 to-blue-900 relative overflow-hidden">
          <img
            src={creator.banner}
            alt={`${creator.name} banner`}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative -mt-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#1a1a1a] rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 text-white">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {creator.name}
                </h1>
                <p className="text-lg md:text-xl text-slate-200 mb-4">
                  {creator.tagline}
                </p>
                <ClientOnly fallback={
                  <div className="border border-[#2a2a2a] text-slate-200 px-4 py-2 rounded text-sm bg-[#252525] animate-pulse">
                    Loading...
                  </div>
                }>
                  <ShareButton />
                </ClientOnly>
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
              {creator.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#2a2a2a] text-slate-200 hover:bg-[#2a2a2a] hover:text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Latest Posts */}
      {creator.posts.length > 0 && (
        <div className="py-12 border-b border-[#2a2a2a]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Latest Posts</h2>
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
      )}

      {/* Interactive Tabs Section */}
      <ClientOnly fallback={
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-[#252525] border border-[#2a2a2a] rounded-lg p-6 animate-pulse">
            <div className="flex gap-4 mb-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 w-24 bg-[#1f1f1f] rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-[#1f1f1f] rounded"></div>
          </div>
        </div>
      }>
        <ProfileTabs creator={creator} />
      </ClientOnly>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-[#252525] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Profile Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{creator.gifts.length}</div>
              <div className="text-sm text-slate-400">Gifts Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{creator.tiers.length}</div>
              <div className="text-sm text-slate-400">Support Tiers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{creator.callouts.length}</div>
              <div className="text-sm text-slate-400">Callout Options</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{creator.spoilItems.length}</div>
              <div className="text-sm text-slate-400">Spoil Me Items</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-[#252525] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {creator.recentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {purchase.buyer.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{purchase.buyer}</div>
                    <div className="text-slate-400 text-sm">{purchase.item}</div>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold">
                  ${purchase.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gifts */}
        <div className="mt-6">
          <h3 className="text-white font-semibold mb-4">Available Gifts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creator.gifts.map((gift) => (
              <div key={gift.id} className="bg-[#252525] border border-[#2a2a2a] rounded-lg hover:border-[#333333] transition-colors cursor-pointer">
                <div className="p-4">
                  <img
                    src={gift.media}
                    alt={gift.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="text-white font-semibold mb-2">{gift.title}</h4>
                  <p className="text-slate-400 text-sm mb-3">{gift.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-[#2a2a2a] text-slate-200 text-xs px-2 py-1 rounded">
                      {gift.type}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      ${gift.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="mt-8">
          <h3 className="text-white font-semibold mb-4">Support Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creator.tiers.map((tier) => (
              <div key={tier.id} className={`bg-[#252525] border border-[#2a2a2a] rounded-lg hover:border-[#333333] transition-colors cursor-pointer ${tier.highlighted ? 'ring-2 ring-emerald-500' : ''}`}>
                <div className="p-6">
                  {tier.highlighted && (
                    <span className="inline-block mb-3 bg-emerald-600 text-white text-xs px-2 py-1 rounded">Most Popular</span>
                  )}
                  <h4 className="text-white font-bold text-xl mb-2">{tier.name}</h4>
                  <div className="text-3xl font-bold text-emerald-400 mb-4">
                    ${tier.price.toFixed(2)}
                    <span className="text-sm text-slate-400 font-normal">/month</span>
                  </div>
                  <ul className="space-y-2">
                    {tier.perks.map((perk, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}