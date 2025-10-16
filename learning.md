# 📚 Learning: Clerk `getAuth()` Error in Loader

This document explains an error encountered with Clerk authentication and how it was resolved.

## 🚨 The Issue: Clerk `getAuth()` Error

When navigating to the `/creatordashboard` route, an error message from Clerk appeared:

*   **Error Message:** "Clerk: You're calling 'getAuth()' from a loader, without providing the loader args object."
*   **What it means (simple language):** Your app was trying to get user information (`getAuth()`) inside a special function called a "loader" (which helps prepare data for a page). However, it forgot to give `getAuth()` the necessary "arguments" (extra information) that the loader received. Clerk needs these arguments to properly figure out who the user is when the page is being built on the server.
*   **Why it happened:** The `getAuth()` function needs to know about the current request context (like headers, cookies, etc.) to work correctly in a server-side rendering (SSR) environment. This context is usually passed to the loader function as `args`.

## 🛠️ How We Resolved It

The fix involved updating the `loader` function in `app/routes/creatordashboard.tsx` to correctly pass the `args` object to `getAuth()`.

*   **Original Code (simplified):**
    ```typescript
    export async function loader() {
      const { userId } = await getAuth(); // Missing args here!
      // ... rest of your loader logic
    }
    ```

*   **Resolution Steps:**
    1.  **Modified the `loader` function signature:** We ensured the `loader` function accepted `args: Route.LoaderArgs` as a parameter.
    2.  **Passed `args` to `getAuth()`:** We updated the call to `getAuth()` to include the `args` object.

*   **Corrected Code (simplified):**
    ```typescript
    export async function loader(args: Route.LoaderArgs) {
      const { userId } = await getAuth(args); // Now passing args!
      // ... rest of your loader logic
    }
    ```

By making this change, `getAuth()` received the necessary context, allowing Clerk to correctly identify the user during server-side rendering and resolve the authentication error.

---

# 📚 Learning: Convex Authentication Setup Issues

This document explains the authentication issues we encountered when setting up Convex with Clerk and how they were resolved.

## 🚨 The Problem: Onboarding Stuck on "Creating Profile..."

The user onboarding process was getting stuck when trying to create a creator profile. The "Complete Setup" button would show "Creating Profile..." but never complete.

## 🔍 Root Cause Analysis

The issue had multiple layers:

### 1. Missing Clerk User ID in Creator Table
- **What happened:** The old creator profile existed but had no `userId` field
- **Why this mattered:** Convex needs to link creator profiles to Clerk user accounts
- **Solution:** Delete the old profile and create a new one with proper linking

### 2. Missing Clerk Environment Variables
- **What happened:** The app was missing `VITE_CLERK_FRONTEND_API_URL` and `CLERK_JWT_ISSUER`
- **Why this mattered:** Convex needs these to validate JWT tokens from Clerk
- **Solution:** Add the missing environment variables to `.env.local`

### 3. Missing Environment Variables in Convex Cloud
- **What happened:** Environment variables were only in local `.env.local` file
- **Why this mattered:** Convex deployments run in the cloud and need their own environment variables
- **Solution:** Add the same environment variables to Convex dashboard settings

### 4. Incorrect Auth Configuration
- **What happened:** Created an `auth.config.ts` file that caused cyclic import errors
- **Why this mattered:** Convex couldn't deploy properly with broken imports
- **Solution:** Remove the auth config file (not needed for this setup)

## 🛠️ Step-by-Step Fix

1. **Delete old creator profile** from Convex database
2. **Add Clerk environment variables** to local `.env.local` file
3. **Add same environment variables** to Convex dashboard
4. **Remove broken auth config** file
5. **Redeploy Convex** functions
6. **Complete onboarding** - now works properly!

## 💡 Key Lesson

Convex needs environment variables in TWO places:
- Local development (`.env.local`)
- Cloud deployment (Convex dashboard)

Both must have the same values for authentication to work properly.

### Required Environment Variables:

**In `.env.local` file:**
```
VITE_CLERK_FRONTEND_API_URL=https://your-clerk-domain.clerk.accounts.dev
CLERK_JWT_ISSUER=https://your-clerk-domain.clerk.accounts.dev
```

**In Convex Dashboard:**
- Go to Settings → Environment Variables
- Add the same two variables with the same values
- `VITE_CLERK_FRONTEND_API_URL` = your Clerk domain URL
- `CLERK_JWT_ISSUER` = your Clerk domain URL