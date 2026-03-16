"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetBigsterTestsQuery,
    useGetBigsterTestFilterOptionsQuery,
} from "@/lib/redux/features/bigster";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetBigsterProfilesQuery } from "@/lib/redux/features/bigster";
import { BigsterTestFilters, BigsterTestStatus } from "@/types/bigster";
import { StatsFilters } from "@/types/bigster-stats";
import { TestToolbar, SavedPreset } from "./TestToolbar";
import { TestFilters, TestFiltersState, INITIAL_TEST_FILTERS_STATE } from "./TestFilters";
import { TestCard } from "./TestCard";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
    ClipboardCheck,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { StandardSelect } from "@/components/ui/StandardSelect";

interface TestListProps {
    filters: StatsFilters;
    onFiltersChange: (filters: StatsFilters) => void;
}

type SortOption =
    | "recent"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "status"
    | "completion"
    | "eligible"
    | "read";

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];
const SAVED_PRESETS_KEY = "bigster_test_filter_presets";

function loadSavedPresets(): SavedPreset[] {
    try {
        if (typeof window === "undefined") return [];
        const raw = localStorage.getItem(SAVED_PRESETS_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as SavedPreset[];
    } catch {
        return [];
    }
}

function persistPresets(presets: SavedPreset[]): void {
    try {
        localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(presets));
    } catch {

    }
}

function buildQueryParams(
    filters: TestFiltersState,
    search: string,
    sortBy: SortOption,
    page: number,
    limit: number
): BigsterTestFilters {
    const params: BigsterTestFilters = {
        page,
        limit,
        sort_by: sortBy,
    };

    if (filters.status !== "all") params.status = filters.status as BigsterTestStatus;
    if (filters.completed !== "all") params.completed = filters.completed === "yes";
    if (filters.eligible !== "all") params.eligible = filters.eligible === "yes";
    if (filters.suspect !== "all") params.suspect = filters.suspect === "yes";
    if (filters.unreliable !== "all") params.unreliable = filters.unreliable === "yes";
    if (filters.read !== "all") params.read = filters.read === "yes";

    if (filters.selection_id !== "all") params.selection_id = parseInt(filters.selection_id);
    if (filters.company_id !== "all") params.company_id = parseInt(filters.company_id);
    if (filters.profile_id !== "all") params.profile_id = parseInt(filters.profile_id);

    if (filters.is_shortlisted !== "all") params.is_shortlisted = filters.is_shortlisted === "yes";

    if (filters.candidate_sex !== "all") params.candidate_sex = filters.candidate_sex as "MALE" | "FEMALE";
    if (filters.candidate_regione !== "all") params.candidate_regione = filters.candidate_regione;

    if (filters.candidate_provincia !== "all") params.candidate_provincia = filters.candidate_provincia;
    if (filters.candidate_citta !== "all") params.candidate_citta = filters.candidate_citta;
    if (filters.domicilio_regione !== "all") params.domicilio_regione = filters.domicilio_regione;
    if (filters.domicilio_provincia !== "all") params.domicilio_provincia = filters.domicilio_provincia;
    if (filters.domicilio_citta !== "all") params.domicilio_citta = filters.domicilio_citta;

    if (filters.automunito !== "all") params.automunito = filters.automunito === "yes";
    if (filters.disponibilita_trasferte !== "all") params.disponibilita_trasferte = filters.disponibilita_trasferte === "yes";
    if (filters.partita_iva !== "all") params.partita_iva = filters.partita_iva === "yes";
    if (filters.attestato_aso !== "all") params.attestato_aso = filters.attestato_aso;
    if (filters.disponibilita_immediata !== "all") params.disponibilita_immediata = filters.disponibilita_immediata === "yes";

    if (filters.char_k_min) params.char_k_min = parseInt(filters.char_k_min);
    if (filters.char_k_max) params.char_k_max = parseInt(filters.char_k_max);
    if (filters.char_l_min) params.char_l_min = parseInt(filters.char_l_min);
    if (filters.char_l_max) params.char_l_max = parseInt(filters.char_l_max);
    if (filters.char_egl_min) params.char_egl_min = parseInt(filters.char_egl_min);
    if (filters.char_egl_max) params.char_egl_max = parseInt(filters.char_egl_max);
    if (filters.char_etl_min) params.char_etl_min = parseInt(filters.char_etl_min);
    if (filters.char_etl_max) params.char_etl_max = parseInt(filters.char_etl_max);
    if (filters.char_m_min) params.char_m_min = parseInt(filters.char_m_min);
    if (filters.char_m_max) params.char_m_max = parseInt(filters.char_m_max);

    if (filters.three_lies_critical === "yes") params.three_lies_critical = true;
    if (filters.high_defensiveness === "yes") params.high_defensiveness = true;

    if (filters.sent_from) params.sent_from = filters.sent_from;
    if (filters.sent_to) params.sent_to = filters.sent_to;
    if (filters.completed_from) params.completed_from = filters.completed_from;
    if (filters.completed_to) params.completed_to = filters.completed_to;

    if (search.trim()) params.search = search.trim();

    return params;
}

