"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
    ReferenceLine,
} from "recharts";
import { useGetBigsterAggregateScoresQuery } from "@/lib/redux/features/bigster/bigsterStatsApiSlice";
import { useGetSelectionsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetBigsterProfilesQuery } from "@/lib/redux/features/bigster";
import { AggregateScoresFilters, CharacteristicStats } from "@/types/bigster-stats";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
    ArrowLeft,
    RefreshCw,
    AlertTriangle,
    Filter,
    X,
    Users,
    ThumbsUp,
    ThumbsDown,
    ShieldAlert,
    TrendingDown,
    Heart,
    Zap,
    Shield,
    BarChart3,
    PieChart as PieChartIcon,
    ListChecks,
    LayoutDashboard,
    FileBarChart,
    Info,
} from "lucide-react";
import BigsterLoader from "@/components/shared/BigsterLoader";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const ATTEGGIAMENTO_MAP: Record<string, string> = {
    A: "Stabilità",
    B: "Allegria",
    C: "Tranquillità",
    D: "Fiducia",
    E: "Dinamicità",
    F: "Proattività",
    G: "Coscienziosità",
    H: "Imparzialità",
    I: "Empatia",
    J: "Comunicatività",
};

const CAPACITA_MAP: Record<string, string> = {
    C1: "Positività",
    C2: "Prospettiva",
    C3: "Resilienza",
    C4: "Controllo",
    C5: "Responsabilità",
    C6: "Volontà",
    C7: "Altruismo",
    C8: "Senso Etico",
    C9: "Comprensione",
    C10: "Consapevolezza",
};

const VALIDITA_MAP: Record<string, string> = {
    K: "Difensività",
    L: "Lie",
    EGL: "Egoic Lies",
    ETL: "Ethic Lies",
    M: "Inconsapevolezza",
};

const NEUROTIC_MAP: Record<string, string> = {
    N1: "Ansia",
    N2: "Depressione",
    N3: "Dipendenza",
    N4: "Isteria",
    N5: "Ossessività",
};

const PATHOLOGIC_MAP: Record<string, string> = {
    P1: "Maniacale",
    P2: "Anti-sociale",
    P3: "Narcisista",
    P4: "Paranoide",
    P5: "Schizoide",
};

const REGIONI_ITALIANE = [
    "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
    "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
    "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
    "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
];

const PIE_COLORS = ["#3b82f6", "#ec4899"];

const SEX_OPTIONS = [
    { value: "MALE", label: "Maschio" },
    { value: "FEMALE", label: "Femmina" },
];

function normalizeScore(raw: number): number {
    return Math.round(((raw + 100) / 200) * 100);
}

function getScoreColor(normalizedValue: number): string {
    if (normalizedValue >= 60) return "#22c55e";
    if (normalizedValue >= 40) return "#f59e0b";
    return "#ef4444";
}

function getValidityColor(rawValue: number): string {
    if (rawValue >= 80) return "#ef4444";
    if (rawValue >= 49) return "#f59e0b";
    return "#22c55e";
}

function formatCharStats(stats: CharacteristicStats): string {
    return `Avg: ${stats.avg.toFixed(1)} | Min: ${stats.min} | Max: ${stats.max} | Med: ${stats.median.toFixed(1)} | σ: ${stats.std_dev.toFixed(1)}`;
}

