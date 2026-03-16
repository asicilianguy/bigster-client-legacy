"use client";

import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import SelectionCard from "./SelectionCard";

interface SelectionsGridProps {
  selections: any[];
  filters: any;
  activeFiltersCount: number;
  clearAllFilters: () => void;
}

export function SelectionsGrid({
  selections,
  filters,
  activeFiltersCount,
  clearAllFilters,
}: SelectionsGridProps) {
  if (selections.length === 0) {
    return (
      <div className="bg-bigster-surface border border-bigster-border p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bigster-background flex items-center justify-center">
            <Package className="h-8 w-8 text-bigster-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-bigster-text mb-2">
            Nessuna selezione trovata
          </h3>
          <p className="text-sm text-bigster-text-muted mb-6">
            {activeFiltersCount > 0
              ? "Prova a modificare i filtri per vedere più risultati."
              : "Non ci sono selezioni disponibili al momento."}
          </p>
          {activeFiltersCount > 0 && (
            <Button
              onClick={clearAllFilters}
              className="rounded-none border-2 font-semibold"
              style={{
                backgroundColor: "#e4d72b",
                color: "#6c4e06",
                borderColor: "#6c4e06",
              }}
            >
              Cancella tutti i filtri
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-bigster-text-muted">
          Mostrando{" "}
          <span className="font-semibold text-bigster-text">
            {selections.length}
          </span>{" "}
          {selections.length === 1 ? "selezione" : "selezioni"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {selections.map((selection, index) => (
          <SelectionCard
            key={selection.id}
            selection={selection}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
