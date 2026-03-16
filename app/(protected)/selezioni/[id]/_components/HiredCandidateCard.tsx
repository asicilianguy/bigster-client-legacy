"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    UserCheck,
    ExternalLink,
    Phone,
    Mail,
    MapPin,
    ClipboardCheck,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    FlaskConical,
    Briefcase,
    Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetApplicationsBySelectionIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { ApplicationListItem } from "@/types/application";

interface HiredCandidateCardProps {
    selection: SelectionDetail;
}

const EVALUATION_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
    IDONEO: {
        label: "Idoneo",
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle2,
    },
    PARZIALMENTE_IDONEO: {
        label: "Parzialmente Idoneo",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: AlertCircle,
    },
    NON_IDONEO: {
        label: "Non Idoneo",
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: XCircle,
    },
};

function formatDate(dateString: string | null): string {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getClosedDate(selection: SelectionDetail): string | null {
    return selection.data_chiusura || null;
}

function getTrialStartDate(selection: SelectionDetail): string | null {
    const trialHistory = selection.storico_stati?.find(
        (h) => h.stato_nuovo === SelectionStatus.CANDIDATO_IN_PROVA
    );
    return trialHistory?.data_cambio || null;
}

export function HiredCandidateCard({ selection }: HiredCandidateCardProps) {
    const shouldFetch = selection.stato === SelectionStatus.CHIUSA;

    const {
        data: applications = [],
        isLoading,
    } = useGetApplicationsBySelectionIdQuery(selection.id, {
        skip: !shouldFetch,
    });

    const hiredCandidate: ApplicationListItem | undefined = useMemo(() => {
        return applications.find((app) => app.stato === "ASSUNTO");
    }, [applications]);

    if (!shouldFetch) return null;

    if (isLoading) {
        return (
            <div className="sticky top-[69px] z-40">
                <div className="bg-bigster-surface border-2 border-green-300 p-4">
                    <div className="flex items-center gap-3">
                        <Spinner className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-bigster-text-muted">
                            Caricamento candidato assunto...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (!hiredCandidate) return null;

    const test = hiredCandidate.test_bigster;
    const closedDate = getClosedDate(selection);
    const trialStartDate = getTrialStartDate(selection);

    const evalConfig = test?.evaluation
        ? EVALUATION_CONFIG[test.evaluation] || null
        : null;

    const hasInterviews = (hiredCandidate.colloqui?.length ?? 0) > 0;
    const positiveInterviews = hiredCandidate.colloqui?.filter(
        (c) => c.esito === "POSITIVO"
    ).length ?? 0;

    return (
        <div className="sticky top-[69px] z-40">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-bigster-surface border-2 border-green-400 shadow-lg"
                style={{
                    borderLeft: "6px solid #16a34a",
                }}
            >

                <div className="px-5 py-3 bg-green-50 border-b border-green-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-green-900">
                                Candidato Assunto
                            </h3>
                            <p className="text-xs text-green-700">
                                {closedDate && (
                                    <span>Selezione chiusa il {formatDate(closedDate)}</span>
                                )}
                                {trialStartDate && closedDate && (
                                    <span className="ml-1">
                                        · In prova dal {formatDate(trialStartDate)}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300">
                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wide">
                            Completata
                        </span>
                    </div>
                </div>

                <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-6">

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                                <p className="text-lg font-bold text-bigster-text truncate">
                                    {hiredCandidate.nome} {hiredCandidate.cognome}
                                </p>
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold flex-shrink-0">
                                    ASSUNTO
                                </span>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">

                                <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                    <a
                                        href={`mailto:${hiredCandidate.email}`}
                                        className="text-xs text-bigster-text hover:underline truncate"
                                    >
                                        {hiredCandidate.email}
                                    </a>
                                </div>

                                {hiredCandidate.telefono && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                        <a
                                            href={`tel:${hiredCandidate.telefono}`}
                                            className="text-xs text-bigster-text hover:underline"
                                        >
                                            {hiredCandidate.telefono}
                                        </a>
                                    </div>
                                )}

                                {hiredCandidate.citta && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                        <span className="text-xs text-bigster-text">
                                            {hiredCandidate.citta}
                                            {hiredCandidate.provincia ? ` (${hiredCandidate.provincia})` : ""}
                                        </span>
                                    </div>
                                )}

                                {hasInterviews && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                        <span className="text-xs text-bigster-text">
                                            {hiredCandidate.colloqui!.length} colloqui
                                            {positiveInterviews > 0 && (
                                                <span className="text-green-600 ml-1">
                                                    ({positiveInterviews} positivi)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">

                            {test && (
                                <div className="flex flex-col items-end gap-1.5">
                                    {evalConfig && (
                                        <div
                                            className={`flex items-center gap-1.5 px-2.5 py-1 ${evalConfig.bgColor} ${evalConfig.borderColor} border`}
                                        >
                                            <evalConfig.icon className={`h-3.5 w-3.5 ${evalConfig.color}`} />
                                            <span className={`text-xs font-semibold ${evalConfig.color}`}>
                                                {evalConfig.label}
                                            </span>
                                        </div>
                                    )}

                                    {test.completed && test.questionProgress > 0 && (
                                        <span className="text-xs text-bigster-text-muted">
                                            {test.questionProgress} risposte
                                        </span>
                                    )}
                                </div>
                            )}

                            {!test && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bigster-muted-bg border border-bigster-border">
                                    <FlaskConical className="h-3.5 w-3.5 text-bigster-text-muted" />
                                    <span className="text-xs text-bigster-text-muted">
                                        Nessun test
                                    </span>
                                </div>
                            )}

                            <div className="w-px h-10 bg-bigster-border" />

                            <div className="flex items-center gap-2">
                                <Link href={`/candidature/${hiredCandidate.id}`}>
                                    <Button
                                        variant="outline"
                                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-3 py-2 h-auto"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                        <span className="text-xs font-semibold">Candidatura</span>
                                    </Button>
                                </Link>

                                {test && (
                                    <Link href={`/test-bigster/${test.id}`}>
                                        <Button
                                            variant="outline"
                                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-3 py-2 h-auto"
                                        >
                                            <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
                                            <span className="text-xs font-semibold">Test</span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
