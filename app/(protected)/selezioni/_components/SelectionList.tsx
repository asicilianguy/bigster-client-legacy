"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetSelectionsPaginatedQuery,
    useGetSelectionFilterOptionsQuery,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import type {
    SelectionListItem,
    GetSelectionsPaginatedQueryParams,
} from "@/types/selection";
import { SelectionListCard } from "./SelectionListCard";
import { SelectionsToolbar } from "./SelectionsToolbar";
import { SelectionFilters, FilterState, INITIAL_FILTERS } from "./SelectionsFilters";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
    Briefcase,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { StandardSelect } from "@/components/ui/StandardSelect";

type SortOption =
    | "recent"
    | "oldest"
    | "title_asc"
    | "title_desc"
    | "company_asc"
    | "company_desc"
    | "applications"
    | "status"
    | "shortlist";

interface SelectionListProps {

    filters: {
        selection_id?: number;
        company_id?: number;
    };

    onFiltersChange: (filters: { selection_id?: number; company_id?: number }) => void;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];
const DEFAULT_LIMIT = 24;

export function SelectionList({ filters: externalFilters, onFiltersChange }: SelectionListProps) {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [sortBy, setSortBy] = useState<SortOption>("recent");

    const [localFilters, setLocalFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (externalFilters.company_id) {
            setLocalFilters((prev) => ({
                ...prev,
                company_id: String(externalFilters.company_id),
            }));
        }
    }, [externalFilters.company_id]);

    const queryParams = useMemo((): GetSelectionsPaginatedQueryParams => {
        const params: GetSelectionsPaginatedQueryParams = {
            page,
            limit,
            sort_by: sortBy,
        };

        if (debouncedSearch.trim()) {
            params.search = debouncedSearch.trim();
        }

        if (localFilters.stato !== "all") {
            params.stato = localFilters.stato as any;
        }
        if (localFilters.pacchetto !== "all") {
            params.pacchetto = localFilters.pacchetto as any;
        }
        if (localFilters.figura_ricercata && localFilters.figura_ricercata !== "all") {
            params.figura_ricercata = localFilters.figura_ricercata;
        }

        if (localFilters.has_hr !== "all") {
            params.has_hr = localFilters.has_hr as "assigned" | "unassigned";
        }
        if (localFilters.risorsa_umana_id && localFilters.risorsa_umana_id !== "all") {
            params.risorsa_umana_id = Number(localFilters.risorsa_umana_id);
        }

        if (localFilters.company_id && localFilters.company_id !== "all") {
            params.company_id = Number(localFilters.company_id);
        }
        if (localFilters.consulente_id && localFilters.consulente_id !== "all") {
            params.consulente_id = Number(localFilters.consulente_id);
        }

        if (localFilters.has_job_collection !== "all") {
            params.has_job_collection = localFilters.has_job_collection === "yes";
        }
        if (localFilters.has_annunci !== "all") {
            params.has_annunci = localFilters.has_annunci === "yes";
        }
        if (localFilters.has_shortlist !== "all") {
            params.has_shortlist = localFilters.has_shortlist === "yes";
        }

        if (localFilters.data_da) params.data_da = localFilters.data_da;
        if (localFilters.data_a) params.data_a = localFilters.data_a;
        if (localFilters.data_chiusura_da) params.data_chiusura_da = localFilters.data_chiusura_da;
        if (localFilters.data_chiusura_a) params.data_chiusura_a = localFilters.data_chiusura_a;

        return params;
    }, [page, limit, sortBy, debouncedSearch, localFilters]);

    const {
        data: paginatedResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetSelectionsPaginatedQuery(queryParams);

    const { data: filterOptions } = useGetSelectionFilterOptionsQuery();

    const selections = paginatedResponse?.data ?? [];
    const pagination = paginatedResponse?.pagination ?? { total: 0, page: 1, limit: DEFAULT_LIMIT, total_pages: 1 };

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== "all" && value !== "") {
                count++;
            }
        });
        return count;
    }, [localFilters]);

    const handleFilterChange = useCallback(
        (newFilters: FilterState) => {
            setLocalFilters(newFilters);
            setPage(1);

            const newCompanyId = newFilters.company_id && newFilters.company_id !== "all"
                ? Number(newFilters.company_id)
                : undefined;
            onFiltersChange({
                ...externalFilters,
                company_id: newCompanyId,
            });
        },
        [externalFilters, onFiltersChange]
    );

    const handleClearFilters = useCallback(() => {
        setLocalFilters(INITIAL_FILTERS);
        setSearchQuery("");
        setDebouncedSearch("");
        setSortBy("recent");
        setPage(1);
        onFiltersChange({});
    }, [onFiltersChange]);

    const handleSortChange = useCallback((newSort: string) => {
        setSortBy(newSort as SortOption);
        setPage(1);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    const handleSelectionClick = useCallback(
        (selection: SelectionListItem) => {
            router.push(`/selezioni/${selection.id}`);
        },
        [router]
    );

    if (isLoading && !paginatedResponse) {
        return (
            <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-bigster-text" />
                        <h2 className="text-lg font-bold text-bigster-text">Lista Selezioni</h2>
                    </div>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Spinner className="h-8 w-8" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-bigster-text" />
                        <h2 className="text-lg font-bold text-bigster-text">Lista Selezioni</h2>
                    </div>
                </div>
                <div className="p-6">
                    <div className="p-4 bg-red-50 border border-red-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800 mb-1">
                                    Errore nel caricamento delle selezioni
                                </p>
                                <p className="text-xs text-red-700">
                                    {(error as any)?.data?.error || "Si è verificato un errore. Riprova."}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => refetch()}
                                    className="mt-3 rounded-none border border-red-300 text-red-700 hover:bg-red-100 text-xs px-3 py-1"
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Riprova
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-bigster-text" />
                        <h2 className="text-lg font-bold text-bigster-text">Lista Selezioni</h2>
                        <span className="text-xs text-bigster-text-muted ml-2">
                            {pagination.total} totali
                        </span>
                    </div>
                    {isFetching && (
                        <Spinner className="h-4 w-4" />
                    )}
                </div>
            </div>

            <div className="p-6">

                <SelectionsToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    activeFiltersCount={activeFiltersCount}
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    onRefresh={refetch}
                    onClearFilters={handleClearFilters}
                    resultsCount={pagination.total}
                    isLoading={isFetching}
                />

                <AnimatePresence mode="wait">
                    {selections.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16 bg-bigster-muted-bg border border-bigster-border mt-6"
                        >
                            <Briefcase className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                            <p className="text-sm font-medium text-bigster-text-muted mb-1">
                                Nessuna selezione trovata
                            </p>
                            <p className="text-xs text-bigster-text-muted mb-4">
                                {activeFiltersCount > 0 || debouncedSearch
                                    ? "Prova a modificare i filtri o la ricerca"
                                    : "Non ci sono selezioni disponibili"}
                            </p>
                            {(activeFiltersCount > 0 || debouncedSearch) && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="rounded-none border border-bigster-border text-bigster-text hover:bg-bigster-muted-bg text-xs px-3 py-1"
                                >
                                    Cancella filtri
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                                {selections.map((selection, index) => (
                                    <motion.div
                                        key={selection.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <SelectionListCard
                                            selection={selection}
                                            onClick={() => handleSelectionClick(selection)}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-bigster-border">

                                <p className="text-xs text-bigster-text-muted">
                                    Mostrando{" "}
                                    <span className="font-semibold text-bigster-text">
                                        {Math.min((page - 1) * limit + 1, pagination.total)}–
                                        {Math.min(page * limit, pagination.total)}
                                    </span>{" "}
                                    di{" "}
                                    <span className="font-semibold text-bigster-text">
                                        {pagination.total}
                                    </span>{" "}
                                    selezioni
                                </p>

                                <div className="flex items-center gap-3">

                                    <Button
                                        variant="outline"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1 || isFetching}
                                        className="rounded-none border border-bigster-border text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-40 h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <span className="text-xs font-semibold text-bigster-text whitespace-nowrap">
                                        Pagina {page} di {pagination.total_pages || 1}
                                    </span>

                                    <Button
                                        variant="outline"
                                        onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                                        disabled={page >= pagination.total_pages || isFetching}
                                        className="rounded-none border border-bigster-border text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-40 h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    <div className="w-[130px]">
                                        <StandardSelect
                                            value={String(limit)}
                                            onChange={(value: string) => {
                                                if (value !== "all") handleLimitChange(Number(value));
                                            }}
                                            options={PAGE_SIZE_OPTIONS.map((size) => ({
                                                value: String(size),
                                                label: `${size} per pagina`,
                                            }))}
                                            emptyLabel="--"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SelectionFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                filters={localFilters}
                onFiltersChange={handleFilterChange}
                filterOptions={filterOptions}
            />
        </div>
    );
}
