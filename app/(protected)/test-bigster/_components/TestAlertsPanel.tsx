"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    Clock,
    Shield,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Brain,
    Info,
    TrendingDown,
    ShieldAlert,
} from "lucide-react";
import {
    AlertExpiringSoon,
    AlertHighDefensiveness,
    AlertSuspectTest,
    AlertUnreliableTest,
    AlertThreeLiesCritical,
} from "@/types/bigster-stats";

interface AlertsPanelProps {
    alerts: {
        total: number;
        expiring_soon: AlertExpiringSoon[];
        high_defensiveness: AlertHighDefensiveness[];
        suspect_tests: AlertSuspectTest[];
        unreliable_tests: AlertUnreliableTest[];
        three_lies_critical?: AlertThreeLiesCritical[];
    };
}

interface AlertItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    badge?: string;
    badgeColor?: string;
    onClick?: () => void;
}

function AlertItem({
    icon,
    title,
    subtitle,
    badge,
    badgeColor = "bg-red-100 text-red-700",
    onClick,
}: AlertItemProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 p-3 bg-bigster-surface border border-bigster-border ${onClick
                ? "cursor-pointer hover:border-bigster-text transition-colors"
                : ""
                }`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-bigster-text truncate">
                    {title}
                </p>
                <p className="text-xs text-bigster-text-muted">{subtitle}</p>
            </div>
            {badge && (
                <span
                    className={`px-2 py-1 text-xs font-bold ${badgeColor} flex-shrink-0`}
                >
                    {badge}
                </span>
            )}
            {onClick && (
                <ExternalLink className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
            )}
        </div>
    );
}

function AlertColorLegend() {
    const [isOpen, setIsOpen] = useState(false);

    const legendItems = [
        {
            label: "In Scadenza",
            description: "Test con scadenza ≤ 3 giorni",
            color: "bg-yellow-400",
        },
        {
            label: "Alta Difensività",
            description: "Punteggio K > 70",
            color: "bg-orange-400",
        },
        {
            label: "3 LIE Critiche",
            description: "L ≥ 80, EGL ≥ 80, ETL ≥ 80",
            color: "bg-purple-400",
        },
        {
            label: "Sospetto (M alto)",
            description: "Inconsapevolezza M ≥ 49",
            color: "bg-amber-400",
        },
        {
            label: "Non Affidabile",
            description: "Difensività K ≥ 80",
            color: "bg-red-400",
        },
    ];

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 hover:bg-bigster-muted-bg transition-colors"
            >
                <Info className="h-4 w-4 text-bigster-text-muted" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-8 z-50 w-64 bg-bigster-surface border border-bigster-border shadow-lg p-4 space-y-3">
                    <p className="text-xs font-bold text-bigster-text mb-2 uppercase tracking-wide">
                        Legenda Alert
                    </p>
                    {legendItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <span
                                className={`w-3 h-3 ${item.color} flex-shrink-0 mt-0.5`}
                            />
                            <div>
                                <p className="text-xs font-semibold text-bigster-text">
                                    {item.label}
                                </p>
                                <p className="text-[10px] text-bigster-text-muted">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TestAlertsPanel({ alerts }: AlertsPanelProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    const threeLies = alerts.three_lies_critical ?? [];

    const activeCategoriesCount = useMemo(() => {
        let count = 0;
        if (alerts.expiring_soon.length > 0) count++;
        if (alerts.high_defensiveness.length > 0) count++;
        if (alerts.suspect_tests.length > 0) count++;
        if (alerts.unreliable_tests.length > 0) count++;
        if (threeLies.length > 0) count++;
        return count;
    }, [alerts, threeLies]);

    const gridClass =
        activeCategoriesCount >= 2
            ? "columns-1 lg:columns-2 gap-6 space-y-4 [&>div]:break-inside-avoid"
            : "space-y-4";

    const handleTestClick = (testId: number) => {
        router.push(`/test-bigster/${testId}`);
    };

    const formatDaysRemaining = (days: number) => {
        if (days === 0) return "Oggi";
        if (days === 1) return "Domani";
        return `${days} giorni`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
        });
    };

    if (alerts.total === 0) return null;

    return (
        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

            <div
                className="px-6 py-4 border-b border-bigster-border bg-yellow-50 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                            <h3 className="text-[15px] font-semibold text-bigster-text">
                                Alert Attivi
                            </h3>
                            <p className="text-xs text-bigster-text-muted">
                                {alerts.total} situazioni che richiedono attenzione
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                            <AlertColorLegend />
                        </div>
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold">
                            {alerts.total}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-bigster-text-muted" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-bigster-text-muted" />
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6">
                    <div className={gridClass}>

                        {alerts.expiring_soon.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-semibold text-bigster-text">
                                        In Scadenza ({alerts.expiring_soon.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {alerts.expiring_soon.map((alert) => (
                                        <AlertItem
                                            key={alert.id}
                                            icon={
                                                <Clock className="h-5 w-5 text-yellow-600" />
                                            }
                                            title={alert.candidate_name}
                                            subtitle={`Scade: ${formatDaysRemaining(
                                                alert.days_remaining
                                            )}`}
                                            badge={formatDaysRemaining(alert.days_remaining)}
                                            badgeColor="bg-yellow-100 text-yellow-700"
                                            onClick={() => handleTestClick(alert.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {alerts.high_defensiveness.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-semibold text-bigster-text">
                                        Alta Difensività ({alerts.high_defensiveness.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {alerts.high_defensiveness.map((alert) => (
                                        <AlertItem
                                            key={alert.id}
                                            icon={
                                                <Shield className="h-5 w-5 text-orange-600" />
                                            }
                                            title={alert.candidate_name}
                                            subtitle={`Completato il ${formatDate(
                                                alert.completed_at
                                            )}`}
                                            badge={`K: ${alert.char_k}`}
                                            badgeColor="bg-orange-100 text-orange-700"
                                            onClick={() => handleTestClick(alert.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {threeLies.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldAlert className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-semibold text-bigster-text">
                                        3 LIE Critiche ({threeLies.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {threeLies.map((alert) => (
                                        <AlertItem
                                            key={alert.id}
                                            icon={
                                                <ShieldAlert className="h-5 w-5 text-purple-600" />
                                            }
                                            title={alert.candidate_name}
                                            subtitle={`L: ${alert.char_l} | EGL: ${alert.char_egl} | ETL: ${alert.char_etl}`}
                                            badge="3 LIE"
                                            badgeColor="bg-purple-100 text-purple-700"
                                            onClick={() => handleTestClick(alert.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {alerts.suspect_tests.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="h-4 w-4 text-amber-600" />
                                    <span className="text-sm font-semibold text-bigster-text">
                                        Sospetti — M Alto ({alerts.suspect_tests.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {alerts.suspect_tests.map((alert) => (
                                        <AlertItem
                                            key={alert.id}
                                            icon={
                                                <Brain className="h-5 w-5 text-amber-600" />
                                            }
                                            title={alert.candidate_name}
                                            subtitle={`Completato il ${formatDate(
                                                alert.completed_at
                                            )}`}
                                            badge={`M: ${alert.char_m}`}
                                            badgeColor="bg-amber-100 text-amber-700"
                                            onClick={() => handleTestClick(alert.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {alerts.unreliable_tests.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-semibold text-bigster-text">
                                        Non Affidabili ({alerts.unreliable_tests.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {alerts.unreliable_tests.map((alert) => (
                                        <AlertItem
                                            key={alert.id}
                                            icon={
                                                <TrendingDown className="h-5 w-5 text-red-600" />
                                            }
                                            title={alert.candidate_name}
                                            subtitle={`Completato il ${formatDate(
                                                alert.completed_at
                                            )}`}
                                            badge={`K: ${alert.char_k}`}
                                            badgeColor="bg-red-100 text-red-700"
                                            onClick={() => handleTestClick(alert.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
