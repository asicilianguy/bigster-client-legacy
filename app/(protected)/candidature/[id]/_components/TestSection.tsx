"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
    ClipboardCheck,
    CheckCircle,
    Award,
    Clock,
    AlertCircle,
    Send,
    RefreshCw,
    XCircle,
    PlayCircle,
    Ban,
    AlertTriangle,
    ChevronUp,
    Eye,
    Download,
    ExternalLink,
    Loader2,
} from "lucide-react";
import {
    useGetBigsterTestByApplicationQuery,
    useCreateBigsterTestMutation,
    useResendBigsterTestMutation,
    useCancelBigsterTestMutation,
    useGetBigsterProfilesQuery,
} from "@/lib/redux/features/bigster";
import { useBigsterReportDownload } from "@/lib/redux/features/bigster/useBigsterReportDownload";
import { BigsterTestStatus } from "@/types/bigster";
import { toast } from "sonner";
import { StandardSelect } from "@/components/ui/StandardSelect";

interface TestSectionProps {
    applicationId: number;
    applicationStatus: string;
    candidateName: string;
    candidateEmail: string;
    onRefetch?: () => void;
}

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

const getStatusConfig = (status: BigsterTestStatus, isExpired: boolean) => {
    if (isExpired && status !== BigsterTestStatus.COMPLETED && status !== BigsterTestStatus.CANCELLED) {
        return {
            label: "Scaduto",
            color: "bg-red-100 text-red-700 border-red-300",
            icon: XCircle,
        };
    }

    switch (status) {
        case BigsterTestStatus.PENDING:
            return {
                label: "In attesa",
                color: "bg-yellow-100 text-yellow-700 border-yellow-300",
                icon: Clock,
            };
        case BigsterTestStatus.IN_PROGRESS:
            return {
                label: "In corso",
                color: "bg-blue-100 text-blue-700 border-blue-300",
                icon: PlayCircle,
            };
        case BigsterTestStatus.COMPLETED:
            return {
                label: "Completato",
                color: "bg-green-100 text-green-700 border-green-300",
                icon: CheckCircle,
            };
        case BigsterTestStatus.EXPIRED:
            return {
                label: "Scaduto",
                color: "bg-red-100 text-red-700 border-red-300",
                icon: XCircle,
            };
        case BigsterTestStatus.CANCELLED:
            return {
                label: "Annullato",
                color: "bg-gray-100 text-gray-700 border-gray-300",
                icon: Ban,
            };
        default:
            return {
                label: status,
                color: "bg-gray-100 text-gray-700 border-gray-300",
                icon: Clock,
            };
    }
};

const getEvaluationConfig = (evaluation: string | null) => {
    switch (evaluation) {
        case "IDONEO":
            return {
                label: "Idoneo",
                color: "text-green-600",
                bgColor: "bg-green-50 border-green-200",
            };
        case "PARZIALMENTE_IDONEO":
            return {
                label: "Parzialmente Idoneo",
                color: "text-yellow-600",
                bgColor: "bg-yellow-50 border-yellow-200",
            };
        case "NON_IDONEO":
            return {
                label: "Non Idoneo",
                color: "text-red-600",
                bgColor: "bg-red-50 border-red-200",
            };
        default:
            return {
                label: "In valutazione",
                color: "text-gray-600",
                bgColor: "bg-gray-50 border-gray-200",
            };
    }
};

