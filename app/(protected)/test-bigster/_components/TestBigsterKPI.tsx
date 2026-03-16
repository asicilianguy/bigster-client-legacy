"use client";

import { motion } from "framer-motion";
import {
    ClipboardCheck,
    CheckCircle,
    Clock,
    Hourglass,
    UserCheck,
    UserX,
    TrendingUp,
    AlertTriangle,
    EyeOff,
} from "lucide-react";
import { StatsOverview } from "@/types/bigster-stats";
import { Spinner } from "@/components/ui/spinner";

interface TestBigsterKPIProps {
    overview: StatsOverview | undefined;
    isLoading: boolean;
}

interface KPICardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    subValue?: string;
    color?: "default" | "yellow" | "green" | "red" | "blue";
}

function KPICard({ icon, label, value, subValue, color = "default" }: KPICardProps) {
    const colorClasses = {
        default: "bg-bigster-card-bg",
        yellow: "bg-yellow-50 border-yellow-200",
        green: "bg-green-50 border-green-200",
        red: "bg-red-50 border-red-200",
        blue: "bg-blue-50 border-blue-200",
    };

    const iconColors = {
        default: "text-bigster-text-muted",
        yellow: "text-yellow-600",
        green: "text-green-600",
        red: "text-red-600",
        blue: "text-blue-600",
    };

    return (
        <div className={`p-4 border border-bigster-border ${colorClasses[color]}`}>
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${iconColors[color]}`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide truncate">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-bigster-text">
                        {value}
                    </p>
                    {subValue && (
                        <p className="text-xs text-bigster-text-muted">
                            {subValue}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export function TestBigsterKPI({ overview, isLoading }: TestBigsterKPIProps) {
    if (isLoading) {
        return (
            <div className="bg-bigster-surface border border-bigster-border p-6">
                <div className="flex items-center justify-center py-4">
                    <Spinner className="h-6 w-6" />
                </div>
            </div>
        );
    }

    if (!overview) {
        return null;
    }

    const total = overview.total_tests ?? 0;
    const completed = overview.completed_tests ?? 0;
    const pending = overview.pending_tests ?? 0;
    const inProgress = overview.in_progress_tests ?? 0;
    const expired = overview.expired_tests ?? 0;
    const eligible = overview.eligible_tests ?? 0;
    const notEligible = overview.not_eligible_tests ?? 0;
    const last7Days = overview.tests_last_7_days ?? 0;
    const last30Days = overview.tests_last_30_days ?? 0;

    const completionRate = overview.completion_rate ?? 0;
    const eligibilityRate = overview.eligibility_rate ?? 0;
    const unread = overview.unread_tests ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bigster-surface border border-bigster-border shadow-bigster-card"
        >

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-bigster-text">
                            Panoramica Test
                        </h2>
                        <p className="text-xs text-bigster-text-muted">
                            Statistiche in tempo reale
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-bigster-text-muted">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Ultimi 7gg: <span className="font-semibold text-bigster-text">{last7Days}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Ultimi 30gg: <span className="font-semibold text-bigster-text">{last30Days}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">

                    <KPICard
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        label="Totale"
                        value={total}
                    />

                    <KPICard
                        icon={<CheckCircle className="h-5 w-5" />}
                        label="Completati"
                        value={completed}
                        subValue={`${completionRate}%`}
                        color="blue"
                    />

                    <KPICard
                        icon={<Clock className="h-5 w-5" />}
                        label="In Corso"
                        value={inProgress}
                        color="yellow"
                    />

                    <KPICard
                        icon={<Hourglass className="h-5 w-5" />}
                        label="In Attesa"
                        value={pending}
                    />

                    <KPICard
                        icon={<UserCheck className="h-5 w-5" />}
                        label="Idonei"
                        value={eligible}
                        subValue={`${eligibilityRate}% su ${completed}`}
                        color="green"
                    />

                    <KPICard
                        icon={<UserX className="h-5 w-5" />}
                        label="Non Idonei"
                        value={notEligible}
                        color="red"
                    />

                    <KPICard
                        icon={<AlertTriangle className="h-5 w-5" />}
                        label="Scaduti"
                        value={expired}
                        color={expired > 0 ? "red" : "default"}
                    />

                    <KPICard
                        icon={<EyeOff className="h-5 w-5" />}
                        label="Da Leggere"
                        value={unread}
                        color={unread > 0 ? "blue" : "default"}
                    />

                    <KPICard
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Tempo Medio"
                        value={overview.average_completion_days != null
                            ? `${overview.average_completion_days}gg`
                            : "–"
                        }
                    />
                </div>
            </div>
        </motion.div>
    );
}

export default TestBigsterKPI;
