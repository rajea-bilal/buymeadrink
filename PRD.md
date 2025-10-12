# BuyMeADrink MVP Product Requirements (Simplified)

## 1. Overview

**What is it?**
A simple web platform where fans can buy gifts or monthly support plans for their favourite public figures (starting with UFC fighters).

**Who is it for?**

* **Creators/Fighters** who want to earn directly from their fans
* **Fans** who want to support, feel closer to, or be recognised by the creators they admire

**Why it matters:**

* Easy way for creators to make money without brand deals
* Simple way for fans to show support and feel seen

## 2. Key Goals (What success looks like)

* Get first 10 UFC fighters onboarded
* 100+ fan gift purchases within first 3 months
* At least 50 monthly supporters across all creators
* Fan-to-creator gifting flow takes less than 60 seconds
* Creators earn £1,000+ in first month

## 3. Pages & Routes

### Creator Profile Page

**Route:** `/profile/:handle`

* Public-facing page where fans support their favourite creator

### Creator Dashboard (Basic)

**Route:** `/dashboard`

* Simple dashboard to manage profile, prices, links, and payouts

## 4. Features

### 4.1 Gifts (One-off support)

**Purpose:** Fans buy gifts (e.g. drinks) and leave a short message

**Fan flow:**

1. Pick a gift (e.g. “Buy a Drink”)
2. Choose quantity (1, 3, 5, or custom)
3. Enter name/@handle + message
4. Checkout with Stripe
5. Get a confirmation email

**Creator flow:**

* See latest gifts on dashboard
* Receive funds via Stripe Connect

**Key Requirements:**

* Gift grid layout (4 per row)
* Stripe Checkout
* Email receipt to buyer & creator (via Resend)
* Gift message visible on profile (last 3 only)

### 4.2 Monthly Support Tiers

**Purpose:** Fans subscribe to monthly plans to support creators regularly

**Tier examples:**

| Tier   | Price | Perk                      |
| ------ | ----- | ------------------------- |
| Bronze | £8    | Monthly thank-you message |
| Silver | £20   | Access to private updates |
| Gold   | £50   | Name listed on profile    |

**Fan flow:**

1. Choose a tier
2. Subscribe via Stripe
3. See confirmation and perks

**Creator flow:**

* Set price and perks in dashboard
* View subscriber count

**Key Requirements:**

* Stripe Subscriptions integration
* Tier cards with descriptions
* Subscriber management in dashboard

### 4.3 Creator Profile Setup

**Fields:**

* Profile picture
* Banner image
* Short bio (max 500 chars)
* Social media links (max 8)

**Sponsor tiles**

* Upload logo, set URL

## 5. Payments (Stripe)

* Stripe Connect Express for creator payouts
* Stripe Checkout for gifts
* Stripe Subscriptions for monthly support
* Platform takes a small fee (via application fee)

**Emails via Resend:**

* Gift receipt
* Subscription confirmation
* Monthly payout summary

## 6. Basic Creator Dashboard

**Tabs:**

* Profile Setup
* Gifts & Tiers
* Revenue Overview

**Dashboard Shows:**

* Total earnings
* Latest supporters
* Tier subscriber count

## 7. Tech Stack

* **Frontend:** React + React Router v7
* **Backend:** Convex
* **Payments:** Stripe Connect + Checkout + Subscriptions
* **Emails:** Resend

## 8. MVP Timeline (6 weeks)

**Week 1-2:**

* Profile page layout
* Stripe Connect onboarding

**Week 3-4:**

* Gift purchase flow
* Email receipts
* Dashboard: Profile + Gifts

**Week 5-6:**

* Monthly support tiers
* Revenue dashboard
* Basic analytics (page views, gift purchases)

---

This MVP removes advanced features (leaderboards, shoutouts, Spoil Me, UFC APIs, etc.) and focuses only on:

* One-off gifts
* Monthly support tiers
* Stripe payments
* Creator dashboard

We can build the rest in Phase 2 once core value is proven.
