// components/RecentAnalysisCardSkeleton.tsx
import React from "react";

export function RecentAnalysisCardSkeleton() {
  return (
    <div className="border p-4 rounded animate-pulse">
      {/* Skeleton for the image using h-64 */}
      <div className="h-64 w-full bg-gray-300 rounded mb-2" />
      {/* Skeleton for the title */}
      <div className="h-6 w-3/4 bg-gray-300 rounded" />
    </div>
  );
}
