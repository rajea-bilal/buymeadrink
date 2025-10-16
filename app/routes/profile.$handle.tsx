import type { Route } from "./+types/profile.$handle";
import { useEffect, useState } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { ClientOnly } from "~/components/ClientOnly";
import { ShareButton } from "~/components/ShareButton";
import { SignedIn, SignedOut, useUser } from "@clerk/react-router";
import { Button } from "~/components/ui/button";
import { Settings, BarChart3 } from "lucide-react";
// import { ProfileTabs } from "~/components/ProfileTabs";
import { StripeTestButton, StripeConnectionTest } from "~/components/StripeTestButton";
import { GiftModal } from "~/components/GiftModal";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL!);

interface CreatorData {
  _id?: string;
  handle: string;
  name: string;
  tagline: string;
  avatar: string;
  banner: string;
  // sponsors: Array<{
  //   id: string;
  //   name: string;
  //   logo: string;
  //   url: string;
  // }>;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  // posts: Array<{
  //   id: string;
  //   platform: string;
  //   thumbnail: string;
  //   timestamp: string;
  //   url: string;
  // }>;
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
  // callouts: Array<{
  //   id: string;
  //   type: string;
  //   price: number;
  //   duration: string;
  //   description: string;
  //   currency: string;
  //   featured?: boolean;
  // }>;
  // spoilItems: Array<{
  //   id: string;
  //   title: string;
  //   description: string;
  //   targetAmount: number;
  //   currentAmount: number;
  //   currency: string;
  //   image: string;
  //   shareAmount: number;
  // }>;
  // leaderboards: {
  //   week: Array<{
  //     rank: number;
  //     name: string;
  //     handle: string;
  //     amount: number;
  //   }>;
  //   month: Array<{
  //     rank: number;
  //     name: string;
  //     
  //     handle: string;
  //     amount: number;
  //   }>;
  //   allTime: Array<{
  //     rank: number;
  //     name: string;
  //     handle: string;
  //     amount: number;
  //   }>;
  // };
  recentPurchases: Array<{
    id: string;
    buyer: string;
    item: string;
    amount: number;
  }>;
  isOwner?: boolean;
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

    // const [weekLeaderboard, monthLeaderboard, allTimeLeaderboard] = await Promise.all([
    //   convex.query(api.creators.getLeaderboard, { 
    //     creatorId: profile.creator._id, 
    //     timeframe: "week" 
    //   }),
    //   convex.query(api.creators.getLeaderboard, { 
    //     creatorId: profile.creator._id, 
    //     timeframe: "month" 
    //   }),
    //   convex.query(api.creators.getLeaderboard, { 
    //     creatorId: profile.creator._id, 
    //     timeframe: "allTime" 
    //   }),
    // ]);

    // const getRelativeTime = (timestamp: number) => {
    //   const now = Date.now();
    //   const diff = now - timestamp;
    //   const minutes = Math.floor(diff / 60000);
    //   const hours = Math.floor(diff / 3600000);
    //   const days = Math.floor(diff / 86400000);
    //   
    //   if (minutes < 60) return `${minutes} minutes ago`;
    //   if (hours < 24) return `${hours} hours ago`;
    //   return `${days} days ago`;
    // };

