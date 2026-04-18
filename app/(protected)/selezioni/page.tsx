"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  useGetSelectionsQuery,
  useGetSelectionStatsQuery,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { SelectionsKPI } from "./_components/SelectionsKPI";
import { SelectionList } from "./_components/SelectionList";
import { SelectionsDeadlinesMonitor } from "./_components/SelectionsDeadlinesMonitor";
import { Button } from "@/components/ui/button";
import { Briefcase, X } from "lucide-react";
import RoleProtectedRoute from "@/components/shared/role-protected-route";
import { UserRole } from "@/types/user";

// Selezioni è accessibile a tutti i ruoli TRANNE il consulente
const ALLOWED_ROLES = [
  UserRole.CEO,
  UserRole.RESPONSABILE_RISORSE_UMANE,
  UserRole.RISORSA_UMANA,
  UserRole.AMMINISTRAZIONE,
  UserRole.DEVELOPER,
];

function SelezioniPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectionIdFromUrl = searchParams.get("selection_id");

  const [filters, setFilters] = useState<{
    selection_id?: number;
    company_id?: number;
  }>(() => {
    if (selectionIdFromUrl) {
      return { selection_id: parseInt(selectionIdFromUrl) };
    }
    return {};
  });

  useEffect(() => {
    if (selectionIdFromUrl) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    if (selectionIdFromUrl) {
      setFilters((prev) => ({
        ...prev,
        selection_id: parseInt(selectionIdFromUrl),
      }));
    }
  }, [selectionIdFromUrl]);

  useEffect(() => {
    if (!filters.selection_id && selectionIdFromUrl) {
      router.push("/selezioni");
    }
  }, [filters.selection_id, selectionIdFromUrl, router]);

  const { data: stats, isLoading: isLoadingStats } =
    useGetSelectionStatsQuery();

  const { data: selections = [] } = useGetSelectionsQuery({});

  const selectedSelection = useMemo(() => {
    if (filters.selection_id && selections.length > 0) {
      return selections.find(
        (s: any) => s.id === filters.selection_id
      );
    }
    return null;
  }, [filters.selection_id, selections]);

  const handleClearSelectionFilter = () => {
    setFilters((prev) => {
      const { selection_id, ...rest } = prev;
      return rest;
    });
  };

  const handleFiltersChange = (newFilters: {
    selection_id?: number;
    company_id?: number;
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-bigster-background">
      <div className="mx-auto p-6 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-bigster-text tracking-tight">
            Selezioni
          </h1>
          <p className="text-sm text-bigster-text-muted mt-1">
            Gestisci tutte le selezioni del personale
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SelectionsKPI stats={stats} isLoading={isLoadingStats} />
        </motion.div>

        {selectedSelection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bigster-surface border border-bigster-border p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bigster-card-bg border border-bigster-border">
                  <Briefcase className="h-4 w-4 text-bigster-text" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Filtro selezione attivo
                  </p>
                  <p className="text-sm font-bold text-bigster-text">
                    {(selectedSelection as any).titolo}
                    {(selectedSelection as any).company?.nome && (
                      <span className="font-normal text-bigster-text-muted">
                        {" "}
                        — {(selectedSelection as any).company.nome}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleClearSelectionFilter}
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                <X className="h-4 w-4 mr-1" />
                Rimuovi filtro
              </Button>
            </div>
          </motion.div>
        )}

        <SelectionList
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <SelectionsDeadlinesMonitor />
    </div>
  );
}

export default function SelezioniPage() {
  return (
    <RoleProtectedRoute allowedRoles={ALLOWED_ROLES}>
      <SelezioniPageContent />
    </RoleProtectedRoute>
  );
}