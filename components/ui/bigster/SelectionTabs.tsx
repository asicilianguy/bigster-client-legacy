"use client";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function SelectionTabs({
  activeTab,
  setActiveTab,
  tabCounts,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabCounts: { all: number; active: number; pending: number; closed: number };
}) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full bg-transparent"
      >
        <TabsList
          className="w-full h-full p-1.5 grid grid-cols-4 gap-2 bg-white/80 backdrop-blur-sm rounded-xl border-0"
          style={{
            background: "transparent",
          }}
        >
          {[
            { id: "all", label: "Tutte", count: tabCounts.all, icon: "📋" },
            {
              id: "active",
              label: "Attive",
              count: tabCounts.active,
              icon: "🔄",
            },
            {
              id: "pending",
              label: "In Attesa",
              count: tabCounts.pending,
              icon: "⏳",
            },
            {
              id: "closed",
              label: "Chiuse",
              count: tabCounts.closed,
              icon: "✅",
            },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-all data-[state=active]:shadow-md border-2 border-transparent",
                "data-[state=active]:border-[#e4d72b] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgba(228,215,43,0.15)] data-[state=active]:to-[rgba(254,241,154,0.15)]",
                "data-[state=active]:text-[#6c4e06] data-[state=active]:font-semibold"
              )}
              style={{

                borderColor: activeTab === tab.id ? "#e4d72b" : "transparent",
                color: activeTab === tab.id ? "#6c4e06" : "#666666",
              }}
            >
              <span>{tab.label}</span>
              <span
                className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/80 shadow-sm"
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? "rgba(228, 215, 43, 0.2)"
                      : "rgba(0, 0, 0, 0.05)",
                  color: activeTab === tab.id ? "#6c4e06" : "inherit",
                }}
              >
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
}
