"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetApplicationsQuery,
    useGetFilterOptionsQuery,
} from "@/lib/redux/features/applications/applicationsApiSlice";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import {
    ApplicationListItem,
    GetApplicationsQueryParams,
    isInShortlist,
} from "@/types/application";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationsToolbar } from "./ApplicationsToolbar";
import { FilterState } from "./ApplicationFilters";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
    Users,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { StandardSelect } from "@/components/ui/StandardSelect";

type SortOption =
    | "recent"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "age_asc"
    | "age_desc"
    | "status";

interface ApplicationListProps {

    filters: {
        selection_id?: number;
        company_id?: number;
    };

    onFiltersChange: (filters: { selection_id?: number; company_id?: number }) => void;
}

const INITIAL_FILTERS: FilterState = {
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
    is_read: "all",
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
};

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

function buildQueryParams(
    filters: FilterState,
    search: string,
    sortBy: SortOption,
    page: number,
    limit: number
): GetApplicationsQueryParams {
    const params: GetApplicationsQueryParams = {
        page,
        limit,
        sort_by: sortBy,
    };

    if (filters.selezione_id && filters.selezione_id !== "all") {
        params.selezione_id = parseInt(filters.selezione_id);
    }
    if (filters.company_id && filters.company_id !== "all") {
        params.company_id = parseInt(filters.company_id);
    }

    if (filters.stato && filters.stato !== "all") {
        params.stato = filters.stato as any;
    }

    if (filters.sesso && filters.sesso !== "all") {
        params.sesso = filters.sesso as "M" | "F";
    }
    if (filters.regione && filters.regione !== "all") params.regione = filters.regione;
    if (filters.provincia && filters.provincia !== "all") params.provincia = filters.provincia;
    if (filters.citta && filters.citta !== "all") params.citta = filters.citta;
    if (filters.titolo_studio && filters.titolo_studio !== "all") params.titolo_studio = filters.titolo_studio;
    if (filters.eta_min) params.eta_min = parseInt(filters.eta_min);
    if (filters.eta_max) params.eta_max = parseInt(filters.eta_max);

    if (filters.domicilio_regione && filters.domicilio_regione !== "all") params.domicilio_regione = filters.domicilio_regione;
    if (filters.domicilio_provincia && filters.domicilio_provincia !== "all") params.domicilio_provincia = filters.domicilio_provincia;
    if (filters.domicilio_citta && filters.domicilio_citta !== "all") params.domicilio_citta = filters.domicilio_citta;

    if (filters.automunito === "yes") params.automunito = true;
    else if (filters.automunito === "no") params.automunito = false;
    if (filters.disponibilita_trasferte === "yes") params.disponibilita_trasferte = true;
    else if (filters.disponibilita_trasferte === "no") params.disponibilita_trasferte = false;
    if (filters.partita_iva === "yes") params.partita_iva = true;
    else if (filters.partita_iva === "no") params.partita_iva = false;
    if (filters.attestato_aso && filters.attestato_aso !== "all") params.attestato_aso = filters.attestato_aso;
    if (filters.disponibilita_immediata === "yes") params.disponibilita_immediata = true;
    else if (filters.disponibilita_immediata === "no") params.disponibilita_immediata = false;

    if (filters.preavviso_min) params.preavviso_min = parseInt(filters.preavviso_min);
    if (filters.preavviso_max) params.preavviso_max = parseInt(filters.preavviso_max);

    if (filters.has_cv === "yes") params.has_cv = true;
    else if (filters.has_cv === "no") params.has_cv = false;
    if (filters.has_note === "yes") params.has_note = true;
    else if (filters.has_note === "no") params.has_note = false;

    if (filters.is_read === "yes") params.is_read = true;
    else if (filters.is_read === "no") params.is_read = false;

    if (filters.has_colloqui === "yes") params.has_colloqui = true;
    else if (filters.has_colloqui === "no") params.has_colloqui = false;
    if (filters.tipo_colloquio && filters.tipo_colloquio !== "all") params.tipo_colloquio = filters.tipo_colloquio;
    if (filters.esito_colloquio && filters.esito_colloquio !== "all") params.esito_colloquio = filters.esito_colloquio;
    if (filters.has_colloqui_positivi === "yes") params.has_colloqui_positivi = true;
    else if (filters.has_colloqui_positivi === "no") params.has_colloqui_positivi = false;

    if (filters.has_test === "yes") params.has_test = true;
    else if (filters.has_test === "no") params.has_test = false;
    if (filters.test_status && filters.test_status !== "all") params.test_status = filters.test_status as any;
    if (filters.test_completed === "yes") params.test_completed = true;
    else if (filters.test_completed === "no") params.test_completed = false;
    if (filters.test_eligible === "yes") params.test_eligible = true;
    else if (filters.test_eligible === "no") params.test_eligible = false;
    if (filters.test_suspect === "yes") params.test_suspect = true;
    else if (filters.test_suspect === "no") params.test_suspect = false;
    if (filters.test_unreliable === "yes") params.test_unreliable = true;
    else if (filters.test_unreliable === "no") params.test_unreliable = false;
    if (filters.test_preferred === "yes") params.test_preferred = true;
    else if (filters.test_preferred === "no") params.test_preferred = false;
    if (filters.test_read === "yes") params.test_read = true;
    else if (filters.test_read === "no") params.test_read = false;
    if (filters.test_evaluation && filters.test_evaluation !== "all") params.test_evaluation = filters.test_evaluation;
    if (filters.test_profile_id && filters.test_profile_id !== "all") params.test_profile_id = parseInt(filters.test_profile_id);

    if (filters.is_shortlisted === "yes") params.is_shortlisted = true;
    else if (filters.is_shortlisted === "no") params.is_shortlisted = false;

    if (filters.piattaforma && filters.piattaforma !== "all") params.piattaforma = filters.piattaforma;

    if (filters.data_da) params.data_da = filters.data_da;
    if (filters.data_a) params.data_a = filters.data_a;

    if (filters.data_chiusura_da) params.data_chiusura_da = filters.data_chiusura_da;
    if (filters.data_chiusura_a) params.data_chiusura_a = filters.data_chiusura_a;

    if (search.trim()) params.search = search.trim();

    return params;
}

