# BuyMeADrink Setup Guide

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd buymeadrink
   npm install --legacy-peer-deps
   ```

2. **Set up Convex database:**
   ```bash
   npx convex dev
   ```
   This will create your Convex deployment and auto-fill `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` in `.env.local`.

3. **Configure environment variables:**
   Copy `.env.buymeadrink` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.buymeadrink .env.local
   ```

4. **Seed test data:**
   In Convex dashboard, run:
   ```javascript
   await api.seed.seedConorProfile({})
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Visit test profile:**
   Open [http://localhost:5173/profile/conor](http://localhost:5173/profile/conor)

## Required Service Setup

### 1. Stripe (Payments)

**Get API Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
3. Copy your **Secret key** → `STRIPE_API_KEY`

**Set up Webhooks:**
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

**Enable Stripe Connect:**
1. Go to [Connect Settings](https://dashboard.stripe.com/connect/accounts/overview)
2. Enable Express accounts
3. Set up webhook for Connect events → `STRIPE_CONNECT_WEBHOOK_SECRET`

### 2. Resend (Email)

**Get API Key:**
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Create new API key
3. Copy key → `RESEND_API_KEY`

**Set up Domain (Production):**
1. Add your domain in Resend dashboard
2. Set `RESEND_FROM_EMAIL=noreply@yourdomain.com`

**Webhooks (Optional):**
1. Add webhook endpoint for delivery tracking
2. Copy secret → `RESEND_WEBHOOK_SECRET`

### 3. Convex Backend Environment

Set these in **Convex Dashboard → Settings → Environment Variables**:

```
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

## Testing the Setup

### 1. Profile Page Test
Visit: `http://localhost:5173/profile/conor`

**Expected:**
- [x] Conor McGregor profile loads
- [x] Sponsors display
- [x] Social links work
- [x] Posts carousel shows
- [x] Gifts, tiers, callouts visible
- [x] Leaderboard displays
- [x] Recent purchases show

### 2. Payment Flow Test
*Note: Requires Stripe setup*

1. Click on a gift
2. Fill purchase form
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify email receipt (if Resend configured)

### 3. Data Validation
In Convex dashboard, check tables:
```javascript
// Check if data exists
await db.query("creators").collect()
await db.query("gifts").collect()
await db.query("orders").collect()
```

## Common Issues

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Convex Connection Failed
1. Check `VITE_CONVEX_URL` is set correctly
2. Run `npx convex dev` again
3. Ensure you're logged in: `npx convex auth`

### Profile Not Found (404)
1. Run seed command in Convex dashboard
2. Check `creators` table has data
3. Verify handle is "conor" (lowercase)

### Stripe Errors
1. Check API keys are for same account
2. Verify webhook endpoint is accessible
3. Use test mode during development

### Email Not Sending
1. Verify `RESEND_API_KEY` is set in Convex backend
2. Check domain is verified in Resend (production)
3. Use `onboarding@resend.dev` for testing

## Next Steps

### MVP Implementation Priority:
1. ✅ Profile page working
2. 🔄 Stripe Connect onboarding flow
3. 🔄 Gift purchase with Stripe Checkout
4. 🔄 Email notifications
5. 🔄 Creator dashboard
6. 🔄 Tier subscriptions
7. 🔄 Spoil Me crowdfunding
8. 🔄 Callout bookings

### Phase 2 Features:
- UFC fighter data integration
- Embed panel/overlay
- Advanced analytics
- Mobile app
- Creator verification

## Support

- Check [Convex docs](https://docs.convex.dev)
- Check [Stripe docs](https://stripe.com/docs)
- Check [Resend docs](https://resend.com/docs)
- Review PRD.md for full feature specifications