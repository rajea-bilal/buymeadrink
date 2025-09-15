import React from "react";
import { OptimizedLogo } from "../ui/optimized-image";

export default function Resend(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <OptimizedLogo src="/resend-icon-black.svg" alt="Resend logo" className="h-8 w-auto" {...props} />
  );
} 