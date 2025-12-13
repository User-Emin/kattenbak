"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Component - DRY Principle
 * Reusable card with consistent styling
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card",
        hover && "transition-shadow hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0 flex items-center", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-2", className)} {...props}>
      {children}
    </p>
  );
}