    const creatorData: CreatorData = {
      _id: profile.creator._id,
      handle: profile.creator.handle,
      name: profile.creator.name,
      tagline: profile.creator.tagline || "",
      avatar: profile.creator.avatar || "/kaizen.png",
      banner: profile.creator.banner || "/kaizen.png",
      // sponsors: profile.sponsors.map((s) => ({
      //   id: s._id,
      //   name: s.name,
      //   logo: s.logo,
      //   url: s.url,
      // })),
      socialLinks: profile.socialLinks.map((sl: any) => ({
        platform: sl.platform,
        url: sl.url,
      })),
      // posts: profile.posts.map((p) => ({
      //   id: p._id,
      //   platform: p.platform,
      //   thumbnail: p.thumbnail,
      //   timestamp: getRelativeTime(p.publishedAt),
      //   url: p.url,
      // })),
      gifts: profile.gifts.map((g: any) => ({
        id: g._id,
        title: g.title,
        price: g.price / 100,
        description: g.description,
        media: g.media,
        currency: g.currency,
        type: g.type,
      })),
      tiers: profile.tiers.map((t: any) => ({
        id: t._id,
        name: t.name,
        price: t.price / 100,
        currency: t.currency,
        perks: t.perks,
        highlighted: t.highlighted,
      })),
      // callouts: profile.callouts.map((c) => ({
      //   id: c._id,
      //   type: c.type,
      //   price: c.price / 100,
      //   duration: c.duration,
      //   description: c.description,
      //   currency: c.currency,
      //   featured: c.featured,
      // })),
      // spoilItems: profile.spoilItems.map((si) => ({
      //   id: si._id,
      //   title: si.title,
      //   description: si.description,
      //   targetAmount: si.targetAmount / 100,
      //   currentAmount: si.currentAmount / 100,
      //   currency: si.currency,
      //   image: si.image,
      //   shareAmount: si.shareAmount / 100,
      // })),
      // leaderboards: {
      //   week: weekLeaderboard.map((entry) => ({
      //     rank: entry.rank,
      //     name: entry.fanName,
      //     handle: entry.fanName,
      //     amount: entry.totalAmount / 100,
      //   })),
      //   month: monthLeaderboard.map((entry) => ({
      //     rank: entry.rank,
      //     name: entry.fanName,
      //     handle: entry.fanName,
      //     amount: entry.totalAmount / 100,
      //   })),
      //   allTime: allTimeLeaderboard.map((entry) => ({
      //     rank: entry.rank,
      //     name: entry.fanName,
      //     handle: entry.fanName,
      //     amount: entry.totalAmount / 100,
      //   })),
      // },
      recentPurchases: profile.recentPurchases.map((p: any) => ({
        id: p._id,
        buyer: p.fanName || "Anonymous",
        item: "Gift",
        amount: p.totalAmount / 100,
      })),
      isOwner: false, // Will be updated client-side
    };

    return creatorData;
  } catch (error) {
    console.error("Loader error:", error);
    throw error;
  }
}

