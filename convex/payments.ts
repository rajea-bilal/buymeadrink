import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
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
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2025-09-30.clover",
    });

    // Get gift and creator details using the public queries
    const [gift, creator] = await Promise.all([
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
      const session = await stripe.checkout.sessions.create({
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
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2025-09-30.clover",
    });

    try {
      const session = await stripe.checkout.sessions.create({
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
 * Test Stripe connection
 */
export const testStripeConnection = action({
  args: {},
  handler: async () => {
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