import type { Route } from "./+types/creatordashboard";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClientOnly } from "~/components/ClientOnly";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/react-router";
import { isFeatureEnabled, isServiceEnabled } from "../../config";
import { EarningsOverview } from "~/components/EarningsOverview";
import { DashboardSidebar } from "~/components/ui/dashboard-sidebar";
import { SetupChecklist } from "~/components/SetupChecklist";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { 
  User, 
  Gift, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Menu,
  ChevronLeft,
  Star
} from "lucide-react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import { SponsorTierCard } from "~/components/SponsorTierCard";
import { SPONSOR_TIERS } from "~/lib/sponsorTiers";

export default function Dashboard() {
  // Check if auth is enabled
  if (!isFeatureEnabled('auth') || !isServiceEnabled('clerk')) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-slate-400">Please enable authentication to access the creator dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  );
}

function DashboardContent() {
  const { user } = useUser();
  
  // Get creator by Clerk ID - this is the recommended way
  const creator = useQuery(api.creators.getCreatorByClerkId, 
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Load related data if creator exists
  const gifts = useQuery(api.creators.getGiftsByCreator, 
    creator ? { creatorId: creator._id } : "skip"
  );
  const tiers = useQuery(api.creators.getTiersByCreator, 
    creator ? { creatorId: creator._id } : "skip"
  );
  const socialLinks = useQuery(api.creators.getSocialLinksByCreator, 
    creator ? { creatorId: creator._id } : "skip"
  );

  // IMPORTANT: All hooks must be declared before any early returns.
  // UI state hooks
  const [activeTab, setActiveTab] = useState("profile");
  const [showCompletionChecklist, setShowCompletionChecklist] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Convex mutations
  const updateProfile = useMutation(api.creators.updateCreatorProfile);
  const createGift = useMutation(api.creators.createGift);
  const createTier = useMutation(api.creators.createTier);
  const updateTier = useMutation(api.creators.updateTier);
  const deleteTier = useMutation(api.creators.deleteTier);

  // Profile editing state (initialize safely, then hydrate when creator loads)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    tagline: "",
    bio: "",
    avatar: "",
    banner: ""
  });

  useEffect(() => {
    if (creator) {
      setProfileForm({
        name: creator.name || "",
        tagline: creator.tagline || "",
        bio: creator.bio || "",
        avatar: creator.avatar || "",
        banner: creator.banner || "",
      });
    }
  }, [creator]);

  // Gift creation state
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [giftForm, setGiftForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "USD",
    media: "",
    type: "image" as "clip" | "image" | "item"
  });

  // Tier creation/editing state
  const [isCreatingTier, setIsCreatingTier] = useState(false);
  const [editingTierId, setEditingTierId] = useState<Id<"tiers"> | null>(null);
  const [tierForm, setTierForm] = useState({
    name: "",
    price: "",
    currency: "USD",
    description: "",
    perks: [""]
  });

  // Debug logging
  console.log("Dashboard debug:", {
    user: user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : null,
    creator,
    gifts: gifts?.length || 0,
    tiers: tiers?.length || 0,
    socialLinks: socialLinks?.length || 0,
  });


  // Handle loading state
  if (creator === undefined || gifts === undefined || tiers === undefined || socialLinks === undefined) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
          <p className="text-slate-500 text-sm mt-2">
            User: {user ? user.id : "Not authenticated"}
          </p>
        </div>
      </div>
    );
  }

  // Handle no creator profile
  if (!creator) {

    // No existing profile found, redirect to onboarding
    if (typeof window !== 'undefined') {
      window.location.href = '/onboard';
      return null;
    }
    
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Setting up your profile...</h1>
          <p className="text-slate-400 mb-6">
            Redirecting to onboarding to create your creator profile.
          </p>
        </div>
      </div>
    );
  }

  // Calculate completion status
  const completionStatus = {
    profileSetup: !!(creator?.name && creator?.handle),
    firstGift: (gifts || []).some((g: any) => g.active),
    socialLinks: (socialLinks || []).length > 0,
    supportTiers: (tiers || []).some((t: any) => t.active),
  };

  // Data is now loaded individually above

  const handleProfileUpdate = async () => {
    if (!profileForm.name) {
      toast.error("Please enter a name");
      return;
    }

    try {
      await updateProfile({
        name: profileForm.name,
        tagline: profileForm.tagline || undefined,
        bio: profileForm.bio || undefined,
        avatar: profileForm.avatar || undefined,
        banner: profileForm.banner || undefined,
      });
      toast.success("Profile updated successfully!");
    setIsEditingProfile(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handleGiftCreate = async () => {
    if (!giftForm.title || !giftForm.description || !giftForm.price || !giftForm.media) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!creator) {
      toast.error("Creator profile not found");
      return;
    }

    try {
      const priceInCents = Math.round(parseFloat(giftForm.price) * 100);
      
      await createGift({
        creatorId: creator._id,
        title: giftForm.title,
        description: giftForm.description,
        price: priceInCents,
        currency: giftForm.currency,
        media: giftForm.media,
        type: giftForm.type,
      });
      
      toast.success("Gift created successfully!");
      setIsCreatingGift(false);
      setGiftForm({
        title: "",
        description: "",
        price: "",
        currency: "USD",
        media: "",
        type: "image"
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create gift");
    }
  };

  const handleTierSave = async () => {
    if (!tierForm.name || !tierForm.price || tierForm.perks.some(p => !p.trim())) {
      toast.error("Please fill in all required fields and perks");
      return;
    }

    try {
      const priceInCents = Math.round(parseFloat(tierForm.price) * 100);
      
      if (editingTierId) {
        // Update existing tier
        await updateTier({
          tierId: editingTierId,
          name: tierForm.name,
          price: priceInCents,
          currency: tierForm.currency,
          perks: tierForm.perks.filter(p => p.trim()),
          description: tierForm.description || undefined,
        });
        toast.success("Tier updated successfully!");
        setEditingTierId(null);
      } else {
        // Create new tier
        await createTier({
          name: tierForm.name,
          price: priceInCents,
          currency: tierForm.currency,
          perks: tierForm.perks.filter(p => p.trim()),
          description: tierForm.description || undefined,
        });
        toast.success("Tier created successfully!");
      }
    
    setIsCreatingTier(false);
      setTierForm({
        name: "",
        price: "",
        currency: "USD",
        description: "",
        perks: [""]
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tier");
    }
  };

  const handleTierEdit = (tier: typeof tiers[0]) => {
    setEditingTierId(tier._id);
    setTierForm({
      name: tier.name,
      price: (tier.price / 100).toFixed(2),
      currency: tier.currency,
      description: tier.description || "",
      perks: tier.perks.length > 0 ? tier.perks : [""]
    });
    setIsCreatingTier(true);
  };

  const handleTierDelete = async (tierId: Id<"tiers">) => {
    // Using browser confirm for simplicity - could be replaced with a custom modal
    const confirmed = window.confirm("Are you sure you want to delete this tier?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTier({ tierId });
      toast.success("Tier deleted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tier");
    }
  };

  const handleTierCancel = () => {
    setIsCreatingTier(false);
    setEditingTierId(null);
    setTierForm({
      name: "",
      price: "",
      currency: "USD",
      description: "",
      perks: [""]
    });
  };

  const addPerk = () => {
    setTierForm(prev => ({
      ...prev,
      perks: [...prev.perks, ""]
    }));
  };

  const updatePerk = (index: number, value: string) => {
    setTierForm(prev => ({
      ...prev,
      perks: prev.perks.map((perk, i) => i === index ? value : perk)
    }));
  };

  const removePerk = (index: number) => {
    setTierForm(prev => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* LEFT — Fixed Sidebar with smooth animation */}
      <aside className={`hidden lg:fixed lg:block inset-y-0 left-0 w-80 bg-[#0f0f0f] border-r border-[#2a2a2a] transition-all duration-300 ease-out z-40 ${
        sidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} creator={{ ...creator, active: creator.active ?? true }} />
        </div>
      </aside>

      {/* Mobile sidebar overlay - appears only on mobile when open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar - slides in from left on small screens */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-[#0f0f0f] border-r border-[#2a2a2a] transition-all duration-300 ease-out z-40 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto">
          <DashboardSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} creator={{ ...creator, active: creator.active ?? true }} />
        </div>
      </aside>

      {/* RIGHT — Header + Main, offset by sidebar width on desktop only */}
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-out ${
        sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
      }`}>
        
        {/* Floating toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 w-8 h-8 bg-[#2a2a2a] hover:bg-[#333] rounded border border-[#404040] transition-colors text-slate-400 hover:text-white flex items-center justify-center lg:hidden"
          aria-label="Toggle sidebar"
        >
          <div className="flex flex-col gap-[2px]">
            <div className={`w-3 h-[2px] bg-current transition-transform duration-200 ${!sidebarOpen ? 'rotate-0' : 'rotate-45 translate-y-[4px]'}`}></div>
            <div className={`w-3 h-[2px] bg-current transition-opacity duration-200 ${!sidebarOpen ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`w-3 h-[2px] bg-current transition-transform duration-200 ${!sidebarOpen ? 'rotate-0' : '-rotate-45 -translate-y-[4px]'}`}></div>
          </div>
        </button>

        {/* Main Content with straight edges */}
        <main className="flex-1 bg-[#1a1a1a] p-4">
          <div className="h-[calc(100vh-2rem)] bg-[#232323] rounded-2xl px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
            
            {/* Completion Checklist */}
        {showCompletionChecklist && (
          <SetupChecklist 
            completionStatus={completionStatus} 
            onClose={() => setShowCompletionChecklist(false)} 
            onCompleteSetup={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/onboard';
              }
            }}
            onNavigateTab={(tab, section) => {
              setActiveTab(tab);
              setShowCompletionChecklist(false);
              // Scroll to section if provided
              if (section) {
                setTimeout(() => {
                  const element = document.getElementById(section);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          />
        )}

            {/* Tab Content */}
            {activeTab === "profile" && (
              <>
                {/* Profile Settings Card */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 mb-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                      <p className="text-sm text-slate-400">Manage your public profile information</p>
                    </div>
                <Button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  variant={isEditingProfile ? "destructive" : "default"}
                  className={isEditingProfile ? "bg-red-600 hover:bg-red-700" : "bg-[#2FD4BE] hover:bg-[#2FD4BE]/80"}
                >
                  {isEditingProfile ? (
                    <><X className="w-4 h-4 mr-2" /> Cancel</>
                  ) : (
                    <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>
                  )}
                </Button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-6">
                  {/* Banner Upload */}
                  <div>
                    <Label className="text-white font-medium">Banner Image</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-24 w-48 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg overflow-hidden relative">
                        <img 
                          src={profileForm.banner || "/kaizen.png"} 
                          alt="Banner preview"
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          value={profileForm.banner}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, banner: e.target.value }))}
                          placeholder="Banner image URL"
                          className="bg-[#2a2a2a] border-[#333] text-white"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // For demo, create a blob URL (in production, upload to storage)
                                const url = URL.createObjectURL(file);
                                setProfileForm(prev => ({ ...prev, banner: url }));
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-[#333] text-slate-400 hover:text-white"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Banner
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <Label className="text-white font-medium">Profile Picture</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full overflow-hidden">
                        <img 
                          src={profileForm.avatar || "/kaizen.png"} 
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          value={profileForm.avatar}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                          placeholder="Avatar image URL"
                          className="bg-[#2a2a2a] border-[#333] text-white"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // For demo, create a blob URL (in production, upload to storage)
                                const url = URL.createObjectURL(file);
                                setProfileForm(prev => ({ ...prev, avatar: url }));
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-[#333] text-slate-400 hover:text-white"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Avatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white font-medium">Display Name</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your display name"
                        className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium">Tagline</Label>
                      <Input
                        value={profileForm.tagline}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="A short description about you"
                        className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white font-medium">Bio</Label>
                    <Textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell your supporters about yourself..."
                      className="mt-2 bg-[#2a2a2a] border-[#333] text-white resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleProfileUpdate}
                      className="bg-[#2FD4BE] hover:bg-[#2FD4BE]/80"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditingProfile(false)}
                      variant="outline"
                      className="border-[#333] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Profile Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-400 text-sm">Display Name</Label>
                      <p className="text-white font-medium">{creator.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Handle</Label>
                      <p className="text-white font-medium">@{creator.handle}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Tagline</Label>
                      <p className="text-white">{creator.tagline || "No tagline set"}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Status</Label>
                      <Badge variant="secondary" className="bg-[#2FD4BE]/10 text-[#2FD4BE]">
                        {creator.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {creator.bio && (
                    <div>
                      <Label className="text-slate-400 text-sm">Bio</Label>
                      <p className="text-white">{creator.bio}</p>
                    </div>
                  )}

                  {/* Social Links Section */}
                  <div className="mt-6" id="social">
                    <Label className="text-slate-400 text-sm">Social Links</Label>
                    <SocialLinksManager creatorHandle={creator.handle} creatorId={creator._id} links={socialLinks || []} />
                  </div>
                    </div>
                  )}
                </Card>
              </>
            )}

            {activeTab === "content" && (
              <div className="space-y-6">
                {/* Gifts Section */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Gifts</h2>
                      <p className="text-sm text-slate-400">Manage your gift offerings</p>
                    </div>
                    <Button 
                      onClick={() => setIsCreatingGift(true)}
                      className="bg-[#2FD4BE] hover:bg-[#2FD4BE]/80"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Gift
                    </Button>
                  </div>

                  {gifts && gifts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gifts.map((gift) => (
                        <div key={gift._id} className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:border-[#2FD4BE]/50 transition-colors">
                          <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg mb-3 overflow-hidden">
                            <img 
                              src={gift.media || "/kaizen.png"} 
                              alt={gift.title}
                              className="w-full h-full object-cover opacity-80"
                            />
                          </div>
                          <h3 className="text-white font-medium mb-1">{gift.title}</h3>
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">{gift.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[#2FD4BE] font-semibold">
                              ${(gift.price / 100).toFixed(2)} {gift.currency}
                            </span>
                            <Badge 
                              variant={gift.active ? "default" : "secondary"}
                              className={gift.active ? "bg-emerald-600" : "bg-slate-600"}
                            >
                              {gift.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Gift className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No gifts yet</h3>
                      <p className="text-slate-400 mb-6">Create your first gift to start earning</p>
                    </div>
                  )}
                </Card>

                {/* Tiers Section */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 shadow-xl" id="tiers">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Subscription Tiers</h2>
                      <p className="text-sm text-slate-400">Manage your subscription tiers</p>
                    </div>
                    <Button 
                      onClick={() => setIsCreatingTier(true)}
                      className="bg-[#2FD4BE] hover:bg-[#2FD4BE]/80"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tier
                    </Button>
                  </div>

                  {tiers && tiers.length > 0 ? (
                    <div className="space-y-4">
                      {/* Creator Tiers */}
                      {tiers.map((tier) => (
                        <div key={tier._id} className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:border-[#2FD4BE]/50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-white font-medium">{tier.name}</h3>
                              <p className="text-slate-400 text-sm">{tier.description || "No description"}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[#2FD4BE] font-semibold text-lg">
                                ${(tier.price / 100).toFixed(2)} {tier.currency}/month
                              </span>
                              {tier.highlighted && (
                                <Badge className="bg-yellow-600 text-xs ml-2">Featured</Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 mb-3">
                            {tier.perks.map((perk, index) => (
                              <div key={index} className="flex items-center text-slate-300 text-sm">
                                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                                {perk}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={tier.active ? "default" : "secondary"}
                              className={tier.active ? "bg-emerald-600" : "bg-slate-600"}
                            >
                              {tier.active ? "Active" : "Inactive"}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTierEdit(tier)}
                                className="border-[#333] text-slate-400 hover:text-white"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTierDelete(tier._id)}
                                className="border-[#333] text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Sponsor Tiers Section */}
                      <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">Featured Partners</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {SPONSOR_TIERS.map((sponsor) => (
                            <SponsorTierCard key={sponsor.id} tier={sponsor} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-12">
                        <Star className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No subscription tiers yet</h3>
                        <p className="text-slate-400 mb-6">Create your first subscription tier</p>
                      </div>

                      {/* Show Sponsor Tiers when no creator tiers exist */}
                      <div className="border-t border-[#2a2a2a] pt-8">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">Featured Partners</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {SPONSOR_TIERS.map((sponsor) => (
                            <SponsorTierCard key={sponsor.id} tier={sponsor} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "revenue" && (
              <MonthlyEarnings creatorId={creator._id} />
            )}
                </div>
        </main>

      </div>

      {/* Gift Creation Modal */}
      {isCreatingGift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Gift</h3>
              <Button
                onClick={() => setIsCreatingGift(false)}
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Gift Type */}
              <div>
                <Label className="text-white font-medium">Gift Type</Label>
                <Select value={giftForm.type} onValueChange={(value: "clip" | "image" | "item") => 
                  setGiftForm(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger className="mt-2 bg-[#2a2a2a] border-[#333] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1f1f1f] border-[#333]">
                    <SelectItem value="image" className="text-white hover:bg-[#333]">Image/Photo</SelectItem>
                    <SelectItem value="clip" className="text-white hover:bg-[#333]">Video Clip</SelectItem>
                    <SelectItem value="item" className="text-white hover:bg-[#333]">Physical Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Gift Title *</Label>
                  <Input
                    value={giftForm.title}
                    onChange={(e) => setGiftForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Buy me a coffee"
                    className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Price *</Label>
                  <div className="flex mt-2">
                    <Select value={giftForm.currency} onValueChange={(value) => 
                      setGiftForm(prev => ({ ...prev, currency: value }))
                    }>
                      <SelectTrigger className="w-20 bg-[#2a2a2a] border-[#333] text-white border-r-0 rounded-r-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f1f1f] border-[#333]">
                        <SelectItem value="USD" className="text-white hover:bg-[#333]">USD</SelectItem>
                        <SelectItem value="GBP" className="text-white hover:bg-[#333]">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={giftForm.price}
                      onChange={(e) => setGiftForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="bg-[#2a2a2a] border-[#333] text-white rounded-l-none border-l-0"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-white font-medium">Description *</Label>
                <Textarea
                  value={giftForm.description}
                  onChange={(e) => setGiftForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what fans will get..."
                  className="mt-2 bg-[#2a2a2a] border-[#333] text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Media */}
              <div>
                <Label className="text-white font-medium">Media URL *</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-24 h-16 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg overflow-hidden">
                    <img 
                      src={giftForm.media || "/kaizen.png"} 
                      alt="Media preview"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={giftForm.media}
                      onChange={(e) => setGiftForm(prev => ({ ...prev, media: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="bg-[#2a2a2a] border-[#333] text-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {giftForm.type === "image" ? "Image URL" : giftForm.type === "clip" ? "Video URL" : "Item image URL"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGiftCreate}
                  className="bg-[#2FD4BE] hover:bg-[#2FD4BE]/80"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Gift
                </Button>
                <Button
                  onClick={() => setIsCreatingGift(false)}
                  variant="outline"
                  className="border-[#333] text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tier Creation Modal */}
      {isCreatingTier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingTierId ? "Edit Tier" : "Create New Tier"}
              </h3>
              <Button
                onClick={handleTierCancel}
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Tier Name and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Tier Name *</Label>
                  <Input
                    value={tierForm.name}
                    onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Bronze, Silver, Gold"
                    className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Monthly Price *</Label>
                  <div className="flex mt-2">
                    <Select value={tierForm.currency} onValueChange={(value) => 
                      setTierForm(prev => ({ ...prev, currency: value }))
                    }>
                      <SelectTrigger className="w-20 bg-[#2a2a2a] border-[#333] text-white border-r-0 rounded-r-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f1f1f] border-[#333]">
                        <SelectItem value="USD" className="text-white hover:bg-[#333]">USD</SelectItem>
                        <SelectItem value="GBP" className="text-white hover:bg-[#333]">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={tierForm.price}
                      onChange={(e) => setTierForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="bg-[#2a2a2a] border-[#333] text-white rounded-l-none border-l-0"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-white font-medium">Description</Label>
                <Textarea
                  value={tierForm.description}
                  onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this tier..."
                  className="mt-2 bg-[#2a2a2a] border-[#333] text-white resize-none"
                  rows={2}
                />
              </div>

              {/* Perks */}
              <div>
                <Label className="text-white font-medium">Perks *</Label>
                <div className="mt-2 space-y-3">
                  {tierForm.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={perk}
                        onChange={(e) => updatePerk(index, e.target.value)}
                        placeholder="Enter a perk for this tier"
                        className="bg-[#2a2a2a] border-[#333] text-white"
                      />
                      <Button
                        onClick={() => removePerk(index)}
                        size="sm"
                        variant="outline"
                        className="border-[#333] text-slate-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addPerk}
                    size="sm"
                    variant="outline"
                    className="border-[#333] text-slate-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Perk
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTierSave}
                  className="bg-[#2FD4BE] hover:bg-[#2FD4BE]/80"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTierId ? "Update Tier" : "Create Tier"}
                </Button>
                <Button
                  onClick={handleTierCancel}
                  variant="outline"
                  className="border-[#333] text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper function to validate social media URLs
function validateSocialUrl(platform: string, url: string): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: "URL is required" };
  }

  // Must be a valid URL
  try {
    new URL(url);
  } catch {
    return { valid: false, error: "Please enter a valid URL" };
  }

  // Platform-specific validation
  const lowercasePlatform = platform.toLowerCase();
  const lowercaseUrl = url.toLowerCase();

  if (lowercasePlatform === "instagram" && !lowercaseUrl.includes("instagram.com")) {
    return { valid: false, error: "Please enter an Instagram URL" };
  }
  if (lowercasePlatform === "twitter" && !lowercaseUrl.includes("twitter.com") && !lowercaseUrl.includes("x.com")) {
    return { valid: false, error: "Please enter a Twitter/X URL" };
  }
  if (lowercasePlatform === "youtube" && !lowercaseUrl.includes("youtube.com") && !lowercaseUrl.includes("youtu.be")) {
    return { valid: false, error: "Please enter a YouTube URL" };
  }
  if (lowercasePlatform === "tiktok" && !lowercaseUrl.includes("tiktok.com")) {
    return { valid: false, error: "Please enter a TikTok URL" };
  }

  return { valid: true };
}

// Build a full URL from a handle or accept a full URL as-is
function normalizeSocialInput(platform: string, value: string): string {
  const input = (value || "").trim();
  if (!input) return input;
  // If it's already a URL, return as-is
  if (input.startsWith("http://") || input.startsWith("https://")) return input;

  const handle = input.replace(/^@/, "").trim();
  const p = platform.toLowerCase();
  switch (p) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "twitter":
    case "x":
      return `https://twitter.com/${handle}`;
    case "youtube":
      // YouTube channels often use @handle
      return `https://youtube.com/@${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "website":
      // Treat handle as domain if no scheme
      return `https://${handle}`;
    default:
      return handle;
  }
}

function SocialLinksManager({ creatorId, links }: { creatorHandle: string; creatorId: Id<"creators">; links: Array<{ _id: Id<"socialLinks">; platform: string; url: string; position: number }> }) {
  const [platform, setPlatform] = useState("instagram");
  const [url, setUrl] = useState("");
  
  const createSocialLink = useMutation(api.creators.createSocialLink);
  const deleteSocialLink = useMutation(api.creators.deleteSocialLink);

  const addLink = async () => {
    if (!url.trim()) {
      toast.error("Please enter a handle or URL");
      return;
    }

    // Normalize input to a full URL when a handle is provided
    const finalUrl = normalizeSocialInput(platform, url);

    // Validate final URL
    const validation = validateSocialUrl(platform, finalUrl);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid URL");
      return;
    }

    try {
      await createSocialLink({ creatorId, platform, url: finalUrl });
      toast.success("Social link added successfully!");
      setUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add link");
    }
  };

  const removeLink = async (id: Id<"socialLinks">) => {
    try {
      await deleteSocialLink({ socialLinkId: id });
      toast.success("Social link removed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove link");
    }
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2 mb-3">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-[#2a2a2a] border border-[#333] text-white rounded-lg px-3 py-2">
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="website">Website</option>
        </select>
        <Input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
          placeholder="@handle or https://..." 
          className="bg-[#2a2a2a] border-[#333] text-white flex-1" 
        />
        <Button onClick={addLink} className="bg-[#2FD4BE] hover:bg-[#2FD4BE]/80">Add</Button>
      </div>
      {links.length > 0 ? (
        <div className="space-y-2">
          {links.map((l) => (
            <div key={l._id} className="flex items-center justify-between bg-[#1f1f1f] p-2 rounded">
              <div className="text-slate-300 text-sm">{l.platform} — <a className="text-[#2FD4BE] hover:underline" href={l.url} target="_blank" rel="noreferrer">{l.url}</a></div>
              <Button size="sm" variant="outline" className="border-[#333] text-slate-400 hover:text-red-400" onClick={() => removeLink(l._id)}>Remove</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-sm">No links yet</div>
      )}
    </div>
  );
}

/**
 * Monthly Earnings Component
 */
function MonthlyEarnings({ creatorId }: { creatorId: string }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const monthlyEarnings = useQuery(
    api.creators.getMonthlyEarnings,
    creatorId ? { creatorId: creatorId as any, year: selectedYear, month: selectedMonth } : "skip"
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (monthlyEarnings === undefined) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Monthly Earnings</h3>
        <div className="flex gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32 bg-[#1f1f1f] border-[#333] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f1f1f] border-[#333]">
              {monthNames.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()} className="text-white hover:bg-[#333]">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24 bg-[#1f1f1f] border-[#333] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1f1f1f] border-[#333]">
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()} className="text-white hover:bg-[#333]">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {monthlyEarnings ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1f1f1f] p-4 rounded-xl">
              <div className="text-slate-400 text-sm mb-1">Total Earnings</div>
              <div className="text-white text-2xl font-bold">
                {formatCurrency(monthlyEarnings.totalEarnings, monthlyEarnings.currency)}
              </div>
            </div>
            <div className="bg-[#1f1f1f] p-4 rounded-xl">
              <div className="text-slate-400 text-sm mb-1">Platform Fee (5%)</div>
              <div className="text-red-400 text-2xl font-bold">
                -{formatCurrency(monthlyEarnings.platformFee, monthlyEarnings.currency)}
              </div>
            </div>
            <div className="bg-[#1f1f1f] p-4 rounded-xl border-2 border-emerald-600">
              <div className="text-emerald-400 text-sm mb-1">Net Earnings</div>
              <div className="text-emerald-400 text-2xl font-bold">
                {formatCurrency(monthlyEarnings.netEarnings, monthlyEarnings.currency)}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1f1f1f] p-4 rounded-xl">
              <h4 className="text-white font-medium mb-3">Gift Sales</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenue</span>
                  <span className="text-white font-medium">
                    {formatCurrency(monthlyEarnings.giftEarnings, monthlyEarnings.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Count</span>
                  <span className="text-white font-medium">{monthlyEarnings.giftCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1f1f1f] p-4 rounded-xl">
              <h4 className="text-white font-medium mb-3">Subscriptions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenue</span>
                  <span className="text-white font-medium">
                    {formatCurrency(monthlyEarnings.subscriptionEarnings, monthlyEarnings.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active</span>
                  <span className="text-white font-medium">{monthlyEarnings.subscriptionCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-xl">
            <p className="text-yellow-200 text-sm">
              💡 <strong>Note:</strong> Payouts are processed manually. Contact support for payout requests.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400">No earnings data for {monthNames[selectedMonth - 1]} {selectedYear}</p>
          <p className="text-slate-500 text-sm">Start selling gifts and subscriptions to see your earnings here</p>
        </div>
      )}
    </Card>
  );
}