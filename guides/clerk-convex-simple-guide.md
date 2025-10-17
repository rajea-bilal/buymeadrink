# Clerk & Convex Connection - Simple Guide 🔐

## What is JWT? (Plain English)

**JWT = A Signed Message Proving Who You Are**

When you sign up on a website:
1. The authentication service (Clerk) creates a special message about you
2. This message includes: who you are, your email, when it expires
3. The service signs this message with a secret code so nobody can forge it
4. Your browser stores this message
5. Every time you make a request, you send this message to the backend
6. The backend checks: "Is this message real? Was it signed by Clerk?"
7. If yes, the backend trusts you and lets your request through

**That message is called a JWT.**

The JWT has three parts separated by dots:
```
Header.Payload.Signature
```

- **Header**: Says what algorithm was used to sign it
- **Payload**: Contains the actual data (your ID, email, name)
- **Signature**: Proof that it wasn't tampered with - only Clerk can create valid signatures

---

## The Simple Connection Flow 🔄

### **Step-by-Step: What Happens When You Sign Up**

```
YOUR BROWSER                 CLERK                          CONVEX
(Client)                     (Auth Service)                 (Backend)
    │                          │                               │
    │──1. Sign up ────────────>│                               │
    │   (email + password)     │                               │
    │                          │                               │
    │<─2. Here's your JWT──────│                               │
    │   (signed token)         │                               │
    │                          │                               │
    │──3. Make request ─────────────────────────────────────>│
    │   (JWT attached)         │                               │
    │                          │    4. Verify JWT signature    │
    │                          │<────────────────────────────────│
    │                          │                               │
    │                          │  5. Signature is valid        │
    │                          │─────────────────────────────>│
    │                          │                               │
    │<─────6. Request allowed──────────────────────────────│
```

---

## The Three Components 👥

### **1. Your Browser (The Client)**
- Stores your JWT in memory
- Automatically sends it with every request to the backend
- Can't modify or create JWTs (only Clerk can)

### **2. Clerk (The Authentication Service)**
- Takes your email and password when you sign up
- Verifies your identity
- Creates a JWT with your information
- Signs it with a secret key (the private key)

### **3. Convex (The Backend)**
- Receives requests with the JWT attached
- Verifies the JWT signature using Clerk's public key
- Checks: "Was this JWT created by Clerk?"
- If valid, runs your request
- If invalid, rejects the request

---

## How Clerk & Convex Communicate 🗣️

**They use environment variables as configuration.**

Your `.env.local` file tells Convex how to verify JWTs:

```bash
CLERK_JWT_ISSUER=https://square-wren-15.clerk.accounts.dev
```

**What this means:**

1. Convex sees a JWT in your request
2. Convex looks at the JWT and reads: "This was issued by square-wren-15.clerk.accounts.dev"
3. Convex checks the environment variable: "Is that the Clerk instance I should trust?"
4. If yes, Convex automatically gets Clerk's public key from that URL
5. Convex verifies the signature: "Does this JWT's signature match Clerk's public key?"
6. If the signature is valid, Convex knows you're authenticated

---

## What Does `convex/auth.config.ts` Do? 🔧

This configuration file tells Convex how to verify authentication tokens.

Here's what it does:

```typescript
// convex/auth.config.ts

// Step 1: Find the Clerk instance location from environment variables
function resolveClerkDomain(): string {
  // Look for the Clerk domain in our configuration
  const fromUrl = process.env.VITE_CLERK_FRONTEND_API_URL;
  const fromIssuer = process.env.CLERK_JWT_ISSUER;
  
  // Use whichever one is set, or use a default
  const domain = fromUrl || fromIssuer || "https://square-wren-15.clerk.accounts.dev";
  
  return domain;
}

// Step 2: Set up authentication verification
export default {
  providers: [
    {
      domain: resolveClerkDomain(),  // Where Clerk is located
      applicationID: "convex",        // For this specific application
    },
  ],
};
```

**What happens behind the scenes:**

1. **Reads configuration** - Gets the Clerk domain from environment variables
2. **Downloads Clerk's public keys** - Fetches and caches the keys needed to verify signatures
3. **Enables authentication checking** - Now Convex can verify JWTs
4. **Makes `ctx.auth.getUserIdentity()` work** - Convex functions can safely check who is making the request

---

## The Complete Process 📍

### **Scenario: You Sign Up and Create a Gift**

