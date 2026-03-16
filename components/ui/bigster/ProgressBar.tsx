import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  colorClass?: string;
  textClass?: string;
  className?: string;
}

export function ProgressBar({
  label,
  value,
  max,
  colorClass = "bg-primary",
  textClass = "text-sm",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center w-full", className)}>
      <div className="w-24 text-sm">{label}</div>
      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className={cn("w-10 text-right font-medium", textClass)}>
        {value}
      </div>
    </div>
  );
}