export function TestSection({
    applicationId,
    applicationStatus,
    candidateName,
    candidateEmail,
    onRefetch,
}: TestSectionProps) {
    const router = useRouter();

    const [showSendDialog, setShowSendDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>();
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [showDetails, setShowDetails] = useState(false);

    const {
        data: test,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetBigsterTestByApplicationQuery(applicationId);

    const { data: profiles = [], isLoading: profilesLoading } = useGetBigsterProfilesQuery();

    const { downloadPdf, isDownloading } = useBigsterReportDownload();

    const hasNoTest = isError || !test;
    const is404Error = isError && (error as any)?.status === 404;

    const [createTest, { isLoading: isCreating }] = useCreateBigsterTestMutation();
    const [resendTest, { isLoading: isResending }] = useResendBigsterTestMutation();
    const [cancelTest, { isLoading: isCancelling }] = useCancelBigsterTestMutation();

    const isInCorso = applicationStatus === "IN_CORSO";
    const canSendTest = isInCorso && !test;
    const canResendTest = test && !test.completed && (test.status === BigsterTestStatus.EXPIRED || isExpired(test.expires_at));
    const canCancelTest = test && !test.completed && test.status !== BigsterTestStatus.CANCELLED;

    function isExpired(expiresAt: string | null): boolean {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    }

    const handleSendTest = async () => {
        try {
            await createTest({
                application_id: applicationId,
                profile_id: selectedProfileId,
                expires_in_days: expiresInDays,
                send_email: true,
            }).unwrap();

            toast.success("Test inviato con successo", {
                description: `Email inviata a ${candidateEmail}`,
            });

            setShowSendDialog(false);
            refetch();
            onRefetch?.();
        } catch (err: any) {
            toast.error("Errore nell'invio del test", {
                description: err?.data?.error || "Riprova più tardi",
            });
        }
    };

    const handleResendTest = async () => {
        if (!test) return;

        try {
            await resendTest({
                id: test.id,
                data: { extend_expiration_days: 7 },
            }).unwrap();

            toast.success("Test reinviato con successo", {
                description: "La scadenza è stata estesa di 7 giorni",
            });

            refetch();
            onRefetch?.();
        } catch (err: any) {
            toast.error("Errore nel reinvio del test", {
                description: err?.data?.error || "Riprova più tardi",
            });
        }
    };

    const handleCancelTest = async () => {
        if (!test) return;

        try {
            await cancelTest(test.id).unwrap();

            toast.success("Test annullato", {
                description: "Il test è stato annullato con successo",
            });

            setShowCancelDialog(false);
            refetch();
            onRefetch?.();
        } catch (err: any) {
            toast.error("Errore nell'annullamento del test", {
                description: err?.data?.error || "Riprova più tardi",
            });
        }
    };

    const handleDownloadPdf = async () => {
        if (!test || !test.completed) return;

        try {
            const filename = candidateName.replace(/\s+/g, "-");
            await downloadPdf(test.id, filename);
            toast.success("Report PDF scaricato!");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Errore nel download"
            );
        }
    };

    const handleGoToDetail = () => {
        if (!test) return;
        router.push(`/test-bigster/${test.id}`);
    };

    if (isLoading) {
        return (
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        Test BigsTer
                    </h2>
                </div>
                <div className="p-6 flex items-center justify-center">
                    <Spinner className="h-6 w-6" />
                </div>
            </div>
        );
    }

    if (hasNoTest) {
        if (isError && !is404Error) {
            return (
                <div className="bg-bigster-surface border border-bigster-border">
                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                        <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Test BigsTer
                        </h2>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm text-red-600 mb-2">
                            Errore nel caricamento del test
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="rounded-none"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Riprova
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="bg-bigster-surface border border-bigster-border">
                    <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                        <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Test BigsTer
                        </h2>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-bigster-card-bg border border-bigster-border flex items-center justify-center mx-auto mb-3">
                            <ClipboardCheck className="h-6 w-6 text-bigster-text-muted" />
                        </div>
                        <p className="text-sm text-bigster-text-muted mb-4">
                            Nessun test inviato per questa candidatura
                        </p>

                        {canSendTest ? (
                            <Button
                                onClick={() => setShowSendDialog(true)}
                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Invia Test BigsTer
                            </Button>
                        ) : (
                            <p className="text-xs text-bigster-text-muted">
                                {!isInCorso
                                    ? "La candidatura deve essere in stato 'In Corso' per inviare il test"
                                    : "Non è possibile inviare il test"}
                            </p>
                        )}
                    </div>
                </div>

                <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                    <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
                        <DialogHeader
                            title="Invia Test BigsTer"
                            onClose={() => setShowSendDialog(false)}
                        />

                        <div className="p-5 pt-0 space-y-4">
                            <p className="text-xs text-bigster-text-muted">
                                Il candidato riceverà un&apos;email con il link per compilare il test
                            </p>

                            <div>
                                <p className="text-sm text-bigster-text mb-1">
                                    <strong>Candidato:</strong> {candidateName}
                                </p>
                                <p className="text-sm text-bigster-text-muted">
                                    <strong>Email:</strong> {candidateEmail}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-bigster-text">
                                    Profilo di valutazione
                                </label>
                                <StandardSelect
                                    value={selectedProfileId ? String(selectedProfileId) : ""}
                                    onChange={(value: string) =>
                                        setSelectedProfileId(value && value !== "all" ? Number(value) : undefined)
                                    }
                                    options={profiles.map((profile) => ({
                                        value: String(profile.id),
                                        label: profile.name,
                                    }))}
                                    emptyLabel="Seleziona profilo (opzionale)"
                                    disabled={profilesLoading}
                                    useEmptyStringForAll
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-bigster-text">
                                    Scadenza (giorni)
                                </label>
                                <StandardSelect
                                    value={String(expiresInDays)}
                                    onChange={(value: string) => {
                                        if (value !== "all") setExpiresInDays(Number(value));
                                    }}
                                    options={[
                                        { value: "3", label: "3 giorni" },
                                        { value: "5", label: "5 giorni" },
                                        { value: "7", label: "7 giorni" },
                                        { value: "14", label: "14 giorni" },
                                    ]}
                                    emptyLabel="Seleziona scadenza"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-bigster-border">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSendDialog(false)}
                                    className="flex-1 rounded-none border border-bigster-border"
                                >
                                    Annulla
                                </Button>
                                <Button
                                    onClick={handleSendTest}
                                    disabled={isCreating}
                                    className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 disabled:opacity-50"
                                >
                                    {isCreating ? (
                                        <Spinner className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Invia Test
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    const statusConfig = getStatusConfig(test.status, isExpired(test.expires_at));
    const StatusIcon = statusConfig.icon;
    const evaluationConfig = test.completed ? getEvaluationConfig(test.evaluation) : null;

    return (
        <>
            <div className="bg-bigster-surface border border-bigster-border">

                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        Test BigsTer
                    </h2>

                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs px-2 py-1 font-semibold border ${statusConfig.color}`}
                        >
                            <StatusIcon className="h-3 w-3 inline mr-1" />
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-4">

                    <div className="flex flex-wrap gap-3">

                        <div className="flex items-center gap-3 px-4 py-3 bg-bigster-card-bg border border-bigster-border">
                            <div className="w-9 h-9 bg-bigster-surface border border-bigster-border flex items-center justify-center flex-shrink-0">
                                <Send className="h-4 w-4 text-bigster-text-muted" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-bigster-text-muted uppercase tracking-wider">
                                    Inviato
                                </p>
                                <p className="text-sm font-medium text-bigster-text whitespace-nowrap">
                                    {formatDate(test.sent_at)}
                                </p>
                            </div>
                        </div>

                        {test.started_at && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200">
                                <div className="w-9 h-9 bg-blue-100 border border-blue-300 flex items-center justify-center flex-shrink-0">
                                    <PlayCircle className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                                        Iniziato
                                    </p>
                                    <p className="text-sm font-medium text-blue-800 whitespace-nowrap">
                                        {formatDate(test.started_at)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {test.completed_at && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200">
                                <div className="w-9 h-9 bg-green-100 border border-green-300 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                                        Completato
                                    </p>
                                    <p className="text-sm font-medium text-green-800 whitespace-nowrap">
                                        {formatDate(test.completed_at)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!test.completed && test.expires_at && (
                            <div className={`flex items-center gap-3 px-4 py-3 ${isExpired(test.expires_at)
                                ? "bg-red-50 border border-red-200"
                                : "bg-bigster-card-bg border border-bigster-border"
                                }`}>
                                <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${isExpired(test.expires_at)
                                    ? "bg-red-100 border border-red-300"
                                    : "bg-bigster-surface border border-bigster-border"
                                    }`}>
                                    <Clock className={`h-4 w-4 ${isExpired(test.expires_at) ? "text-red-600" : "text-bigster-text-muted"
                                        }`} />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isExpired(test.expires_at) ? "text-red-600" : "text-bigster-text-muted"
                                        }`}>
                                        {isExpired(test.expires_at) ? "Scaduto" : "Scade"}
                                    </p>
                                    <p className={`text-sm font-medium whitespace-nowrap ${isExpired(test.expires_at) ? "text-red-800" : "text-bigster-text"
                                        }`}>
                                        {formatDate(test.expires_at)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {test.profile && (
                        <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                                Profilo Assegnato
                            </p>
                            <p className="text-sm text-bigster-text font-medium">
                                {test.profile.name}
                            </p>
                        </div>
                    )}

                    {test.completed && evaluationConfig && (
                        <div className="border-t border-bigster-border pt-4">
                            <div className={`p-4 border ${evaluationConfig.bgColor}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award className={`h-6 w-6 ${evaluationConfig.color}`} />
                                        <div>
                                            <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                                Esito Test
                                            </p>
                                            <p className={`text-lg font-bold ${evaluationConfig.color}`}>
                                                {evaluationConfig.label}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="rounded-none border-bigster-border"
                                    >
                                        {showDetails ? (
                                            <>
                                                <ChevronUp className="h-4 w-4 mr-1" />
                                                Nascondi
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4 mr-1" />
                                                Dettagli
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {showDetails && (
                                    <div className="mt-4 pt-4 border-t border-bigster-border space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-bigster-text-muted">Idoneo:</span>{" "}
                                                <span className={test.eligible ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                    {test.eligible ? "Sì" : "No"}
                                                </span>
                                            </div>
                                            {test.suspect && (
                                                <div>
                                                    <span className="text-yellow-600 font-semibold">
                                                        ⚠ Test sospetto
                                                    </span>
                                                </div>
                                            )}
                                            {test.unreliable && (
                                                <div>
                                                    <span className="text-red-600 font-semibold">
                                                        ⚠ Test inaffidabile
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleGoToDetail}
                                                className="rounded-none border-bigster-border"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                Vedi Dettaglio Completo
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleDownloadPdf}
                                                disabled={isDownloading}
                                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                                            >
                                                {isDownloading ? (
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4 mr-1" />
                                                )}
                                                Scarica Report PDF
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!test.completed && isExpired(test.expires_at) && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-800">
                                    Test scaduto
                                </p>
                                <p className="text-xs text-yellow-700">
                                    Il candidato non può più completare il test. Puoi reinviarlo per estendere la scadenza.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">

                        {canResendTest && (
                            <Button
                                onClick={handleResendTest}
                                disabled={isResending}
                                variant="outline"
                                className="rounded-none border-bigster-border hover:bg-bigster-muted-bg"
                            >
                                {isResending ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Reinvia Test
                            </Button>
                        )}

                        {canCancelTest && (
                            <Button
                                onClick={() => setShowCancelDialog(true)}
                                variant="outline"
                                className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Annulla Test
                            </Button>
                        )}

                        {test.completed && (
                            <Button
                                onClick={handleGoToDetail}
                                variant="outline"
                                className="rounded-none border-bigster-border hover:bg-bigster-muted-bg"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Dettagli Test
                            </Button>
                        )}

                        {test.completed && (
                            <Button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Scarica Report PDF
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-sm shadow-lg">
                    <DialogHeader
                        title="Annulla Test"
                        onClose={() => setShowCancelDialog(false)}
                    />

                    <div className="p-5 pt-0 space-y-4">
                        <div className="p-3 bg-red-50 border border-red-200">
                            <p className="text-sm text-red-800">
                                Sei sicuro di voler annullare il test per <strong>{candidateName}</strong>?
                            </p>
                        </div>
                        <p className="text-xs text-bigster-text-muted">
                            Questa azione non può essere annullata. Il candidato non potrà più accedere al test.
                        </p>

                        <div className="flex items-center gap-3 pt-4 border-t border-bigster-border">
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelDialog(false)}
                                className="flex-1 rounded-none border border-bigster-border"
                            >
                                Indietro
                            </Button>
                            <Button
                                onClick={handleCancelTest}
                                disabled={isCancelling}
                                className="flex-1 rounded-none bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isCancelling ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Conferma
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