export function TestList({ filters, onFiltersChange }: TestListProps) {
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(24);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const [testFilters, setTestFilters] = useState<TestFiltersState>(() => {
        if (filters.selection_id) {
            return {
                ...INITIAL_TEST_FILTERS_STATE,
                selection_id: filters.selection_id.toString(),
            };
        }
        return INITIAL_TEST_FILTERS_STATE;
    });

    const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
    const [activePresetName, setActivePresetName] = useState<string | null>(null);

    useEffect(() => {
        setSavedPresets(loadSavedPresets());
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setTestFilters((prev) => {
            const currentSelectionId = prev.selection_id;
            const parentSelectionId = filters.selection_id?.toString() || "all";
            if (currentSelectionId === parentSelectionId) return prev;
            return { ...prev, selection_id: parentSelectionId };
        });
    }, [filters.selection_id]);

    const queryParams = useMemo(
        () => buildQueryParams(testFilters, debouncedSearch, sortBy, page, limit),
        [testFilters, debouncedSearch, sortBy, page, limit]
    );

    const {
        data: testsData,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetBigsterTestsQuery(queryParams);

    const { data: filterOptions } = useGetBigsterTestFilterOptionsQuery();
    const { data: selections = [] } = useGetSelectionsQuery({});
    const { data: profiles = [] } = useGetBigsterProfilesQuery();

    const totalPages = testsData?.pagination?.total_pages || 1;
    const totalItems = testsData?.pagination?.total || 0;

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        const init = INITIAL_TEST_FILTERS_STATE;
        for (const key of Object.keys(init) as (keyof TestFiltersState)[]) {
            if (testFilters[key] !== init[key]) count++;
        }
        return count;
    }, [testFilters]);

    const handleTestClick = useCallback(
        (testId: number) => {
            router.push(`/test-bigster/${testId}`);
        },
        [router]
    );

    const handleFilterChange = useCallback(
        (newFilters: TestFiltersState) => {
            setTestFilters(newFilters);
            setPage(1);

            setActivePresetName(null);

            const newSelectionId =
                newFilters.selection_id !== "all"
                    ? parseInt(newFilters.selection_id)
                    : undefined;

            if (newSelectionId !== filters.selection_id) {
                if (newSelectionId) {
                    onFiltersChange({ ...filters, selection_id: newSelectionId });
                } else {
                    const { selection_id, ...rest } = filters;
                    onFiltersChange(rest);
                }
            }
        },
        [filters, onFiltersChange]
    );

    const handleClearFilters = useCallback(() => {
        setTestFilters(INITIAL_TEST_FILTERS_STATE);
        setSearchQuery("");
        setDebouncedSearch("");
        setPage(1);
        setActivePresetName(null);
        onFiltersChange({});
    }, [onFiltersChange]);

    const handleSortChange = useCallback((value: string) => {
        setSortBy(value as SortOption);
        setPage(1);
    }, []);

    const handleLimitChange = useCallback((value: number) => {
        setLimit(value);
        setPage(1);
    }, []);

    const handleSavePreset = useCallback(
        (name: string) => {
            const newPreset: SavedPreset = {
                name,
                filters: { ...testFilters } as unknown as Record<string, string>,
                createdAt: new Date().toISOString(),
            };
            const updated = [...savedPresets, newPreset];
            setSavedPresets(updated);
            persistPresets(updated);
            setActivePresetName(name);
        },
        [testFilters, savedPresets]
    );

    const handleLoadPreset = useCallback(
        (preset: SavedPreset) => {
            const loaded = preset.filters as unknown as TestFiltersState;
            setTestFilters(loaded);
            setPage(1);
            setActivePresetName(preset.name);

            const selId =
                loaded.selection_id !== "all"
                    ? parseInt(loaded.selection_id)
                    : undefined;
            if (selId !== filters.selection_id) {
                if (selId) {
                    onFiltersChange({ ...filters, selection_id: selId });
                } else {
                    const { selection_id, ...rest } = filters;
                    onFiltersChange(rest);
                }
            }
        },
        [filters, onFiltersChange]
    );

    const handleDeletePreset = useCallback(
        (index: number) => {
            const deleted = savedPresets[index];
            const updated = savedPresets.filter((_, i) => i !== index);
            setSavedPresets(updated);
            persistPresets(updated);
            if (activePresetName === deleted?.name) {
                setActivePresetName(null);
            }
        },
        [savedPresets, activePresetName]
    );

    if (isLoading && !isFetching) {
        return (
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text">Lista Test</h2>
                </div>
                <div className="p-12 flex items-center justify-center">
                    <Spinner className="h-8 w-8" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text">Lista Test</h2>
                </div>
                <div className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-bigster-text-muted mb-4">
                        Errore nel caricamento dei test
                    </p>
                    <Button
                        onClick={() => refetch()}
                        className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Riprova
                    </Button>
                </div>
            </div>
        );
    }

    const tests = testsData?.data || [];

    return (
        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card relative">

            {isFetching && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <Spinner className="w-8 h-8" />
                </div>
            )}

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-bigster-text">Lista Test</h2>
                        <p className="text-xs text-bigster-text-muted">
                            {totalItems} test totali
                            {activePresetName && (
                                <span className="ml-2 text-bigster-text">
                                    · Preset: <span className="font-semibold">{activePresetName}</span>
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-b border-bigster-border">
                <TestToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    activeFiltersCount={activeFiltersCount}
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    onRefresh={() => refetch()}
                    onClearFilters={
                        activeFiltersCount > 0 || searchQuery
                            ? handleClearFilters
                            : undefined
                    }
                    isLoading={isFetching}
                    savedPresets={savedPresets}
                    onSavePreset={handleSavePreset}
                    onLoadPreset={handleLoadPreset}
                    onDeletePreset={handleDeletePreset}
                    activePresetName={activePresetName}
                    readFilter={testFilters.read === "yes" ? "yes" : testFilters.read === "no" ? "no" : "all"}
                    onReadFilterChange={(value) => {
                        setTestFilters((prev: TestFiltersState) => ({
                            ...prev,
                            read: value,
                        }));
                        setPage(1);
                        setActivePresetName(null);
                    }}
                />
            </div>

            <div className="p-6">
                {tests.length === 0 ? (
                    <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
                        <ClipboardCheck className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                        <p className="text-sm font-medium text-bigster-text-muted mb-1">
                            Nessun test trovato
                        </p>
                        <p className="text-xs text-bigster-text-muted">
                            {activeFiltersCount > 0 || searchQuery
                                ? "Prova a modificare i filtri di ricerca"
                                : "Non ci sono test da visualizzare"}
                        </p>
                        {(activeFiltersCount > 0 || searchQuery) && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="mt-4 rounded-none border border-bigster-border"
                            >
                                Cancella filtri
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {tests.map((test, index) => (
                                <motion.div
                                    key={test.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <TestCard
                                        test={test}
                                        onClick={() => handleTestClick(test.id)}
                                        isInRosa={test.is_in_shortlist}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-bigster-border">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-bigster-text-muted">Mostra</span>
                            <div className="w-[80px]">
                                <StandardSelect
                                    value={String(limit)}
                                    onChange={(value: string) => {
                                        if (value !== "all") handleLimitChange(parseInt(value));
                                    }}
                                    options={PAGE_SIZE_OPTIONS.map((size) => ({
                                        value: String(size),
                                        label: String(size),
                                    }))}
                                    emptyLabel="--"
                                />
                            </div>
                            <span className="text-sm text-bigster-text-muted">per pagina</span>
                            <span className="text-sm text-bigster-text-muted ml-4">
                                Totale:{" "}
                                <span className="font-semibold text-bigster-text">
                                    {totalItems}
                                </span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isFetching}
                                className="rounded-none border border-bigster-border"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-bigster-text px-2">
                                Pagina {page} di {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isFetching}
                                className="rounded-none border border-bigster-border"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <TestFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                filters={testFilters}
                onFiltersChange={handleFilterChange}
                selections={selections}
                profiles={profiles}
                filterOptions={filterOptions}
            />
        </div>
    );
}
