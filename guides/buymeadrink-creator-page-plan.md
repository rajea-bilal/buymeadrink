# BuyMeADrink Creator Page Implementation Plan

## Goal
Ship the `/c/:handle` creator profile page first, using mock data, so the same layout can power the later overlay panel.

## Route Setup
- Update `app/routes.ts` with `route("c/:handle", "routes/creator-profile.tsx")`.
- Create `app/routes/creator-profile.tsx`; import `type Route` from `./+types/creator-profile`.
- Loader returns a mock creator payload with hero data, sponsors, socials, posts, gifts, tiers, callouts, Spoil Me items, and leaderboard entries.
- Keep data typed inline using TypeScript interfaces; replace with Convex queries in later milestones.

## Layout Skeleton
- Wrap content in `<main className="min-h-screen bg-slate-950 text-white">` with `container mx-auto px-4 py-8` sections.
- Section order: Hero → Sponsors band → Social row → Latest posts carousel → Gifts grid → Monthly tiers → Callouts → Spoil Me → Leaderboards.
- Use existing shadcn UI primitives (`Button`, `Card`, `Tabs`, etc.) and Tailwind utilities.
- Ensure responsive design (mobile first, breakpoints at `md`, `lg`).

## Hero & Sponsors
- Hero: background image overlay, avatar, name, tagline, primary CTA (`Support now`) and secondary CTA (`Share profile`).
- Sponsor band: grid with six tiles (3 per row on desktop) linking out to sponsor URLs; include hover states and optional tracking hook.

## Social Link Row
- Horizontal icon buttons for Instagram, X, YouTube, TikTok, Facebook, Twitch, custom link.
- Add a `Share all links` button that stubs `navigator.share` or copies a prefilled message.
- Make row keyboard navigable and support wrapping on mobile.

## Latest Posts Carousel
- MVP: horizontal scroll list with left/right buttons and dot indicators; items show platform badge, thumbnail, timestamp, and external link.
- Mark carousel container with `role="region"` and `aria-live="polite"` for accessibility.

## Gifts Section
- 4-column grid on desktop (2 on mobile) using `Card` components for each gift.
- Each card: media thumbnail, title, price, short description, quantity presets (buttons), message input placeholder, `Make this monthly` toggle (non-functional).
- Adjacent sidebar (desktop) or stacked section (mobile) that lists three mock recent purchases.

## Monthly Support Tiers
- Four cards (Bronze, Silver, Gold, Platinum) with price, perks list, and `Join tier` CTA.
- Highlight Platinum with badge or accent border; include notes about perks (call, exclusive buys, WhatsApp group).

## Callouts / Shout-outs
- Cards for `$250` video, `$999` call, `$20,000` after-win callout.
- Show duration, description, CTA, and flag after-win option with caution note.

## Spoil Me Crowdfunds
- Card list with item image, narrative, target amount, amount raised (mock), progress bar, and `Contribute` button.
- After payment copy placeholder referencing digital certificate delivery.

## Leaderboards
- Use `Tabs` to switch between `Week`, `Month`, `All time` leaderboards.
- Each tab shows a list/table with rank, avatar initials, display name/@handle, and total contributed.

## Accessibility & Responsiveness
- Use semantic section headings (`<section>`, `<h2>`) with visually hidden labels where needed.
- Ensure focus states, aria labels for controls, keyboard navigation for carousels and tabs.
- Test on 320px width for stacking order and spacing.

## Type Safety & Housekeeping
- After adding the route, run `npm run typecheck` to generate the `./+types/creator-profile` file.
- Keep mock data in the loader for now; document where Convex integration will slot in later.


