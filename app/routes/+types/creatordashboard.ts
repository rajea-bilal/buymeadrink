export interface LoaderArgs {
  request: Request;
  params: Record<string, string>;
}

export interface ComponentProps {
  loaderData: {
    creator: {
      _id: string;
      handle: string;
      name: string;
      tagline?: string;
      bio?: string;
      avatar?: string;
      banner?: string;
      active?: boolean;
    };
    gifts: Array<{
      _id: string;
      title: string;
      description: string;
      price: number;
      currency: string;
      media: string;
      type: "clip" | "image" | "item";
      active: boolean;
    }>;
    tiers: Array<{
      _id: string;
      name: string;
      price: number;
      currency: string;
      perks: string[];
      description?: string;
      highlighted?: boolean;
      active: boolean;
    }>;
  };
}

export interface Route {
  LoaderArgs: LoaderArgs;
  ComponentProps: ComponentProps;
}