# Build Log (2-line summaries)

- Added Social Links (backend + UI). Creators can add/remove links with toasts; one link per platform enforced.
- Pressing Enter in the Social Link URL field now adds the link. Success/error use toasts instead of alerts.
- Onboarding flow scaffolded at /onboard (profile + first gift). Completion redirects to dashboard.
- Dashboard shows completion checklist and links to onboarding. Home loader fixed to use convex/browser.
- Dashboard now uses authenticated Convex query (getAuthenticatedCreatorDashboard). Auth via ctx.auth.getUserIdentity() gates access; only creator's own data loads. Client-side fetch with useQuery replaces server loader.
- Support tiers fully functional: createTier, updateTier, deleteTier mutations with auth checks. Edit/delete UI wired up with toast notifications for success/errors. Onboard types fixed (Route.LoaderArgs).
- Profile editing now saves: updateCreatorProfile mutation with auth; no creatorId needed. Toast success/error on save. Empty name validation enforced.
- Social links with client validation: validateSocialUrl helper checks URL format and platform-specific domains. createSocialLink/deleteSocialLink now auth-gated; proper toasts on success/error.
- Onboarding uses real userId from Clerk (user.id). Auto-redirects to /creatordashboard after 1.5s delay. Toast on success/error; no more alerts.
- Cleanup complete: typecheck passes with zero errors. All alerts replaced with toasts (gift/tier forms). Error boundaries handled by root.tsx default. Confirm dialogs use window.confirm for simplicity.

Note: After each change, append a new two-line summary here.


