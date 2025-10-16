import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import Stripe from "stripe";

/**
 * Full gift checkout session with database integration
 */
export const createCheckoutSession = action({
  args: {
    giftId: v.id("gifts"),
    creatorId: v.id("creators"),
    quantity: v.number(),
    fanName: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string | null }> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2025-09-30.clover",
    });

    // Get gift and creator details using the public queries
    const [gift, creator]: [any, any] = await Promise.all([
      ctx.runQuery(api.creators.getGiftById, { giftId: args.giftId }),
      ctx.runQuery(api.creators.getCreatorById, { creatorId: args.creatorId }),
    ]);

    if (!gift) {
      throw new Error("Gift not found");
    }
    if (!creator) {
      throw new Error("Creator not found");
    }

    try {
      const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: gift.currency.toLowerCase(),
              product_data: {
                name: `${gift.title} for ${creator.name}`,
                description: gift.description,
                images: gift.media ? [gift.media] : undefined,
              },
              unit_amount: gift.price, // Amount in cents
            },
            quantity: args.quantity,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/profile/${creator.handle}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/profile/${creator.handle}?canceled=true`,
        metadata: {
          giftId: args.giftId,
          creatorId: args.creatorId,
          fanName: args.fanName || "Anonymous",
          message: args.message || "",
          quantity: args.quantity.toString(),
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Stripe checkout error:", error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Simple test checkout session for testing Stripe
 */
export const createTestCheckoutSession = action({
  args: {
    amount: v.number(), // Amount in cents
    title: v.string(),
    creatorHandle: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string | null }> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2025-09-30.clover",
    });

    try {
      const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: args.title,
                description: "Test gift purchase for BuyMeADrink",
              },
              unit_amount: args.amount, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/profile/${args.creatorHandle}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/profile/${args.creatorHandle}?canceled=true`,
        metadata: {
          test: "true",
          creatorHandle: args.creatorHandle,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Stripe checkout error:", error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Check if a gift purchase already exists for a session
 */
export const checkExistingPurchase = mutation({
  args: { sessionId: v.string() },
  returns: v.union(v.id("giftPurchases"), v.null()),
  handler: async (ctx, { sessionId }) => {
    const existing = await ctx.db
      .query("giftPurchases")
      .filter((q) => q.eq(q.field("stripeSessionId"), sessionId))
      .first();
    return existing?._id || null;
  },
});

/**
 * Create a new order record
 */
export const createOrder = mutation({
  args: {
    creatorId: v.id("creators"),
    giftId: v.id("gifts"),
    quantity: v.number(),
    totalAmount: v.number(),
    currency: v.string(),
    fanName: v.optional(v.string()),
    fanId: v.optional(v.string()),
    message: v.optional(v.string()),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      creatorId: args.creatorId,
      giftId: args.giftId,
      quantity: args.quantity,
      unitPrice: args.totalAmount / args.quantity, // Calculate unit price
      totalAmount: args.totalAmount,
      currency: args.currency,
      fanName: args.fanName,
      fanId: args.fanId,
      message: args.message,
      stripeCheckoutSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "completed",
    });
  },
});

/**
 * Create a gift purchase record
 */
export const createGiftPurchase = mutation({
  args: {
    giftId: v.id("gifts"),
    creatorId: v.id("creators"),
    fanName: v.optional(v.string()),
    message: v.optional(v.string()),
    quantity: v.number(),
    amount: v.number(),
    stripeSessionId: v.string(),
  },
  returns: v.id("giftPurchases"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("giftPurchases", {
      giftId: args.giftId,
      creatorId: args.creatorId,
      fanName: args.fanName,
      message: args.message,
      quantity: args.quantity,
      amount: args.amount,
      stripeSessionId: args.stripeSessionId,
      status: "completed",
    });
  },
});

// confirmGiftCheckout removed - using simplified payment flow for MVP

/**
 * Test Stripe connection
 */
export const testStripeConnection = action({
  args: {},
  handler: async (): Promise<{ success: boolean; accountId?: string; country?: string; currency?: string; error?: string }> => {
    try {
      const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
        apiVersion: "2025-09-30.clover",
      });

      // Test API key by retrieving account info
      const account = await stripe.accounts.retrieve();
      
      return {
        success: true,
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
      };
    } catch (error) {
      console.error("Stripe connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
