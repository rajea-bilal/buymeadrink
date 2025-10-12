import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with test data for Conor McGregor
 * Run this once in the Convex dashboard or via CLI
 */
export const seedConorProfile = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if Conor already exists
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", "conor"))
      .first();

    if (existing) {
      console.log("Conor profile already exists, skipping seed");
      return null;
    }

    // Create Conor's profile
    const creatorId = await ctx.db.insert("creators", {
      handle: "conor",
      name: "Conor McGregor",
      tagline: "The Notorious • UFC Champion • Entrepreneur",
      bio: "Two-division UFC champion, entrepreneur, and philanthropist. Support my journey!",
      avatar: "/kaizen.png",
      banner: "/kaizen-no-bg.png",
      active: true,
      stripeOnboardingComplete: false,
    });

    // Add sponsors
    const sponsors = [
      { name: "Reebok", logo: "/clerk.svg", url: "https://reebok.com", position: 1 },
      { name: "Beats by Dre", logo: "/polar.svg", url: "https://beatsbydre.com", position: 2 },
      { name: "Burger King", logo: "/plunk.svg", url: "https://burgerking.com", position: 3 },
      { name: "McGregor FAST", logo: "/resend-icon-black.svg", url: "https://mcgregorfast.com", position: 4 },
      { name: "Proper Twelve", logo: "/clerk.svg", url: "https://properwhiskey.com", position: 5 },
      { name: "Monster Energy", logo: "/polar.svg", url: "https://monsterenergy.com", position: 6 },
    ];

    for (const sponsor of sponsors) {
      await ctx.db.insert("sponsors", {
        creatorId,
        ...sponsor,
        active: true,
        clicks: 0,
      });
    }

    // Add social links
    const socialLinks = [
      { platform: "Instagram", url: "https://instagram.com/thenotoriousmma", position: 1 },
      { platform: "Twitter", url: "https://twitter.com/thenotoriousmma", position: 2 },
      { platform: "YouTube", url: "https://youtube.com/@thenotoriousmma", position: 3 },
      { platform: "Facebook", url: "https://facebook.com/thenotoriousmma", position: 4 },
      { platform: "Twitch", url: "https://twitch.tv/thenotoriousmma", position: 5 },
    ];

    for (const link of socialLinks) {
      await ctx.db.insert("socialLinks", {
        creatorId,
        ...link,
      });
    }

    // Add posts
    const posts = [
      { platform: "Instagram", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 2 * 60 * 60 * 1000 },
      { platform: "Twitter", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 5 * 60 * 60 * 1000 },
      { platform: "YouTube", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 24 * 60 * 60 * 1000 },
      { platform: "Instagram", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { platform: "Twitter", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { platform: "YouTube", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
      { platform: "Instagram", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    ];

    for (const post of posts) {
      await ctx.db.insert("posts", {
        creatorId,
        ...post,
      });
    }

    // Add gifts
    const gifts = [
      { title: "The Notorious", price: 700, description: "Iconic quote video", type: "clip" as const },
      { title: "Forged Irish Coffee", price: 500, description: "Custom coffee blend", type: "item" as const },
      { title: "Burger & Chips", price: 1500, description: "Meal on me", type: "item" as const },
      { title: "Fish & Chips", price: 1200, description: "Classic favorite", type: "item" as const },
      { title: "Victory Dance", price: 2000, description: "Celebration clip", type: "clip" as const },
      { title: "Training Montage", price: 2500, description: "Behind the scenes", type: "clip" as const },
      { title: "Walk-in Entrance", price: 3000, description: "Iconic entrance", type: "clip" as const },
      { title: "Post-Fight Interview", price: 1800, description: "Classic moments", type: "clip" as const },
    ];

    for (const gift of gifts) {
      await ctx.db.insert("gifts", {
        creatorId,
        ...gift,
        media: "/kaizen.png",
        currency: "USD",
        active: true,
        allowRecurring: true,
      });
    }

    // Add tiers
    const tiers = [
      { name: "Bronze", price: 800, perks: ["Exclusive updates", "Discord access", "Monthly newsletter"], highlighted: false },
      { name: "Silver", price: 2000, perks: ["All Bronze perks", "Early content access", "Member badge"], highlighted: false },
      { name: "Gold", price: 5000, perks: ["All Silver perks", "Monthly Q&A access", "Exclusive merch discount"], highlighted: false },
      { name: "Platinum", price: 50000, perks: ["All Gold perks", "5-min monthly call", "Platinum WhatsApp group", "Exclusive purchases"], highlighted: true },
    ];

    for (const tier of tiers) {
      await ctx.db.insert("tiers", {
        creatorId,
        ...tier,
        currency: "USD",
        active: true,
      });
    }

    // Add callouts
    const callouts = [
      { type: "video_message", price: 25000, duration: "60 seconds", description: "Personal video shout-out", featured: false },
      { type: "video_call", price: 99900, duration: "9 minutes", description: "One-on-one video call", featured: false },
      { type: "after_win", price: 2000000, duration: "Live", description: "Shout you out after my next win", featured: true },
    ];

    for (const callout of callouts) {
      await ctx.db.insert("callouts", {
        creatorId,
        ...callout,
        currency: "USD",
        active: true,
      });
    }

    // Add Spoil Me items
    const spoilItems = [
      {
        title: "Ducati Panigale V4",
        description: "Help me get my dream bike",
        targetAmount: 3299900,
        currentAmount: 1850000,
        shareAmount: 100000,
      },
      {
        title: "Land Rover Defender 130",
        description: "Ultimate adventure vehicle",
        targetAmount: 8407000,
        currentAmount: 4200000,
        shareAmount: 100000,
      },
      {
        title: "Rolex Daytona",
        description: "Championship watch",
        targetAmount: 4120000,
        currentAmount: 820000,
        shareAmount: 100000,
      },
    ];

    for (const item of spoilItems) {
      await ctx.db.insert("spoilItems", {
        creatorId,
        ...item,
        currency: "GBP",
        image: "/kaizen.png",
        active: true,
        completed: false,
      });
    }

    // Add some test orders for the recent purchases feed
    const recentOrders = [
      { fanName: "@fan123", totalAmount: 700 },
      { fanName: "@superfan", totalAmount: 2000 },
      { fanName: "@supporter", totalAmount: 2000 },
    ];

    // We need a giftId, so get the first gift
    const firstGift = await ctx.db
      .query("gifts")
      .withIndex("by_creator_and_active", (q) =>
        q.eq("creatorId", creatorId).eq("active", true)
      )
      .first();

    if (firstGift) {
      for (const order of recentOrders) {
        await ctx.db.insert("orders", {
          creatorId,
          giftId: firstGift._id,
          ...order,
          quantity: 1,
          unitPrice: order.totalAmount,
          currency: "USD",
          status: "completed",
        });
      }
    }

    console.log("✅ Seeded Conor McGregor profile successfully!");
    return null;
  },
});

/**
 * Clear all BuyMeADrink data (for testing)
 */
/**
 * Add missing data to existing Conor profile
 */
export const addMissingDataToConor = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find existing Conor profile
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", "conor"))
      .first();

    if (!creator) {
      console.log("Conor profile not found");
      return null;
    }

    const creatorId = creator._id;

    // Check if data already exists
    const existingSponsors = await ctx.db
      .query("sponsors")
      .withIndex("by_creator_and_position", (q) => q.eq("creatorId", creatorId))
      .collect();

    if (existingSponsors.length > 0) {
      console.log("Data already exists for Conor, adding remaining data anyway...");
    }

    // Add sponsors
    const sponsors = [
      { name: "Reebok", logo: "/clerk.svg", url: "https://reebok.com", position: 1 },
      { name: "Beats by Dre", logo: "/polar.svg", url: "https://beatsbydre.com", position: 2 },
      { name: "Burger King", logo: "/plunk.svg", url: "https://burgerking.com", position: 3 },
      { name: "McGregor FAST", logo: "/resend-icon-black.svg", url: "https://mcgregorfast.com", position: 4 },
      { name: "Proper Twelve", logo: "/clerk.svg", url: "https://properwhiskey.com", position: 5 },
      { name: "Monster Energy", logo: "/polar.svg", url: "https://monsterenergy.com", position: 6 },
    ];

    for (const sponsor of sponsors) {
      await ctx.db.insert("sponsors", {
        creatorId,
        ...sponsor,
        active: true,
        clicks: 0,
      });
    }

    // Add social links
    const socialLinks = [
      { platform: "Instagram", url: "https://instagram.com/thenotoriousmma", position: 1 },
      { platform: "Twitter", url: "https://twitter.com/thenotoriousmma", position: 2 },
      { platform: "YouTube", url: "https://youtube.com/@thenotoriousmma", position: 3 },
      { platform: "Facebook", url: "https://facebook.com/thenotoriousmma", position: 4 },
      { platform: "Twitch", url: "https://twitch.tv/thenotoriousmma", position: 5 },
    ];

    for (const link of socialLinks) {
      await ctx.db.insert("socialLinks", {
        creatorId,
        ...link,
      });
    }

    // Add posts
    const posts = [
      { platform: "Instagram", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 2 * 60 * 60 * 1000 },
      { platform: "Twitter", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 5 * 60 * 60 * 1000 },
      { platform: "YouTube", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 24 * 60 * 60 * 1000 },
      { platform: "Instagram", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { platform: "Twitter", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { platform: "YouTube", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
      { platform: "Instagram", thumbnail: "/kaizen.png", url: "#", publishedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    ];

    for (const post of posts) {
      await ctx.db.insert("posts", {
        creatorId,
        ...post,
      });
    }

    // Add gifts
    const gifts = [
      { title: "The Notorious", price: 700, description: "Iconic quote video", type: "clip" as const },
      { title: "Forged Irish Coffee", price: 500, description: "Custom coffee blend", type: "item" as const },
      { title: "Burger & Chips", price: 1500, description: "Meal on me", type: "item" as const },
      { title: "Fish & Chips", price: 1200, description: "Classic favorite", type: "item" as const },
      { title: "Victory Dance", price: 2000, description: "Celebration clip", type: "clip" as const },
      { title: "Training Montage", price: 2500, description: "Behind the scenes", type: "clip" as const },
      { title: "Walk-in Entrance", price: 3000, description: "Iconic entrance", type: "clip" as const },
      { title: "Post-Fight Interview", price: 1800, description: "Classic moments", type: "clip" as const },
    ];

    for (const gift of gifts) {
      await ctx.db.insert("gifts", {
        creatorId,
        ...gift,
        media: "/kaizen.png",
        currency: "USD",
        active: true,
        allowRecurring: true,
      });
    }

    // Add tiers
    const tiers = [
      { name: "Bronze", price: 800, perks: ["Exclusive updates", "Discord access", "Monthly newsletter"], highlighted: false },
      { name: "Silver", price: 2000, perks: ["All Bronze perks", "Early content access", "Member badge"], highlighted: false },
      { name: "Gold", price: 5000, perks: ["All Silver perks", "Monthly Q&A access", "Exclusive merch discount"], highlighted: false },
      { name: "Platinum", price: 50000, perks: ["All Gold perks", "5-min monthly call", "Platinum WhatsApp group", "Exclusive purchases"], highlighted: true },
    ];

    for (const tier of tiers) {
      await ctx.db.insert("tiers", {
        creatorId,
        ...tier,
        currency: "USD",
        active: true,
      });
    }

    // Add callouts
    const callouts = [
      { type: "video_message", price: 25000, duration: "60 seconds", description: "Personal video shout-out", featured: false },
      { type: "video_call", price: 99900, duration: "9 minutes", description: "One-on-one video call", featured: false },
      { type: "after_win", price: 2000000, duration: "Live", description: "Shout you out after my next win", featured: true },
    ];

    for (const callout of callouts) {
      await ctx.db.insert("callouts", {
        creatorId,
        ...callout,
        currency: "USD",
        active: true,
      });
    }

    // Add Spoil Me items
    const spoilItems = [
      {
        title: "Ducati Panigale V4",
        description: "Help me get my dream bike",
        targetAmount: 3299900,
        currentAmount: 1850000,
        shareAmount: 100000,
      },
      {
        title: "Land Rover Defender 130",
        description: "Ultimate adventure vehicle",
        targetAmount: 8407000,
        currentAmount: 4200000,
        shareAmount: 100000,
      },
      {
        title: "Rolex Daytona",
        description: "Championship watch",
        targetAmount: 4120000,
        currentAmount: 820000,
        shareAmount: 100000,
      },
    ];

    for (const item of spoilItems) {
      await ctx.db.insert("spoilItems", {
        creatorId,
        ...item,
        currency: "GBP",
        image: "/kaizen.png",
        active: true,
        completed: false,
      });
    }

    // Add some test orders for the recent purchases feed
    const recentOrders = [
      { fanName: "@fan123", totalAmount: 700 },
      { fanName: "@superfan", totalAmount: 2000 },
      { fanName: "@supporter", totalAmount: 2000 },
    ];

    // We need a giftId, so get the first gift
    const firstGift = await ctx.db
      .query("gifts")
      .withIndex("by_creator_and_active", (q) =>
        q.eq("creatorId", creatorId).eq("active", true)
      )
      .first();

    if (firstGift) {
      for (const order of recentOrders) {
        await ctx.db.insert("orders", {
          creatorId,
          giftId: firstGift._id,
          ...order,
          quantity: 1,
          unitPrice: order.totalAmount,
          currency: "USD",
          status: "completed",
        });
      }
    }

    console.log("✅ Added missing data to Conor McGregor profile!");
    return null;
  },
});

/**
 * Add a single test gift to existing Conor profile for Stripe testing
 */
export const addTestGift = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find existing Conor profile
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", "conor"))
      .first();

    if (!creator) {
      console.log("Conor profile not found");
      return null;
    }

    // Add one test gift
    await ctx.db.insert("gifts", {
      creatorId: creator._id,
      title: "Test Coffee",
      price: 500, // $5.00 in cents
      description: "Buy Conor a coffee to test Stripe",
      type: "item" as const,
      media: "/kaizen.png",
      currency: "USD",
      active: true,
      allowRecurring: true,
    });

    console.log("✅ Added test gift for Stripe testing!");
    return null;
  },
});

export const clearAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const tables = [
      "creators",
      "sponsors",
      "socialLinks",
      "posts",
      "gifts",
      "tiers",
      "callouts",
      "spoilItems",
      "orders",
      "tierSubscriptions",
      "bookings",
      "contributions",
    ];

    for (const tableName of tables) {
      const docs = await ctx.db.query(tableName as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    console.log("✅ Cleared all BuyMeADrink data");
    return null;
  },
});