export default function CreatorProfile({ loaderData }: Route.ComponentProps) {
  const creator = loaderData;
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [hasProcessedCheckout, setHasProcessedCheckout] = useState(false);
  
  const { user } = useUser();

  // Check if current user is the creator
  const ownerCheck = useQuery(api.creators.isCreatorOwner, 
    creator._id ? { creatorId: creator._id as any } : "skip"
  );
  const isOwner = ownerCheck?.isOwner || false;

  const handleGiftClick = (gift: any) => {
    setSelectedGift(gift);
    setIsGiftModalOpen(true);
  };

  const closeGiftModal = () => {
    setIsGiftModalOpen(false);
    setSelectedGift(null);
  };

  const handleGiftPurchase = async (data: {
    giftId: string;
    quantity: number;
    fanName: string;
    message: string;
  }) => {
    try {
      // Create checkout session
      const result = await convex.action(api.payments.createCheckoutSession, {
        giftId: data.giftId as any,
        creatorId: creator._id as any,
        quantity: data.quantity,
        fanName: data.fanName,
        message: data.message,
      });

      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      // Handle error (show toast, etc.)
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const sessionId = params.get("session_id");

    if (success === "true" && sessionId && !hasProcessedCheckout) {
      setHasProcessedCheckout(true);
      let reloadAfterConfirm = false;

      // Simple success handling for MVP
      alert("Thanks! Your gift went through.");
      
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
      window.location.reload();
    }
  }, [hasProcessedCheckout]);

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
                <div className="flex flex-wrap gap-3">
                  <ClientOnly fallback={
                    <div className="border border-[#2a2a2a] text-slate-200 px-4 py-2 rounded text-sm bg-[#252525] animate-pulse">
                      Loading...
                    </div>
                  }>
                    <ShareButton />
                  </ClientOnly>
                  
                  {/* Dashboard Access Button for Creator */}
                  <SignedIn>
                    {isOwner && (
                      <Button
                        asChild
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <a href="/creatordashboard">
                          <Settings className="w-4 h-4 mr-2" />
                          Dashboard
                        </a>
                      </Button>
                    )}
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors Section - NOT IN PRD
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#232323] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
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
      */}

      {/* Social Links Section */}
      {creator.socialLinks.length > 0 && (
        <div className="py-6 border-b border-[#2a2a2a]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex flex-wrap gap-3">
              {creator.socialLinks.map((link) => {
                const getPlatformIcon = (platform: string) => {
                  const normalizedPlatform = platform.toLowerCase();
                  switch (normalizedPlatform) {
                    case 'twitter':
                    case 'x':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      );
                    case 'instagram':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.476.209 4.938.396a6.522 6.522 0 0 0-2.357 1.535A6.57 6.57 0 0 0 .396 4.938C.209 5.476.082 6.094.048 7.041.013 7.989 0 8.396 0 12.017s.013 4.028.048 4.976c.034.947.161 1.565.348 2.103a6.57 6.57 0 0 0 1.535 2.357 6.522 6.522 0 0 0 2.357 1.535c.538.187 1.156.314 2.103.348.948.035 1.355.048 4.976.048s4.028-.013 4.976-.048c.947-.034 1.565-.161 2.103-.348a6.522 6.522 0 0 0 2.357-1.535 6.57 6.57 0 0 0 1.535-2.357c.187-.538.314-1.156.348-2.103.035-.948.048-1.355.048-4.976s-.013-4.028-.048-4.976c-.034-.947-.161-1.565-.348-2.103a6.57 6.57 0 0 0-1.535-2.357A6.522 6.522 0 0 0 19.062.396c-.538-.187-1.156-.314-2.103-.348C16.011.013 15.604 0 12.017 0zm0 2.161c3.573 0 3.996.014 5.408.048.947.034 1.562.142 1.927.235.484.188.829.413 1.192.776.363.363.588.708.776 1.192.093.365.201.98.235 1.927.034 1.412.048 1.835.048 5.408s-.014 3.996-.048 5.408c-.034.947-.142 1.562-.235 1.927-.188.484-.413.829-.776 1.192-.363.363-.708.588-1.192.776-.365.093-.98.201-1.927.235-1.412.034-1.835.048-5.408.048s-3.996-.014-5.408-.048c-.947-.034-1.562-.142-1.927-.235-.484-.188-.829-.413-1.192-.776-.363-.363-.588-.708-.776-1.192-.093-.365-.201-.98-.235-1.927-.034-1.412-.048-1.835-.048-5.408s.014-3.996.048-5.408c.034-.947.142-1.562.235-1.927.188-.484.413-.829.776-1.192.363-.363.708-.588 1.192-.776.365-.093.98-.201 1.927-.235 1.412-.034 1.835-.048 5.408-.048zm0 3.666a6.19 6.19 0 1 0 0 12.381 6.19 6.19 0 0 0 0-12.381zm0 10.22a4.029 4.029 0 1 1 0-8.058 4.029 4.029 0 0 1 0 8.058zm7.877-10.477a1.444 1.444 0 1 1-2.888 0 1.444 1.444 0 0 1 2.888 0z"/>
                        </svg>
                      );
                    case 'youtube':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      );
                    case 'tiktok':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      );
                    case 'linkedin':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      );
                    case 'facebook':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      );
                    case 'discord':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0003 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                        </svg>
                      );
                    case 'twitch':
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                        </svg>
                      );
                    default:
                      return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      );
                  }
                };

                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-[#232323] border border-[#2a2a2a] text-slate-200 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors"
                    title={link.platform}
                  >
                    {getPlatformIcon(link.platform)}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stripe Test Zone - NOT IN PRD
      <div className="py-8 border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ClientOnly fallback={<div className="animate-pulse bg-[#232323] h-32 rounded-lg"></div>}>
            <StripeConnectionTest />
            <div className="bg-[#232323] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">🧪 Test Gift Purchase</h3>
              <StripeTestButton creatorHandle={creator.handle} />
            </div>
          </ClientOnly>
        </div>
      </div>
      */}

      {/* Latest Posts - NOT IN PRD
      {creator.posts.length > 0 && (
        <div className="py-12 border-b border-[#2a2a2a]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Latest Posts</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {creator.posts.map((post) => (
                <div
                  key={post.id}
                  className="min-w-[200px] bg-[#232323] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
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
      */}

      {/* Interactive Tabs Section - REPLACED WITH SIMPLE SECTIONS
      <ClientOnly fallback={
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-[#232323] border border-[#2a2a2a] rounded-lg p-6 animate-pulse">
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
      */}

      {/* Stats Section - NOT IN PRD
      <div className="bg-[#232323] border border-[#2a2a2a] rounded-lg p-6 mb-6">
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
      */}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* Recent Activity */}
        <div className="mt-6 bg-[#232323] border border-[#2a2a2a] rounded-lg p-6">
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
              <div 
                key={gift.id} 
                className="bg-[#232323] border border-[#2a2a2a] rounded-lg hover:border-[#333333] transition-colors cursor-pointer"
                onClick={() => handleGiftClick(gift)}
              >
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
              <div key={tier.id} className={`bg-[#232323] border border-[#2a2a2a] rounded-lg hover:border-[#333333] transition-colors cursor-pointer ${tier.highlighted ? 'ring-2 ring-emerald-500' : ''}`}>
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

      {/* Gift Modal */}
      {selectedGift && (
        <GiftModal
          gift={selectedGift}
          creator={{ name: creator.name, handle: creator.handle }}
          isOpen={isGiftModalOpen}
          onClose={closeGiftModal}
          onPurchase={handleGiftPurchase}
        />
      )}
    </div>
  );
}
