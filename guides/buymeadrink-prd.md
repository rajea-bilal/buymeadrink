# BuyMeADrink MVP PRD

## 1. Product Snapshot
- **One line:** A plug-and-play fan support panel so athletes and creators can get gifts, subs, callouts, and big-ticket help in one place.
- **Why now:** Fans already look for ways to tip or cheer; this bundles them with secure payouts and sponsor upsell.
- **Pitch deck ask:** Provide before/after visuals for UFC, NBA, NFL, WWE profile pages to show the drop-in widget impact.

## 2. Tech Stack Grounding
- Frontend uses `react-router` v7 with Vite and React 19, TailwindCSS, and shadcn/radix UI.
- Server side logic runs through Convex for real-time data, plus optional Clerk auth (currently off) and Resend email.
- Payments and subscriptions run through Stripe (Checkout + Subscriptions) with Stripe Connect Express for creator payouts.
- Emails delivered by Resend via server functions; analytics hooks exist; deploy target is Vercel.
- Type safety is enforced with TypeScript, generated route types, and Convex schema.
- File storage and moderation queues should use Convex storage once assets are ready.

## 3. Users And Goals
- **Fans:** Open the panel fast, browse content, buy or subscribe in under two minutes, and share the moment.
- **Creators:** Set up a polished profile in under 30 minutes, stay compliant, and get paid automatically.
- **Sponsors/Admin:** See logo clicks, manage slots, keep payouts and messaging clean.

## 4. MVP Scope (Step By Step)

### Step 1 — Embed Launcher
- Ship a lightweight script that injects the BuyMeADrink logo button on partner pages.
- Default mode opens an iframe panel in a shadow DOM overlay; add query param or attribute to force `panel`, `page`, or `auto` behaviour.
- Detect block/iframe denial and redirect to full profile page at `/c/<handle>`.
- Make the button load in <150ms and pass WCAG focus rules.

### Step 2 — Panel & Page Shell
- Use shared layout for panel and fallback page; keep responsive breakpoints at 320px, 768px, 1024px.
- Include header with hero banner, creator avatar, name, tagline, sponsor strip, and close/back actions.
- Sidebar (in desktop) or bottom drawer (mobile) shows last three purchases and CTA buttons.

### Step 3 — Branding And Sponsors
- Hero banner: upload image or pick color gradient; add text overlay and optional video loop.
- Six sponsor tiles (3 left, 3 right). Each tile stores logo, label, link, tracking slug.
- Allow quick reorder and toggle off individual sponsors.

### Step 4 — Social Link Row
- Display Linktree-style icon row with WhatsApp/Text “share all links” button pre-filled with creator message.
- Support at least Instagram, X, YouTube, TikTok, Facebook, Twitch, custom link.
- Add analytics hooks for click tracking.

### Step 5 — Latest Posts Carousel
- Pull 7 most recent posts via manual curation feed (MVP) with optional automatic sort by publish date.
- Carousel includes arrows, dots, autoplay toggle. Support mix of thumbnails + short descriptions.
- Treat each post as link-out; open in new tab.

### Step 6 — Gifts (One-Off Purchases)
- Grid of themed gifts (4 per row desktop, 2 mobile). Each card: image/video, title, price, short description.
- Purchase flow: choose preset quantity (1, 3, 5, custom), enter name/@handle, message, optional video upload.
- Toggle “Make this monthly” to convert to recurring subscription using same SKU if available.
- Show rolling feed of last three purchases in sidebar with anonymised handles if privacy mode on.

### Step 7 — Monthly Support Tiers
- Bundle four default tiers: Bronze $8, Silver $20, Gold $50, Platinum $500 (editable copy/pricing).
- Platinum adds perks fields: monthly call, exclusive buys, WhatsApp group; store as structured perks array.
- Provide quick link to manage subscription via Stripe customer portal.

### Step 8 — Callouts / Shout-outs
- Offer three preset options: `$250` for 60-sec video, `$999` for 9-min call, `$20,000` “After-win callout”.
- Collect fan instructions, preferred delivery dates, contact email, phone (optional).
- Flag After-win flow as high-value: if Stripe cannot auto-process, send manual follow-up instructions and mark booking as pending payout.

