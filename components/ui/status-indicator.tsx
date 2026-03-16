"use client"

import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StatusIndicatorProps {
  statuses: string[]
  counts: { [key: string]: number }
  labels: { [key: string]: string }
}

export function StatusIndicator({ statuses, counts, labels }: StatusIndicatorProps) {
  return (
    <div className="relative flex flex-col items-start">
      {statuses.map((status, index) => {
        const count = counts[status] || 0
        const hasItems = count > 0

        return (
          <TooltipProvider key={status} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group flex w-full items-center gap-3 py-1">
                  <div className="relative flex h-full flex-col items-center">
                    {index < statuses.length - 1 && <div className="absolute top-3 h-full w-0.5 bg-border" />}
                    <motion.div
                      className={`z-10 h-2.5 w-2.5 rounded-full transition-colors ${
                        hasItems ? "bg-primary" : "bg-border group-hover:bg-muted-foreground"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    />
                  </div>
                  <div className="flex-grow text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    {labels[status] || status}
                  </div>
                  {hasItems && (
                    <motion.div
                      className="text-xs font-bold text-primary"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      {count}
                    </motion.div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {count} {labels[status] || status}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}
