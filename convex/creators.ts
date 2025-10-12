import { query, mutation } from "./_generated/server";
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
  handler: async (ctx, args) => {
    return await ctx.db.get(args.giftId);
  },
});

export const getCreatorById = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.creatorId);
  },
});


