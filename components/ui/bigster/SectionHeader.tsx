import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
  action?: React.ReactNode;
  description?: string;
}

export function SectionHeader({
  title,
  viewAllLink,
  action,
  description,
}: SectionHeaderProps) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action}
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="ghost" size="sm">
              Visualizza tutte <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