function checkIsInRosa(
    application: ApplicationListItem,
    activeSelectionId: string
): boolean {
    if (!application.shortlisted_in || application.shortlisted_in.length === 0) return false;
    if (activeSelectionId !== "all") return isInShortlist(application, parseInt(activeSelectionId));
    return application.shortlisted_in.length > 0;
}

function countActiveFilters(filters: FilterState): number {
    let count = 0;

    if (filters.stato && filters.stato !== "all") count++;
    if (filters.selezione_id && filters.selezione_id !== "all") count++;
    if (filters.company_id && filters.company_id !== "all") count++;
    if (filters.is_shortlisted === "yes" || filters.is_shortlisted === "no") count++;

    if (filters.sesso && filters.sesso !== "all") count++;
    if (filters.regione && filters.regione !== "all") count++;
    if (filters.provincia && filters.provincia !== "all") count++;
    if (filters.citta && filters.citta !== "all") count++;
    if (filters.titolo_studio && filters.titolo_studio !== "all") count++;
    if (filters.eta_min) count++;
    if (filters.eta_max) count++;

    if (filters.domicilio_regione && filters.domicilio_regione !== "all") count++;
    if (filters.domicilio_provincia && filters.domicilio_provincia !== "all") count++;
    if (filters.domicilio_citta && filters.domicilio_citta !== "all") count++;

    if (filters.automunito === "yes" || filters.automunito === "no") count++;
    if (filters.disponibilita_trasferte === "yes" || filters.disponibilita_trasferte === "no") count++;
    if (filters.partita_iva === "yes" || filters.partita_iva === "no") count++;
    if (filters.attestato_aso && filters.attestato_aso !== "all") count++;
    if (filters.disponibilita_immediata === "yes" || filters.disponibilita_immediata === "no") count++;

    if (filters.preavviso_min) count++;
    if (filters.preavviso_max) count++;

    if (filters.has_cv === "yes" || filters.has_cv === "no") count++;
    if (filters.has_note === "yes" || filters.has_note === "no") count++;
    if (filters.is_read === "yes" || filters.is_read === "no") count++;

    if (filters.has_colloqui === "yes" || filters.has_colloqui === "no") count++;
    if (filters.tipo_colloquio && filters.tipo_colloquio !== "all") count++;
    if (filters.esito_colloquio && filters.esito_colloquio !== "all") count++;
    if (filters.has_colloqui_positivi === "yes" || filters.has_colloqui_positivi === "no") count++;

    if (filters.has_test === "yes" || filters.has_test === "no") count++;
    if (filters.test_status && filters.test_status !== "all") count++;
    if (filters.test_completed === "yes" || filters.test_completed === "no") count++;
    if (filters.test_eligible === "yes" || filters.test_eligible === "no") count++;
    if (filters.test_suspect === "yes" || filters.test_suspect === "no") count++;
    if (filters.test_unreliable === "yes" || filters.test_unreliable === "no") count++;
    if (filters.test_preferred === "yes" || filters.test_preferred === "no") count++;
    if (filters.test_read === "yes" || filters.test_read === "no") count++;
    if (filters.test_evaluation && filters.test_evaluation !== "all") count++;
    if (filters.test_profile_id && filters.test_profile_id !== "all") count++;

    if (filters.piattaforma && filters.piattaforma !== "all") count++;

    if (filters.data_da) count++;
    if (filters.data_a) count++;

    if (filters.data_chiusura_da) count++;
    if (filters.data_chiusura_a) count++;

    return count;
}

