"use client";

import { Button } from "@/components/ui/button";
import { Users, Search, FilterX } from "lucide-react";

interface ApplicationEmptyStateProps {
    hasFilters: boolean;
    onClearFilters: () => void;
}

export function ApplicationEmptyState({
    hasFilters,
    onClearFilters,
}: ApplicationEmptyStateProps) {
    return (
        <div className="bg-bigster-surface border border-bigster-border p-12">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-bigster-muted-bg flex items-center justify-center mb-4">
                    {hasFilters ? (
                        <Search className="h-8 w-8 text-bigster-text-muted" />
                    ) : (
                        <Users className="h-8 w-8 text-bigster-text-muted" />
                    )}
                </div>

                <h3 className="text-lg font-bold text-bigster-text mb-2">
                    {hasFilters
                        ? "Nessuna candidatura trovata"
                        : "Nessuna candidatura presente"}
                </h3>

                <p className="text-sm text-bigster-text-muted mb-6">
                    {hasFilters
                        ? "Nessuna candidatura corrisponde ai criteri di ricerca selezionati. Prova a modificare i filtri."
                        : "Le candidature appariranno qui quando verranno ricevute attraverso gli annunci pubblicati."}
                </p>

                {hasFilters && (
                    <Button
                        onClick={onClearFilters}
                        variant="outline"
                        className="rounded-none border-2 border-red-400 text-red-600 hover:bg-red-50 font-semibold"
                    >
                        <FilterX className="h-4 w-4 mr-2" />
                        Rimuovi tutti i filtri
                    </Button>
                )}
            </div>
        </div>
    );
}
