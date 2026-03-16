"use client";

import { motion } from "framer-motion";
import {
    Users,
    FileText,
    ClipboardCheck,
    Star,
    UserCheck,
    UserX,
    Clock,
    TrendingUp,
    EyeOff,
} from "lucide-react";
import { ApplicationStatsResponse } from "@/types/application";
import { Spinner } from "@/components/ui/spinner";

interface ApplicationsKPIProps {
    stats: ApplicationStatsResponse | undefined;
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
        orange: "bg-orange-50 border-orange-200",

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

export function ApplicationsKPI({ stats, isLoading }: ApplicationsKPIProps) {
    if (isLoading) {
        return (
            <div className="bg-bigster-surface border border-bigster-border p-6">
                <div className="flex items-center justify-center py-4">
                    <Spinner className="h-6 w-6" />
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const total = stats.total ?? 0;
    const withCv = stats.with_cv ?? 0;
    const withTest = stats.with_test ?? 0;
    const testCompleted = stats.test_completed ?? 0;
    const testEligible = stats.test_eligible ?? 0;
    const inShortlist = stats.in_shortlist ?? 0;
    const last7Days = stats.last_7_days ?? 0;
    const last30Days = stats.last_30_days ?? 0;

    const cvRate = total > 0 ? Math.round((withCv / total) * 100) : 0;
    const testRate = total > 0 ? Math.round((withTest / total) * 100) : 0;

    const eligibilityRate = testCompleted > 0
        ? Math.round((testEligible / testCompleted) * 100)
        : 0;

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
                            Panoramica Candidature
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">

                    <KPICard
                        icon={<Users className="h-5 w-5" />}
                        label="Totale"
                        value={total}
                    />

                    <KPICard
                        icon={<Clock className="h-5 w-5" />}
                        label="In Corso"
                        value={stats.by_status?.IN_CORSO ?? 0}
                        color="blue"
                    />

                    <KPICard
                        icon={<Clock className="h-5 w-5" />}
                        label="In Prova"
                        value={stats.by_status?.IN_PROVA ?? 0}
                        color="yellow"
                    />

                    <KPICard
                        icon={<UserCheck className="h-5 w-5" />}
                        label="Assunti"
                        value={stats.by_status?.ASSUNTO ?? 0}
                        color="green"
                    />

                    <KPICard
                        icon={<UserX className="h-5 w-5" />}
                        label="Scartati"
                        value={stats.by_status?.SCARTATO ?? 0}
                        color="red"
                    />

                    <KPICard
                        icon={<EyeOff className="h-5 w-5" />}
                        label="Da leggere"
                        value={stats.unread ?? 0}
                        color="blue"
                    />

                    <KPICard
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        label="Con Test"
                        value={withTest}
                        subValue={`${testRate}%`}
                    />

                    <KPICard
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        label="Idonei"
                        value={testEligible}
                        subValue={`${eligibilityRate}% su ${testCompleted}`}
                        color="green"
                    />

                    <KPICard
                        icon={<Star className="h-5 w-5" />}
                        label="Nella Rosa"
                        value={inShortlist}
                        color="yellow"
                    />
                </div>
            </div>
        </motion.div>
    );
}

export default ApplicationsKPI;
