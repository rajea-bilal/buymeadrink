import React from "react";
import { OptimizedLogo } from "../ui/optimized-image";

export default function ClerkLogo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <OptimizedLogo src="/clerk.svg" alt="Clerk logo" className="h-8 !w-auto" {...props} />
  );
} 