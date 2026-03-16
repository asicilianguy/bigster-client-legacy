"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGetApplicationStatsQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { ApplicationList } from "./_components/ApplicationList";
import { ApplicationsKPI } from "./_components/ApplicationsKPI";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export default function CandidaturePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectionIdFromUrl = searchParams.get("selezione_id");

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
            router.push("/candidature");
        }
    }, [filters.selection_id, selectionIdFromUrl, router]);

    const statsParams = useMemo(() => {
        const params: { selection_id?: number; company_id?: number } = {};
        if (filters.selection_id) params.selection_id = filters.selection_id;
        if (filters.company_id) params.company_id = filters.company_id;
        return Object.keys(params).length > 0 ? params : undefined;
    }, [filters.selection_id, filters.company_id]);

    const { data: stats, isLoading: isLoadingStats } = useGetApplicationStatsQuery(statsParams);
    const { data: selections = [] } = useGetSelectionsQuery({});

    const selectedSelection = useMemo(() => {
        if (filters.selection_id && selections.length > 0) {
            return selections.find((s) => s.id === filters.selection_id);
        }
        return null;
    }, [filters.selection_id, selections]);

    const handleClearSelectionFilter = () => {
        setFilters((prev) => {
            const { selection_id, ...rest } = prev;
            return rest;
        });
    };

    const handleFiltersChange = (newFilters: { selection_id?: number; company_id?: number }) => {
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
                        Candidature
                    </h1>
                    <p className="text-sm text-bigster-text-muted mt-1">
                        Gestisci tutte le candidature ricevute
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <ApplicationsKPI stats={stats} isLoading={isLoadingStats} />
                </motion.div>

                {selectedSelection && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-4 bg-bigster-primary border border-yellow-200 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-bigster-primary-text" />
                            <div>
                                <p className="text-sm font-bold text-bigster-primary-text">
                                    Filtro attivo: {selectedSelection.titolo}
                                </p>
                                <p className="text-xs text-bigster-primary-text opacity-80">
                                    {selectedSelection.company?.nome} • Stai visualizzando solo le candidature di questa selezione
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSelectionFilter}
                            className="rounded-none border-bigster-primary-text bg-transparent text-bigster-primary-text hover:bg-yellow-200"
                        >
                            Mostra tutte
                        </Button>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <ApplicationList
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />
                </motion.div>
            </div>
        </div>
    );
}
