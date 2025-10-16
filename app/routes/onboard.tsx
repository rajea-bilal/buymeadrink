import type { Route } from "./+types/onboard";
import type { Id } from "../../convex/_generated/dataModel";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/react-router";
import { useNavigate } from "react-router";
import { isFeatureEnabled, isServiceEnabled } from "../../config";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { 
  User, 
  Gift, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Star,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

// Onboarding steps
const STEPS = [
  {
    id: "welcome",
    title: "Welcome to BuyMeADrink!",
    description: "Let's set up your creator profile",
    icon: Star,
    required: false
  },
  {
    id: "profile",
    title: "Profile Setup",
    description: "Tell fans about yourself",
    icon: User,
    required: true
  },
  {
    id: "first-gift",
    title: "Create Your First Gift",
    description: "Set up a gift fans can send you",
    icon: Gift,
    required: true
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Your profile is ready for fans",
    icon: CheckCircle,
    required: false
  }
] as const;

type StepId = typeof STEPS[number]['id'];

interface OnboardingData {
  handle: string;
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  banner: string;
  firstGift: {
    title: string;
    description: string;
    price: string;
    media: string;
  };
}

interface OnboardingLoaderData {
  userId: string;
  hasExistingProfile: boolean;
  onboardingData: OnboardingData;
}

export async function loader({ request }: Route.LoaderArgs): Promise<OnboardingLoaderData> {
  // Get authenticated user
  let userId = "demo-user";
  let hasExistingProfile = false;

  if (isFeatureEnabled('auth') && isServiceEnabled('clerk')) {
    try {
      const { getAuth } = await import("@clerk/react-router/ssr.server");
      const auth = await getAuth({ request, params: {}, context: {} });
      userId = auth.userId || "demo-user";
    } catch (error) {
      console.error("Auth error in loader:", error);
    }
  }
    
  return {
    userId,
    hasExistingProfile,
    onboardingData: {
      handle: "",
      name: "",
      tagline: "",
      bio: "",
      avatar: "",
      banner: "",
      firstGift: {
        title: "",
        description: "",
        price: "",
        media: ""
      }
    }
  };
}

export default function Onboarding({ loaderData }: Route.ComponentProps) {
  // Check if auth is enabled
  if (!isFeatureEnabled('auth') || !isServiceEnabled('clerk')) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-slate-400">Please enable authentication to access onboarding.</p>
        </div>
      </div>
    );
  }

  // Redirect if already has profile
  if (loaderData.hasExistingProfile) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Profile Already Exists</h1>
          <p className="text-slate-400 mb-6">You already have a creator profile set up.</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/creatordashboard">Go to Dashboard</a>
          </Button>
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
        <OnboardingContent loaderData={loaderData} />
      </SignedIn>
    </>
  );
}

