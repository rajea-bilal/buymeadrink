import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatisticItem {
  value: string;
  label: string;
  color?: "green" | "purple" | "pink" | "blue" | "orange";
}

interface ContactItem {
  icon: LucideIcon;
  value: string;
  color?: "green" | "purple" | "pink" | "blue" | "orange";
}

interface InfoCardProps {
  icon?: LucideIcon;
  categoryLabel?: string;
  title: string;
  description?: string;
  statistics?: StatisticItem[];
  contacts?: ContactItem[];
  className?: string;
}

const colorVariants = {
  green: "text-emerald-400",
  purple: "text-purple-400", 
  pink: "text-pink-400",
  blue: "text-blue-400",
  orange: "text-orange-400"
};

export function InfoCard({
  icon: Icon,
  categoryLabel,
  title,
  description,
  statistics = [],
  contacts = [],
  className
}: InfoCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-[#2a2a2a] border border-[#3a3a3a]",
        "p-6 md:p-8 transition-all duration-300",
        "hover:border-[#4a4a4a]",
        className
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        {/* Header Section */}
        {(Icon || categoryLabel) && (
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center">
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
            )}
            {categoryLabel && (
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                {categoryLabel}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {title}
          </h2>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-300 leading-relaxed">
            {description}
          </p>
        )}

        {/* Statistics Section */}
        {statistics.length > 0 && (
          <div className="flex flex-wrap gap-6 pt-4">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={cn(
                  "text-2xl md:text-3xl font-bold",
                  stat.color ? colorVariants[stat.color] : "text-emerald-400"
                )}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {contacts.length > 0 && (statistics.length > 0 || description) && (
          <div className="border-t border-gray-700/50" />
        )}

        {/* Contact Section */}
        {contacts.length > 0 && (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-3">
                <contact.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  contact.color ? colorVariants[contact.color] : "text-emerald-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  contact.color ? colorVariants[contact.color] : "text-emerald-400"
                )}>
                  {contact.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}