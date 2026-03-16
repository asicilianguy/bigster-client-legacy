"use client";

import {
    Search,
    SlidersHorizontal,
    RefreshCw,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardSelect } from "@/components/ui/StandardSelect";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const SORT_OPTIONS = [
    { value: "recent", label: "Più recenti" },
    { value: "oldest", label: "Meno recenti" },
    { value: "title_asc", label: "Titolo (A–Z)" },
    { value: "title_desc", label: "Titolo (Z–A)" },
    { value: "company_asc", label: "Azienda (A–Z)" },
    { value: "company_desc", label: "Azienda (Z–A)" },
    { value: "applications", label: "Più candidature" },
    { value: "status", label: "Stato" },
    { value: "shortlist", label: "Più in rosa" },
];

interface SelectionsToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    activeFiltersCount: number;
    onOpenFilters: () => void;
    onRefresh: () => void;
    onClearFilters: () => void;
    resultsCount: number;
    isLoading: boolean;
}

export function SelectionsToolbar({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    activeFiltersCount,
    onOpenFilters,
    onRefresh,
    onClearFilters,
    resultsCount,
    isLoading,
}: SelectionsToolbarProps) {
    return (
        <div className="space-y-3">

            <div className="flex flex-wrap items-center gap-3">

                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
                    <input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cerca per titolo, azienda, figura…"
                        className={`${inputBase} pl-10`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-bigster-text-muted hover:text-bigster-text"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="w-[200px]">
                    <StandardSelect
                        value={sortBy}
                        onChange={onSortChange}
                        options={SORT_OPTIONS}
                    />
                </div>

                <Button
                    variant="outline"
                    className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-3 py-2 hover:bg-bigster-muted-bg h-[38px]"
                    onClick={onOpenFilters}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                        <span
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                            style={{ backgroundColor: "#e4d72b" }}
                        >
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-3 py-2 hover:bg-bigster-muted-bg h-[38px]"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>

                {activeFiltersCount > 0 && (
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="rounded-none border-2 font-semibold text-xs px-3 py-2 h-[38px]"
                        style={{
                            borderColor: "#ef4444",
                            color: "#ef4444",
                            backgroundColor: "rgba(239,68,68,0.05)",
                        }}
                    >
                        <X className="h-3 w-3 mr-1" />
                        Cancella ({activeFiltersCount})
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-bigster-text-muted">
                    {resultsCount} {resultsCount === 1 ? "selezione trovata" : "selezioni trovate"}
                </p>
            </div>
        </div>
    );
}

export default SelectionsToolbar;
