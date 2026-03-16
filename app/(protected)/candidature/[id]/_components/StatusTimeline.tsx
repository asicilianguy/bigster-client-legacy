"use client";

import {
    CheckCircle,
    Clock,
    FileText,
    ClipboardCheck,
    MessageSquare,
    UserCheck,
    UserX,
    LogOut,
} from "lucide-react";

interface StatusTimelineProps {
    application: {
        stato: string;
        data_creazione: string;
        data_chiusura?: string | null;
        cv_s3_key?: string | null;
        test?: {
            inviato_il?: string | null;
            completato_il?: string | null;
        } | null;
        colloqui?: Array<{
            tipo: string;
            data?: string | null;
            esito?: string | null;
        }>;
    };
}

interface TimelineStep {
    label: string;
    icon: React.ElementType;
    date?: string | null;
    status: "completed" | "current" | "pending" | "skipped";
    detail?: string;
}

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export function StatusTimeline({ application }: StatusTimelineProps) {
    const isFinalized = ["ASSUNTO", "SCARTATO", "RITIRATO"].includes(
        application.stato
    );

    const steps: TimelineStep[] = [
        {
            label: "Candidatura Ricevuta",
            icon: CheckCircle,
            date: application.data_creazione,
            status: "completed",
        },
        {
            label: "CV Allegato",
            icon: FileText,
            status: application.cv_s3_key ? "completed" : "skipped",
            detail: application.cv_s3_key ? "CV presente" : "Nessun CV",
        },
    ];

    if (application.test) {
        steps.push({
            label: "Test Bigster",
            icon: ClipboardCheck,
            date: application.test.completato_il || application.test.inviato_il,
            status: application.test.completato_il
                ? "completed"
                : application.test.inviato_il
                    ? "current"
                    : "pending",
            detail: application.test.completato_il
                ? "Completato"
                : application.test.inviato_il
                    ? "In attesa"
                    : "Da inviare",
        });
    }

    const colloqui = application.colloqui || [];
    if (colloqui.length > 0) {
        const colloquiCompletati = colloqui.filter((c) => c.data).length;
        steps.push({
            label: "Colloqui",
            icon: MessageSquare,
            status: colloquiCompletati === colloqui.length ? "completed" : "current",
            detail: `${colloquiCompletati}/${colloqui.length} completati`,
        });
    }

    if (isFinalized) {
        const finalIcon =
            application.stato === "ASSUNTO"
                ? UserCheck
                : application.stato === "SCARTATO"
                    ? UserX
                    : LogOut;
        const finalLabel =
            application.stato === "ASSUNTO"
                ? "Assunto"
                : application.stato === "SCARTATO"
                    ? "Scartato"
                    : "Ritirato";

        steps.push({
            label: finalLabel,
            icon: finalIcon,
            date: application.data_chiusura,
            status: "completed",
        });
    } else {
        steps.push({
            label: "In Valutazione",
            icon: Clock,
            status: "current",
        });
    }

    return (
        <div className="bg-bigster-surface border border-bigster-border">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <h2 className="text-lg font-bold text-bigster-text">
                    Progresso Candidatura
                </h2>
            </div>

            <div className="p-6">
                <div className="space-y-0">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isLast = index === steps.length - 1;

                        const statusColors = {
                            completed: {
                                icon: "bg-green-100 text-green-600 border-green-300",
                                line: "bg-green-300",
                                text: "text-bigster-text",
                            },
                            current: {
                                icon: "bg-blue-100 text-blue-600 border-blue-300",
                                line: "bg-bigster-border",
                                text: "text-bigster-text font-semibold",
                            },
                            pending: {
                                icon: "bg-gray-100 text-gray-400 border-gray-200",
                                line: "bg-bigster-border",
                                text: "text-bigster-text-muted",
                            },
                            skipped: {
                                icon: "bg-gray-50 text-gray-300 border-gray-200",
                                line: "bg-bigster-border",
                                text: "text-bigster-text-muted line-through",
                            },
                        };

                        const colors = statusColors[step.status];

                        return (
                            <div key={index} className="flex items-start">

                                <div className="flex flex-col items-center mr-4">
                                    <div
                                        className={`w-10 h-10 border-2 flex items-center justify-center ${colors.icon}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {!isLast && (
                                        <div className={`w-0.5 h-8 ${colors.line}`} />
                                    )}
                                </div>

                                <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                                    <p className={`text-sm ${colors.text}`}>{step.label}</p>
                                    {step.date && (
                                        <p className="text-xs text-bigster-text-muted">
                                            {formatDate(step.date)}
                                        </p>
                                    )}
                                    {step.detail && (
                                        <p className="text-xs text-bigster-text-muted mt-0.5">
                                            {step.detail}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
