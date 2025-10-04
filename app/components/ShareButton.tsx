"use client";
import { Share2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ShareButton() {
  return (
    <Button variant="outline" size="sm" className="border-[#2a2a2a] text-slate-200 hover:bg-[#2a2a2a] hover:text-white">
      <Share2 className="w-4 h-4 mr-2" />
      Share Profile
    </Button>
  );
}