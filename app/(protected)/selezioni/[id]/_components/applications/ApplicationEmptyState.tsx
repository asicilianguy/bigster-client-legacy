"use client";

import { Users, FileText } from "lucide-react";

interface ApplicationEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function ApplicationEmptyState({
  hasFilters = false,
  onClearFilters,
}: ApplicationEmptyStateProps) {
  return (
    <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
      <Users className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
      <p className="text-sm font-medium text-bigster-text-muted mb-1">
        {hasFilters
          ? "Nessuna candidatura corrisponde ai filtri"
          : "Nessuna candidatura ricevuta"}
      </p>
      <p className="text-xs text-bigster-text-muted">
        {hasFilters
          ? "Prova a modificare i criteri di ricerca"
          : "Le candidature appariranno qui quando verranno ricevute"}
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 text-sm font-semibold text-bigster-text underline hover:no-underline"
        >
          Rimuovi tutti i filtri
        </button>
      )}
    </div>
  );
}
