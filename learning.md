# How to Fix SSR "Component is not a function" Errors

## The Problem
When you use shadcn/ui components or Lucide icons in React Router v7, you get this error:
```
Component is not a function
ReferenceError: Component is not defined
```

This happens because these components try to run on the server during SSR, but they're meant for the browser only.

## The Simple Solution

### Step 1: Create a ClientOnly wrapper
```tsx
// app/components/ClientOnly.tsx
"use client";
import { useState, useEffect } from "react";

export function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return children;
}
```

### Step 2: Put your components in separate files with "use client"
```tsx
// app/components/ShareButton.tsx
"use client";
import { Share2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ShareButton() {
  return (
    <Button>
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}
```

### Step 3: Wrap them in your routes
```tsx
// app/routes/profile.tsx
import { ClientOnly } from "~/components/ClientOnly";
import { ShareButton } from "~/components/ShareButton";

export default function Profile() {
  return (
    <div>
      <h1>My Profile</h1>
      
      <ClientOnly fallback={<div className="h-10 bg-gray-200 rounded animate-pulse" />}>
        <ShareButton />
      </ClientOnly>
    </div>
  );
}
```

## Why This Works

1. **Server renders the fallback** - Shows instantly, no errors
2. **Client mounts the real component** - After page loads
3. **"use client" marks the boundary** - Tells React "this is browser-only"
4. **Clean separation** - Server code vs client code is obvious

## Quick Rules

- ✅ **DO**: Put ANY interactive component in its own file with `"use client"`
- ✅ **DO**: Wrap it with `<ClientOnly>` in your routes
- ✅ **DO**: Provide a `fallback` that looks similar
- ❌ **DON'T**: Import shadcn/Lucide directly in route files
- ❌ **DON'T**: Use `useState`/`useEffect` in route components

## Examples

### Good ✅
```tsx
// Separate file with "use client"
"use client";
export function MyTabs() {
  return <Tabs>...</Tabs>;
}

// In route
<ClientOnly fallback={<div className="h-40" />}>
  <MyTabs />
</ClientOnly>
```

### Bad ❌
```tsx
// Direct import in route file
import { Tabs } from "~/components/ui/tabs"; // This breaks SSR

export default function MyRoute() {
  return <Tabs>...</Tabs>; // Error!
}
```

---

# How to Build Interactive Components (Tabs, Accordions, etc.)

## The Problem
You want to build components with:
- **Click interactions** (tabs, accordions, dropdowns)
- **State management** (open/closed, active tab)
- **Complex UI libraries** (shadcn tabs, buttons, icons)

But you get SSR errors when you try to add `useState`, `onClick`, or import interactive components.

## The Error You See
```
Hydration failed because the initial UI does not match
Component is not a function
useState/useEffect is not defined
```

## The Simple Solution

### Step 1: Create your interactive component with "use client"
```tsx
// app/components/ProfileTabs.tsx
"use client";
import { useState } from "react";
import { ChevronDown, Gift } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ProfileTabs({ data }) {
  const [activeTab, setActiveTab] = useState(null);

  const tabs = [
    { id: "gifts", label: "Gifts", icon: Gift, count: data.gifts.length },
    // ... more tabs
  ];

  return (
    <div>
      {/* Navigation */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <Button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id === activeTab ? null : tab.id)}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label} ({tab.count})
            <ChevronDown className={activeTab === tab.id ? "rotate-180" : ""} />
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "gifts" && (
        <div className="grid grid-cols-4 gap-4">
          {data.gifts.map(gift => (
            <div key={gift.id} className="p-4 border rounded">
              <h4>{gift.title}</h4>
              <p>${gift.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 2: Wrap it in your route with ClientOnly
```tsx
// app/routes/profile.tsx
import { ClientOnly } from "~/components/ClientOnly";
import { ProfileTabs } from "~/components/ProfileTabs";

export default function Profile({ loaderData }) {
  return (
    <div>
      <h1>Profile</h1>
      
      <ClientOnly fallback={
        <div className="p-6 bg-gray-100 animate-pulse">
          <div className="flex gap-4 mb-4">
            {[1,2,3].map(i => <div key={i} className="h-10 w-20 bg-gray-200 rounded" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      }>
        <ProfileTabs data={loaderData} />
      </ClientOnly>
    </div>
  );
}
```

## Why This Works

1. **"use client" = interactive boundary** - Everything inside can use state, clicks, etc.
2. **ClientOnly prevents SSR conflicts** - Server shows fallback, client shows real component
3. **All interactions work perfectly** - useState, onClick, animations, everything
4. **Clean separation** - Route stays server-side, interactions stay client-side

## Key Rules for Interactive Components

- ✅ **DO**: Put ALL interactive logic in separate files with `"use client"`
- ✅ **DO**: Use useState, useEffect, onClick freely in these files
- ✅ **DO**: Import any UI library (shadcn, Lucide, etc.) in these files
- ✅ **DO**: Wrap with ClientOnly in your routes
- ✅ **DO**: Provide a similar-looking fallback for loading
- ❌ **DON'T**: Add useState or onClick directly in route files
- ❌ **DON'T**: Import interactive components directly in routes

## Real Example Pattern
```tsx
// ✅ Good: Interactive component in separate file
"use client";
export function MyTabs() {
  const [active, setActive] = useState("tab1");
  return <Tabs>...</Tabs>; // Works perfectly!
}

// ✅ Good: Use in route with wrapper
<ClientOnly fallback={<LoadingSkeleton />}>
  <MyTabs />
</ClientOnly>

// ❌ Bad: Interactive logic in route
export default function MyRoute() {
  const [active, setActive] = useState("tab1"); // SSR ERROR!
  return <Tabs>...</Tabs>; // BREAKS!
}
```

## The End
This pattern works for ANY React component that has SSR issues. Just remember: separate files + "use client" + ClientOnly wrapper = no more errors.