"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    StatsOverview,
    StatsTimeSeries,
    StatsByProfile,
    StatsByRegion,
    ScoreDistribution,
} from "@/types/bigster-stats";
import {
    ClipboardCheck,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Users,
    Timer,
    Award,
    XCircle,
    Hourglass,
    MapPin,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";

interface TestDashboardProps {
    overview: StatsOverview;
    trends: StatsTimeSeries[];
    byProfile: StatsByProfile[];
    byRegion: StatsByRegion[];
    scoreDistribution: ScoreDistribution[];
}

const COLORS = {
    primary: "#fde01c",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    muted: "#6b7280",
    text: "#6c4e06",
};

const PIE_COLORS = ["#22c55e", "#fde01c", "#3b82f6", "#ef4444", "#6b7280"];

const CHARACTERISTIC_NAMES: Record<string, string> = {

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

    K: "Difensività",
    L: "Lie",
    EGL: "Egoic Lies",
    ETL: "Ethic Lies",
    M: "Inconsapevolezza",

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

    N1: "Ansia",
    N2: "Depressione",
    N3: "Dipendenza",
    N4: "Isteria",
    N5: "Ossessività",

    P1: "Maniacale",
    P2: "Anti-sociale",
    P3: "Narcisista",
    P4: "Paranoide",
    P5: "Schizoide",
};

const CATEGORY_ORDER = [
    { key: "base", label: "Atteggiamento (Base)", codes: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] },
    { key: "composite", label: "Capacità (Composite)", codes: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"] },
    { key: "validity", label: "Scale di Validità", codes: ["K", "L", "EGL", "ETL", "M"] },
    { key: "neurotic", label: "Scale Nevrotiche", codes: ["N1", "N2", "N3", "N4", "N5"] },
    { key: "pathologic", label: "Scale Patologiche", codes: ["P1", "P2", "P3", "P4", "P5"] },
];

function normalizeScore(value: number): number {
    return ((value + 100) / 200) * 100;
}

function formatTrendDate(dateStr: string): string {
    if (!dateStr) return "";

    if (dateStr.length === 7) {
        const [year, month] = dateStr.split("-");
        const monthNames = [
            "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
            "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    return dateStr;
}

function getCurrentMonthName(): string {
    const monthNames = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    return monthNames[new Date().getMonth()];
}

function getPreviousMonthName(): string {
    const monthNames = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    return monthNames[prevMonth];
}

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    color?: "default" | "success" | "warning" | "danger" | "info";
}

const iconColorClasses: Record<string, string> = {
    default: "bg-bigster-card-bg text-bigster-text",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-blue-50 text-blue-600",
};

function KpiCard({ title, value, subtitle, icon, trend, color = "default" }: KpiCardProps) {
    return (
        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide truncate">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-bigster-text mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-bigster-text-muted mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend.positive ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span
                                className={`text-xs font-medium ${trend.positive ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {trend.positive ? "+" : ""}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-bigster-text-muted">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`p-2 ${iconColorClasses[color]}`}>{icon}</div>
            </div>
        </div>
    );
}

interface TemporalComparisonProps {
    overview: StatsOverview;
}

function TemporalComparison({ overview }: TemporalComparisonProps) {
    const currentMonth = getCurrentMonthName();
    const previousMonth = getPreviousMonthName();
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const renderChange = (change: number | null, label: string, count: number) => {
        if (change === null) {
            return (
                <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-bigster-text-muted" />
                    <span className="text-sm text-bigster-text-muted">
                        vs {label}: N/D
                    </span>
                </div>
            );
        }

        const isPositive = change > 0;
        const isZero = change === 0;

        return (
            <div className="flex items-center gap-2">
                {isZero ? (
                    <Minus className="h-4 w-4 text-bigster-text-muted" />
                ) : isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-bigster-text">
                    vs {label}:{" "}
                    <span
                        className={`font-bold ${isZero
                            ? "text-bigster-text-muted"
                            : isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {isPositive ? "+" : ""}
                        {change.toFixed(1)}%
                    </span>
                </span>
                <span className="text-xs text-bigster-text-muted">
                    ({count} test)
                </span>
            </div>
        );
    };

    return (
        <div className="bg-bigster-surface border border-bigster-border">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-bigster-text" />
                    <h3 className="text-[15px] font-semibold text-bigster-text">
                        Confronto Temporale
                    </h3>
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-bigster-text">
                        {overview.tests_current_month}
                    </span>
                    <span className="text-sm text-bigster-text-muted">
                        test nel mese di {currentMonth} {currentYear}
                    </span>
                </div>
                <div className="space-y-3">
                    {renderChange(
                        overview.change_vs_previous_month,
                        `${previousMonth} ${currentYear}`,
                        overview.tests_previous_month
                    )}
                    {renderChange(
                        overview.change_vs_previous_year,
                        `${currentMonth} ${previousYear}`,
                        overview.tests_same_month_previous_year
                    )}
                </div>
            </div>
        </div>
    );
}

interface ByRegionTableProps {
    data: StatsByRegion[];
}

function ByRegionTable({ data }: ByRegionTableProps) {
    if (!data || data.length === 0) return null;

    const maxTests = Math.max(...data.map((r) => r.total_tests), 1);

    return (
        <div className="bg-bigster-surface border border-bigster-border">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-bigster-text" />
                    <h3 className="text-[15px] font-semibold text-bigster-text">
                        Distribuzione per Regione
                    </h3>
                </div>
                <p className="text-xs text-bigster-text-muted mt-1">
                    {data.length} regioni con test attivi
                </p>
            </div>
            <div className="p-6">
                <div className="space-y-3">
                    {data.slice(0, 10).map((region) => (
                        <div key={region.region} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-bigster-text">
                                    {region.region}
                                </span>
                                <div className="flex items-center gap-3 text-xs text-bigster-text-muted">
                                    <span>{region.total_tests} test</span>
                                    <span>{region.completed_tests} compl.</span>
                                    <span className="font-semibold text-bigster-text">
                                        {region.eligibility_rate}% idonei
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-bigster-border">
                                <div
                                    className="h-full bg-bigster-primary transition-all"
                                    style={{
                                        width: `${(region.total_tests / maxTests) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {data.length > 10 && (
                    <p className="text-xs text-bigster-text-muted mt-4 text-center">
                        e altre {data.length - 10} regioni
                    </p>
                )}
            </div>
        </div>
    );
}

function ScoreDistributionCard({ sd }: { sd: ScoreDistribution }) {

    const nMin = normalizeScore(sd.min);
    const nMax = normalizeScore(sd.max);
    const nP25 = normalizeScore(sd.percentile_25);
    const nP75 = normalizeScore(sd.percentile_75);
    const nMedian = normalizeScore(sd.median);

    return (
        <div className="p-3 bg-bigster-card-bg border border-bigster-border">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-bigster-text">
                    {sd.characteristic_name ||
                        CHARACTERISTIC_NAMES[sd.characteristic] ||
                        sd.characteristic}
                </span>
                <span className="text-sm font-bold text-bigster-text">
                    {sd.average.toFixed(1)}
                </span>
            </div>

            <div className="w-full h-2 bg-bigster-border relative overflow-hidden">

                <div
                    className="absolute h-full bg-blue-200"
                    style={{
                        left: `${nMin}%`,
                        width: `${nMax - nMin}%`,
                    }}
                />

                <div
                    className="absolute h-full bg-blue-400"
                    style={{
                        left: `${nP25}%`,
                        width: `${nP75 - nP25}%`,
                    }}
                />

                <div
                    className="absolute w-0.5 h-full bg-bigster-text"
                    style={{ left: `${nMedian}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-bigster-text-muted">
                <span>Min: {sd.min}</span>
                <span>Med: {sd.median}</span>
                <span>Max: {sd.max}</span>
            </div>
        </div>
    );
}

export function TestDashboard({
    overview,
    trends,
    byProfile,
    byRegion,
    scoreDistribution,
}: TestDashboardProps) {

    const statusData = useMemo(
        () => [
            { name: "Completati", value: overview.completed_tests, color: COLORS.success },
            { name: "In corso", value: overview.in_progress_tests, color: COLORS.primary },
            { name: "In attesa", value: overview.pending_tests, color: COLORS.info },
            { name: "Scaduti", value: overview.expired_tests, color: COLORS.danger },
            { name: "Annullati", value: overview.cancelled_tests, color: COLORS.muted },
        ],
        [overview]
    );

    const formattedTrends = useMemo(
        () =>
            trends.map((t) => ({
                ...t,
                date: formatTrendDate(t.date),
                eligibilityRate:
                    t.completed > 0 ? Math.round((t.eligible / t.completed) * 100) : 0,
            })),
        [trends]
    );

    const groupedDistribution = useMemo(() => {
        if (!scoreDistribution || scoreDistribution.length === 0) return [];

        const sdMap = new Map<string, ScoreDistribution>();
        scoreDistribution.forEach((sd) => sdMap.set(sd.characteristic, sd));

        return CATEGORY_ORDER
            .map((cat) => ({
                ...cat,
                items: cat.codes
                    .map((code) => sdMap.get(code))
                    .filter((sd): sd is ScoreDistribution => sd !== undefined),
            }))
            .filter((cat) => cat.items.length > 0);
    }, [scoreDistribution]);

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                <KpiCard
                    title="Totale Test"
                    value={overview.total_tests}
                    subtitle={`${overview.tests_last_7_days} ultimi 7gg`}
                    icon={<ClipboardCheck className="h-6 w-6" />}
                />
                <KpiCard
                    title="Completati"
                    value={overview.completed_tests}
                    subtitle={`${overview.completion_rate}% tasso`}
                    icon={<CheckCircle className="h-6 w-6" />}
                    color="success"
                />
                <KpiCard
                    title="In Corso"
                    value={overview.in_progress_tests}
                    icon={<Clock className="h-6 w-6" />}
                    color="warning"
                />
                <KpiCard
                    title="In Attesa"
                    value={overview.pending_tests}
                    icon={<Hourglass className="h-6 w-6" />}
                    color="info"
                />

                <KpiCard
                    title="Idonei"
                    value={overview.eligible_tests ?? 0}
                    subtitle={`${overview.eligibility_rate}% tasso`}
                    icon={<ThumbsUp className="h-6 w-6" />}
                    color="success"
                />
                <KpiCard
                    title="Non Idonei"
                    value={overview.not_eligible_tests ?? 0}
                    icon={<ThumbsDown className="h-6 w-6" />}
                    color="danger"
                />
                <KpiCard
                    title="Tasso Idoneità"
                    value={`${overview.eligibility_rate}%`}
                    subtitle="sui completati"
                    icon={<Award className="h-6 w-6" />}
                    color={overview.eligibility_rate >= 50 ? "success" : "warning"}
                />
                <KpiCard
                    title="Tempo Medio"
                    value={
                        overview.average_completion_days
                            ? `${overview.average_completion_days}gg`
                            : "N/A"
                    }
                    subtitle="giorni completamento"
                    icon={<Timer className="h-6 w-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TemporalComparison overview={overview} />
                <ByRegionTable data={byRegion} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {formattedTrends.length > 0 && (
                    <div className="bg-bigster-surface border border-bigster-border">
                        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                Trend Temporale
                            </h3>
                            <p className="text-xs text-bigster-text-muted">
                                Ultimi 6 mesi
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={formattedTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: "#666666", fontSize: 11 }}
                                        />
                                        <YAxis tick={{ fill: "#666666", fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke={COLORS.info}
                                            strokeWidth={2}
                                            name="Totale"
                                            dot={{ r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="completed"
                                            stroke={COLORS.success}
                                            strokeWidth={2}
                                            name="Completati"
                                            dot={{ r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="eligible"
                                            stroke={COLORS.primary}
                                            strokeWidth={2}
                                            name="Idonei"
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-bigster-surface border border-bigster-border">
                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                        <h3 className="text-[15px] font-semibold text-bigster-text">
                            Distribuzione Stato
                        </h3>
                        <p className="text-xs text-bigster-text-muted">
                            Tutti i test per stato
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {byProfile.length > 0 && (
                <div className="bg-bigster-surface border border-bigster-border">
                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                        <h3 className="text-[15px] font-semibold text-bigster-text">
                            Per Profilo
                        </h3>
                        <p className="text-xs text-bigster-text-muted">
                            Top {byProfile.length} profili per volume test
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byProfile} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                    <XAxis type="number" tick={{ fill: "#666666", fontSize: 11 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="profile_name"
                                        tick={{ fill: "#6c4e06", fontSize: 11 }}
                                        width={120}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total_tests" fill={COLORS.info} name="Totale" />
                                    <Bar
                                        dataKey="completed_tests"
                                        fill={COLORS.success}
                                        name="Completati"
                                    />
                                    <Bar
                                        dataKey="eligible_tests"
                                        fill={COLORS.primary}
                                        name="Idonei"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {groupedDistribution.length > 0 && (
                <div className="bg-bigster-surface border border-bigster-border">
                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                        <h3 className="text-[15px] font-semibold text-bigster-text">
                            Distribuzione Punteggi
                        </h3>
                        <p className="text-xs text-bigster-text-muted">
                            Media, mediana e range per caratteristica (scala -100 / +100)
                        </p>
                    </div>
                    <div className="p-6 space-y-6">
                        {groupedDistribution.map((category) => (
                            <div key={category.key}>
                                <h4 className="text-sm font-semibold text-bigster-text mb-3">
                                    {category.label}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {category.items.map((sd) => (
                                        <ScoreDistributionCard key={sd.characteristic} sd={sd} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
