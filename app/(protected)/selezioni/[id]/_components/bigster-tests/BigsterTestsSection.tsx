"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ClipboardCheck,
    CheckCircle,
    Clock,
    AlertTriangle,
    PlayCircle,
    Ban,
    XCircle,
    Award,
    RefreshCw,
    ChevronRight,
    ArrowRight,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Selection } from "@/types/selection";
import { useGetBigsterTestsQuery } from "@/lib/redux/features/bigster";
import { BigsterTestStatus, BigsterTestListItem } from "@/types/bigster";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BigsterTestsSectionProps {
    selection: Selection;
}

const VISIBLE_STATES = [
    "ANNUNCIO_PUBBLICATO",
    "CANDIDATURE_RICEVUTE",
    "COLLOQUI_IN_CORSO",
    "CANDIDATO_IN_PROVA",
    "SELEZIONI_IN_SOSTITUZIONE",
    "CHIUSA",
];

const PREVIEW_LIMIT = 5;

const getStatusConfig = (status: BigsterTestStatus, isExpired: boolean) => {
    if (isExpired && status !== BigsterTestStatus.COMPLETED && status !== BigsterTestStatus.CANCELLED) {
        return { label: "Scaduto", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle };
    }

    switch (status) {
        case BigsterTestStatus.PENDING:
            return { label: "In attesa", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock };
        case BigsterTestStatus.IN_PROGRESS:
            return { label: "In corso", color: "bg-blue-100 text-blue-700 border-blue-300", icon: PlayCircle };
        case BigsterTestStatus.COMPLETED:
            return { label: "Completato", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle };
        case BigsterTestStatus.EXPIRED:
            return { label: "Scaduto", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle };
        case BigsterTestStatus.CANCELLED:
            return { label: "Annullato", color: "bg-gray-100 text-gray-700 border-gray-300", icon: Ban };
        default:
            return { label: status, color: "bg-gray-100 text-gray-700 border-gray-300", icon: Clock };
    }
};

interface MiniTestCardProps {
    test: BigsterTestListItem;
    onClick: () => void;
}

function MiniTestCard({ test, onClick }: MiniTestCardProps) {
    const statusConfig = getStatusConfig(test.status, test.is_expired);
    const StatusIcon = statusConfig.icon;

    const formattedDate = format(
        new Date(test.completed_at || test.sent_at || ""),
        "d MMM",
        { locale: it }
    );

    return (
        <div
            className="p-3 bg-bigster-card-bg border border-bigster-border hover:border-bigster-text transition-colors cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-center gap-3">

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-bigster-text truncate">
                            {test.candidate.name}
                        </h4>
                        <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 font-semibold border ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-bigster-text-muted">
                        <span className="truncate max-w-[180px]">{test.candidate.email}</span>
                        {test.profile && (
                            <span className="inline-flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {test.profile.name}
                            </span>
                        )}
                        <span>{formattedDate}</span>
                    </div>
                </div>

                {test.completed && (
                    <span className={`text-xs font-bold px-2 py-1 ${test.eligible
                        ? "text-green-600 bg-green-50 border border-green-200"
                        : "text-red-600 bg-red-50 border border-red-200"
                        }`}>
                        {test.eligible ? "Idoneo" : "Non Idoneo"}
                    </span>
                )}

                <ChevronRight className="h-4 w-4 text-bigster-text-muted group-hover:text-bigster-text transition-colors" />
            </div>
        </div>
    );
}

function TestEmptyState() {
    return (
        <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
            <ClipboardCheck className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-bigster-text-muted mb-1">
                Nessun test inviato
            </p>
            <p className="text-xs text-bigster-text-muted">
                I test BigsTer verranno mostrati qui quando saranno inviati ai candidati
            </p>
        </div>
    );
}

export function BigsterTestsSection({ selection }: BigsterTestsSectionProps) {
    const router = useRouter();
    const isVisible = VISIBLE_STATES.includes(selection.stato);

    const {
        data: testsResponse,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useGetBigsterTestsQuery({
        selection_id: selection.id,
        limit: 100,
    }, {
        skip: !isVisible,
    });

    const tests = testsResponse?.data ?? [];

    const recentTests = useMemo(() => {
        return [...tests]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, PREVIEW_LIMIT);
    }, [tests]);

    const kpis = useMemo(() => {
        if (!tests.length) return null;

        const total = tests.length;
        const completed = tests.filter(t => t.completed).length;
        const inProgress = tests.filter(t => t.status === BigsterTestStatus.IN_PROGRESS).length;
        const eligible = tests.filter(t => t.completed && t.eligible).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, inProgress, eligible, completionRate };
    }, [tests]);

    const hasMoreTests = tests.length > PREVIEW_LIMIT;

    if (!isVisible) return null;

    const handleViewAll = () => {
        router.push(`/test-bigster?selection_id=${selection.id}`);
    };

    const handleTestClick = (testId: number) => {
        router.push(`/test-bigster/${testId}`);
    };

    return (
        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-5 w-5 text-bigster-text" />
                        <div>
                            <h2 className="text-lg font-bold text-bigster-text">
                                Test BigsTer
                            </h2>
                            <p className="text-xs text-bigster-text-muted">
                                {isLoading ? "Caricamento..." : `${tests.length} test inviati`}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="p-6">

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Spinner className="h-8 w-8" />
                    </div>
                )}

                {error && (
                    <Alert className="rounded-none border border-red-400 bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <AlertDescription className="text-red-800">
                            Errore nel caricamento dei test. Riprova più tardi.
                        </AlertDescription>
                    </Alert>
                )}

                {!isLoading && !error && (
                    <>
                        {tests.length === 0 ? (
                            <TestEmptyState />
                        ) : (
                            <>

                                {kpis && (
                                    <div className="grid grid-cols-5 gap-3 mb-6">
                                        <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                                            <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                                Totale
                                            </p>
                                            <p className="text-xl font-bold text-bigster-text">
                                                {kpis.total}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-50 border border-green-200">
                                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                                Completati
                                            </p>
                                            <p className="text-xl font-bold text-green-700">
                                                {kpis.completed}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-50 border border-blue-200">
                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                                In Corso
                                            </p>
                                            <p className="text-xl font-bold text-blue-700">
                                                {kpis.inProgress}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-50 border border-green-200">
                                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                                Idonei
                                            </p>
                                            <p className="text-xl font-bold text-green-700">
                                                {kpis.eligible}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                                            <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                                Completamento
                                            </p>
                                            <p className="text-xl font-bold text-bigster-text">
                                                {kpis.completionRate}%
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                        Ultimi {Math.min(recentTests.length, PREVIEW_LIMIT)} test
                                    </p>
                                    {hasMoreTests && (
                                        <p className="text-xs text-bigster-text-muted">
                                            +{tests.length - PREVIEW_LIMIT} altri
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {recentTests.map((test) => (
                                        <MiniTestCard
                                            key={test.id}
                                            test={test}
                                            onClick={() => handleTestClick(test.id)}
                                        />
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <Button
                                        onClick={handleViewAll}
                                        className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border-2 border-yellow-300 hover:bg-yellow-400 font-bold py-4 text-base shadow-md transition-all hover:shadow-lg"
                                    >
                                        <ClipboardCheck className="h-5 w-5 mr-3" />
                                        Gestisci tutti i {kpis?.total || 0} test
                                        <ArrowRight className="h-5 w-5 ml-3" />
                                    </Button>
                                    <p className="text-center text-xs text-bigster-text-muted mt-2">
                                        Filtra, analizza e scarica i report con strumenti avanzati
                                    </p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default BigsterTestsSection;
