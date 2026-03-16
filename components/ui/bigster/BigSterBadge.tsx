import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const bigsterBadgeVariants = cva("bigster-badge", {
  variants: {
    variant: {
      default: "bg-bigster-primary text-bigster-primary-text",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-bigster-border",
      success: "bg-green-400/20 text-green-600 border-green-400/30",
      warning: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
      danger: "bg-red-400/20 text-red-600 border-red-400/30",
      info: "bg-blue-400/20 text-blue-600 border-blue-400/30",
    },
    size: {
      default: "px-2.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface BigSterBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bigsterBadgeVariants> {}

function BigSterBadge({
  className,
  variant,
  size,
  ...props
}: BigSterBadgeProps) {
  return (
    <div
      className={cn(bigsterBadgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { BigSterBadge, bigsterBadgeVariants };
