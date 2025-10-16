import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Get a creator's full profile by handle
 * This loads everything needed for the /profile/:handle page
 */
export const getCreatorProfile = query({
  args: { handle: v.string() },
  returns: v.union(
    v.object({
      creator: v.object({
        _id: v.id("creators"),
        _creationTime: v.number(),
        handle: v.string(),
        name: v.string(),
        tagline: v.optional(v.string()),
        bio: v.optional(v.string()),
        avatar: v.optional(v.string()),
        banner: v.optional(v.string()),
        active: v.optional(v.boolean()),
      }),
      sponsors: v.array(
        v.object({
          _id: v.id("sponsors"),
          name: v.string(),
          logo: v.string(),
          url: v.string(),
          position: v.number(),
        })
      ),
      socialLinks: v.array(
        v.object({
          _id: v.id("socialLinks"),
          platform: v.string(),
          url: v.string(),
          position: v.number(),
        })
      ),
      posts: v.array(
        v.object({
          _id: v.id("posts"),
          platform: v.string(),
          thumbnail: v.string(),
          url: v.string(),
          publishedAt: v.number(),
        })
      ),
      gifts: v.array(
        v.object({
          _id: v.id("gifts"),
          type: v.union(v.literal("clip"), v.literal("image"), v.literal("item")),
          title: v.string(),
          description: v.string(),
          media: v.string(),
          price: v.number(),
          currency: v.string(),
        })
      ),
      tiers: v.array(
        v.object({
          _id: v.id("tiers"),
          name: v.string(),
          price: v.number(),
          currency: v.string(),
          perks: v.array(v.string()),
          highlighted: v.optional(v.boolean()),
        })
      ),
      callouts: v.array(
        v.object({
          _id: v.id("callouts"),
          type: v.string(),
          price: v.number(),
          duration: v.string(),
          description: v.string(),
          currency: v.string(),
          featured: v.optional(v.boolean()),
        })
      ),
      spoilItems: v.array(
        v.object({
          _id: v.id("spoilItems"),
          title: v.string(),
          description: v.string(),
          targetAmount: v.number(),
          currentAmount: v.number(),
          currency: v.string(),
          image: v.string(),
          shareAmount: v.number(),
        })
      ),
      recentPurchases: v.array(
        v.object({
          _id: v.id("orders"),
          fanName: v.optional(v.string()),
          totalAmount: v.number(),
          currency: v.string(),
          _creationTime: v.number(),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Find creator by handle
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();

    if (!creator || !creator.active) {
      return null;
    }

    // Load all related data in parallel
    const [sponsors, socialLinks, posts, gifts, tiers, callouts, spoilItems, recentOrders] =
      await Promise.all([
        // Sponsors (active only, sorted by position)
        ctx.db
          .query("sponsors")
          .withIndex("by_creator_and_position", (q) =>
            q.eq("creatorId", creator._id)
          )
          .filter((q) => q.eq(q.field("active"), true))
          .collect(),

        // Social links (sorted by position)
        ctx.db
          .query("socialLinks")
          .withIndex("by_creator_and_position", (q) =>
            q.eq("creatorId", creator._id)
          )
          .collect(),

        // Latest posts (last 7, newest first)
        ctx.db
          .query("posts")
          .withIndex("by_creator_and_published", (q) =>
            q.eq("creatorId", creator._id)
          )
          .order("desc")
          .take(7),

        // Active gifts
        ctx.db
          .query("gifts")
          .withIndex("by_creator_and_active", (q) =>
            q.eq("creatorId", creator._id).eq("active", true)
          )
          .collect(),

        // Active tiers
        ctx.db
          .query("tiers")
          .withIndex("by_creator_and_active", (q) =>
            q.eq("creatorId", creator._id).eq("active", true)
          )
          .collect(),

        // Active callouts
        ctx.db
          .query("callouts")
          .withIndex("by_creator_and_active", (q) =>
            q.eq("creatorId", creator._id).eq("active", true)
          )
          .collect(),

        // Active spoil items
        ctx.db
          .query("spoilItems")
          .withIndex("by_creator_and_active", (q) =>
            q.eq("creatorId", creator._id).eq("active", true)
          )
          .collect(),

        // Recent completed orders (last 3)
        ctx.db
          .query("orders")
          .withIndex("by_creator_and_status", (q) =>
            q.eq("creatorId", creator._id).eq("status", "completed")
          )
          .order("desc")
          .take(3),
      ]);

    return {
      creator: {
        _id: creator._id,
        _creationTime: creator._creationTime,
        handle: creator.handle,
        name: creator.name,
        tagline: creator.tagline,
        bio: creator.bio,
        avatar: creator.avatar,
        banner: creator.banner,
        active: creator.active,
      },
      sponsors: sponsors.map((s) => ({
        _id: s._id,
        name: s.name,
        logo: s.logo,
        url: s.url,
        position: s.position,
      })),
      socialLinks: socialLinks.map((sl) => ({
        _id: sl._id,
        platform: sl.platform,
        url: sl.url,
        position: sl.position,
      })),
      posts: posts.map((p) => ({
        _id: p._id,
        platform: p.platform,
        thumbnail: p.thumbnail,
        url: p.url,
        publishedAt: p.publishedAt,
      })),
      gifts: gifts.map((g) => ({
        _id: g._id,
        type: g.type,
        title: g.title,
        description: g.description,
        media: g.media,
        price: g.price,
        currency: g.currency,
      })),
      tiers: tiers.map((t) => ({
        _id: t._id,
        name: t.name,
        price: t.price,
        currency: t.currency,
        perks: t.perks,
        highlighted: t.highlighted,
      })),
      callouts: callouts.map((c) => ({
        _id: c._id,
        type: c.type,
        price: c.price,
        duration: c.duration,
        description: c.description,
        currency: c.currency,
        featured: c.featured,
      })),
      spoilItems: spoilItems.map((si) => ({
        _id: si._id,
        title: si.title,
        description: si.description,
        targetAmount: si.targetAmount,
        currentAmount: si.currentAmount,
        currency: si.currency,
        image: si.image,
        shareAmount: si.shareAmount,
      })),
      recentPurchases: recentOrders.map((o) => ({
        _id: o._id,
        fanName: o.fanName,
        totalAmount: o.totalAmount,
        currency: o.currency,
        _creationTime: o._creationTime,
      })),
    };
  },
});

/**
 * Get leaderboard data for a creator
 */
export const getLeaderboard = query({
  args: {
    creatorId: v.id("creators"),
    timeframe: v.union(
      v.literal("week"),
      v.literal("month"),
      v.literal("allTime")
    ),
  },
  returns: v.array(
    v.object({
      rank: v.number(),
      fanName: v.string(),
      totalAmount: v.number(),
      currency: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    let startTime = 0;

    // Calculate time window
    if (args.timeframe === "week") {
      startTime = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    } else if (args.timeframe === "month") {
      startTime = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    }

    // Get all completed orders and contributions in the timeframe
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_creator_and_status", (q) =>
        q.eq("creatorId", args.creatorId).eq("status", "completed")
      )
      .filter((q) =>
        args.timeframe === "allTime"
          ? true
          : q.gte(q.field("_creationTime"), startTime)
      )
      .collect();

    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .filter((q) =>
        args.timeframe === "allTime"
          ? q.eq(q.field("status"), "completed")
          : q.and(
              q.eq(q.field("status"), "completed"),
              q.gte(q.field("_creationTime"), startTime)
            )
      )
      .collect();

    // Aggregate by fan
    const fanTotals: Record<string, { name: string; amount: number; currency: string }> = {};

    for (const order of orders) {
      const fanKey = order.fanName || "Anonymous";
      if (!fanTotals[fanKey]) {
        fanTotals[fanKey] = {
          name: fanKey,
          amount: 0,
          currency: order.currency,
        };
      }
      fanTotals[fanKey].amount += order.totalAmount;
    }

    for (const contribution of contributions) {
      const fanKey = contribution.fanName || "Anonymous";
      if (!fanTotals[fanKey]) {
        fanTotals[fanKey] = {
          name: fanKey,
          amount: 0,
          currency: contribution.currency,
        };
      }
      fanTotals[fanKey].amount += contribution.amount;
    }

    // Sort by amount (descending) and assign ranks
    const sorted = Object.values(fanTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10

    return sorted.map((entry, index) => ({
      rank: index + 1,
      fanName: entry.name,
      totalAmount: entry.amount,
      currency: entry.currency,
    }));
  },
});

/**
 * Helper functions for payments (regular queries for now)
 */
export const getGiftById = query({
  args: { giftId: v.id("gifts") },
  returns: v.union(
    v.object({
      _id: v.id("gifts"),
      _creationTime: v.number(),
      creatorId: v.id("creators"),
      type: v.union(v.literal("clip"), v.literal("image"), v.literal("item")),
      title: v.string(),
      description: v.string(),
      media: v.string(),
      price: v.number(),
      currency: v.string(),
      stripePriceId: v.optional(v.string()),
      active: v.boolean(),
      allowRecurring: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.giftId);
  },
});

export const getTierById = query({
  args: { tierId: v.id("tiers") },
  returns: v.union(
    v.object({
      _id: v.id("tiers"),
      _creationTime: v.number(),
      creatorId: v.id("creators"),
      name: v.string(),
      price: v.number(),
      currency: v.string(),
      perks: v.array(v.string()),
      description: v.optional(v.string()),
      stripePriceId: v.optional(v.string()),
      highlighted: v.optional(v.boolean()),
      active: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tierId);
  },
});

export const findTierByPriceId = query({
  args: { priceId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("tiers"),
      _creationTime: v.number(),
      creatorId: v.id("creators"),
      name: v.string(),
      price: v.number(),
      currency: v.string(),
      perks: v.array(v.string()),
      description: v.optional(v.string()),
      stripePriceId: v.optional(v.string()),
      highlighted: v.optional(v.boolean()),
      active: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tiers")
      .filter((q) => q.eq(q.field("stripePriceId"), args.priceId))
      .first();
  },
});

export const getCreatorById = query({
  args: { creatorId: v.id("creators") },
  returns: v.union(
    v.object({
      _id: v.id("creators"),
      _creationTime: v.number(),
      userId: v.optional(v.string()),
      handle: v.string(),
      name: v.string(),
      tagline: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatar: v.optional(v.string()),
      banner: v.optional(v.string()),
      stripeConnectAccountId: v.optional(v.string()),
      stripeOnboardingComplete: v.optional(v.boolean()),
      active: v.optional(v.boolean()),
      settings: v.optional(v.object({
        hideRealName: v.optional(v.boolean()),
        moderationRequired: v.optional(v.boolean()),
      })),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.creatorId);
  },
});

/**
 * Get a creator by the linked Clerk userId
 */
export const getCreatorByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("creators"),
      _creationTime: v.number(),
      userId: v.optional(v.string()),
      handle: v.string(),
      name: v.string(),
      tagline: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatar: v.optional(v.string()),
      banner: v.optional(v.string()),
      active: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!existing) return null;
    return {
      _id: existing._id,
      _creationTime: existing._creationTime,
      userId: existing.userId,
      handle: existing.handle,
      name: existing.name,
      tagline: existing.tagline,
      bio: existing.bio,
      avatar: existing.avatar,
      banner: existing.banner,
      active: existing.active,
    };
  },
});

/**
 * Get a creator by handle (for debugging)
 */
export const getCreatorByHandle = query({
  args: { handle: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("creators"),
      _creationTime: v.number(),
      userId: v.optional(v.string()),
      handle: v.string(),
      name: v.string(),
      tagline: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatar: v.optional(v.string()),
      banner: v.optional(v.string()),
      active: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    if (!existing) return null;
    return {
      _id: existing._id,
      _creationTime: existing._creationTime,
      userId: existing.userId,
      handle: existing.handle,
      name: existing.name,
      tagline: existing.tagline,
      bio: existing.bio,
      avatar: existing.avatar,
      banner: existing.banner,
      active: existing.active,
    };
  },
});

/**
 * Check if a handle is available
 */
export const checkHandleAvailability = query({
  args: { handle: v.string() },
  returns: v.object({ available: v.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    return { available: existing ? false : true };
  },
});

/**
 * Check if current user is the owner of a creator profile
 */
export const isCreatorOwner = query({
  args: { creatorId: v.id("creators") },
  returns: v.object({ isOwner: v.boolean() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isOwner: false };
    }

    const creator = await ctx.db.get(args.creatorId);
    if (!creator) {
      return { isOwner: false };
    }

    return { isOwner: creator.userId === identity.subject };
  },
});

/**
 * Get all gifts for a creator (for dashboard)
 */
export const getGiftsByCreator = query({
  args: { creatorId: v.id("creators") },
  returns: v.array(
    v.object({
      _id: v.id("gifts"),
      _creationTime: v.number(),
      creatorId: v.id("creators"),
      type: v.union(v.literal("clip"), v.literal("image"), v.literal("item")),
      title: v.string(),
      description: v.string(),
      media: v.string(),
      price: v.number(),
      currency: v.string(),
      stripePriceId: v.optional(v.string()),
      active: v.boolean(),
      allowRecurring: v.optional(v.boolean()),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gifts")
      .withIndex("by_creator_and_active", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

/**
 * Get all tiers for a creator (for dashboard)
 */
export const getTiersByCreator = query({
  args: { creatorId: v.id("creators") },
  returns: v.array(
    v.object({
      _id: v.id("tiers"),
      _creationTime: v.number(),
      creatorId: v.id("creators"),
      name: v.string(),
      price: v.number(),
      currency: v.string(),
      perks: v.array(v.string()),
      description: v.optional(v.string()),
      stripePriceId: v.optional(v.string()),
      highlighted: v.optional(v.boolean()),
      active: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tiers")
      .withIndex("by_creator_and_active", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

/**
 * Update creator profile (authenticated)
 */
export const updateCreatorProfile = mutation({
  args: {
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get creator profile
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!creator) {
      throw new Error("Creator profile not found");
    }
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(args).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(creator._id, cleanUpdates);
    return null;
  },
});


/**
 * Create a new creator profile (temporary non-authenticated version)
 */
export const createCreatorNoAuth = mutation({
  args: {
    userId: v.string(),
    handle: v.string(),
    name: v.string(),
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
  },
  returns: v.id("creators"),
  handler: async (ctx, args) => {
    console.log("🔧 createCreatorNoAuth mutation called with args:", args);
    
    // NO AUTHENTICATION - just proceed with database operations
    
    // Ensure handle is available
    console.log("🔍 Checking if handle exists:", args.handle);
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    
    if (existing) {
      console.error("❌ Handle already exists:", existing);
      throw new Error("Handle is already taken");
    }

    console.log("✅ Handle is available, inserting creator...");
    const id = await ctx.db.insert("creators", {
      userId: args.userId,
      handle: args.handle,
      name: args.name,
      tagline: args.tagline,
      bio: args.bio,
      avatar: args.avatar,
      banner: args.banner,
      active: true,
    });
    
    console.log("✅ Creator inserted with ID:", id);
    return id;
  },
});

/**
 * Create a new creator profile (authenticated)
 */
export const createCreator = mutation({
  args: {
    handle: v.string(),
    name: v.string(),
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
  },
  returns: v.id("creators"),
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Ensure handle is available
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    if (existing) {
      throw new Error("Handle is already taken");
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_-]+$/;
    if (!handleRegex.test(args.handle)) {
      throw new Error("Handle can only contain letters, numbers, hyphens, and underscores");
    }

    // Validate handle length
    if (args.handle.length < 3 || args.handle.length > 30) {
      throw new Error("Handle must be between 3 and 30 characters");
    }

    // Validate name
    if (!args.name || args.name.trim().length < 2 || args.name.trim().length > 50) {
      throw new Error("Name must be between 2 and 50 characters");
    }

    // Insert creator linked to authenticated user
    const id = await ctx.db.insert("creators", {
      userId: identity.subject,
      handle: args.handle,
      name: args.name,
      tagline: args.tagline,
      bio: args.bio,
      avatar: args.avatar,
      banner: args.banner,
      active: true,
    });

    // Send welcome email to the creator
    try {
      const profileUrl = `${process.env.PUBLIC_URL || "https://buymeadrink.app"}/profile/${args.handle}`;
      await ctx.scheduler.runAfter(0, internal.sendEmails.sendCreatorWelcomeEmail, {
        email: identity.email || "",
        name: args.name,
        handle: args.handle,
        profileUrl: profileUrl,
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't fail the creator creation if email fails
    }

    return id;
  },
});

/**
 * Create a new gift
 */
export const createGift = mutation({
  args: {
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    price: v.number(), // In cents
    currency: v.string(),
    media: v.string(),
    type: v.union(v.literal("clip"), v.literal("image"), v.literal("item")),
  },
  returns: v.id("gifts"),
  handler: async (ctx, args) => {
    console.log("🎁 createGift mutation called with args:", args);
    
    const giftId = await ctx.db.insert("gifts", {
      ...args,
      active: true,
    });
    
    console.log("✅ Gift inserted with ID:", giftId);
    return giftId;
  },
});

/**
 * Create a new tier (authenticated)
 */
export const createTier = mutation({
  args: {
    name: v.string(),
    price: v.number(), // In cents
    currency: v.string(),
    perks: v.array(v.string()),
    description: v.optional(v.string()),
    highlighted: v.optional(v.boolean()),
  },
  returns: v.id("tiers"),
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get creator profile
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    return await ctx.db.insert("tiers", {
      creatorId: creator._id,
      name: args.name,
      price: args.price,
      currency: args.currency,
      perks: args.perks,
      description: args.description,
      highlighted: args.highlighted,
      active: true,
    });
  },
});

/**
 * Update an existing tier (authenticated)
 */
export const updateTier = mutation({
  args: {
    tierId: v.id("tiers"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    perks: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    highlighted: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the tier to verify ownership
    const tier = await ctx.db.get(args.tierId);
    if (!tier) {
      throw new Error("Tier not found");
    }

    // Get creator profile
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!creator || tier.creatorId !== creator._id) {
      throw new Error("Unauthorized");
    }

    const { tierId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(tierId, cleanUpdates);
    return null;
  },
});

/**
 * Delete a tier (authenticated)
 */
export const deleteTier = mutation({
  args: { tierId: v.id("tiers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the tier to verify ownership
    const tier = await ctx.db.get(args.tierId);
    if (!tier) {
      throw new Error("Tier not found");
    }

    // Get creator profile
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!creator || tier.creatorId !== creator._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.tierId);
    return null;
  },
});


/**
 * Social links - list by creator
 */
export const getSocialLinksByCreator = query({
  args: { creatorId: v.id("creators") },
  returns: v.array(
    v.object({
      _id: v.id("socialLinks"),
      platform: v.string(),
      url: v.string(),
      position: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("socialLinks")
      .withIndex("by_creator_and_position", (q) => q.eq("creatorId", args.creatorId))
      .collect();
    return links.map((l) => ({ _id: l._id, platform: l.platform, url: l.url, position: l.position }));
  },
});

/**
 * Social links - create (authenticated)
 */
export const createSocialLink = mutation({
  args: {
    creatorId: v.id("creators"),
    platform: v.string(),
    url: v.string(),
  },
  returns: v.id("socialLinks"),
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the creatorId belongs to the authenticated user
    const creator = await ctx.db.get(args.creatorId);
    if (!creator || creator.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Normalize platform key
    const platform = args.platform.toLowerCase();

    // Prevent duplicate platform per creator
    const existingForCreator = await ctx.db
      .query("socialLinks")
      .withIndex("by_creator_and_position", (q) => q.eq("creatorId", args.creatorId))
      .collect();
    const alreadyExists = existingForCreator.some((l) => l.platform.toLowerCase() === platform);
    if (alreadyExists) {
      throw new Error(`A ${platform} link already exists for this creator`);
    }

    // naive position: append to end
    const count = existingForCreator.length;
    return await ctx.db.insert("socialLinks", {
      creatorId: args.creatorId,
      platform,
      url: args.url,
      position: count + 1,
    });
  },
});

/**
 * Social links - delete (authenticated)
 */
export const deleteSocialLink = mutation({
  args: { socialLinkId: v.id("socialLinks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the social link to verify ownership
    const socialLink = await ctx.db.get(args.socialLinkId);
    if (!socialLink) {
      throw new Error("Social link not found");
    }

    // Verify the social link belongs to the authenticated user's creator profile
    const creator = await ctx.db.get(socialLink.creatorId);
    if (!creator || creator.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.socialLinkId);
    return null;
  },
});

/**
 * Get the current authenticated user's creator dashboard data
 * This query checks authentication and returns all dashboard data
 */
export const getAuthenticatedCreatorDashboard = query({
  args: {},
  returns: v.union(
    v.object({
      creator: v.object({
        _id: v.id("creators"),
        _creationTime: v.number(),
        userId: v.optional(v.string()),
        handle: v.string(),
        name: v.string(),
        tagline: v.optional(v.string()),
        bio: v.optional(v.string()),
        avatar: v.optional(v.string()),
        banner: v.optional(v.string()),
        active: v.optional(v.boolean()),
      }),
      gifts: v.array(
        v.object({
          _id: v.id("gifts"),
          _creationTime: v.number(),
          creatorId: v.id("creators"),
          type: v.union(v.literal("clip"), v.literal("image"), v.literal("item")),
          title: v.string(),
          description: v.string(),
          media: v.string(),
          price: v.number(),
          currency: v.string(),
          stripePriceId: v.optional(v.string()),
          active: v.boolean(),
          allowRecurring: v.optional(v.boolean()),
        })
      ),
      tiers: v.array(
        v.object({
          _id: v.id("tiers"),
          _creationTime: v.number(),
          creatorId: v.id("creators"),
          name: v.string(),
          price: v.number(),
          currency: v.string(),
          perks: v.array(v.string()),
          description: v.optional(v.string()),
          stripePriceId: v.optional(v.string()),
          highlighted: v.optional(v.boolean()),
          active: v.boolean(),
        })
      ),
      socialLinks: v.array(
        v.object({
          _id: v.id("socialLinks"),
          platform: v.string(),
          url: v.string(),
          position: v.number(),
        })
      ),
      needsOnboarding: v.boolean(),
      completionStatus: v.object({
        profileSetup: v.boolean(),
        firstGift: v.boolean(),
        socialLinks: v.boolean(),
        supportTiers: v.boolean(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get authenticated user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      // Not authenticated
      return null;
    }

    // Get creator profile by userId (Clerk's subject is the userId)
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!creator) {
      // User is authenticated but doesn't have a creator profile yet
      return null;
    }

    // Load all dashboard data in parallel
    const [gifts, tiers, socialLinks] = await Promise.all([
      ctx.db
        .query("gifts")
        .withIndex("by_creator_and_active", (q) => q.eq("creatorId", creator._id))
        .collect(),
      ctx.db
        .query("tiers")
        .withIndex("by_creator_and_active", (q) => q.eq("creatorId", creator._id))
        .collect(),
      ctx.db
        .query("socialLinks")
        .withIndex("by_creator_and_position", (q) => q.eq("creatorId", creator._id))
        .collect(),
    ]);

    // Calculate completion status
    const hasGifts = gifts.some((g) => g.active);
    const hasTiers = tiers.some((t) => t.active);
    const hasSocialLinks = socialLinks.length > 0;
    const hasProfile = !!(creator.name && creator.handle);

    return {
      creator: {
        _id: creator._id,
        _creationTime: creator._creationTime,
        userId: creator.userId,
        handle: creator.handle,
        name: creator.name,
        tagline: creator.tagline,
        bio: creator.bio,
        avatar: creator.avatar,
        banner: creator.banner,
        active: creator.active,
      },
      gifts,
      tiers,
      socialLinks: socialLinks.map((sl) => ({
        _id: sl._id,
        platform: sl.platform,
        url: sl.url,
        position: sl.position,
      })),
      needsOnboarding: false,
      completionStatus: {
        profileSetup: hasProfile,
        firstGift: hasGifts,
        socialLinks: hasSocialLinks,
        supportTiers: hasTiers,
      },
    };
  },
});




/**
 * Test query to verify Clerk + Convex authentication
 */
export const testAuth = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    console.log("🔧 testAuth query called");
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      console.log("🔧 Identity result:", identity);
      
      if (!identity) {
        console.log("❌ No identity found - not authenticated");
        return "Not authenticated";
      }
      
      console.log("✅ Identity found:", {
        subject: identity.subject,
        name: identity.name,
        email: identity.email
      });
      
      return `Authenticated as: ${identity.name || identity.subject}`;
    } catch (error) {
      console.error("❌ Auth error:", error);
      return `Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get monthly earnings for a creator (simplified for MVP)
 */
export const getMonthlyEarnings = query({
  args: {
    creatorId: v.id("creators"),
    year: v.number(),
    month: v.number(), // 1-12
  },
  returns: v.object({
    totalEarnings: v.number(),
    giftEarnings: v.number(),
    subscriptionEarnings: v.number(),
    platformFee: v.number(),
    netEarnings: v.number(),
    giftCount: v.number(),
    subscriptionCount: v.number(),
    currency: v.string(),
  }),
  handler: async (ctx, args) => {
    const startDate = new Date(args.year, args.month - 1, 1).getTime();
    const endDate = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();

    // Get completed orders in the month
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_creator_and_status", (q) =>
        q.eq("creatorId", args.creatorId).eq("status", "completed")
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startDate),
          q.lte(q.field("_creationTime"), endDate)
        )
      )
      .collect();

    // Get completed subscriptions in the month
    const subscriptions = await ctx.db
      .query("tierSubscriptions")
      .withIndex("by_creator_and_status", (q) =>
        q.eq("creatorId", args.creatorId).eq("status", "active")
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("currentPeriodStart"), startDate),
          q.lte(q.field("currentPeriodStart"), endDate)
        )
      )
      .collect();

    // Calculate totals
    const giftEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get tier amounts for subscriptions
    const subscriptionEarnings = await Promise.all(
      subscriptions.map(async (sub) => {
        const tier = await ctx.db.get(sub.tierId);
        if (!tier) return 0;
        
        // Calculate prorated amount for the month
        const periodStart = sub.currentPeriodStart;
        const periodEnd = sub.currentPeriodEnd;
        const monthStart = startDate;
        const monthEnd = endDate;
        
        // Calculate overlap
        const overlapStart = Math.max(periodStart, monthStart);
        const overlapEnd = Math.min(periodEnd, monthEnd);
        
        if (overlapStart <= overlapEnd) {
          const totalDays = periodEnd - periodStart;
          const overlapDays = overlapEnd - overlapStart;
          const proratedAmount = tier.price * (overlapDays / totalDays);
          return proratedAmount;
        }
        return 0;
      })
    ).then(amounts => amounts.reduce((sum, amount) => sum + amount, 0));

    const totalEarnings = giftEarnings + subscriptionEarnings;
    const platformFee = Math.round(totalEarnings * 0.05); // 5% platform fee
    const netEarnings = totalEarnings - platformFee;

    return {
      totalEarnings,
      giftEarnings,
      subscriptionEarnings,
      platformFee,
      netEarnings,
      giftCount: orders.length,
      subscriptionCount: subscriptions.length,
      currency: orders[0]?.currency || "USD",
    };
  },
});
