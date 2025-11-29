"use client";

import * as React from "react";
import { X } from "@/components/ui/icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// Entity-specific theme configuration
export const entityThemes = {
  person: {
    gradient: "from-orange-500/20 via-pink-500/20 to-rose-500/20",
    accentGlow: "shadow-[0_0_40px_rgba(249,115,22,0.3)]",
    accentColor: "bg-orange-500",
    ringColor: "ring-orange-500/20",
  },
  gift: {
    gradient: "from-purple-500/20 via-fuchsia-500/20 to-pink-500/20",
    accentGlow: "shadow-[0_0_40px_rgba(168,85,247,0.3)]",
    accentColor: "bg-purple-500",
    ringColor: "ring-purple-500/20",
  },
  list: {
    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    accentGlow: "shadow-[0_0_40px_rgba(59,130,246,0.3)]",
    accentColor: "bg-blue-500",
    ringColor: "ring-blue-500/20",
  },
  occasion: {
    gradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    accentGlow: "shadow-[0_0_40px_rgba(245,158,11,0.3)]",
    accentColor: "bg-amber-500",
    ringColor: "ring-amber-500/20",
  },
} as const;

export type EntityType = keyof typeof entityThemes;

interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function EntityModal({
  open,
  onOpenChange,
  entityType,
  title,
  children,
  footer,
  size = "md",
}: EntityModalProps) {
  const theme = entityThemes[entityType];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Enhanced backdrop with entity-specific gradient */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "transition-all duration-300"
          )}
        >
          {/* Radial gradient background that shifts based on entity type */}
          <div
            className={cn(
              "absolute inset-0 opacity-40",
              "bg-gradient-radial from-center to-transparent",
              theme.gradient
            )}
            style={{
              background: `radial-gradient(circle at 50% 40%, var(--tw-gradient-stops))`,
            }}
          />
        </DialogPrimitive.Overlay>

        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]",
            "max-h-[90vh] sm:max-h-[85vh] overflow-y-auto",
            sizeClasses[size],
            "bg-white/95 backdrop-blur-xl",
            "rounded-3xl shadow-2xl",
            theme.ringColor,
            "ring-1 ring-inset",
            // Organic animations
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]",
            "duration-300 ease-out",
            // Subtle glow effect
            theme.accentGlow
          )}
        >
          {/* Decorative gradient bar at top */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 rounded-t-3xl",
              "bg-gradient-to-r",
              theme.gradient,
              "opacity-60"
            )}
          />

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-warm-200/50 px-6 py-5 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <DialogPrimitive.Title
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  "bg-gradient-to-br from-warm-900 via-warm-800 to-warm-700",
                  "bg-clip-text text-transparent"
                )}
              >
                {title}
              </DialogPrimitive.Title>

              <DialogPrimitive.Close
                className={cn(
                  "rounded-full p-2.5 transition-all duration-200",
                  "hover:bg-warm-100 hover:scale-110",
                  "focus:outline-none focus:ring-2 focus:ring-warm-400 focus:ring-offset-2",
                  "active:scale-95",
                  "min-h-[44px] min-w-[44px] flex items-center justify-center",
                  "group"
                )}
                aria-label="Close"
              >
                <X
                  className={cn(
                    "h-5 w-5 text-warm-600",
                    "group-hover:text-warm-900 transition-colors"
                  )}
                />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Content with staggered fade-in animation */}
          <div
            className={cn(
              "px-6 py-6",
              "animate-in fade-in-0 slide-in-from-bottom-4",
              "duration-400 ease-out",
              // Delay for stagger effect
              "[animation-delay:100ms]"
            )}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={cn(
                "sticky bottom-0 bg-white/80 backdrop-blur-lg",
                "border-t border-warm-200/50 px-6 py-4 rounded-b-3xl",
                "animate-in fade-in-0 slide-in-from-bottom-4",
                "duration-400 ease-out",
                // Delay for stagger effect
                "[animation-delay:200ms]"
              )}
            >
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Hook for managing modal state with entity type
export function useEntityModal(entityType: EntityType) {
  const [open, setOpen] = React.useState(false);
  const [entityId, setEntityId] = React.useState<string | null>(null);

  const openModal = React.useCallback((id: string) => {
    setEntityId(id);
    setOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setOpen(false);
    // Clear entity ID after animation completes
    setTimeout(() => setEntityId(null), 300);
  }, []);

  return {
    open,
    entityId,
    openModal,
    closeModal,
    setOpen,
  };
}
