import React from "react";
import { OptimizedLogo } from "../ui/optimized-image";

export default function Polar(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <OptimizedLogo src="/polar.svg" alt="Polar Logo" className="h-8 w-auto" {...props} />
  );
}
