"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
    MessageSquare,

    CheckCircle,
    XCircle,

    Clock,
    Phone,
    User,
    Building2,
    Users,
} from "lucide-react";
import { InterviewOutcome } from "@/types/application";

interface Interview {
    id: number;
    tipo: string;
    esito?: string | null;
    data?: string | null;
    note?: string | null;
}

interface InterviewSectionProps {
    applicationId: number;
    interviews: Interview[];
    applicationStatus: string;
    onRefetch: () => void;
}

const INTERVIEW_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
    SCREENING_TELEFONICO: { label: "Screening Telefonico", icon: Phone },
    INCONTRO_HR: { label: "Incontro HR", icon: User },
    PROPOSTA_CLIENTE: { label: "Proposta Cliente", icon: Users },
};

const OUTCOME_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    POSITIVO: { label: "Positivo", icon: CheckCircle, color: "text-green-600" },
    NEGATIVO: { label: "Negativo", icon: XCircle, color: "text-red-600" },
};

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export function InterviewSection({
    applicationId,
    interviews,
    applicationStatus,
    onRefetch,
}: InterviewSectionProps) {

    const isInCorso = applicationStatus === "IN_CORSO";

    if (interviews.length === 0) {
        return (
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Colloqui
                    </h2>
                </div>

                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-bigster-muted-bg flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="h-6 w-6 text-bigster-text-muted" />
                    </div>
                    <p className="text-sm text-bigster-text-muted">
                        Nessun colloquio registrato
                    </p>
                    {isInCorso && (
                        <p className="text-xs text-bigster-text-muted mt-1">
                            Usa "Azioni Rapide" per registrare un colloquio
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Colloqui ({interviews.length})
                    </h2>
                </div>

                <div className="divide-y divide-bigster-border">
                    {interviews.map((interview) => {
                        const typeConfig = INTERVIEW_TYPE_LABELS[interview.tipo] || {
                            label: interview.tipo,
                            icon: MessageSquare,
                        };
                        const TypeIcon = typeConfig.icon;

                        const hasOutcome = !!interview.esito;
                        const outcomeConfig = interview.esito
                            ? OUTCOME_CONFIG[interview.esito]
                            : null;

                        return (
                            <div key={interview.id} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <TypeIcon className="h-4 w-4 text-bigster-text-muted" />
                                        <span className="text-sm font-semibold text-bigster-text">
                                            {typeConfig.label}
                                        </span>
                                    </div>

                                    {hasOutcome && outcomeConfig ? (
                                        <span
                                            className={`text-xs px-2 py-1 flex items-center gap-1 font-semibold ${interview.esito === "POSITIVO"
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : interview.esito === "NEGATIVO"
                                                    ? "bg-red-100 text-red-700 border border-red-300"
                                                    : "bg-gray-100 text-gray-600 border border-gray-300"
                                                }`}
                                        >
                                            <outcomeConfig.icon className="h-3 w-3" />
                                            {outcomeConfig.label}
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-300 flex items-center gap-1 font-semibold">
                                            <Clock className="h-3 w-3" />
                                            In attesa
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-bigster-text-muted mb-2">
                                    {interview.data && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-bigster-text-muted" />
                                            {formatDate(interview.data)}
                                        </span>
                                    )}
                                </div>

                                {interview.note && (
                                    <p className="text-xs text-bigster-text-muted italic">
                                        "{interview.note}"
                                    </p>
                                )}

                            </div>
                        );
                    })}
                </div>
            </div>

        </>
    );
}
