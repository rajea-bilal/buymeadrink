import { Card } from "~/components/ui/card";
import { 
  TrendingUp, 
  Gift, 
  Users, 
  DollarSign, 
  Eye,
  Heart,
  MessageSquare,
  Calendar
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalEarnings: number;
    monthlyEarnings: number;
    giftCount: number;
    subscriptionCount: number;
    totalViews?: number;
    totalLikes?: number;
    totalComments?: number;
    joinDate?: string;
  };
  className?: string;
}

export function DashboardStats({ stats, className = "" }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statCards = [
    {
      title: "Total Earnings",
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/20",
      borderColor: "border-emerald-600/30",
      change: "+12.5%",
      changeColor: "text-emerald-400"
    },
    {
      title: "This Month",
      value: formatCurrency(stats.monthlyEarnings),
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-600/30",
      change: "+8.2%",
      changeColor: "text-blue-400"
    },
    {
      title: "Gifts Sold",
      value: stats.giftCount.toString(),
      icon: Gift,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
      borderColor: "border-purple-600/30",
      change: "+15.3%",
      changeColor: "text-purple-400"
    },
    {
      title: "Supporters",
      value: stats.subscriptionCount.toString(),
      icon: Users,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
      borderColor: "border-orange-600/30",
      change: "+5.7%",
      changeColor: "text-orange-400"
    }
  ];

  const additionalStats = [
    {
      title: "Total Views",
      value: stats.totalViews ? formatNumber(stats.totalViews) : "0",
      icon: Eye,
      color: "text-cyan-400"
    },
    {
      title: "Total Likes",
      value: stats.totalLikes ? formatNumber(stats.totalLikes) : "0",
      icon: Heart,
      color: "text-red-400"
    },
    {
      title: "Comments",
      value: stats.totalComments ? formatNumber(stats.totalComments) : "0",
      icon: MessageSquare,
      color: "text-yellow-400"
    },
    {
      title: "Joined",
      value: stats.joinDate ? formatDate(stats.joinDate) : "Recently",
      icon: Calendar,
      color: "text-slate-400"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index}
              className={`bg-[#232323] border-[#2a2a2a] hover:border-emerald-600/30 transition-colors ${stat.borderColor}`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`text-xs font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {stat.title}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <Card className="bg-[#232323] border-[#2a2a2a]">
        <div className="p-6">
          <h3 className="text-white font-semibold mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {additionalStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1f1f1f] mb-2`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`font-semibold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {stat.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick Insights */}
      <Card className="bg-[#232323] border-[#2a2a2a]">
        <div className="p-6">
          <h3 className="text-white font-semibold mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
              <span className="text-slate-300">Average gift value</span>
              <span className="text-emerald-400 font-medium">
                {stats.giftCount > 0 ? formatCurrency(stats.totalEarnings / stats.giftCount) : "$0"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
              <span className="text-slate-300">Revenue per supporter</span>
              <span className="text-blue-400 font-medium">
                {stats.subscriptionCount > 0 ? formatCurrency(stats.totalEarnings / stats.subscriptionCount) : "$0"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
              <span className="text-slate-300">Platform fee (5%)</span>
              <span className="text-red-400 font-medium">
                -{formatCurrency(stats.totalEarnings * 0.05)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}