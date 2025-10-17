import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User authentication and account table
  users: defineTable({
    email: v.string(), // Required, unique email
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // Clerk ID (subject)
    emailVerified: v.boolean(), // Default false
    createdAt: v.number(), // Timestamp
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
  
  // BuyMeADrink: Creator profiles
  creators: defineTable({
    userId: v.id("users"), // Reference to users._id (Convex document ID)
    clerkId: v.optional(v.string()), // Explicit Clerk ID for direct lookups
    email: v.optional(v.string()), // Cache from users table for efficiency
    handle: v.string(), // Unique username (e.g., "conor")
    name: v.string(), // Display name
    tagline: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()), // URL or storage ID
    banner: v.optional(v.string()), // URL or storage ID
    stripeConnectAccountId: v.optional(v.string()), // For payouts
    stripeOnboardingComplete: v.optional(v.boolean()),
    active: v.optional(v.boolean()), // Profile published or draft
    settings: v.optional(v.object({
      hideRealName: v.optional(v.boolean()),
      moderationRequired: v.optional(v.boolean()),
    })),
    createdAt: v.optional(v.number()), // Timestamp (optional for migration compatibility)
    lastUpdated: v.optional(v.number()), // Track changes (optional for migration compatibility)
  })
    .index("by_handle", ["handle"])
    .index("by_userId", ["userId"])
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),
  
  // BuyMeADrink: Sponsor partnerships
  sponsors: defineTable({
    creatorId: v.id("creators"),
    name: v.string(),
    logo: v.string(), // URL or storage ID
    url: v.string(),
    position: v.number(), // Display order (1-6)
    active: v.boolean(),
    clicks: v.optional(v.number()), // Track engagement
  }).index("by_creator_and_position", ["creatorId", "position"]),
  
  // BuyMeADrink: Social media links
  socialLinks: defineTable({
    creatorId: v.id("creators"),
    platform: v.string(), // "instagram", "twitter", "youtube", etc.
    url: v.string(),
    position: v.number(), // Display order
  }).index("by_creator_and_position", ["creatorId", "position"]),
  
  // BuyMeADrink: Latest posts/content
  posts: defineTable({
    creatorId: v.id("creators"),
    platform: v.string(), // Source platform
    thumbnail: v.string(),
    url: v.string(),
    publishedAt: v.number(), // Timestamp
  })
    .index("by_creator_and_published", ["creatorId", "publishedAt"]),
  
  // BuyMeADrink: One-time gifts fans can send
  gifts: defineTable({
    creatorId: v.id("creators"),
    type: v.union(v.literal("clip"), v.literal("image"), v.literal("item")),
    title: v.string(),
    description: v.string(),
    media: v.string(), // URL or storage ID
    price: v.number(), // In cents
    currency: v.string(), // "USD", "GBP"
    stripePriceId: v.optional(v.string()),
    active: v.boolean(),
    allowRecurring: v.optional(v.boolean()), // Can convert to monthly
  })
    .index("by_creator_and_active", ["creatorId", "active"]),
  
  // BuyMeADrink: Monthly membership tiers (also aliased as supportTiers)
  tiers: defineTable({
    creatorId: v.id("creators"),
    name: v.string(), // "Bronze", "Silver", "Gold", "Platinum"
    price: v.number(), // In cents
    currency: v.string(),
    perks: v.array(v.string()), // List of benefits
    description: v.optional(v.string()), // Additional description field for Task 1 compatibility
    stripePriceId: v.optional(v.string()),
    highlighted: v.optional(v.boolean()),
    active: v.boolean(),
  })
    .index("by_creator_and_active", ["creatorId", "active"]),
  
  // Alias for Task 1 compatibility - same as tiers table
  supportTiers: defineTable({
    creatorId: v.id("creators"),
    name: v.string(),
    price: v.number(), // In cents
    description: v.string(),
    perks: v.array(v.string()),
    active: v.optional(v.boolean()),
  })
    .index("by_creator", ["creatorId"]),
  
  // BuyMeADrink: Callout/shout-out options
  callouts: defineTable({
    creatorId: v.id("creators"),
    type: v.string(), // "video_message", "video_call", "after_win"
    price: v.number(), // In cents
    duration: v.string(), // "60 seconds", "9 minutes"
    description: v.string(),
    currency: v.string(),
    stripePriceId: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    active: v.boolean(),
  })
    .index("by_creator_and_active", ["creatorId", "active"]),
  
  // BuyMeADrink: Spoil Me crowdfund items
  spoilItems: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    targetAmount: v.number(), // In cents
    currentAmount: v.number(), // In cents
    currency: v.string(),
    image: v.string(),
    shareAmount: v.number(), // Default contribution amount (e.g., £1000)
    stripePriceId: v.optional(v.string()),
    active: v.boolean(),
    completed: v.optional(v.boolean()),
  })
    .index("by_creator_and_active", ["creatorId", "active"]),
  
  // BuyMeADrink: One-time gift purchases (also aliased as giftPurchases)
  orders: defineTable({
    creatorId: v.id("creators"),
    fanId: v.optional(v.string()), // Can be guest or logged-in user
    fanName: v.optional(v.string()), // Display name or @handle
    giftId: v.id("gifts"),
    quantity: v.number(),
    unitPrice: v.number(), // In cents
    totalAmount: v.number(), // In cents
    amount: v.optional(v.number()), // Alias for totalAmount for Task 1 compatibility
    currency: v.string(),
    message: v.optional(v.string()),
    videoUrl: v.optional(v.string()), // Fan-uploaded video message
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()), // Alias: stripeSessionId
    status: v.string(), // "pending", "completed", "refunded"
    moderationStatus: v.optional(v.string()), // "pending", "approved", "rejected"
    isRecurring: v.optional(v.boolean()), // Monthly gift
  })
    .index("by_creator_and_status", ["creatorId", "status"])
    .index("by_fan", ["fanId"]),
  
  // Alias for Task 1 compatibility - same as orders table
  giftPurchases: defineTable({
    giftId: v.id("gifts"),
    creatorId: v.id("creators"), 
    fanName: v.optional(v.string()),
    message: v.optional(v.string()),
    quantity: v.number(),
    amount: v.number(), // In cents
    stripeSessionId: v.optional(v.string()),
    status: v.optional(v.string()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_gift", ["giftId"]),
  
  // BuyMeADrink: Tier subscriptions (also aliased as subscriptions for Task 1)
  tierSubscriptions: defineTable({
    creatorId: v.id("creators"),
    fanId: v.optional(v.string()),
    fanName: v.optional(v.string()),
    fanEmail: v.optional(v.string()), // Added for Task 1 compatibility
    tierId: v.id("tiers"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(), // "active", "canceled", "past_due"
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  })
    .index("by_creator_and_status", ["creatorId", "status"])
    .index("by_fan", ["fanId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),
  
  // BuyMeADrink: Callout bookings
  bookings: defineTable({
    creatorId: v.id("creators"),
    fanId: v.optional(v.string()),
    fanName: v.optional(v.string()),
    fanEmail: v.string(),
    fanPhone: v.optional(v.string()),
    calloutId: v.id("callouts"),
    amount: v.number(), // In cents
    currency: v.string(),
    instructions: v.optional(v.string()),
    preferredDate: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    status: v.string(), // "pending", "scheduled", "completed", "canceled"
    scheduledAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_creator_and_status", ["creatorId", "status"])
    .index("by_fan", ["fanId"]),
  
  // BuyMeADrink: Spoil Me contributions
  contributions: defineTable({
    creatorId: v.id("creators"),
    spoilItemId: v.id("spoilItems"),
    fanId: v.optional(v.string()),
    fanName: v.optional(v.string()),
    amount: v.number(), // In cents
    currency: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    certificateId: v.optional(v.string()), // Storage ID for certificate
    status: v.string(), // "pending", "completed", "refunded"
  })
    .index("by_spoil_item", ["spoilItemId"])
    .index("by_creator", ["creatorId"])
    .index("by_fan", ["fanId"]),
  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
  webhookEvents: defineTable({
    id: v.optional(v.string()),
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
    processed: v.optional(v.boolean()),
    created_at: v.optional(v.number()),
    webhookId: v.optional(v.string()),
    processingStatus: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"])
    .index("by_webhook_id", ["webhookId"]),

  // BuyMeADrink: Manual payout tracking for MVP
  payouts: defineTable({
    creatorId: v.id("creators"),
    amount: v.number(), // Amount in cents
    currency: v.string(),
    status: v.string(), // "pending", "processing", "sent", "failed"
    method: v.string(), // "paypal", "venmo", "bank_transfer", "stripe_connect"
    recipientEmail: v.optional(v.string()),
    recipientDetails: v.optional(v.string()), // PayPal email, Venmo handle, etc.
    transactionId: v.optional(v.string()), // External payment ID
    notes: v.optional(v.string()),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    failedReason: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  })
    .index("by_creator_and_status", ["creatorId", "status"])
    .index("by_status", ["status"]),
});
