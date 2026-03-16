import * as React from "react";
import { cn } from "@/lib/utils";

const BigSterCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bigster-card", className)} {...props} />
));
BigSterCard.displayName = "BigSterCard";

const BigSterCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
BigSterCardHeader.displayName = "BigSterCardHeader";

const BigSterCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-bigster-text",
      className
    )}
    {...props}
  />
));
BigSterCardTitle.displayName = "BigSterCardTitle";

const BigSterCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-bigster-text-muted", className)}
    {...props}
  />
));
BigSterCardDescription.displayName = "BigSterCardDescription";

const BigSterCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
BigSterCardContent.displayName = "BigSterCardContent";

const BigSterCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
BigSterCardFooter.displayName = "BigSterCardFooter";

export {
  BigSterCard,
  BigSterCardHeader,
  BigSterCardFooter,
  BigSterCardTitle,
  BigSterCardDescription,
  BigSterCardContent,
};
