"use client";

import { BigsterTestListItem, BigsterTestStatus } from "@/types/bigster";
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Hourglass,
    AlertTriangle,
    Star,
    EyeOff,
    Building2,
    User,
} from "lucide-react";

interface TestCardProps {
    test: BigsterTestListItem;
    onClick: () => void;
    isInRosa?: boolean;
}

const statusConfig: Record<
    BigsterTestStatus,
    { label: string; icon: typeof CheckCircle; color: string; bg: string; border: string }
> = {
    [BigsterTestStatus.PENDING]: {
        label: "In attesa",
        icon: Hourglass,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    [BigsterTestStatus.IN_PROGRESS]: {
        label: "In corso",
        icon: Clock,
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
    },
    [BigsterTestStatus.COMPLETED]: {
        label: "Completato",
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
    },
    [BigsterTestStatus.EXPIRED]: {
        label: "Scaduto",
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
    },
    [BigsterTestStatus.CANCELLED]: {
        label: "Annullato",
        icon: XCircle,
        color: "text-gray-500",
        bg: "bg-gray-50",
        border: "border-gray-200",
    },
};

function getScoreColor(value: number | null | undefined): string {
    if (value === null || value === undefined) return "text-bigster-text-muted";
    const abs = Math.abs(value);
    if (abs >= 80) return "text-red-600 font-bold";
    if (abs >= 50) return "text-orange-600 font-semibold";
    if (abs >= 40) return "text-yellow-600";
    return "text-bigster-text-muted";
}

function getScoreBg(value: number | null | undefined): string {
    if (value === null || value === undefined) return "bg-bigster-muted-bg border-bigster-border";
    const abs = Math.abs(value);
    if (abs >= 80) return "bg-red-50 border-red-200";
    if (abs >= 50) return "bg-orange-50 border-orange-200";
    if (abs >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-bigster-muted-bg border-bigster-border";
}

export function TestCard({ test, onClick, isInRosa }: TestCardProps) {
    const status = statusConfig[test.status];
    const StatusIcon = status.icon;
    const isUnread = test.completed && !test.read;
    const validityScores = test.validity_scores;
    const progressPercent = Math.round((test.question_progress / 300) * 100);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
        });
    };

    const topBarColor = isInRosa
        ? "bg-amber-500"
        : isUnread
            ? "bg-blue-500"
            : test.status === BigsterTestStatus.COMPLETED
                ? "bg-green-500"
                : test.status === BigsterTestStatus.IN_PROGRESS
                    ? "bg-yellow-500"
                    : test.status === BigsterTestStatus.EXPIRED
                        ? "bg-red-500"
                        : test.status === BigsterTestStatus.CANCELLED
                            ? "bg-gray-400"
                            : "bg-blue-500";

    return (
        <div
            onClick={onClick}
            className={`bg-bigster-surface border hover:border-bigster-text hover:shadow-sm transition-all cursor-pointer group flex flex-col ${isInRosa
                ? "border-amber-300"
                : isUnread
                    ? "border-blue-300"
                    : "border-bigster-border"
                }`}
        >

            <div className={`h-1 w-full ${topBarColor}`} />

            <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        {isUnread && (
                            <span
                                className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                                title="Da visionare"
                            />
                        )}
                        {isInRosa && (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                        <p className="font-semibold text-sm text-bigster-text truncate">
                            {test.candidate.name}
                        </p>
                    </div>
                    <p className="text-xs text-bigster-text-muted truncate mt-0.5">
                        {test.candidate.email}
                    </p>
                </div>

                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium flex-shrink-0 border ${status.color} ${status.bg} ${status.border}`}
                >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                </span>
            </div>

            <div className="px-4 pb-2 space-y-1.5">

                <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                        {test.application.annuncio.selezione.company.nome}
                    </span>
                    <span className="text-bigster-border mx-0.5">·</span>
                    <span className="truncate">
                        {test.application.annuncio.selezione.figura_ricercata ||
                            test.application.annuncio.selezione.titolo}
                    </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    {test.profile ? (
                        <div className="flex items-center gap-1.5 text-bigster-text-muted">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{test.profile.name}</span>
                        </div>
                    ) : (
                        <div />
                    )}

                    <span className="text-bigster-text-muted flex-shrink-0">
                        {test.completed_at ? "Completato " : "Inviato "}
                        {formatDate(test.completed_at || test.sent_at)}
                    </span>
                </div>
            </div>

            {test.status === BigsterTestStatus.IN_PROGRESS && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-bigster-border overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-bigster-text">
                            {progressPercent}%
                        </span>
                    </div>
                </div>
            )}

            {test.completed && (
                <div className="px-4 py-2 border-t border-bigster-border/60 bg-bigster-muted-bg flex items-center gap-2 flex-wrap mt-auto">

                    {validityScores && (
                        <div
                            className="flex items-center gap-1"
                            title="Scale di Validità: K (Difensività), M (Inconsapevolezza), L (Lie)"
                        >
                            <span
                                className={`inline-flex items-center px-1.5 py-0.5 text-[11px] border ${getScoreBg(validityScores.K)} ${getScoreColor(validityScores.K)}`}
                            >
                                K:{validityScores.K ?? "–"}
                            </span>
                            <span
                                className={`inline-flex items-center px-1.5 py-0.5 text-[11px] border ${getScoreBg(validityScores.M)} ${getScoreColor(validityScores.M)}`}
                            >
                                M:{validityScores.M ?? "–"}
                            </span>
                            <span
                                className={`inline-flex items-center px-1.5 py-0.5 text-[11px] border ${getScoreBg(validityScores.L)} ${getScoreColor(validityScores.L)}`}
                            >
                                L:{validityScores.L ?? "–"}
                            </span>
                        </div>
                    )}

                    <div className="flex-1" />

                    {isInRosa && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-50 border border-amber-300 text-amber-700">
                            <Star className="h-3 w-3 fill-amber-500" />
                            Rosa
                        </span>
                    )}

                    {isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-blue-50 border border-blue-300 text-blue-700">
                            <EyeOff className="h-3 w-3" />
                            Da visionare
                        </span>
                    )}

                    {test.eligible !== null && (
                        <span
                            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border ${test.eligible
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                                }`}
                        >
                            {test.eligible ? "✔ Idoneo" : "✗ Non idoneo"}
                        </span>
                    )}

                    {(test.suspect || test.unreliable) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-orange-50 border border-orange-200 text-orange-700">
                            <AlertTriangle className="h-3 w-3" />
                            {test.suspect ? "Sospetto" : "Non affidabile"}
                        </span>
                    )}
                </div>
            )}

            {!test.completed && (test.suspect || test.unreliable) && (
                <div className="px-4 py-2 border-t border-bigster-border/60 bg-bigster-muted-bg mt-auto">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-orange-50 border border-orange-200 text-orange-700">
                        <AlertTriangle className="h-3 w-3" />
                        {test.suspect ? "Sospetto" : "Non affidabile"}
                    </span>
                </div>
            )}
        </div>
    );
}
