"use client";

import React from "react";

/**
 * Skeleton Loader Component
 * Professional loading states
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className || ""}`}
      {...props}
    />
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="w-full h-64" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}