export default function StatisticheAggregatePage() {
    const router = useRouter();

    const [filters, setFilters] = useState<AggregateScoresFilters>({});
    const [showFilters, setShowFilters] = useState(true);

    const {
        data,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetBigsterAggregateScoresQuery(
        Object.keys(filters).length > 0 ? filters : undefined
    );

    const { data: selections = [] } = useGetSelectionsQuery({});
    const { data: profiles = [] } = useGetBigsterProfilesQuery();

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter(
            (v) => v !== undefined && v !== ""
        ).length;
    }, [filters]);

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

    const regioniOptions = useMemo(() =>
        REGIONI_ITALIANE.map((r) => ({
            value: r,
            label: r,
        })),
        []
    );

    const filtersAppliedBadges = useMemo(() => {
        if (!data?.filters_applied) return [];
        const badges: { label: string; value: string }[] = [];
        const fa = data.filters_applied;

        if (fa.company_id) {
            const sel = selections.find((s) => s.company?.id === Number(fa.company_id));
            badges.push({ label: "Azienda", value: sel?.company?.nome || String(fa.company_id) });
        }
        if (fa.selection_id) {
            const sel = selections.find((s) => s.id === Number(fa.selection_id));
            badges.push({ label: "Selezione", value: sel?.titolo || String(fa.selection_id) });
        }
        if (fa.sex) badges.push({ label: "Sesso", value: fa.sex === "MALE" ? "Maschio" : "Femmina" });
        if (fa.region) badges.push({ label: "Regione", value: String(fa.region) });
        if (fa.age_min || fa.age_max) {
            badges.push({ label: "Età", value: `${fa.age_min || "?"} - ${fa.age_max || "?"}` });
        }
        if (fa.profile_id) {
            const p = profiles.find((pr) => pr.id === Number(fa.profile_id));
            badges.push({ label: "Profilo", value: p?.name || String(fa.profile_id) });
        }

        return badges;
    }, [data, selections, profiles]);

    const atteggiamentoData = useMemo(() => {
        if (!data?.scores?.base) return [];
        return Object.entries(ATTEGGIAMENTO_MAP).map(([code, name]) => {
            const rawAvg = data.scores.base[code as keyof typeof data.scores.base]?.avg ?? 0;
            return {
                name,
                code,
                value: normalizeScore(rawAvg),
                rawAvg,
                stats: data.scores.base[code as keyof typeof data.scores.base],
            };
        });
    }, [data]);

    const capacitaData = useMemo(() => {
        if (!data?.scores?.composite) return [];
        return Object.entries(CAPACITA_MAP).map(([code, name]) => {
            const rawAvg = data.scores.composite[code as keyof typeof data.scores.composite]?.avg ?? 0;
            return {
                name,
                code,
                value: normalizeScore(rawAvg),
                rawAvg,
                stats: data.scores.composite[code as keyof typeof data.scores.composite],
            };
        });
    }, [data]);

    const validitaData = useMemo(() => {
        if (!data?.scores?.validity) return [];
        return Object.entries(VALIDITA_MAP).map(([code, name]) => {
            const rawAvg = data.scores.validity[code as keyof typeof data.scores.validity]?.avg ?? 0;
            return {
                name,
                code,
                value: normalizeScore(rawAvg),
                rawAvg,
                stats: data.scores.validity[code as keyof typeof data.scores.validity],
            };
        });
    }, [data]);

    const neuroticData = useMemo(() => {
        if (!data?.scores?.neurotic) return [];
        return Object.entries(NEUROTIC_MAP).map(([code, name]) => {
            const rawAvg = data.scores.neurotic[code as keyof typeof data.scores.neurotic]?.avg ?? 0;
            return {
                name,
                code,
                value: normalizeScore(rawAvg),
                rawAvg,
                stats: data.scores.neurotic[code as keyof typeof data.scores.neurotic],
            };
        });
    }, [data]);

    const pathologicData = useMemo(() => {
        if (!data?.scores?.pathologic) return [];
        return Object.entries(PATHOLOGIC_MAP).map(([code, name]) => {
            const rawAvg = data.scores.pathologic[code as keyof typeof data.scores.pathologic]?.avg ?? 0;
            return {
                name,
                code,
                value: normalizeScore(rawAvg),
                rawAvg,
                stats: data.scores.pathologic[code as keyof typeof data.scores.pathologic],
            };
        });
    }, [data]);

    const sexPieData = useMemo(() => {
        if (!data?.sex_breakdown) return [];
        return [
            { name: "Maschi", value: data.sex_breakdown.male_count },
            { name: "Femmine", value: data.sex_breakdown.female_count },
        ].filter((d) => d.value > 0);
    }, [data]);

    const handleClearFilters = () => {
        setFilters({});
    };

    if (isLoading && !data) {
        return <BigsterLoader text="Caricamento statistiche" />;
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
                                Statistiche Aggregate
                            </h1>
                            <p className="text-sm text-bigster-text-muted mt-1">
                                Medie e distribuzioni su gruppi filtrati di test completati
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/test-bigster/dashboard")}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg font-semibold"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard KPI
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
                        className="bg-bigster-surface border border-bigster-border"
                    >
                        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                Filtri Gruppo
                            </h3>
                            <p className="text-xs text-bigster-text-muted">
                                Seleziona i criteri per calcolare le medie aggregate
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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
                                    <SearchableSelect
                                        label="Regione"
                                        value={filters.region ?? ""}
                                        onChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                region: value || undefined,
                                            }))
                                        }
                                        options={regioniOptions}
                                        placeholder="Cerca regione..."
                                        emptyLabel="Tutte le regioni"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <StandardSelect
                                        label="Sesso"
                                        value={filters.sex ?? ""}
                                        onChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                sex: (value || undefined) as "MALE" | "FEMALE" | undefined,
                                            }))
                                        }
                                        options={SEX_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Età minima
                                    </label>
                                    <input
                                        type="number"
                                        min={18}
                                        max={70}
                                        value={filters.age_min ?? ""}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                age_min: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            }))
                                        }
                                        className={inputBase}
                                        placeholder="Es. 25"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Età massima
                                    </label>
                                    <input
                                        type="number"
                                        min={18}
                                        max={70}
                                        value={filters.age_max ?? ""}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                age_max: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            }))
                                        }
                                        className={inputBase}
                                        placeholder="Es. 35"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Periodo da
                                    </label>
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
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Periodo a
                                    </label>
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
                                    />
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

                {filtersAppliedBadges.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                            Filtri attivi:
                        </span>
                        {filtersAppliedBadges.map((badge, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-bigster-card-bg border border-bigster-border text-xs text-bigster-text"
                            >
                                {badge.label}: <strong>{badge.value}</strong>
                            </span>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="bg-red-50 border border-red-200 p-6 text-center">
                        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-red-800 mb-2">
                            Errore nel caricamento
                        </p>
                        <Button
                            onClick={() => refetch()}
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Riprova
                        </Button>
                    </div>
                )}

                {data && data.sample_size === 0 && (
                    <div className="text-center py-16 bg-bigster-muted-bg border border-bigster-border">
                        <FileBarChart className="h-16 w-16 text-bigster-text-muted mx-auto mb-4" />
                        <p className="text-lg font-semibold text-bigster-text mb-2">
                            Nessun test completato per i filtri selezionati
                        </p>
                        <p className="text-sm text-bigster-text-muted mb-4">
                            Prova a modificare o rimuovere alcuni filtri per ampliare il campione.
                        </p>
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancella tutti i filtri
                            </Button>
                        )}
                    </div>
                )}

                {data && data.sample_size > 0 && (
                    <div className="space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                        >
                            <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-bigster-text-muted" />
                                    <div>
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                            Campione
                                        </p>
                                        <p className="text-2xl font-bold text-bigster-text">
                                            {data.sample_size}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200">
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                            Idonei
                                        </p>
                                        <p className="text-2xl font-bold text-bigster-text">
                                            {data.eligible_count}
                                        </p>
                                        <p className="text-xs text-bigster-text-muted">
                                            {data.eligibility_rate}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-red-50 border border-red-200">
                                <div className="flex items-center gap-2">
                                    <ThumbsDown className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                            Non Idonei
                                        </p>
                                        <p className="text-2xl font-bold text-bigster-text">
                                            {data.not_eligible_count}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 border border-amber-200">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                            Sospetti
                                        </p>
                                        <p className="text-2xl font-bold text-bigster-text">
                                            {data.suspect_count}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-red-50 border border-red-200">
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                            Inaffidabili
                                        </p>
                                        <p className="text-2xl font-bold text-bigster-text">
                                            {data.unreliable_count}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-bigster-text-muted" />
                                    <div>
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                            M / F
                                        </p>
                                        <p className="text-lg font-bold text-bigster-text">
                                            {data.sex_breakdown.male_count} / {data.sex_breakdown.female_count}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {atteggiamentoData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-bigster-surface border border-bigster-border"
                                >
                                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-5 w-5 text-purple-600" />
                                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                                Atteggiamento (Media)
                                            </h3>
                                        </div>
                                        <p className="text-xs text-bigster-text-muted mt-1">
                                            Profilo comportamentale medio del gruppo (scala -100 / +100)
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={atteggiamentoData}>
                                                    <PolarGrid stroke="#d8d8d8" />
                                                    <PolarAngleAxis
                                                        dataKey="name"
                                                        tick={{ fill: "#6c4e06", fontSize: 10 }}
                                                    />
                                                    <PolarRadiusAxis
                                                        angle={90}
                                                        domain={[0, 100]}
                                                        tick={{ fill: "#666666", fontSize: 10 }}
                                                    />
                                                    <Radar
                                                        name="Media"
                                                        dataKey="value"
                                                        stroke="#8b5cf6"
                                                        fill="#8b5cf6"
                                                        fillOpacity={0.3}
                                                        strokeWidth={2}
                                                    />
                                                    <Tooltip
                                                        formatter={(_val: number, _name: string, entry: any) => {
                                                            const stats = entry?.payload?.stats as CharacteristicStats | undefined;
                                                            const rawAvg = entry?.payload?.rawAvg as number | undefined;
                                                            if (!stats) return [`${rawAvg?.toFixed(1) ?? "N/A"}`, "Media"];
                                                            return [
                                                                `Avg: ${stats.avg.toFixed(1)} | Min: ${stats.min} | Max: ${stats.max} | σ: ${stats.std_dev.toFixed(1)}`,
                                                                entry.payload.name,
                                                            ];
                                                        }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {atteggiamentoData.map((item) => (
                                                <div
                                                    key={item.code}
                                                    className="flex items-center justify-between text-xs p-2 bg-bigster-card-bg border border-bigster-border"
                                                >
                                                    <span className="text-bigster-text-muted">
                                                        {item.name}
                                                    </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{ color: getScoreColor(item.value) }}
                                                    >
                                                        {item.rawAvg.toFixed(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {capacitaData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-bigster-surface border border-bigster-border"
                                >
                                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-green-600" />
                                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                                Capacità (Media)
                                            </h3>
                                        </div>
                                        <p className="text-xs text-bigster-text-muted mt-1">
                                            Competenze trasversali medie del gruppo (scala -100 / +100)
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={capacitaData}>
                                                    <PolarGrid stroke="#d8d8d8" />
                                                    <PolarAngleAxis
                                                        dataKey="name"
                                                        tick={{ fill: "#6c4e06", fontSize: 10 }}
                                                    />
                                                    <PolarRadiusAxis
                                                        angle={90}
                                                        domain={[0, 100]}
                                                        tick={{ fill: "#666666", fontSize: 10 }}
                                                    />
                                                    <Radar
                                                        name="Media"
                                                        dataKey="value"
                                                        stroke="#22c55e"
                                                        fill="#22c55e"
                                                        fillOpacity={0.3}
                                                        strokeWidth={2}
                                                    />
                                                    <Tooltip
                                                        formatter={(_val: number, _name: string, entry: any) => {
                                                            const stats = entry?.payload?.stats as CharacteristicStats | undefined;
                                                            const rawAvg = entry?.payload?.rawAvg as number | undefined;
                                                            if (!stats) return [`${rawAvg?.toFixed(1) ?? "N/A"}`, "Media"];
                                                            return [
                                                                `Avg: ${stats.avg.toFixed(1)} | Min: ${stats.min} | Max: ${stats.max} | σ: ${stats.std_dev.toFixed(1)}`,
                                                                entry.payload.name,
                                                            ];
                                                        }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {capacitaData.map((item) => (
                                                <div
                                                    key={item.code}
                                                    className="flex items-center justify-between text-xs p-2 bg-bigster-card-bg border border-bigster-border"
                                                >
                                                    <span className="text-bigster-text-muted">
                                                        {item.name}
                                                    </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{ color: getScoreColor(item.value) }}
                                                    >
                                                        {item.rawAvg.toFixed(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {validitaData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-bigster-surface border border-bigster-border"
                                >
                                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-orange-600" />
                                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                                Scale di Validità (Media)
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={validitaData}
                                                    layout="vertical"
                                                    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                    <XAxis
                                                        type="number"
                                                        domain={[0, 100]}
                                                        tick={{ fill: "#666666", fontSize: 11 }}
                                                    />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        tick={{ fill: "#6c4e06", fontSize: 11 }}
                                                        width={100}
                                                    />
                                                    <Tooltip
                                                        formatter={(_val: number, _name: string, entry: any) => {
                                                            const stats = entry?.payload?.stats as CharacteristicStats | undefined;
                                                            if (!stats) return [`${entry?.payload?.rawAvg?.toFixed(1) ?? "N/A"}`, "Media"];
                                                            return [
                                                                `Avg: ${stats.avg.toFixed(1)} | Min: ${stats.min} | Max: ${stats.max}`,
                                                                entry.payload.name,
                                                            ];
                                                        }}
                                                    />

                                                    <ReferenceLine x={normalizeScore(49)} stroke="#f59e0b" strokeDasharray="3 3" />
                                                    <ReferenceLine x={normalizeScore(80)} stroke="#ef4444" strokeDasharray="3 3" />
                                                    <Bar dataKey="value" name="Media">
                                                        {validitaData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={getValidityColor(entry.rawAvg)}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-[10px] text-bigster-text-muted">
                                            <div className="flex items-center gap-1">
                                                <span className="w-3 h-0.5 bg-yellow-500 inline-block" />
                                                <span>Soglia sospetto (raw 49)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-3 h-0.5 bg-red-500 inline-block" />
                                                <span>Soglia critica (raw 80)</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="space-y-6"
                            >

                                {sexPieData.length > 0 && (
                                    <div className="bg-bigster-surface border border-bigster-border">
                                        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                                Distribuzione Sesso
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="h-[180px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={sexPieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={70}
                                                            paddingAngle={2}
                                                            dataKey="value"
                                                        >
                                                            {sexPieData.map((_, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={PIE_COLORS[index]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {data.age_breakdown.length > 0 && (
                                    <div className="bg-bigster-surface border border-bigster-border">
                                        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                                Distribuzione Età
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="h-[180px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={data.age_breakdown}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                        <XAxis
                                                            dataKey="range"
                                                            tick={{ fill: "#6c4e06", fontSize: 11 }}
                                                        />
                                                        <YAxis tick={{ fill: "#666666", fontSize: 11 }} />
                                                        <Tooltip />
                                                        <Bar dataKey="count" fill="#fde01c" name="Candidati" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {neuroticData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-bigster-surface border border-bigster-border"
                                >
                                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                        <h3 className="text-[15px] font-semibold text-bigster-text">
                                            Scale Nevrotiche (Media)
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-3">
                                            {neuroticData.map((item) => (
                                                <div key={item.code} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-bigster-text">
                                                            {item.name}
                                                        </span>
                                                        <span className="font-bold text-bigster-text">
                                                            {item.rawAvg.toFixed(1)}
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-3 bg-bigster-border relative overflow-hidden">
                                                        <div
                                                            className="h-full transition-all"
                                                            style={{
                                                                width: `${item.value}%`,
                                                                backgroundColor: getValidityColor(item.rawAvg),
                                                            }}
                                                        />

                                                        {item.stats && (
                                                            <>
                                                                <div
                                                                    className="absolute top-0 w-0.5 h-full bg-bigster-text opacity-30"
                                                                    style={{ left: `${normalizeScore(item.stats.min)}%` }}
                                                                />
                                                                <div
                                                                    className="absolute top-0 w-0.5 h-full bg-bigster-text opacity-30"
                                                                    style={{ left: `${normalizeScore(item.stats.max)}%` }}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                    {item.stats && (
                                                        <p className="text-[10px] text-bigster-text-muted">
                                                            Min: {item.stats.min} | Max: {item.stats.max} | σ: {item.stats.std_dev.toFixed(1)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {pathologicData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="bg-bigster-surface border border-bigster-border"
                                >
                                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                                        <h3 className="text-[15px] font-semibold text-bigster-text">
                                            Scale Patologiche (Media)
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-3">
                                            {pathologicData.map((item) => (
                                                <div key={item.code} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-bigster-text">
                                                            {item.name}
                                                        </span>
                                                        <span className="font-bold text-bigster-text">
                                                            {item.rawAvg.toFixed(1)}
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-3 bg-bigster-border relative overflow-hidden">
                                                        <div
                                                            className="h-full transition-all"
                                                            style={{
                                                                width: `${item.value}%`,
                                                                backgroundColor: getValidityColor(item.rawAvg),
                                                            }}
                                                        />

                                                        {item.stats && (
                                                            <>
                                                                <div
                                                                    className="absolute top-0 w-0.5 h-full bg-bigster-text opacity-30"
                                                                    style={{ left: `${normalizeScore(item.stats.min)}%` }}
                                                                />
                                                                <div
                                                                    className="absolute top-0 w-0.5 h-full bg-bigster-text opacity-30"
                                                                    style={{ left: `${normalizeScore(item.stats.max)}%` }}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                    {item.stats && (
                                                        <p className="text-[10px] text-bigster-text-muted">
                                                            Min: {item.stats.min} | Max: {item.stats.max} | σ: {item.stats.std_dev.toFixed(1)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
