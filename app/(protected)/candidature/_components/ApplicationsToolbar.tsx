"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApplicationFilters, FilterState } from "./ApplicationFilters";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { Spinner } from "@/components/ui/spinner";
import { Search, SlidersHorizontal, ArrowUpDown, X, Eye, EyeOff } from "lucide-react";

interface Selection {
    id: number;
    titolo: string;
    company?: {
        id: number;
        nome: string;
    };
}

interface FilterOptions {
    regioni: string[];
    province: string[];
    citta: string[];
    titoli_studio: string[];
}

interface ApplicationsToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    activeFiltersCount: number;
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    selections: Selection[];
    filterOptions: FilterOptions;
    resultsCount: number;
    isLoading?: boolean;
}

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const STATUS_OPTIONS = [
    { value: "IN_CORSO", label: "In Corso" },
    { value: "IN_PROVA", label: "In Prova" },
    { value: "ASSUNTO", label: "Assunto" },
    { value: "SCARTATO", label: "Scartato" },
    { value: "RITIRATO", label: "Ritirato" },
];

const SORT_OPTIONS = [
    { value: "recent", label: "Più recenti" },
    { value: "oldest", label: "Meno recenti" },
    { value: "name_asc", label: "Nome (A-Z)" },
    { value: "name_desc", label: "Nome (Z-A)" },
    { value: "age_asc", label: "Età (crescente)" },
    { value: "age_desc", label: "Età (decrescente)" },
    { value: "status", label: "Stato" },
];