function OnboardingContent({ loaderData }: { loaderData: OnboardingLoaderData }) {
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(loaderData.onboardingData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [handleAvailability, setHandleAvailability] = useState<"checking" | "available" | "taken" | "invalid" | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Convex mutations
  const createCreator = useMutation(api.creators.createCreator);
  const createGift = useMutation(api.creators.createGift);
  
  // Convex queries
  const checkHandleAvailabilityQuery = useQuery(api.creators.checkHandleAvailability, 
    onboardingData.handle && onboardingData.handle.length >= 3 ? { handle: onboardingData.handle } : "skip"
  );
  
  console.log("🔧 Mutation hooks initialized:", {
    createCreator: !!createCreator,
    createGift: !!createGift,
    apiCreators: !!api.creators,
    createCreatorExists: !!api.creators.createCreator,
    user: user,
    userId: user?.id,
    userFirstName: user?.firstName,
    userLastName: user?.lastName,
    userEmailAddresses: user?.emailAddresses
  });
  
  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Check handle availability
  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleAvailability(null);
      return;
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_-]+$/;
    if (!handleRegex.test(handle)) {
      setHandleAvailability("invalid");
      return;
    }

    setHandleAvailability("checking");
    
    // The query will automatically run when handle changes due to the useQuery hook above
    // We'll update the state based on the query result
  };

  // Update handle availability based on query result
  React.useEffect(() => {
    if (checkHandleAvailabilityQuery !== undefined && onboardingData.handle && onboardingData.handle.length >= 3) {
      const handleRegex = /^[a-zA-Z0-9_-]+$/;
      if (!handleRegex.test(onboardingData.handle)) {
        setHandleAvailability("invalid");
      } else {
        setHandleAvailability(checkHandleAvailabilityQuery.available ? "available" : "taken");
      }
    }
  }, [checkHandleAvailabilityQuery, onboardingData.handle]);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handleComplete = async () => {
    console.log("🚀 handleComplete called");
    console.log("🔧 Current user state:", {
      user: user,
      userId: user?.id,
      isSignedIn: !!user,
      createCreator: !!createCreator,
      createGift: !!createGift
    });
    
    if (!user?.id) {
      console.error("❌ No user ID found", { user, userKeys: user ? Object.keys(user) : 'no user' });
      toast.error("Not authenticated");
      return;
    }

    // Validate required fields
    if (!onboardingData.handle || onboardingData.handle.length < 3) {
      toast.error("Please enter a valid handle (at least 3 characters)");
      return;
    }

    if (!onboardingData.name || onboardingData.name.trim().length === 0) {
      toast.error("Please enter your display name");
      return;
    }

    // Validate name length
    if (onboardingData.name.trim().length < 2 || onboardingData.name.trim().length > 50) {
      toast.error("Display name must be between 2 and 50 characters");
      return;
    }

    // Validate tagline length if provided
    if (onboardingData.tagline && (onboardingData.tagline.length > 100)) {
      toast.error("Tagline must be 100 characters or less");
      return;
    }

    // Validate bio length if provided
    if (onboardingData.bio && (onboardingData.bio.length > 1000)) {
      toast.error("Bio must be 1000 characters or less");
      return;
    }

    if (!onboardingData.firstGift.title || !onboardingData.firstGift.description || !onboardingData.firstGift.price) {
      toast.error("Please complete all gift fields");
      return;
    }

    // Validate gift price
    const giftPrice = parseFloat(onboardingData.firstGift.price);
    if (isNaN(giftPrice) || giftPrice < 0.01 || giftPrice > 999.99) {
      toast.error("Please enter a valid price between $0.01 and $999.99");
      return;
    }

    // Validate gift title length
    if (onboardingData.firstGift.title.length < 3 || onboardingData.firstGift.title.length > 50) {
      toast.error("Gift title must be between 3 and 50 characters");
      return;
    }

    // Validate gift description length
    if (onboardingData.firstGift.description.length < 10 || onboardingData.firstGift.description.length > 500) {
      toast.error("Gift description must be between 10 and 500 characters");
      return;
    }

    if (handleAvailability === "invalid") {
      toast.error("Please enter a valid handle (letters, numbers, hyphens, and underscores only)");
      return;
    }
    
    if (handleAvailability !== "available") {
      toast.error("Please choose an available handle");
      return;
    }

    console.log("✅ User authenticated:", user.id);
    setIsSubmitting(true);
    
    try {
      console.log("📝 Starting onboarding with data:", {
        userId: user.id,
        handle: onboardingData.handle,
        name: onboardingData.name,
        firstGift: onboardingData.firstGift
      });

      console.log("👤 Creating creator profile...");
      console.log("🔧 About to call createCreator mutation:", {
        mutation: !!createCreator,
        args: {
          userId: user.id,
          handle: onboardingData.handle,
          name: onboardingData.name,
          tagline: onboardingData.tagline || undefined,
          bio: onboardingData.bio || undefined,
          avatar: onboardingData.avatar || undefined,
          banner: onboardingData.banner || undefined,
        }
      });
      
      console.log("🔄 Calling createCreator mutation now...");
      
      // Add a timeout to detect if it's hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Mutation timeout after 10 seconds")), 10000);
      });
      
      const creatorId = await Promise.race([
        createCreator({
          handle: onboardingData.handle,
          name: onboardingData.name,
          tagline: onboardingData.tagline || undefined,
          bio: onboardingData.bio || undefined,
          avatar: onboardingData.avatar || undefined,
          banner: onboardingData.banner || undefined,
        }),
        timeoutPromise
      ]);
      console.log("✨ createCreator mutation completed successfully!");
      
      console.log("✅ Creator created with ID:", creatorId);
      
      console.log("🎁 Creating first gift...");
      const giftId = await createGift({
        creatorId: creatorId as Id<"creators">,
        title: onboardingData.firstGift.title,
        description: onboardingData.firstGift.description,
        price: Math.round(parseFloat(onboardingData.firstGift.price || "0") * 100) || 0,
        currency: "USD",
        media: onboardingData.firstGift.media || "/kaizen.png",
        type: "image" as const
      });

      console.log("✅ First gift created with ID:", giftId);
      console.log("🎉 Onboarding completed successfully!");
      
      toast.success("Onboarding complete! Redirecting to dashboard...");
      
      console.log("⏰ Setting up redirect timeout...");
      setTimeout(() => {
        console.log("🔄 Redirecting to dashboard now...");
        navigate("/creatordashboard");
      }, 1500);
      
    } catch (error) {
      console.error("❌ Onboarding error:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("Handle is already taken")) {
          toast.error("This handle is already taken. Please choose a different one.");
          setCurrentStep("profile");
        } else if (error.message.includes("Not authenticated")) {
          toast.error("Please sign in to continue");
        } else if (error.message.includes("Handle can only contain")) {
          toast.error("Handle can only contain letters, numbers, hyphens, and underscores");
          setCurrentStep("profile");
        } else if (error.message.includes("Handle must be between")) {
          toast.error("Handle must be between 3 and 30 characters");
          setCurrentStep("profile");
        } else if (error.message.includes("Name must be between")) {
          toast.error("Name must be between 2 and 50 characters");
          setCurrentStep("profile");
        } else {
          // For other errors, offer retry
          if (retryCount < 2) {
            toast.error(`${error.message}. Retrying... (${retryCount + 1}/2)`);
            setRetryCount(prev => prev + 1);
            // Retry after a short delay
            setTimeout(() => {
              handleComplete();
            }, 2000);
            return;
          } else {
            toast.error(error.message);
          }
        }
      } else {
        toast.error("Failed to complete onboarding. Please try again.");
      }
      
      setIsSubmitting(false);
      setRetryCount(0); // Reset retry count
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };


  const canProceed = () => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "profile":
        return onboardingData.handle && 
               onboardingData.handle.length >= 3 &&
               onboardingData.name && 
               onboardingData.name.trim().length >= 2 &&
               handleAvailability === "available";
      case "first-gift":
        return onboardingData.firstGift.title && 
               onboardingData.firstGift.title.length >= 3 &&
               onboardingData.firstGift.description && 
               onboardingData.firstGift.description.length >= 10 &&
               onboardingData.firstGift.price &&
               parseFloat(onboardingData.firstGift.price) >= 0.01;
      case "complete":
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={handleNext} />;
      case "profile":
        return (
          <ProfileStep 
            data={onboardingData}
            setData={setOnboardingData}
            handleAvailability={handleAvailability}
            onCheckHandle={checkHandleAvailability}
          />
        );
      case "first-gift":
        return (
          <FirstGiftStep 
            data={onboardingData}
            setData={setOnboardingData}
          />
        );
      case "complete":
        return <CompleteStep data={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] bg-[#232323]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Creator Onboarding</h1>
              <p className="text-sm text-slate-400">Set up your creator profile in just a few steps</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Step {currentStepIndex + 1} of {STEPS.length}</div>
              <div className="text-lg font-semibold text-white">{STEPS[currentStepIndex].title}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-[#2a2a2a] rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-3">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrent 
                          ? 'bg-emerald-600/20 text-emerald-400 border-2 border-emerald-600' 
                          : 'bg-[#2a2a2a] text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${
                      isCurrent ? 'text-emerald-400 font-medium' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-[#232323] border-[#2a2a2a] p-8">
          {renderStep()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="border-[#333] text-slate-400 hover:text-white"
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === "complete" ? (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Creating Profile..." : "Complete Setup"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-8">
      <Star className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-white mb-4">Welcome to BuyMeADrink!</h2>
      <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
        You're about to create your creator profile where fans can support you with gifts and subscriptions. 
        This will only take a few minutes!
      </p>
      
      <div className="bg-[#1f1f1f] rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="text-white font-semibold mb-3">What you'll set up:</h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
            Your profile information
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
            Your first gift for fans
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
            Optional support tiers
          </li>
        </ul>
      </div>

      <Button
        onClick={onNext}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3"
      >
        Let's Get Started!
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

function ProfileStep({ 
  data, 
  setData, 
  handleAvailability, 
  onCheckHandle 
}: { 
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  handleAvailability: "checking" | "available" | "taken" | "invalid" | null;
  onCheckHandle: (handle: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Profile Setup</h2>
        <p className="text-slate-400">Tell your fans about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Handle */}
        <div className="md:col-span-2">
          <Label className="text-white font-medium">Creator Handle *</Label>
          <div className="mt-2 flex gap-2">
            <Input
              value={data.handle}
              onChange={(e) => {
                setData({ ...data, handle: e.target.value });
                onCheckHandle(e.target.value);
              }}
              placeholder="your-handle"
              className="bg-[#2a2a2a] border-[#333] text-white"
            />
            {handleAvailability === "checking" && (
              <Badge variant="secondary" className="bg-blue-600/10 text-blue-400">
                Checking...
              </Badge>
            )}
            {handleAvailability === "available" && (
              <Badge variant="secondary" className="bg-emerald-600/10 text-emerald-400">
                Available
              </Badge>
            )}
            {handleAvailability === "taken" && (
              <Badge variant="secondary" className="bg-red-600/10 text-red-400">
                Taken
              </Badge>
            )}
            {handleAvailability === "invalid" && (
              <Badge variant="secondary" className="bg-red-600/10 text-red-400">
                Invalid
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Your profile will be at: /profile/{data.handle || "your-handle"}
          </p>
          {handleAvailability === "invalid" && (
            <p className="text-xs text-red-400 mt-1">
              Handle can only contain letters, numbers, hyphens, and underscores
            </p>
          )}
          {handleAvailability === "taken" && (
            <p className="text-xs text-red-400 mt-1">
              This handle is already taken. Please choose a different one.
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <Label className="text-white font-medium">Display Name *</Label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Your Name"
            className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
          />
        </div>

        {/* Tagline */}
        <div>
          <Label className="text-white font-medium">Tagline</Label>
          <Input
            value={data.tagline}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            placeholder="Short description about you"
            className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
            maxLength={100}
          />
          <p className="text-xs text-slate-400 mt-1">
            {data.tagline.length}/100 characters
          </p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label className="text-white font-medium">Bio</Label>
        <Textarea
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          placeholder="Tell your fans about yourself, your content, or what you do..."
          className="mt-2 bg-[#2a2a2a] border-[#333] text-white resize-none"
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-slate-400 mt-1">
          {data.bio.length}/1000 characters
        </p>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar */}
        <div>
          <Label className="text-white font-medium">Profile Picture</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full overflow-hidden">
              {data.avatar ? (
                <img 
                  src={data.avatar} 
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                value={data.avatar}
                onChange={(e) => setData({ ...data, avatar: e.target.value })}
                placeholder="Image URL"
                className="bg-[#2a2a2a] border-[#333] text-white"
              />
              <Button size="sm" variant="outline" className="border-[#333] text-slate-400 hover:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div>
          <Label className="text-white font-medium">Banner Image</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-16 w-32 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg overflow-hidden">
              {data.banner ? (
                <img 
                  src={data.banner} 
                  alt="Banner preview"
                  className="w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-xs text-center">Banner</div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                value={data.banner}
                onChange={(e) => setData({ ...data, banner: e.target.value })}
                placeholder="Banner URL"
                className="bg-[#2a2a2a] border-[#333] text-white"
              />
              <Button size="sm" variant="outline" className="border-[#333] text-slate-400 hover:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstGiftStep({ 
  data, 
  setData 
}: { 
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Gift className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Create Your First Gift</h2>
        <p className="text-slate-400">Set up a gift that fans can send you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <Label className="text-white font-medium">Gift Title *</Label>
          <Input
            value={data.firstGift.title}
            onChange={(e) => setData({ 
              ...data, 
              firstGift: { ...data.firstGift, title: e.target.value }
            })}
            placeholder="e.g., Buy me a coffee"
            className="mt-2 bg-[#2a2a2a] border-[#333] text-white"
            maxLength={50}
          />
          <p className="text-xs text-slate-400 mt-1">
            {data.firstGift.title.length}/50 characters
          </p>
        </div>

        {/* Price */}
        <div>
          <Label className="text-white font-medium">Price *</Label>
          <div className="mt-2 flex gap-2">
            <DollarSign className="w-4 h-4 text-slate-400 mt-3" />
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max="999.99"
              value={data.firstGift.price}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow positive numbers with max 2 decimal places
                if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                  setData({ 
                    ...data, 
                    firstGift: { ...data.firstGift, price: value }
                  });
                }
              }}
              placeholder="5.00"
              className="bg-[#2a2a2a] border-[#333] text-white"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Minimum $0.01, maximum $999.99
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-white font-medium">Description *</Label>
        <Textarea
          value={data.firstGift.description}
          onChange={(e) => setData({ 
            ...data, 
            firstGift: { ...data.firstGift, description: e.target.value }
          })}
          placeholder="What does this gift mean to you? How will you use it?"
          className="mt-2 bg-[#2a2a2a] border-[#333] text-white resize-none"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-slate-400 mt-1">
          {data.firstGift.description.length}/500 characters
        </p>
      </div>

      {/* Media */}
      <div>
        <Label className="text-white font-medium">Gift Image</Label>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg overflow-hidden">
            {data.firstGift.media ? (
              <img 
                src={data.firstGift.media} 
                alt="Gift preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input
              value={data.firstGift.media}
              onChange={(e) => setData({ 
                ...data, 
                firstGift: { ...data.firstGift, media: e.target.value }
              })}
              placeholder="Image URL"
              className="bg-[#2a2a2a] border-[#333] text-white"
            />
            <Button size="sm" variant="outline" className="border-[#333] text-slate-400 hover:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ data }: { data: OnboardingData }) {
  return (
    <div className="text-center py-8">
      <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-white mb-4">You're All Set!</h2>
      <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
        Your creator profile is ready! Fans can now visit your profile and send you gifts.
      </p>
      
      <div className="bg-[#1f1f1f] rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="text-white font-semibold mb-3">Your Profile:</h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
            Handle: @{data.handle}
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
            Name: {data.name}
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
            First Gift: {data.firstGift.title} (${data.firstGift.price})
          </li>
        </ul>
      </div>

      <div className="text-sm text-slate-400 mb-6">
        Your profile will be available at: <br />
        <span className="text-emerald-400 font-mono">/profile/{data.handle}</span>
      </div>
    </div>
  );
}