```
1. YOU SIGN UP
   ├─ Go to the sign-up page
   ├─ Enter your email and password
   └─ Click "Sign Up"

2. CLERK PROCESSES IT
   ├─ Receives your email and password
   ├─ Creates a user account in Clerk's database
   ├─ Creates a JWT token containing: your ID, email, name
   ├─ Signs the JWT with Clerk's private key
   └─ Sends the JWT to your browser

3. YOUR BROWSER STORES IT
   ├─ Receives the JWT from Clerk
   ├─ Stores it in memory
   └─ Automatically attaches it to future requests

4. YOU CREATE A GIFT
   ├─ On the dashboard, you click "Create Gift"
   ├─ Your browser sends a request to Convex
   ├─ The JWT is automatically included in the request
   └─ Request looks like: "Create this gift (here's my JWT)"

5. CONVEX RECEIVES REQUEST
   ├─ Gets the request with your JWT
   ├─ Reads auth.config.ts: "Who issued this JWT?"
   ├─ Sees it was issued by Clerk
   ├─ Uses Clerk's public key to verify the signature
   ├─ Checks: "Is the signature valid?"
   └─ If valid, trusts that you are who you claim

6. CONVEX PROCESSES REQUEST
   ├─ Runs ctx.auth.getUserIdentity()
   ├─ Gets: { subject: "user_2d8q1K", email: "you@email.com", name: "Your Name" }
   ├─ Knows this data came from Clerk and is trustworthy
   ├─ Creates the gift in the database
   └─ Returns success

7. YOU SEE YOUR GIFT
   └─ Dashboard shows your new gift ✅
```

---

## Environment Variables Explained 🔑

Each variable has a specific job:

```bash
# Tells Convex where to find Clerk for JWT verification
CLERK_JWT_ISSUER=https://square-wren-15.clerk.accounts.dev
   └─ Read by: convex/auth.config.ts
   └─ Purpose: Tells Convex where Clerk is located
   └─ How it works: Convex fetches Clerk's public keys from this URL to verify signatures

# Secret password for Convex to authenticate with Clerk (optional)
CLERK_SECRET_KEY=sk_test_LJ7BctplQbHPkO3k2naK9HX6LWKfzQlIMlTQmOw4rQ
   └─ Read by: Convex backend
   └─ Purpose: Allows backend to call Clerk's admin API
   └─ How it works: Used if you need to manage Clerk users from Convex

# Tells your browser how to connect to Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c3F1YXJlLXdyZW4tMTUuY2xlcmsuYWNjb3VudHMuZGV2JA
   └─ Read by: Frontend (React components)
   └─ Purpose: Used by Clerk's sign-up/sign-in components
   └─ How it works: Allows your browser to show Clerk's authentication UI

# Tells your browser where Clerk is located
VITE_CLERK_FRONTEND_API_URL=https://square-wren-15.clerk.accounts.dev
   └─ Read by: Frontend
   └─ Purpose: URL for browser to contact Clerk
   └─ How it works: Used by Clerk components to connect to the auth service
```

---

## How Your Convex Functions Work 🔍

Once authentication is set up, your Convex functions can safely access user information:

```typescript
// In any Convex function (query, mutation, action):

export const createGift = mutation({
  handler: async (ctx, args) => {
    // Get the authenticated user's information
    const identity = await ctx.auth.getUserIdentity();
    
    // If no one is logged in, reject the request
    if (!identity) {
      throw new Error("You must be logged in to create a gift");
    }
    
    // Now we know who is making this request:
    // - identity.subject: The user's Clerk ID (e.g., "user_2d8q1K")
    // - identity.email: The user's email
    // - identity.name: The user's name
    
    // We can safely save the gift
    await ctx.db.insert("gifts", {
      creatorId: args.creatorId,
      userClerkId: identity.subject,  // Use the authenticated user's ID
      title: args.title,
      price: args.price,
      // ... other fields
    });
  }
});
```

**Key point:** By the time your function runs, Convex has already verified the JWT. You can be 100% sure that `ctx.auth.getUserIdentity()` returns real, trusted data. ✅

---

## Why Signature Verification Matters 🛡️

**Without verification:**
- ❌ Anyone could create a fake JWT claiming to be anyone
- ❌ Someone could delete your data by pretending to be you
- ❌ Data would have no security

**With signature verification:**
- ✅ Only Clerk can create valid JWTs (they have the secret private key)
- ✅ Convex checks every JWT against Clerk's public key
- ✅ Fake JWTs will fail verification and be rejected
- ✅ Your data is safe and private

---

## Summary

| Component | What It Does | Why It Matters |
|-----------|------------|----------------|
| **Clerk** | Creates signed JWTs when you log in | You get authenticated |
| **JWT** | A signed message proving who you are | You don't need to log in with every request |
| **Your Browser** | Stores JWT and sends it with requests | Server knows who you are without asking for password |
| **auth.config.ts** | Tells Convex how to verify JWTs | Convex knows which JWTs to trust |
| **Convex** | Verifies JWT signatures and checks authentication | Safely runs functions only for authenticated users |
| **ctx.auth.getUserIdentity()** | Gets the authenticated user's data | Your functions can safely access user info |

---

## Next Steps

1. ✅ You have `.env.local` with Clerk credentials
2. ✅ `auth.config.ts` reads them and sets up verification
3. ✅ Your app is ready to use
4. Try signing up → Your JWT will be created automatically
5. Try creating a gift → Convex will verify your JWT and let you proceed ✨

The authentication system is working behind the scenes automatically! 🚀
