"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface EarningsOverviewProps {
  creatorId: string;
}

export function EarningsOverview({ creatorId }: EarningsOverviewProps) {
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("paypal");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current month earnings
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const earnings = useQuery(api.creators.getMonthlyEarnings, { 
    creatorId: creatorId as any, 
    year: currentYear, 
    month: currentMonth 
  });
  
  // Mock data for payouts and recent purchases since we simplified the system
  const payouts: any[] = [];
  const recentPurchases: any[] = [];
  
  const requestPayout = async () => {
    // Mock payout request - in real implementation, this would contact support
    console.log("Payout request would be sent to support");
  };

  const handlePayoutRequest = async () => {
    if (!earnings || !payoutAmount || !recipientEmail) return;

    try {
      setIsSubmitting(true);
      await requestPayout();
      
      setShowPayoutForm(false);
      setPayoutAmount("");
      setRecipientEmail("");
      setNotes("");
      alert("Payout request submitted! We'll process it within 24 hours.");
    } catch (error) {
      alert(`Payout request failed: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-600";
      case "processing": return "bg-blue-600";
      case "pending": return "bg-yellow-600";
      case "failed": return "bg-red-600";
      default: return "bg-slate-600";
    }
  };

  if (!earnings) {
    return <div className="animate-pulse bg-[#232323] h-64 rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#232323] border-[#2a2a2a] p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${(earnings.netEarnings / 100).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Available Balance</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#232323] border-[#2a2a2a] p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${(earnings.netEarnings / 100).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Total Earnings</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#232323] border-[#2a2a2a] p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${(earnings.totalEarnings / 100).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Paid Out</div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#232323] border-[#2a2a2a] p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {earnings.giftCount + earnings.subscriptionCount}
              </div>
              <div className="text-sm text-slate-400">Total Purchases</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payout Request */}
      <Card className="bg-[#232323] border-[#2a2a2a] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Request Payout</h3>
          {earnings.netEarnings >= 1000 && (
            <Button
              onClick={() => setShowPayoutForm(!showPayoutForm)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {showPayoutForm ? "Cancel" : "Request Payout"}
            </Button>
          )}
        </div>

        {earnings.netEarnings < 1000 ? (
          <div className="text-slate-400 text-sm">
            Minimum payout amount is $10. Current balance: ${(earnings.netEarnings / 100).toFixed(2)}
          </div>
        ) : showPayoutForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  max={earnings.netEarnings / 100}
                  min="10"
                  step="0.01"
                  className="bg-[#2a2a2a] border-[#333] text-white"
                />
                <div className="text-xs text-slate-400 mt-1">
                  Max: ${(earnings.netEarnings / 100).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-[#333] text-white rounded-lg px-3 py-2"
                >
                  <option value="paypal">PayPal</option>
                  <option value="venmo">Venmo</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                {payoutMethod === "paypal" ? "PayPal Email" : 
                 payoutMethod === "venmo" ? "Venmo Handle" : 
                 "Email for Details"}
              </label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={
                  payoutMethod === "paypal" ? "your@email.com" :
                  payoutMethod === "venmo" ? "@yourhandle" :
                  "contact@email.com"
                }
                className="bg-[#2a2a2a] border-[#333] text-white"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional instructions..."
                className="bg-[#2a2a2a] border-[#333] text-white resize-none"
                rows={2}
              />
            </div>

            <Button
              onClick={handlePayoutRequest}
              disabled={isSubmitting || !payoutAmount || !recipientEmail}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
            >
              {isSubmitting ? "Submitting..." : `Request $${payoutAmount} Payout`}
            </Button>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">
            You can request payouts once you have at least $10 in available balance.
            Current balance: ${(earnings.netEarnings / 100).toFixed(2)}
          </div>
        )}
      </Card>

      {/* Payout History */}
      <Card className="bg-[#232323] border-[#2a2a2a] p-6">
        <h3 className="text-white font-semibold mb-4">Payout History</h3>
        {payouts && payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout: any) => (
              <div key={payout._id} className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(payout.status)}>
                    {payout.status}
                  </Badge>
                  <div>
                    <div className="text-white font-medium">${payout.amount.toFixed(2)}</div>
                    <div className="text-slate-400 text-sm">
                      {payout.method} • {new Date(payout.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {payout.status === "failed" && payout.failedReason && (
                  <div className="text-red-400 text-sm">{payout.failedReason}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">No payouts yet</div>
        )}
      </Card>

      {/* Recent Purchases */}
      <Card className="bg-[#232323] border-[#2a2a2a] p-6">
        <h3 className="text-white font-semibold mb-4">Recent Purchases</h3>
        {recentPurchases && recentPurchases.length > 0 ? (
          <div className="space-y-3">
            {recentPurchases.map((purchase: any) => (
              <div key={purchase._id} className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {purchase.fanName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{purchase.fanName}</div>
                    {purchase.message && (
                      <div className="text-slate-400 text-sm">"{purchase.message}"</div>
                    )}
                    <div className="text-slate-500 text-xs">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold">
                  ${purchase.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">No purchases yet</div>
        )}
      </Card>
    </div>
  );
}