"use client";
import { useState } from "react";
import { ChevronDown, Gift, Users, Mic, Star, Target } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { GiftModal } from "~/components/GiftModal";

interface ProfileTabsProps {
  creator: {
    handle: string;
    _id?: string;
    gifts: Array<{
      id: string;
      title: string;
      price: number;
      description: string;
      media: string;
      type: string;
      currency: string;
    }>;
    tiers: Array<{
      id: string;
      name: string;
      price: number;
      perks: string[];
      highlighted?: boolean;
    }>;
    callouts: Array<{
      id: string;
      type: string;
      price: number;
      duration: string;
      description: string;
      featured?: boolean;
    }>;
    spoilItems: Array<{
      id: string;
      title: string;
      description: string;
      targetAmount: number;
      currentAmount: number;
      image: string;
      shareAmount: number;
    }>;
    leaderboards: {
      week: Array<{ rank: number; name: string; amount: number; }>;
      month: Array<{ rank: number; name: string; amount: number; }>;
      allTime: Array<{ rank: number; name: string; amount: number; }>;
    };
  };
}

export function ProfileTabs({ creator }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const handleGiftClick = (gift: any) => {
    setSelectedGift(gift);
    setIsGiftModalOpen(true);
  };

  const closeGiftModal = () => {
    setIsGiftModalOpen(false);
    setSelectedGift(null);
  };

  const tabs = [
    {
      id: "gifts",
      label: "Gifts",
      icon: Gift,
      count: creator.gifts.length,
      color: "text-emerald-400"
    },
    {
      id: "tiers", 
      label: "Support Tiers",
      icon: Star,
      count: creator.tiers.length,
      color: "text-blue-400"
    },
    {
      id: "callouts",
      label: "Callouts", 
      icon: Mic,
      count: creator.callouts.length,
      color: "text-purple-400"
    },
    {
      id: "spoilme",
      label: "Spoil Me",
      icon: Target,
      count: creator.spoilItems.length,
      color: "text-yellow-400"
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: Users,
      count: creator.leaderboards.week.length + creator.leaderboards.month.length + creator.leaderboards.allTime.length,
      color: "text-pink-400"
    }
  ];

  const toggleTab = (tabId: string) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const renderGifts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {creator.gifts.map((gift) => (
        <Card key={gift.id} className="bg-[#252525] border-[#2a2a2a] hover:border-[#333333] transition-colors cursor-pointer">
          <div className="p-4">
            <img
              src={gift.media}
              alt={gift.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 className="text-white font-semibold mb-2">{gift.title}</h4>
            <p className="text-slate-400 text-sm mb-3">{gift.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-[#2a2a2a] text-slate-200">
                {gift.type}
              </Badge>
              <span className="text-emerald-400 font-bold">
                ${gift.price.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderTiers = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {creator.tiers.map((tier) => (
        <Card key={tier.id} className={`bg-[#252525] border-[#2a2a2a] hover:border-[#333333] transition-colors cursor-pointer ${tier.highlighted ? 'ring-2 ring-emerald-500' : ''}`}>
          <div className="p-6">
            {tier.highlighted && (
              <Badge className="mb-3 bg-emerald-600 text-white">Most Popular</Badge>
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
        </Card>
      ))}
    </div>
  );

  const renderCallouts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creator.callouts.map((callout) => (
        <Card key={callout.id} className={`bg-[#252525] border-[#2a2a2a] hover:border-[#333333] transition-colors cursor-pointer ${callout.featured ? 'ring-2 ring-purple-500' : ''}`}>
          <div className="p-6">
            {callout.featured && (
              <Badge className="mb-3 bg-purple-600 text-white">Featured</Badge>
            )}
            <h4 className="text-white font-bold text-lg mb-2 capitalize">{callout.type.replace('_', ' ')}</h4>
            <p className="text-slate-400 text-sm mb-3">{callout.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300 text-sm">Duration: {callout.duration}</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              ${callout.price.toFixed(2)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderSpoilMe = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creator.spoilItems.map((item) => {
        const progress = (item.currentAmount / item.targetAmount) * 100;
        return (
          <Card key={item.id} className="bg-[#252525] border-[#2a2a2a] hover:border-[#333333] transition-colors cursor-pointer">
            <div className="p-6">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-slate-400 text-sm mb-4">{item.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">
                    ${item.currentAmount.toFixed(2)}
                  </span>
                  <span className="text-slate-400">
                    ${item.targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-[#1f1f1f] rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-yellow-400 text-sm mt-2 font-semibold">
                  {progress.toFixed(1)}% funded
                </div>
              </div>
              
              <div className="text-lg font-bold text-yellow-400">
                ${item.shareAmount.toFixed(2)} to contribute
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(['week', 'month', 'allTime'] as const).map((timeframe) => (
        <Card key={timeframe} className="bg-[#252525] border-[#2a2a2a]">
          <div className="p-6">
            <h3 className="text-white font-semibold mb-4 capitalize">
              {timeframe === 'allTime' ? 'All Time' : `This ${timeframe}`} Top Supporters
            </h3>
            <div className="space-y-3">
              {creator.leaderboards[timeframe].slice(0, 5).map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3 p-2 bg-[#1f1f1f] rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 bg-emerald-600 rounded-full text-white font-bold text-xs">
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">{entry.name}</div>
                    <div className="text-emerald-400 font-semibold text-xs">
                      ${entry.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              {creator.leaderboards[timeframe].length === 0 && (
                <div className="text-center text-slate-400 py-4 text-sm">
                  No supporters yet
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "gifts": return renderGifts();
      case "tiers": return renderTiers();
      case "callouts": return renderCallouts();
      case "spoilme": return renderSpoilMe();
      case "leaderboard": return renderLeaderboard();
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Navigation Bar */}
      <div className="bg-[#252525] border border-[#2a2a2a] rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                className={`flex items-center gap-2 transition-all ${
                  isActive 
                    ? 'bg-[#333333] text-white border-[#444444]' 
                    : 'text-slate-300 hover:bg-[#2a2a2a] hover:text-white'
                }`}
                onClick={() => toggleTab(tab.id)}
              >
                <IconComponent className={`w-4 h-4 ${tab.color}`} />
                <span>{tab.label}</span>
                <Badge variant="secondary" className="bg-[#1a1a1a] text-slate-200 text-xs">
                  {tab.count}
                </Badge>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'rotate-180' : ''
                  }`} 
                />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {activeTab && (
        <div className="animate-in fade-in-50 duration-200">
          {renderContent()}
        </div>
      )}
    </div>
  );
}