### Step 9 — “Spoil Me” Crowdfunds
- List big-ticket items with image, description, target amount, per-share contribution (default $1,000).
- Show live progress bar with amount raised and contributors count.
- After payment, auto-generate digital certificate link (hosted via Convex storage) and email it.

### Step 10 — Leaderboards & Activity
- Weekly, monthly, all-time leaderboards showing display name/@, total contributed, avatar placeholder.
- Update immediately after each payment confirmation.
- Allow creator override to anonymise specific orders.

## 5. Fan Flow Requirements
- Launcher ➜ Panel open under 2 seconds.
- Scroll path: banner → sponsors → social row → latest posts → gifts → tiers → callouts → Spoil Me → leaderboard.
- Purchasing: one modal with order summary, Stripe Checkout handoff, then thank-you screen with share buttons.
- Subscribing: same Stripe handoff but returns to tier success page with perks recap.
- Booking callout: capture details, send Stripe link, show confirmation page and follow-up email.
- Spoil Me: show updated total instantly, deliver certificate download, prompt share.

## 6. Creator Flow Requirements
- Onboarding wizard: create account, connect Stripe Express (KYC), accept terms, publish profile.
- Profile setup: upload avatar/banner, set bio, add social links, assign sponsor tiles (logos + URLs).
- Content manager: CRUD for gifts, tiers, callouts, Spoil Me items, latest posts list.
- Order desk: list purchases, subs, contributions with filters; export CSV, resend receipts, send thank-you notes.
- Moderation queue: review messages/video uploads, approve/reject, auto-flag profanity.
- Insights: show revenue by product, top gifters, panel opens, sponsor clicks (use charts already available in dashboard components).

## 7. Payments, Fees, And Receipts
- Use Stripe Checkout for one-off gifts, callouts, Spoil Me contributions; Stripe Subscriptions for tiers.
- Register BuyMeADrink platform fee; show creators net revenue after fees.
- Store Stripe intent/subscription IDs per order for reconciliation.
- Refunds initiated by admin; reflect status and adjust leaderboards.
- Send receipts via Resend (Convex function) with summary and share link; include Spoil Me certificate link when relevant.

## 8. Content & Compliance Rules
- Dashboard must include checkbox confirming media rights supplied by creator.
- Run profanity filter on messages, handles, video filenames before showing live.
- Provide toggle for creators to hide legal name and use handle-only.
- Accessibility: keyboard navigation through panel, alt text and captions support.
- GDPR: export account data (JSON/CSV) and delete on request.

## 9. Data Model Reference
- Follow Convex schema for: `users`, `creators`, `gifts`, `orders`, `tiers`, `subscriptions`, `callouts`, `bookings`, `spoilItems`, `contributions`, `posts`, `leaderboards`.
- Keep timestamps, currency codes, Stripe references, moderation status flags, sponsor click stats.
- Store certificates as Convex storage files referenced by `certificateId`.

## 10. Admin & Ops Essentials
- Global admin portal: remove content, refund, ban users, verify creators, edit sponsor slots.
- Abuse workflow: report ➜ review ➜ action (remove/ban/refund) with audit log.
- Monitoring: Stripe webhook status, email delivery stats, Convex function errors, panel load metrics.

## 11. Non-Functional Targets
- Panel load under 2 seconds on 4G, first tap response under 100ms.
- Availability target 99.5% monthly.
- `/c/<handle>` pages indexable; panel iframe set to `noindex`.
- Track logo click-through rate, panel open rate, purchases, subscriptions, sponsor clicks.
- Sharing: Provide WhatsApp/text deep link on thank-you screens and in social row.

## 12. Deliverables Checklist
- Embeddable script + iframe panel + `/c/<handle>` page.
- Dashboard screens for onboarding, content management, moderation, insights.
- Stripe + Connect integration, Resend receipts, Spoil Me certificate flow.
- Before/after mockups for UFC, NBA, NFL, WWE sample pages.
- Basic analytics dashboard and admin controls.
- Documentation for embedding instructions and API keys.

## 13. Out Of Scope For MVP
- Native mobile apps.
- Multi-language localisation.
- Advanced AI content or automated moderation beyond profanity filter.
- Non-Stripe payment methods.

---
- Keep language friendly and buttons clear.
- Default to safe fallbacks when data is missing.
- Run `npm run typecheck` after new routes to keep generated types current.

