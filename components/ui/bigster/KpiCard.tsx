import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type ColorScheme =
  | "blue"
  | "yellow"
  | "indigo"
  | "green"
  | "purple"
  | "red"
  | "pink";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  colorScheme?: ColorScheme;
  className?: string;
  index?: number;
}

const colorSchemes: Record<
  ColorScheme,
  { bgColor: string; textColor: string; borderColor: string }
> = {
  blue: {
    bgColor: "bg-blue-400/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-400/20",
  },
  yellow: {
    bgColor: "bg-yellow-400/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-400/20",
  },
  indigo: {
    bgColor: "bg-indigo-400/10",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-400/20",
  },
  green: {
    bgColor: "bg-green-400/10",
    textColor: "text-green-600",
    borderColor: "border-green-400/20",
  },
  purple: {
    bgColor: "bg-purple-400/10",
    textColor: "text-purple-600",
    borderColor: "border-purple-400/20",
  },
  red: {
    bgColor: "bg-red-400/10",
    textColor: "text-red-600",
    borderColor: "border-red-400/20",
  },
  pink: {
    bgColor: "bg-pink-400/10",
    textColor: "text-pink-600",
    borderColor: "border-pink-400/20",
  },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  colorScheme = "blue",
  className,
  index = 0,
}: KpiCardProps) {
  const { bgColor, textColor, borderColor } = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card
        className={cn(
          "overflow-hidden border shadow-sm transition-all hover:shadow-md",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <h3 className="text-3xl font-bold mt-1 tabular-nums">{value}</h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <div className={cn("p-3 rounded-full", bgColor, textColor)}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div
            className={cn(
              "h-1 w-full mt-5 rounded-full overflow-hidden bg-muted/50"
            )}
          >
            <div
              className={cn("h-full rounded-full", bgColor, borderColor)}
              style={{ width: "65%" }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
