// components/ui/SkeletonBlock.tsx
import React from "react";

/**
 * Renders a gray "skeleton" placeholder block, useful for loading states.
 * Example usage:
 *   <SkeletonBlock className="h-6 w-1/2 mb-2" />
 */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-300 dark:bg-gray-600 animate-pulse rounded ${className}`}
    />
  );
}
