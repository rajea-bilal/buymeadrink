import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";

interface PremiumCardProps {
  backgroundImage?: string;
  icon?: LucideIcon;
  category?: string;
  title: string;
  description: string;
  leftInfo?: {
    label: string;
    value: string;
  };
  rightInfo?: {
    label: string;
    value: string;
  };
  teamMembers?: string[];
  teamName?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PremiumCard({
  backgroundImage,
  icon: Icon,
  category,
  title,
  description,
  leftInfo,
  rightInfo,
  teamMembers = [],
  teamName,
  actionLabel = "View Details",
  onAction,
  onDismiss,
  className,
  children
}: PremiumCardProps) {
  return (
    <article className={cn(
      "group relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl",
      "transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl",
      "min-h-[400px]",
      className
    )}>
      {/* Background Image */}
      {backgroundImage && (
        <img 
          src={backgroundImage} 
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
      
      {/* Dismiss Button */}
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-black/40 hover:rotate-90 transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Category Badge */}
      {(Icon || category) && (
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
          {Icon && (
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {category && (
            <span className="text-xs font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              {category}
            </span>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 min-h-[400px]">
        {/* Top Info Section */}
        {(leftInfo || rightInfo) && (
          <div className="flex justify-between items-start text-sm font-medium mb-auto pt-16">
            {leftInfo && (
              <div className="space-y-1">
                <span className="block text-white/70">{leftInfo.label}</span>
                <span className="block font-semibold">{leftInfo.value}</span>
              </div>
            )}
            {rightInfo && (
              <div className="space-y-1 text-right">
                <span className="block text-white/70">{rightInfo.label}</span>
                <span className="block font-semibold">{rightInfo.value}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className="mt-auto">
          <h3 className="text-3xl md:text-4xl leading-tight tracking-tight mb-4 font-bold">
            {title}
          </h3>
          <p className="text-sm text-white/80 mb-6 max-w-sm">
            {description}
          </p>
          
          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            {/* Team Info */}
            {(teamMembers.length > 0 || teamName) && (
              <div className="flex items-center space-x-3">
                {teamMembers.length > 0 && (
                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 2).map((member, index) => (
                      <img 
                        key={index}
                        src={member} 
                        className="w-6 h-6 rounded-full border-2 border-white/20 object-cover" 
                        alt=""
                      />
                    ))}
                  </div>
                )}
                {teamName && (
                  <span className="text-xs text-white/70">{teamName}</span>
                )}
              </div>
            )}
            
            {/* Action Button */}
            {onAction && (
              <button 
                onClick={onAction}
                className="flex items-center space-x-2 text-sm hover:text-white/80 transition-colors"
              >
                <span>{actionLabel}</span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 12h14m-7-7l7 7-7 7" 
                  />
                </svg>
              </button>
            )}
          </div>
          
          {/* Custom Children */}
          {children}
        </div>
      </div>
    </article>
  );
}