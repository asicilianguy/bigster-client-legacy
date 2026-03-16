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
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    FlaskConical,
    Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetApplicationsBySelectionIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { ApplicationListItem } from "@/types/application";

interface TrialCandidateCardProps {
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

const TEST_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: "In attesa", color: "text-orange-600" },
    IN_PROGRESS: { label: "In corso", color: "text-blue-600" },
    COMPLETED: { label: "Completato", color: "text-green-600" },
    EXPIRED: { label: "Scaduto", color: "text-red-600" },
    CANCELLED: { label: "Annullato", color: "text-gray-500" },
};

function formatDate(dateString: string | null): string {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getTrialStartDate(selection: SelectionDetail): string | null {
    const trialHistory = selection.storico_stati?.find(
        (h) => h.stato_nuovo === SelectionStatus.CANDIDATO_IN_PROVA
    );
    return trialHistory?.data_cambio || null;
}

function getTrialDaysElapsed(selection: SelectionDetail): number | null {
    const startDate = getTrialStartDate(selection);
    if (!startDate) return null;
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function TrialCandidateCard({ selection }: TrialCandidateCardProps) {

    const shouldFetch =
        selection.stato === SelectionStatus.CANDIDATO_IN_PROVA;

    const {
        data: applications = [],
        isLoading,
    } = useGetApplicationsBySelectionIdQuery(selection.id, {
        skip: !shouldFetch,
    });

    const trialCandidate: ApplicationListItem | undefined = useMemo(() => {
        return applications.find((app) => app.stato === "IN_PROVA");
    }, [applications]);

    if (!shouldFetch) return null;

    if (isLoading) {
        return (
            <div className="sticky top-[69px] z-40">
                <div className="bg-bigster-surface border-2 border-emerald-300 p-4">
                    <div className="flex items-center gap-3">
                        <Spinner className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm text-bigster-text-muted">
                            Caricamento candidato in prova...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (!trialCandidate) {
        return (
            <div className="sticky top-[69px] z-40">
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                            La selezione è in stato "Candidato in Prova" ma non è stato trovato
                            un candidato con stato IN_PROVA.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const test = trialCandidate.test_bigster;
    const trialStartDate = getTrialStartDate(selection);
    const daysElapsed = getTrialDaysElapsed(selection);
    const trialDuration = 180;
    const progressPercent = daysElapsed !== null
        ? Math.min(Math.round((daysElapsed / trialDuration) * 100), 100)
        : 0;

    const evalConfig = test?.evaluation
        ? EVALUATION_CONFIG[test.evaluation] || null
        : null;

    const testStatusConfig = test?.status
        ? TEST_STATUS_CONFIG[test.status] || null
        : null;

    const hasInterviews = (trialCandidate.colloqui?.length ?? 0) > 0;
    const positiveInterviews = trialCandidate.colloqui?.filter(
        (c) => c.esito === "POSITIVO"
    ).length ?? 0;

    return (
        <div className="sticky top-[69px] z-40">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-bigster-surface border-2 border-emerald-400 shadow-lg"
                style={{
                    borderLeft: "6px solid #059669",
                }}
            >

                <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-emerald-900">
                                Candidato in Prova
                            </h3>
                            {trialStartDate && (
                                <p className="text-xs text-emerald-700">
                                    Dal {formatDate(trialStartDate)}
                                    {daysElapsed !== null && (
                                        <span className="ml-1">
                                            · {daysElapsed} giorni su {trialDuration}
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {daysElapsed !== null && (
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-emerald-100 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                                {progressPercent}%
                            </span>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-6">

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                                <p className="text-lg font-bold text-bigster-text truncate">
                                    {trialCandidate.nome} {trialCandidate.cognome}
                                </p>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold flex-shrink-0">
                                    IN PROVA
                                </span>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">

                                <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                    <a
                                        href={`mailto:${trialCandidate.email}`}
                                        className="text-xs text-bigster-text hover:underline truncate"
                                    >
                                        {trialCandidate.email}
                                    </a>
                                </div>

                                {trialCandidate.telefono && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                        <a
                                            href={`tel:${trialCandidate.telefono}`}
                                            className="text-xs text-bigster-text hover:underline"
                                        >
                                            {trialCandidate.telefono}
                                        </a>
                                    </div>
                                )}

                                {trialCandidate.citta && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                        <span className="text-xs text-bigster-text">
                                            {trialCandidate.citta}
                                            {trialCandidate.provincia ? ` (${trialCandidate.provincia})` : ""}
                                        </span>
                                    </div>
                                )}

                                {hasInterviews && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0" />
                                        <span className="text-xs text-bigster-text">
                                            {trialCandidate.colloqui!.length} colloqui
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

                                    {testStatusConfig && !test.completed && (
                                        <span className={`text-xs ${testStatusConfig.color}`}>
                                            Test: {testStatusConfig.label}
                                        </span>
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

                                <Link href={`/candidature/${trialCandidate.id}`}>
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