export function ApplicationsToolbar({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    activeFiltersCount,
    filters,
    onFiltersChange,
    selections,
    filterOptions,
    resultsCount,
    isLoading,
}: ApplicationsToolbarProps) {
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

    const clearAllFilters = () => {
        onFiltersChange({

            stato: "all",
            selezione_id: "all",
            company_id: "all",
            is_shortlisted: "all",

            sesso: "all",
            regione: "all",
            provincia: "all",
            citta: "all",
            titolo_studio: "all",
            eta_min: "",
            eta_max: "",
            is_read: "all",

            domicilio_regione: "all",
            domicilio_provincia: "all",
            domicilio_citta: "all",

            automunito: "all",
            disponibilita_trasferte: "all",
            partita_iva: "all",
            attestato_aso: "all",
            disponibilita_immediata: "all",
            preavviso_min: "",
            preavviso_max: "",

            has_cv: "all",
            has_note: "all",

            has_colloqui: "all",
            tipo_colloquio: "all",
            esito_colloquio: "all",

            has_colloqui_positivi: "all",

            has_test: "all",
            test_status: "all",
            test_completed: "all",
            test_eligible: "all",
            test_suspect: "all",
            test_unreliable: "all",
            test_preferred: "all",
            test_read: "all",
            test_evaluation: "all",
            test_profile_id: "all",

            piattaforma: "all",

            data_da: "",
            data_a: "",

            data_chiusura_da: "",
            data_chiusura_a: "",
        });
        onSearchChange("");
    };

    return (
        <>
            <div className="bg-bigster-surface border border-bigster-border">

                <div className="p-4">
                    <div className="flex flex-wrap items-center gap-4">

                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cerca per nome, cognome, email, selezione, azienda..."
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

                        <div className="w-[160px]">
                            <StandardSelect
                                value={filters.stato === "all" ? "" : filters.stato}
                                onChange={(value) =>
                                    onFiltersChange({ ...filters, stato: value || "all" })
                                }
                                options={STATUS_OPTIONS}
                                emptyLabel="Tutti gli stati"
                            />
                        </div>

                        <div className="flex items-center border border-bigster-border flex-shrink-0">
                            {(
                                [
                                    { value: "all", label: "Tutte", icon: null },
                                    { value: "no", label: "Da leggere", icon: EyeOff },
                                    { value: "yes", label: "Lette", icon: Eye },
                                ] as const
                            ).map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => onFiltersChange({ ...filters, is_read: value })}
                                    className={`h-10 px-3 text-xs font-semibold flex items-center gap-1.5 border-r last:border-r-0 border-bigster-border transition-colors ${filters.is_read === value
                                        ? "bg-bigster-primary text-bigster-primary-text"
                                        : "bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                                        }`}
                                >
                                    {Icon && <Icon className="h-3.5 w-3.5" />}
                                    {label}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setIsFilterDialogOpen(true)}
                            className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-4 py-2 hover:bg-bigster-muted-bg"
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filtri
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-bigster-primary text-bigster-primary-text text-xs flex items-center justify-center font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
                            <div className="w-[180px]">
                                <StandardSelect
                                    value={sortBy}
                                    onChange={(value) => onSortChange(value || "recent")}
                                    options={SORT_OPTIONS}
                                    emptyLabel="Ordina per..."
                                />
                            </div>
                        </div>

                        {(activeFiltersCount > 0 || searchQuery) && (
                            <Button
                                variant="outline"
                                onClick={clearAllFilters}
                                className="rounded-none border-2 border-red-400 text-red-600 hover:bg-red-50 px-4 py-2"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Pulisci
                            </Button>
                        )}
                    </div>
                </div>

                <div className="px-4 py-3 border-t border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isLoading && <Spinner className="h-4 w-4" />}
                            <p className="text-sm text-bigster-text-muted">
                                <span className="font-semibold text-bigster-text">{resultsCount}</span>{" "}
                                {resultsCount === 1 ? "candidatura" : "candidature"} trovate
                                {searchQuery && (
                                    <span>
                                        {" "}
                                        per "<span className="font-medium">{searchQuery}</span>"
                                    </span>
                                )}
                            </p>
                        </div>

                        {activeFiltersCount > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-bigster-text-muted">Filtri attivi:</span>
                                {filters.stato !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border border-blue-300">
                                        Stato: {filters.stato.replace("_", " ")}
                                    </span>
                                )}
                                {filters.selezione_id !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 border border-purple-300">
                                        Selezione
                                    </span>
                                )}
                                {filters.company_id !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 border border-indigo-300">
                                        Azienda
                                    </span>
                                )}
                                {filters.is_shortlisted !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 border border-amber-300">
                                        Rosa: {filters.is_shortlisted === "yes" ? "Sì" : "No"}
                                    </span>
                                )}
                                {filters.regione !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 border border-green-300">
                                        {filters.regione}
                                    </span>
                                )}
                                {filters.sesso !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 border border-pink-300">
                                        Sesso: {filters.sesso === "M" ? "Maschio" : "Femmina"}
                                    </span>
                                )}
                                {(filters.eta_min || filters.eta_max) && (
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-300">
                                        Età: {filters.eta_min || "—"} - {filters.eta_max || "—"}
                                    </span>
                                )}
                                {filters.has_cv !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border border-orange-300">
                                        CV: {filters.has_cv === "yes" ? "Sì" : "No"}
                                    </span>
                                )}
                                {filters.has_test !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 border border-teal-300">
                                        Test: {filters.has_test === "yes" ? "Sì" : "No"}
                                    </span>
                                )}
                                {filters.test_status !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 border border-cyan-300">
                                        Stato test
                                    </span>
                                )}
                                {filters.is_read !== "all" && (
                                    <span className="text-xs px-2 py-1 bg-bigster-card-bg text-bigster-text border border-bigster-border flex items-center gap-1">
                                        {filters.is_read === "yes"
                                            ? <><Eye className="h-3 w-3" /> Lette</>
                                            : <><EyeOff className="h-3 w-3" /> Da leggere</>
                                        }
                                    </span>
                                )}
                                {(filters.data_da || filters.data_a) && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300">
                                        Date: {filters.data_da || "—"} / {filters.data_a || "—"}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ApplicationFilters
                isOpen={isFilterDialogOpen}
                onClose={() => setIsFilterDialogOpen(false)}
                filters={filters}
                onFiltersChange={onFiltersChange}
                selections={selections}
                filterOptions={filterOptions}
            />
        </>
    );
}

export default ApplicationsToolbar;
