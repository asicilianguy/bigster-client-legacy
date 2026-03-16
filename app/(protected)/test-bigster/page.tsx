"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { TestList } from "./_components/TestList";
import { TestAlertsPanel } from "./_components/TestAlertsPanel";
import { TestBigsterKPI } from "./_components/TestBigsterKPI";
import { useGetBigsterDashboardQuery } from "@/lib/redux/features/bigster/bigsterStatsApiSlice";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { StatsFilters } from "@/types/bigster-stats";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    BarChart3,
    AlertTriangle,
    RefreshCw,
    Briefcase,
    LayoutDashboard,
    PieChart,
} from "lucide-react";
import BigsterLoader from "@/components/shared/BigsterLoader";

export default function TestBigsterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectionIdFromUrl = searchParams.get("selection_id");

    const testListRef = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState<StatsFilters>(() => {
        if (selectionIdFromUrl) {
            return { selection_id: parseInt(selectionIdFromUrl) };
        }
        return {};
    });

    useEffect(() => {
        if (selectionIdFromUrl && testListRef.current) {
            const timer = setTimeout(() => {
                testListRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
            return () => clearTimeout(timer);
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
            router.push("/test-bigster");
        }
    }, [filters.selection_id, selectionIdFromUrl, router]);

    const {
        data: dashboardData,
        isLoading,
        isError,
        refetch,
    } = useGetBigsterDashboardQuery(filters);

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

    if (isLoading) {
        return <BigsterLoader text="Caricamento test" />;
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
                <div className="bg-bigster-surface border border-bigster-border p-8 max-w-md w-full text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-bigster-text mb-2">
                        Errore nel caricamento
                    </h2>
                    <p className="text-bigster-text-muted mb-6">
                        Non è stato possibile caricare i dati.
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
        <div className="min-h-screen bg-bigster-background">
            <div className="mx-auto p-6 space-y-6">

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-bigster-text tracking-tight">
                            Test BigsTer
                        </h1>
                        <p className="text-sm text-bigster-text-muted mt-1">
                            Gestisci e monitora i test psicometrici
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <Button
                            onClick={() => router.push("/test-bigster/dashboard")}
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard KPI
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => router.push("/test-bigster/statistiche")}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg font-semibold"
                        >
                            <PieChart className="h-4 w-4 mr-2" />
                            Statistiche Aggregate
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <TestBigsterKPI
                        overview={dashboardData?.overview}
                        isLoading={isLoading}
                    />
                </motion.div>

                {dashboardData && dashboardData.alerts.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <TestAlertsPanel alerts={dashboardData.alerts} />
                    </motion.div>
                )}

                {selectedSelection && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-bigster-primary border border-yellow-200 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-bigster-primary-text" />
                            <div>
                                <p className="text-sm font-bold text-bigster-primary-text">
                                    Filtro attivo: {selectedSelection.titolo}
                                </p>
                                <p className="text-xs text-bigster-primary-text opacity-80">
                                    {selectedSelection.company?.nome} • Stai visualizzando solo i test di questa selezione
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSelectionFilter}
                            className="rounded-none border-bigster-primary-text bg-transparent text-bigster-primary-text hover:bg-yellow-200"
                        >
                            Mostra tutti
                        </Button>
                    </motion.div>
                )}

                <motion.div
                    ref={testListRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <TestList filters={filters} onFiltersChange={setFilters} />
                </motion.div>
            </div>
        </div>
    );
}
