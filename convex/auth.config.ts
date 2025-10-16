function resolveClerkDomain(): string {
  const fromUrl = process.env.VITE_CLERK_FRONTEND_API_URL; // preferred (full https URL)
  const fromIssuer = process.env.CLERK_JWT_ISSUER; // alternative full https issuer
  const domain = fromUrl || fromIssuer || "https://square-wren-15.clerk.accounts.dev";
  console.log("🔧 Convex Auth Config - Using Clerk domain:", domain);
  return domain;
}

export default {
  providers: [
    {
      domain: resolveClerkDomain(),
      applicationID: "convex",
    },
  ],
};