export function ApplicationList({ filters: externalFilters, onFiltersChange }: ApplicationListProps) {

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(24);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("recent");

    const [localFilters, setLocalFilters] = useState<FilterState>(() => {
        const init = { ...INITIAL_FILTERS };
        if (externalFilters.selection_id) {
            init.selezione_id = externalFilters.selection_id.toString();
        }
        if (externalFilters.company_id) {
            init.company_id = externalFilters.company_id.toString();
        }
        return init;
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setLocalFilters((prev) => {
            const newSelId = externalFilters.selection_id?.toString() || "all";
            const newCompId = externalFilters.company_id?.toString() || "all";
            if (prev.selezione_id === newSelId && prev.company_id === newCompId) return prev;
            return { ...prev, selezione_id: newSelId, company_id: newCompId };
        });
    }, [externalFilters.selection_id, externalFilters.company_id]);

    const queryParams = useMemo(
        () => buildQueryParams(localFilters, debouncedSearch, sortBy, page, limit),
        [localFilters, debouncedSearch, sortBy, page, limit]
    );

    const {
        data: applicationsResponse,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetApplicationsQuery(queryParams);

    const { data: filterOptions } = useGetFilterOptionsQuery();
    const { data: selections = [] } = useGetSelectionsQuery({});

    const applications = applicationsResponse?.data ?? [];
    const pagination = applicationsResponse?.pagination ?? {
        total: 0,
        page: 1,
        limit: 24,
        total_pages: 1,
    };

    const activeFiltersCount = useMemo(() => countActiveFilters(localFilters), [localFilters]);

    const handleFilterChange = useCallback(
        (newFilters: FilterState) => {
            setLocalFilters(newFilters);
            setPage(1);

            const newSelId = newFilters.selezione_id !== "all" ? parseInt(newFilters.selezione_id) : undefined;
            const newCompId = newFilters.company_id !== "all" ? parseInt(newFilters.company_id) : undefined;

            if (newSelId !== externalFilters.selection_id || newCompId !== externalFilters.company_id) {
                onFiltersChange({
                    ...(newSelId ? { selection_id: newSelId } : {}),
                    ...(newCompId ? { company_id: newCompId } : {}),
                });
            }
        },
        [externalFilters, onFiltersChange]
    );

    const handleClearFilters = useCallback(() => {
        setLocalFilters(INITIAL_FILTERS);
        setSearchQuery("");
        setDebouncedSearch("");
        setPage(1);
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

    if (isLoading && !isFetching) {
        return (
            <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text">Lista Candidature</h2>
                </div>
                <div className="p-12 flex items-center justify-center">
                    <Spinner className="h-8 w-8" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text">Lista Candidature</h2>
                </div>
                <div className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-bigster-text-muted mb-4">
                        Errore nel caricamento delle candidature
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
                        <h2 className="text-lg font-bold text-bigster-text">Lista Candidature</h2>
                        <p className="text-xs text-bigster-text-muted">
                            {pagination.total} candidature totali
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-b border-bigster-border">
                <ApplicationsToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    activeFiltersCount={activeFiltersCount}
                    filters={localFilters}
                    onFiltersChange={handleFilterChange}
                    selections={selections}
                    filterOptions={filterOptions ?? { regioni: [], province: [], citta: [], titoli_studio: [] }}
                    resultsCount={pagination.total}
                    isLoading={isFetching}
                />
            </div>

            <div className="p-6">
                {applications.length === 0 ? (
                    <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
                        <Users className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                        <p className="text-sm font-medium text-bigster-text-muted mb-1">
                            Nessuna candidatura trovata
                        </p>
                        <p className="text-xs text-bigster-text-muted">
                            {activeFiltersCount > 0 || searchQuery
                                ? "Prova a modificare i filtri di ricerca"
                                : "Non ci sono candidature da visualizzare"}
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
                            {applications.map((application, index) => {
                                const isInRosa = checkIsInRosa(
                                    application,
                                    localFilters.selezione_id
                                );

                                return (
                                    <motion.div
                                        key={application.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        <ApplicationCard
                                            application={application}
                                            isInRosa={isInRosa}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {pagination.total_pages > 1 && (
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
                                    {pagination.total}
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
                                Pagina {page} di {pagination.total_pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                                disabled={page === pagination.total_pages || isFetching}
                                className="rounded-none border border-bigster-border"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
