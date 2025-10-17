import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * NOTE: Seed functions have been refactored due to schema changes.
 * Creators must now be created through the authenticated createCreator mutation
 * which properly links them to user accounts. Use addTestGift() if you need
 * to add test data to an existing creator profile.
 */

/**
 * Seed a test creator with user account, profile, gifts, and tiers
 * Useful for development and testing without manual signup
 */
export const seedTestCreator = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if test creator already exists
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", "testcreator"))
      .first();

    if (existing) {
      console.log("Test creator already exists, skipping seed");
      return null;
    }

    const now = Date.now();
    const testClerkId = "test_user_" + Math.random().toString(36).substr(2, 9);

    // 1. Create a test user
    const userId = await ctx.db.insert("users", {
      email: "test@buymeadrink.local",
      name: "Test Creator",
      tokenIdentifier: testClerkId,
      emailVerified: false,
      createdAt: now,
    });

    console.log("✅ Created test user:", userId);

    // 2. Create creator linked to that user
    const creatorId = await ctx.db.insert("creators", {
      userId,
      clerkId: testClerkId,
      email: "test@buymeadrink.local",
      handle: "testcreator",
      name: "Test Creator",
      tagline: "Testing • Development • MVP",
      bio: "A test creator profile for development and testing purposes.",
      avatar: "/kaizen.png",
      banner: "/kaizen-no-bg.png",
      active: true,
      createdAt: now,
      lastUpdated: now,
    });

    console.log("✅ Created test creator:", creatorId);

    // 3. Add test gifts
    const gifts = [
      { title: "Test Coffee", price: 500, description: "Buy a coffee" },
      { title: "Test Snack", price: 1000, description: "Buy a snack" },
      { title: "Test Meal", price: 2000, description: "Buy a meal" },
    ];

    for (const gift of gifts) {
      await ctx.db.insert("gifts", {
        creatorId,
        title: gift.title,
        price: gift.price,
        description: gift.description,
        type: "item" as const,
        media: "/kaizen.png",
        currency: "USD",
        active: true,
        allowRecurring: false,
      });
    }

    console.log("✅ Added test gifts");

    // 4. Add test tiers
    const tiers = [
      {
        name: "Supporter",
        price: 500,
        perks: ["Test perk 1", "Test perk 2"],
      },
      {
        name: "Super Supporter",
        price: 1500,
        perks: ["All Supporter perks", "Exclusive test perk"],
      },
    ];

    for (const tier of tiers) {
      await ctx.db.insert("tiers", {
        creatorId,
        name: tier.name,
        price: tier.price,
        perks: tier.perks,
        description: `Test tier: ${tier.name}`,
        currency: "USD",
        active: true,
      });
    }

    console.log("✅ Added test tiers");
    console.log("✅ Seeded test creator successfully!");
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


