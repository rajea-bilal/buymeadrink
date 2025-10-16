export interface SponsorTier {
  id: string;
  name: string;
  logo: string;
  headline: string;
  description: string;
  price: string;
  url: string;
  isSponsored: true;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "sponsor-mcdonalds",
    name: "McDonald's",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
    headline: "Buy a McDonald's for your favorite fighter",
    description: "Send a McDonald's meal to celebrate your fighter's victory. Every purchase supports the creator.",
    price: "$10 - McDonald's Meal",
    url: "https://www.mcdonalds.com",
    isSponsored: true,
  },
  {
    id: "sponsor-kfc",
    name: "KFC",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b7/KFC_logo.png",
    headline: "Order KFC to support the champ",
    description: "Grab a KFC bucket and help fuel your fighter. A portion of proceeds supports the creator.",
    price: "$15 - KFC Family Box",
    url: "https://www.kfc.com",
    isSponsored: true,
  },
  {
    id: "sponsor-costa",
    name: "Costa Coffee",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Costa_Coffee_Logo.svg",
    headline: "Get Costa Coffee delivered to ringside",
    description: "Keep your favorite fighter energized with Costa Coffee. Support creators with every order.",
    price: "$5 - Costa Coffee",
    url: "https://www.costacoffee.com",
    isSponsored: true,
  },
  {
    id: "sponsor-redbull",
    name: "Red Bull",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/e0/Red_Bull_logo.svg",
    headline: "Power up your fighter with Red Bull",
    description: "Give your fighter the wings they need. Energy drinks for champions, supporting creators.",
    price: "$8 - Red Bull Energy Drink",
    url: "https://www.redbull.com",
    isSponsored: true,
  },
];
