import { isFeatureEnabled, isServiceEnabled } from "../../config";
import Integrations from "~/components/homepage/integrations";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";
import { Suspense, lazy } from 'react';
import { ContentSkeleton, FeatureSkeleton, PricingSkeleton } from '~/components/ui/skeleton';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

// Lazy load components below the fold
const ContentSection = lazy(() => import("~/components/homepage/content"));
const CoreFeaturesSection = lazy(() => import("~/components/homepage/core-features"));
const ConvexComparison = lazy(() => import("~/components/homepage/convex-comparison").then(m => ({ default: m.ConvexComparison })));
const Pricing = lazy(() => import("~/components/homepage/pricing"));
const InhouseTools = lazy(() => import("~/components/homepage/inhouse-tools"));
const FAQ = lazy(() => import("~/components/homepage/faq"));
const Footer = lazy(() => import("~/components/homepage/footer"));

export function meta({}: Route.MetaArgs) {
  const title = "Kaizen - Launch Your SAAS Quickly";
  const description =
    "This powerful starter kit is designed to help you launch your SAAS application quickly and efficiently.";
  const keywords = "Kaizen, SAAS, Launch, Quickly, Efficiently";
  const siteUrl = "https://www.kaizen.codeandcreed.tech/";
  const imageUrl = "/kaizen.svg";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "Kaizen" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "Kaizen" },
    { name: "favicon", content: imageUrl },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const authEnabled = isFeatureEnabled("auth") && isServiceEnabled("clerk");
  const convexEnabled = isFeatureEnabled("convex") && isServiceEnabled("convex");
  const paymentsEnabled = isFeatureEnabled("payments") && isServiceEnabled("polar");

  // 1. Auth: get userId if auth enabled, else null
  let userId: string | null = null;
  if (authEnabled) {
    const { getAuth } = await import("@clerk/react-router/ssr.server");
    ({ userId } = await getAuth(args));
  }

  // 2. Check if authenticated user has a creator profile
  let hasCreatorProfile = false;
  if (convexEnabled && userId) {
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);
    
    try {
      const creator = await convex.query(api.creators.getCreatorByUserId, { userId });
      hasCreatorProfile = !!creator;
      
      // If authenticated but no creator profile, show onboarding button instead of redirecting
      if (!creator) {
        const { redirect } = await import("react-router");
        // Don't redirect - let the UI show a button
      }
    } catch (error) {
      // If error is a redirect, re-throw it
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      console.error("Failed to check creator profile:", error);
    }
  }

  // 3. Fetch subscription status & plans only if Convex enabled
  let subscriptionData: { hasActiveSubscription: boolean } | null = null;
  let plans: any = null;

  if (convexEnabled) {
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

    const promises: Promise<any>[] = [
      userId
        ? convex.query(api.subscriptions.checkUserSubscriptionStatus, {
            userId,
          }).catch((error: unknown) => {
            console.error("Failed to fetch subscription data:", error);
            return null;
          })
        : Promise.resolve(null),
    ];

    // Only fetch plans if payments are enabled
    if (paymentsEnabled) {
      promises.push(convex.action(api.subscriptions.getAvailablePlans, {}));
    } else {
      promises.push(Promise.resolve(null));
    }

    [subscriptionData, plans] = await Promise.all(promises);
  }

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    hasCreatorProfile,
    plans,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Integrations loaderData={loaderData} />
      
      {/* Onboarding Button for users without creator profile */}
      {!loaderData.hasCreatorProfile && loaderData.isSignedIn && (
        <section className="py-10 bg-emerald-950">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Ready to Start Your Creator Journey?
            </h3>
            <p className="text-lg text-emerald-200 mb-6">
              Set up your creator profile and start receiving gifts from fans.
            </p>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link to="/onboard">
                Create Creator Profile
              </Link>
            </Button>
          </div>
        </section>
      )}      
      {/* BuyMeADrink Demo Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Support Your Favorite Creators
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            See how BuyMeADrink makes it easy for fans to support athletes and creators with gifts, subscriptions, and more.
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
            <Link to="/profile/conor">
              View Demo Creator Profile →
            </Link>
          </Button>
        </div>
      </section>
      
      <Suspense fallback={<ContentSkeleton />}>
        <ContentSection />
      </Suspense>
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6"><FeatureSkeleton /><FeatureSkeleton /><FeatureSkeleton /></div>}>
        <CoreFeaturesSection />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <ConvexComparison />
      </Suspense>
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"><PricingSkeleton /><PricingSkeleton /></div>}>
        <Pricing loaderData={loaderData} />
      </Suspense>
      <div className="my-6 flex justify-center">
        <div
          aria-hidden
          className="size-12 rounded-full border bg-background text-muted-foreground shadow-sm grid place-items-center text-2xl font-semibold"
        >
          +
        </div>
      </div>
      <Suspense fallback={<ContentSkeleton />}>
        <InhouseTools />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-muted" />}>
        <Footer />
      </Suspense>
    </>
  );
}
