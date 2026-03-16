"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TestDashboard } from "../_components/TestDashboard";
import { useGetBigsterDashboardQuery } from "@/lib/redux/features/bigster/bigsterStatsApiSlice";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetBigsterProfilesQuery } from "@/lib/redux/features/bigster";
import { StatsFilters } from "@/types/bigster-stats";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    ArrowLeft,
    RefreshCw,
    AlertTriangle,
    Filter,
    X,
    PieChart,
    ListChecks,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import BigsterLoader from "@/components/shared/BigsterLoader";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

export default function DashboardPage() {
    const router = useRouter();

    const [filters, setFilters] = useState<StatsFilters>({});
    const [showFilters, setShowFilters] = useState(true);

    const {
        data: dashboardData,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetBigsterDashboardQuery(filters);

    const { data: selections = [] } = useGetSelectionsQuery({});
    const { data: profiles = [] } = useGetBigsterProfilesQuery();

    const activeFiltersCount = Object.values(filters).filter(
        (v) => v !== undefined && v !== ""
    ).length;

    const handleClearFilters = () => {
        setFilters({});
    };

    const selectionOptions = useMemo(() =>
        selections.map((s) => ({
            value: String(s.id),
            label: `${s.titolo} — ${s.company?.nome ?? ""}`,
        })),
        [selections]
    );

    const profileOptions = useMemo(() =>
        profiles.map((p) => ({
            value: String(p.id),
            label: p.name,
        })),
        [profiles]
    );

    if (isLoading) {
        return <BigsterLoader text="Caricamento dashboard" />;
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
                        Non è stato possibile caricare i dati della dashboard.
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
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/test-bigster")}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-bigster-text tracking-tight">
                                Dashboard KPI
                            </h1>
                            <p className="text-sm text-bigster-text-muted mt-1">
                                Panoramica completa delle performance dei test BigsTer
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

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
                            onClick={() => router.push("/test-bigster")}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg font-semibold"
                        >
                            <ListChecks className="h-4 w-4 mr-2" />
                            Lista Test
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`relative rounded-none border px-3 py-2 ${showFilters
                                ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                                : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                                }`}
                        >
                            <Filter className="h-5 w-5" />
                            {activeFiltersCount > 0 && (
                                <span
                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                                    style={{ backgroundColor: "#e4d72b" }}
                                >
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </motion.div>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-bigster-surface border border-bigster-border"
                    >
                        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                Filtra Dashboard
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="Selezione"
                                        value={filters.selection_id ? String(filters.selection_id) : ""}
                                        onChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                selection_id: value ? parseInt(value) : undefined,
                                            }))
                                        }
                                        options={selectionOptions}
                                        placeholder="Cerca selezione..."
                                        emptyLabel="Tutte le selezioni"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="Profilo BigsTer"
                                        value={filters.profile_id ? String(filters.profile_id) : ""}
                                        onChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                profile_id: value ? parseInt(value) : undefined,
                                            }))
                                        }
                                        options={profileOptions}
                                        placeholder="Cerca profilo..."
                                        emptyLabel="Tutti i profili"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Periodo
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={filters.date_from ?? ""}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    date_from: e.target.value || undefined,
                                                }))
                                            }
                                            className={inputBase}
                                            placeholder="Da"
                                        />
                                        <input
                                            type="date"
                                            value={filters.date_to ?? ""}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    date_to: e.target.value || undefined,
                                                }))
                                            }
                                            className={inputBase}
                                            placeholder="A"
                                        />
                                    </div>
                                </div>
                            </div>

                            {activeFiltersCount > 0 && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleClearFilters}
                                        className="rounded-none border-2 font-semibold"
                                        style={{
                                            borderColor: "#ef4444",
                                            color: "#ef4444",
                                            backgroundColor: "rgba(239,68,68,0.05)",
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancella filtri ({activeFiltersCount})
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {dashboardData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <TestDashboard
                            overview={dashboardData.overview}
                            trends={dashboardData.trends}
                            byProfile={dashboardData.by_profile}
                            byRegion={dashboardData.by_region ?? []}
                            scoreDistribution={dashboardData.score_distribution}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
