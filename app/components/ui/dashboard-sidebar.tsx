"use client";

import React, { useState } from "react";
import { BarChart3, Gift, User, ExternalLink, MoreHorizontal, LogOut, Settings, UserIcon } from "lucide-react";
import { SignedIn, useUser, SignOutButton } from "@clerk/react-router";
import { Badge } from "./badge";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  creator?: {
    handle: string;
    name: string;
    active: boolean;
  };
}

export function DashboardSidebar({ activeTab, onTabChange, creator }: DashboardSidebarProps) {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "content", label: "Gifts & Tiers", icon: Gift },
    { id: "revenue", label: "Revenue", icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      {/* Logo / Header */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2FD4BE] rounded-lg flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Creator Dashboard</h2>
            <p className="text-xs text-slate-400">Manage your profile and content</p>
          </div>
        </div>
        
        {/* Creator Status */}
        {creator && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-[#2FD4BE]/10 text-[#2FD4BE] text-xs">
                {creator.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <a 
              href={`/profile/${creator.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Profile
            </a>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left relative focus:outline-none focus:ring-0 focus:border-transparent ${
                isActive
                  ? "bg-[#1a1a1a] text-white"
                  : "text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#2FD4BE]"></div>
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#2a2a2a] relative">
        <SignedIn>
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#2FD4BE] rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                {user?.firstName || "Creator"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg hover:bg-[#1a1a1a] text-slate-400 hover:text-slate-200 transition-colors flex flex-col gap-1"
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>

          {/* Curved Dropdown Menu */}
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu */}
              <div className="absolute bottom-16 left-4 right-4 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
                {/* User Info Header */}
                <div className="p-4 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2FD4BE] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.firstName || "Creator"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-[#2a2a2a] transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Account
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-[#2a2a2a] transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="border-t border-[#2a2a2a] my-1" />
                  <SignOutButton>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-[#2a2a2a] transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </>
          )}
        </SignedIn>
      </div>
    </div>
  );
}

export default DashboardSidebar;
