"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SelectionCard } from "./SelectionCard";
import { EmptyState } from "./EmptyState";
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  BarChart3,
  Target,
} from "lucide-react";
import Link from "next/link";

interface TabsSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabCounts: {
    all: number;
    active: number;
    pending: number;
    closed: number;
  };
  filteredSelections: any[];
  searchQuery: string;
  departmentFilter: string;
  figureFilter: string;
  statusFilter: string;
  sortBy: string;
  canCreateSelection: boolean;
  setDepartmentFilter: (filter: string) => void;
  setFigureFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

export function TabsSection({
  activeTab,
  setActiveTab,
  tabCounts,
  filteredSelections,
  searchQuery,
  departmentFilter,
  figureFilter,
  statusFilter,
  sortBy,
  canCreateSelection,
  setDepartmentFilter,
  setFigureFilter,
  setStatusFilter,
  setSearchQuery,
}: TabsSectionProps) {
  const hasActiveFilters =
    searchQuery ||
    departmentFilter !== "all" ||
    figureFilter !== "all" ||
    statusFilter !== "all";

  const clearAllFilters = () => {
    setDepartmentFilter("all");
    setFigureFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const getSortDescription = () => {
    switch (sortBy) {
      case "recent":
        return "ordinate per data";
      case "applications":
        return "ordinate per numero candidature";
      case "alphabetical":
        return "ordinate alfabeticamente";
      default:
        return "";
    }
  };

  return (
    <Tabs
      defaultValue="all"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <TabsList
          className="grid w-full h-full grid-cols-4 p-2 shadow-lg border-0 rounded-2xl"
          style={{
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <TabsTrigger
            value="all"
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:shadow-lg"
            style={{
              color: activeTab === "all" ? "#6c4e06" : "#666666",
              backgroundColor: activeTab === "all" ? "#ffffff" : "transparent",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  activeTab === "all"
                    ? "linear-gradient(135deg, #e4d72b 0%, #fef19a 100%)"
                    : "rgba(102, 102, 102, 0.1)",
              }}
            >
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold">Tutte</div>
              <div className="text-xs opacity-70">({tabCounts.all})</div>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="active"
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:shadow-lg"
            style={{
              color: activeTab === "active" ? "#6c4e06" : "#666666",
              backgroundColor:
                activeTab === "active" ? "#ffffff" : "transparent",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  activeTab === "active"
                    ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                    : "rgba(102, 102, 102, 0.1)",
              }}
            >
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold">Attive</div>
              <div className="text-xs opacity-70">({tabCounts.active})</div>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="pending"
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:shadow-lg"
            style={{
              color: activeTab === "pending" ? "#6c4e06" : "#666666",
              backgroundColor:
                activeTab === "pending" ? "#ffffff" : "transparent",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  activeTab === "pending"
                    ? "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                    : "rgba(102, 102, 102, 0.1)",
              }}
            >
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold">In Attesa</div>
              <div className="text-xs opacity-70">({tabCounts.pending})</div>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="closed"
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 data-[state=active]:shadow-lg"
            style={{
              color: activeTab === "closed" ? "#6c4e06" : "#666666",
              backgroundColor:
                activeTab === "closed" ? "#ffffff" : "transparent",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  activeTab === "closed"
                    ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
                    : "rgba(102, 102, 102, 0.1)",
              }}
            >
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold">Chiuse</div>
              <div className="text-xs opacity-70">({tabCounts.closed})</div>
            </div>
          </TabsTrigger>
        </TabsList>
      </motion.div>

      <TabsContent value={activeTab} className="mt-8">
        {filteredSelections.length > 0 ? (
          <>

            <motion.div
              className="mb-6 p-4 rounded-xl shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(228, 215, 43, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%)",
                border: "1px solid rgba(228, 215, 43, 0.2)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #e4d72b 0%, #fef19a 100%)",
                    }}
                  >
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: "#6c4e06" }}
                    >
                      {filteredSelections.length} selezioni trovate
                    </div>
                    <div className="text-sm" style={{ color: "#666666" }}>
                      {getSortDescription() &&
                        `Risultati ${getSortDescription()}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div
                      className="text-xs font-medium"
                      style={{ color: "#666666" }}
                    >
                      Media Candidature
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6c4e06" }}
                    >
                      {Math.round(
                        filteredSelections.reduce(
                          (acc, sel) => acc + (sel._count?.candidature || 0),
                          0
                        ) / filteredSelections.length || 0
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-xs font-medium"
                      style={{ color: "#666666" }}
                    >
                      Totale Annunci
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6c4e06" }}
                    >
                      {filteredSelections.reduce(
                        (acc, sel) => acc + (sel._count?.annunci || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {filteredSelections.map((selection: any, index: number) => (
                <SelectionCard
                  key={selection.id}
                  selection={selection}
                  index={index}
                />
              ))}
            </motion.div>
          </>
        ) : (
          <EmptyState
            icon={
              filteredSelections.length === 0 && hasActiveFilters
                ? Target
                : Briefcase
            }
            title={
              hasActiveFilters
                ? "Nessuna selezione corrisponde ai filtri"
                : "Nessuna selezione disponibile"
            }
            description={
              hasActiveFilters
                ? "Prova a modificare i filtri per vedere più risultati o cancella tutti i filtri per vedere tutte le selezioni."
                : canCreateSelection
                ? "Inizia il tuo processo di recruiting creando la prima selezione."
                : "Non ci sono selezioni disponibili per te al momento."
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  className="mt-6 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border-2 px-6 py-3 rounded-xl bg-transparent"
                  style={{
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                  }}
                  onClick={clearAllFilters}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239, 68, 68, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239, 68, 68, 0.05)";
                  }}
                >
                  🗑️ Cancella tutti i filtri
                </Button>
              ) : canCreateSelection ? (
                <Button
                  asChild
                  className="mt-6 font-bold shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-8 py-4 rounded-xl text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #e4d72b 0%, #fef19a 100%)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Link
                    href="/selezioni/nuova"
                    className="flex items-center gap-3"
                  >
                    <PlusCircle className="h-5 w-5" />✨ Crea la prima Selezione
                  </Link>
                </Button>
              ) : null
            }
            className="col-span-full"
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
