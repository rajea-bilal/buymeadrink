import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "./ui/button";

interface CompletionStatus {
  profileSetup: boolean;
  firstGift: boolean;
  socialLinks: boolean;
  supportTiers: boolean;
}

interface SetupChecklistProps {
  completionStatus: CompletionStatus;
  onClose: () => void;
  onCompleteSetup: () => void;
  onNavigateTab?: (tab: string, section?: string) => void;
}

export function SetupChecklist({
  completionStatus,
  onClose,
  onCompleteSetup,
  onNavigateTab,
}: SetupChecklistProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const items = [
    { id: "profile", label: "Profile Setup", completed: completionStatus.profileSetup },
    { id: "gift", label: "First Gift", completed: completionStatus.firstGift },
    { id: "social", label: "Add Social Links", completed: completionStatus.socialLinks },
    { id: "tiers", label: "Create Support Tiers", completed: completionStatus.supportTiers },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Hide if all completed
  if (completedCount === totalCount) {
    return null;
  }

  const handleNavigate = (sectionId: string) => {
    // Navigate to the appropriate section
    switch (sectionId) {
      case "profile":
        // Profile section - switch to profile tab
        onNavigateTab?.("profile");
        break;
      case "gift":
        // First gift - trigger onboarding flow
        onCompleteSetup();
        break;
      case "social":
        // Social links - switch to profile tab
        onNavigateTab?.("profile", "social");
        onClose();
        break;
      case "tiers":
        // Tiers - switch to content tab
        onNavigateTab?.("content", "tiers");
        onClose();
        break;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg shadow-lg z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <div>
          <p className="text-xs text-gray-500">Step {completedCount} of {totalCount}</p>
          <h3 className="text-sm font-semibold text-white">Finish setting up your profile</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-3">
          {/* Checklist Items */}
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    item.completed
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-[#2a2a2a]"
                  }`}
                >
                  {item.completed && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    item.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-300"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleNavigate(item.id)}
                  className="text-xs h-7 px-2 text-emerald-400 hover:bg-emerald-500/10"
                >
                  Go
                </Button>
              )}
            </div>
          ))}

          {/* Progress Bar */}
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-400">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
