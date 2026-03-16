"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useRegisterInterviewMutation } from "@/lib/redux/features/applications/applicationsApiSlice";
import {
    useGetBigsterProfilesQuery,
    useCreateBigsterTestMutation,
    useCreateBigsterProfileMutation,
    useGetBigsterTestByApplicationQuery,
    useResendBigsterTestMutation,
} from "@/lib/redux/features/bigster";
import {
    useGetShortlistQuery,
    useAddToShortlistMutation,
    useRemoveFromShortlistMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { useBigsterReportDownload } from "@/lib/redux/features/bigster/useBigsterReportDownload";
import { Spinner } from "@/components/ui/spinner";
import {
    ClipboardCheck,
    MessageSquare,
    Mail,
    Phone,
    ExternalLink,
    Send,
    Calendar,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Eye,
    Download,
    Loader2,
    Star,
    StarOff,
    Trash2,
    Plus,
    Info,
    X,
} from "lucide-react";
import { InterviewOutcome, InterviewType } from "@/types/application";
import { BigsterTestStatus } from "@/types/bigster";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";

interface QuickActionsProps {
    application: {
        id: number;
        email: string;
        telefono?: string | null;
        stato: string;
        nome: string;
        cognome: string;
        annuncio?: {
            selezione?: {
                id: number;
                figura_ricercata?: string;
                titolo?: string;
            };
        };
    };
    onRefetch: () => void;
}

const INTERVIEW_TYPES = [
    { value: "SCREENING_TELEFONICO", label: "Screening Telefonico" },
    { value: "INCONTRO_HR", label: "Incontro HR" },
    { value: "PROPOSTA_CLIENTE", label: "Proposta Cliente" },
];

const INTERVIEW_OUTCOMES = [
    { value: "POSITIVO", label: "Positivo" },
    { value: "NEGATIVO", label: "Negativo" },
];

const getTestStatusInfo = (status: BigsterTestStatus) => {
    switch (status) {
        case BigsterTestStatus.PENDING:
            return {
                label: "In attesa",
                icon: Clock,
                color: "text-yellow-600",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-200",
            };
        case BigsterTestStatus.IN_PROGRESS:
            return {
                label: "In corso",
                icon: RefreshCw,
                color: "text-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
            };
        case BigsterTestStatus.COMPLETED:
            return {
                label: "Completato",
                icon: CheckCircle2,
                color: "text-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
            };
        case BigsterTestStatus.EXPIRED:
            return {
                label: "Scaduto",
                icon: AlertCircle,
                color: "text-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
            };
        case BigsterTestStatus.CANCELLED:
            return {
                label: "Annullato",
                icon: AlertCircle,
                color: "text-gray-600",
                bgColor: "bg-gray-50",
                borderColor: "border-gray-200",
            };
        default:
            return {
                label: status,
                icon: Clock,
                color: "text-gray-600",
                bgColor: "bg-gray-50",
                borderColor: "border-gray-200",
            };
    }
};

export function QuickActions({ application, onRefetch }: QuickActionsProps) {
    const router = useRouter();

    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
    const [isRemoveFromRosaDialogOpen, setIsRemoveFromRosaDialogOpen] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<number | "">("");
    const [interviewType, setInterviewType] = useState("");
    const [interviewOutcome, setInterviewOutcome] = useState("");
    const [interviewNote, setInterviewNote] = useState("");

    const [wasAutoSelected, setWasAutoSelected] = useState(false);

    const [showNewProfileForm, setShowNewProfileForm] = useState(false);
    const [newProfileName, setNewProfileName] = useState("");
    const [newProfileError, setNewProfileError] = useState("");

    const {
        data: profiles,
        isLoading: isLoadingProfiles,
    } = useGetBigsterProfilesQuery();

    const {
        data: existingTest,
        isLoading: isLoadingTest,
        refetch: refetchTest,
    } = useGetBigsterTestByApplicationQuery(application.id);

    const [createBigsterTest, { isLoading: isCreatingTest }] = useCreateBigsterTestMutation();
    const [resendBigsterTest, { isLoading: isResendingTest }] = useResendBigsterTestMutation();
    const [createBigsterProfile, { isLoading: isCreatingProfile }] = useCreateBigsterProfileMutation();

    const { downloadPdf, isDownloading } = useBigsterReportDownload();

    const selectionId = application.annuncio?.selezione?.id;

    const {
        data: shortlistData,
        isLoading: isLoadingRosa,
    } = useGetShortlistQuery(selectionId!, { skip: !selectionId });

    const [addToShortlist, { isLoading: isAddingToRosa }] = useAddToShortlistMutation();
    const [removeFromShortlist, { isLoading: isRemovingFromRosa }] = useRemoveFromShortlistMutation();

    const isInRosa = useMemo(() => {
        if (!shortlistData?.data) return false;
        return shortlistData.data.some((entry) => entry.application_id === application.id);
    }, [shortlistData, application.id]);

    const [registerInterview, { isLoading: isRegisteringInterview }] =
        useRegisterInterviewMutation();

    const isInCorso = application.stato === "IN_CORSO";
    const hasTest = !!existingTest;
    const testStatus = existingTest?.status;
    const canSendNewTest = !hasTest || testStatus === BigsterTestStatus.EXPIRED || testStatus === BigsterTestStatus.CANCELLED;
    const canResendTest = hasTest && (testStatus === BigsterTestStatus.PENDING || testStatus === BigsterTestStatus.IN_PROGRESS);
    const figuraRicercata = application.annuncio?.selezione?.figura_ricercata;

    useEffect(() => {
        if (profiles && figuraRicercata && !selectedProfileId) {
            const figuraLower = figuraRicercata.toLowerCase();

            const match =
                profiles.find((p) => p.name.toLowerCase() === figuraLower) ||
                profiles.find((p) => p.name.toLowerCase().includes(figuraLower));
            if (match) {
                setSelectedProfileId(match.id);
                setWasAutoSelected(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profiles, figuraRicercata]);

    const handleSendTest = async () => {
        if (!selectedProfileId) {
            toast.error("Seleziona un profilo di valutazione");
            return;
        }

        try {
            await createBigsterTest({
                application_id: application.id,
                profile_id: Number(selectedProfileId),
            }).unwrap();

            toast.success("Test inviato con successo!", {
                description: `Email inviata a ${application.email}`,
            });

            setIsTestDialogOpen(false);
            setSelectedProfileId("");
            setWasAutoSelected(false);
            refetchTest();
            onRefetch();
        } catch (error: any) {
            toast.error("Errore invio test", {
                description: error?.data?.error || "Riprova più tardi",
            });
        }
    };

    const handleResendTest = async () => {
        if (!existingTest?.id) return;

        try {
            await resendBigsterTest({ id: existingTest.id }).unwrap();
            toast.success("Email reinviata con successo!");
            refetchTest();
            onRefetch();
        } catch (error: any) {
            toast.error("Errore reinvio", {
                description: error?.data?.error || "Riprova più tardi",
            });
        }
    };

    const handleDownloadPdf = async () => {
        if (!existingTest || !existingTest.completed) return;

        try {
            await downloadPdf(
                existingTest.id,
                `${application.nome}-${application.cognome}`
            );
            toast.success("Report PDF scaricato!");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Errore nel download"
            );
        }
    };

    const handleGoToTestDetail = () => {
        if (!existingTest) return;
        router.push(`/test-bigster/${existingTest.id}`);
    };

    const handleRegisterInterview = async () => {
        if (!interviewType || !interviewOutcome) {
            toast.error("Compila tutti i campi obbligatori");
            return;
        }

        try {
            await registerInterview({
                applicationId: application.id,
                data: {
                    tipo: interviewType as InterviewType,
                    esito: interviewOutcome as InterviewOutcome,
                    note: interviewNote || undefined,
                },
            }).unwrap();

            toast.success("Colloquio registrato!");
            setIsInterviewDialogOpen(false);
            setInterviewType("");
            setInterviewOutcome("");
            setInterviewNote("");
            onRefetch();
        } catch (error: any) {
            toast.error("Errore nella registrazione", {
                description: error?.data?.message || "Riprova più tardi",
            });
        }
    };

    const handleOpenTestDialog = () => {
        setSelectedProfileId("");
        setWasAutoSelected(false);
        setShowNewProfileForm(false);
        setNewProfileName("");
        setNewProfileError("");
        setIsTestDialogOpen(true);

        if (profiles && figuraRicercata) {
            const figuraLower = figuraRicercata.toLowerCase();
            const match =
                profiles.find((p) => p.name.toLowerCase() === figuraLower) ||
                profiles.find((p) => p.name.toLowerCase().includes(figuraLower));
            if (match) {
                setSelectedProfileId(match.id);
                setWasAutoSelected(true);
            }
        }
    };

    const handleCreateProfile = async () => {
        const trimmed = newProfileName.trim();
        if (trimmed.length < 2) {
            setNewProfileError("Il nome deve avere almeno 2 caratteri");
            return;
        }
        if (profiles?.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
            setNewProfileError("Esiste già un profilo con questo nome");
            return;
        }

        try {
            const result = await createBigsterProfile({ name: trimmed }).unwrap();
            toast.success("Profilo creato!", { description: trimmed });
            setSelectedProfileId(result.data.id);
            setWasAutoSelected(false);
            setShowNewProfileForm(false);
            setNewProfileName("");
            setNewProfileError("");
        } catch (error: any) {
            setNewProfileError(error?.data?.error || "Errore nella creazione del profilo");
        }
    };

    const handleAddToRosa = async () => {
        if (!selectionId) {
            toast.error("Selezione non trovata");
            return;
        }

        try {
            await addToShortlist({
                selectionId,
                body: {
                    application_id: application.id,
                },
            }).unwrap();

            toast.success("Aggiunto alla rosa!", {
                description: `${application.nome} ${application.cognome} è stato aggiunto alla rosa dei candidati`,
            });
            onRefetch();
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile aggiungere alla rosa",
            });
        }
    };

    const handleRemoveFromRosa = async () => {
        if (!selectionId) return;

        try {
            await removeFromShortlist({
                selectionId,
                applicationId: application.id,
            }).unwrap();

            toast.success("Rimosso dalla rosa", {
                description: `${application.nome} ${application.cognome} è stato rimosso dalla rosa`,
            });
            setIsRemoveFromRosaDialogOpen(false);
            onRefetch();
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile rimuovere dalla rosa",
            });
        }
    };

    const renderTestStatusCard = () => {
        if (isLoadingTest) {
            return (
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                    <div className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        <span className="text-sm text-bigster-text-muted">Caricamento test...</span>
                    </div>
                </div>
            );
        }

        if (!existingTest) return null;

        const statusInfo = getTestStatusInfo(existingTest.status);
        const StatusIcon = statusInfo.icon;

        return (
            <div className={`p-4 ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-semibold ${statusInfo.color}`}>
                            Test BigsTer: {statusInfo.label}
                        </span>
                    </div>
                </div>

                {existingTest.profile && (
                    <div className="flex items-center gap-2 text-xs text-bigster-text-muted mb-2">
                        <User className="h-3 w-3" />
                        <span>Profilo: {existingTest.profile.name}</span>
                    </div>
                )}

                {existingTest.sent_at && (
                    <div className="text-xs text-bigster-text-muted mb-3">
                        Inviato il: {new Date(existingTest.sent_at).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {canResendTest && (
                        <Button
                            onClick={handleResendTest}
                            disabled={isResendingTest}
                            variant="outline"
                            size="sm"
                            className="rounded-none border border-bigster-border text-xs"
                        >
                            {isResendingTest ? (
                                <Spinner className="h-3 w-3 mr-1" />
                            ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            Reinvia Email
                        </Button>
                    )}

                    {testStatus === BigsterTestStatus.COMPLETED && (
                        <Button
                            onClick={handleGoToTestDetail}
                            variant="outline"
                            size="sm"
                            className="rounded-none border border-green-300 text-green-700 text-xs"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            Vedi Risultati
                        </Button>
                    )}

                    {testStatus === BigsterTestStatus.COMPLETED && (
                        <Button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            size="sm"
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 text-xs"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <Download className="h-3 w-3 mr-1" />
                            )}
                            Scarica PDF
                        </Button>
                    )}

                    {canSendNewTest && hasTest && (
                        <Button
                            onClick={handleOpenTestDialog}
                            disabled={!isInCorso}
                            size="sm"
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 text-xs"
                        >
                            <Send className="h-3 w-3 mr-1" />
                            Nuovo Test
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const renderRosaStatus = () => {
        if (!selectionId) return null;

        if (isLoadingRosa) {
            return (
                <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                    <div className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        <span className="text-sm text-bigster-text-muted">Verifica rosa...</span>
                    </div>
                </div>
            );
        }

        if (isInRosa) {
            return (
                <div className="p-4 bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">
                                Nella Rosa dei Candidati
                            </span>
                        </div>
                        <Button
                            onClick={() => setIsRemoveFromRosaDialogOpen(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-none border border-red-300 text-red-600 hover:bg-red-50 text-xs"
                        >
                            <StarOff className="h-3 w-3 mr-1" />
                            Rimuovi
                        </Button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text">Azioni Rapide</h2>
                </div>

                <div className="p-4 space-y-3">
                    {renderRosaStatus()}
                    {renderTestStatusCard()}

                    {selectionId && !isInRosa && !isLoadingRosa && (
                        <Button
                            onClick={handleAddToRosa}
                            disabled={isAddingToRosa || !isInCorso}
                            className="w-full rounded-none bg-amber-500 hover:bg-amber-600 text-white border border-amber-400 justify-start disabled:opacity-50"
                        >
                            {isAddingToRosa ? (
                                <Spinner className="h-4 w-4 mr-3" />
                            ) : (
                                <Star className="h-4 w-4 mr-3" />
                            )}
                            Aggiungi alla Rosa
                        </Button>
                    )}

                    {canSendNewTest && !hasTest && (
                        <Button
                            onClick={handleOpenTestDialog}
                            disabled={!isInCorso}
                            className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 justify-start disabled:opacity-50"
                        >
                            <ClipboardCheck className="h-4 w-4 mr-3" />
                            Invia Test BigsTer
                        </Button>
                    )}

                    <Button
                        onClick={() => setIsInterviewDialogOpen(true)}
                        disabled={!isInCorso}
                        variant="outline"
                        className="w-full rounded-none border border-bigster-border justify-start disabled:opacity-50"
                    >
                        <MessageSquare className="h-4 w-4 mr-3" />
                        Registra Colloquio
                    </Button>

                    <div className="border-t border-bigster-border pt-3 mt-3">
                        <a href={`mailto:${application.email}`}>
                            <Button
                                variant="outline"
                                className="w-full rounded-none border border-bigster-border justify-start mb-2"
                            >
                                <Mail className="h-4 w-4 mr-3" />
                                Invia Email
                                <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                        </a>

                        {application.telefono && (
                            <a href={`tel:${application.telefono}`}>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-none border border-bigster-border justify-start"
                                >
                                    <Phone className="h-4 w-4 mr-3" />
                                    Chiama
                                    <ExternalLink className="h-3 w-3 ml-auto" />
                                </Button>
                            </a>
                        )}
                    </div>

                    {application.annuncio?.selezione && (
                        <div className="border-t border-bigster-border pt-3 mt-3">
                            <a href={`/selezioni/${application.annuncio.selezione.id}`}>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-none border border-bigster-border justify-start"
                                >
                                    Vai alla Selezione
                                    <ExternalLink className="h-3 w-3 ml-auto" />
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-lg shadow-lg">
                    <DialogHeader
                        title="Invia Test BigsTer"
                        onClose={() => setIsTestDialogOpen(false)}
                    />

                    <div className="p-5 pt-0 space-y-5">

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-bigster-primary flex items-center justify-center">
                                    <User className="h-5 w-5 text-bigster-primary-text" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-bigster-text">
                                        {application.nome} {application.cognome}
                                    </p>
                                    <p className="text-xs text-bigster-text-muted">{application.email}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-bigster-text mb-1.5">
                                Profilo Professionale *
                            </label>
                            <p className="text-xs text-bigster-text-muted mb-3">
                                Seleziona il profilo per valutare l&apos;idoneità del candidato
                            </p>

                            {wasAutoSelected && figuraRicercata && (
                                <div className="p-3 bg-blue-50 border border-blue-200 mb-3">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-blue-800">
                                                Profilo suggerito automaticamente
                                            </p>
                                            <p className="text-xs text-blue-700 mt-0.5">
                                                Abbiamo pre-selezionato <strong>&ldquo;{figuraRicercata}&rdquo;</strong> in
                                                base alla figura ricercata dalla selezione.
                                                Puoi cambiare profilo in qualsiasi momento o crearne uno nuovo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoadingProfiles ? (
                                <div className="flex items-center gap-2 p-3 bg-bigster-muted-bg border border-bigster-border">
                                    <Spinner className="h-4 w-4" />
                                    <span className="text-sm text-bigster-text-muted">Caricamento profili...</span>
                                </div>
                            ) : (
                                <SearchableSelect
                                    label=""
                                    value={selectedProfileId ? String(selectedProfileId) : ""}
                                    onChange={(value) => {
                                        setSelectedProfileId(value ? Number(value) : "");
                                        if (value) setWasAutoSelected(false);
                                    }}
                                    options={(profiles || []).map((p) => ({
                                        value: p.id.toString(),
                                        label: p.name,
                                    }))}
                                    placeholder="Cerca profilo..."
                                    emptyLabel="Seleziona profilo..."
                                />
                            )}

                            {!showNewProfileForm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewProfileForm(true);
                                        setNewProfileError("");
                                    }}
                                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-bigster-text-muted hover:text-bigster-text transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Il profilo che cerchi non esiste? Creane uno nuovo
                                </button>
                            )}

                            <AnimatePresence>
                                {showNewProfileForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-bigster-text">
                                                    Nuovo Profilo Professionale
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewProfileForm(false);
                                                        setNewProfileName("");
                                                        setNewProfileError("");
                                                    }}
                                                    className="text-bigster-text-muted hover:text-bigster-text"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                value={newProfileName}
                                                onChange={(e) => {
                                                    setNewProfileName(e.target.value);
                                                    setNewProfileError("");
                                                }}
                                                placeholder="Es. Igienista Dentale"
                                                className="w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors"
                                            />

                                            {newProfileError && (
                                                <p className="text-xs text-red-600">{newProfileError}</p>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={handleCreateProfile}
                                                    disabled={isCreatingProfile || !newProfileName.trim()}
                                                    size="sm"
                                                    className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 text-xs disabled:opacity-50"
                                                >
                                                    {isCreatingProfile ? (
                                                        <Spinner className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <Plus className="h-3 w-3 mr-1" />
                                                    )}
                                                    Crea Profilo
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowNewProfileForm(false);
                                                        setNewProfileName("");
                                                        setNewProfileError("");
                                                    }}
                                                    className="rounded-none border border-bigster-border text-xs"
                                                >
                                                    Annulla
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-bigster-border">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsTestDialogOpen(false);
                                    setSelectedProfileId("");
                                    setWasAutoSelected(false);
                                    setShowNewProfileForm(false);
                                    setNewProfileName("");
                                    setNewProfileError("");
                                }}
                                className="flex-1 rounded-none border border-bigster-border"
                            >
                                Annulla
                            </Button>
                            <Button
                                onClick={handleSendTest}
                                disabled={!selectedProfileId || isCreatingTest}
                                className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 disabled:opacity-50"
                            >
                                {isCreatingTest ? (
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

            <Dialog
                open={isInterviewDialogOpen}
                onOpenChange={setIsInterviewDialogOpen}
            >
                <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
                    <DialogHeader
                        title="Registra Colloquio"
                        onClose={() => setIsInterviewDialogOpen(false)}
                    />

                    <div className="p-5 pt-0 space-y-4">

                        <div>
                            <StandardSelect
                                label="Tipo Colloquio *"
                                value={interviewType}
                                onChange={(value) => setInterviewType(value)}
                                options={INTERVIEW_TYPES.map((t) => ({
                                    value: t.value,
                                    label: t.label,
                                }))}
                                emptyLabel="Seleziona tipo..."
                            />
                        </div>

                        <div>
                            <StandardSelect
                                label="Esito *"
                                value={interviewOutcome}
                                onChange={(value) => setInterviewOutcome(value)}
                                options={INTERVIEW_OUTCOMES.map((o) => ({
                                    value: o.value,
                                    label: o.label,
                                }))}
                                emptyLabel="Seleziona esito..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-bigster-text mb-1.5">
                                Note (opzionale)
                            </label>
                            <textarea
                                value={interviewNote}
                                onChange={(e) => setInterviewNote(e.target.value)}
                                placeholder="Aggiungi note sul colloquio..."
                                rows={3}
                                className="w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted px-4 py-2 text-sm focus:outline-none focus:border-bigster-text"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-bigster-border">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsInterviewDialogOpen(false);
                                    setInterviewType("");
                                    setInterviewOutcome("");
                                    setInterviewNote("");
                                }}
                                className="flex-1 rounded-none border border-bigster-border"
                            >
                                Annulla
                            </Button>
                            <Button
                                onClick={handleRegisterInterview}
                                disabled={
                                    !interviewType || !interviewOutcome || isRegisteringInterview
                                }
                                className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 disabled:opacity-50"
                            >
                                {isRegisteringInterview ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Registra
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isRemoveFromRosaDialogOpen}
                onOpenChange={setIsRemoveFromRosaDialogOpen}
            >
                <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
                    <DialogHeader
                        title="Rimuovi dalla Rosa"
                        onClose={() => setIsRemoveFromRosaDialogOpen(false)}
                    />

                    <div className="p-5 pt-0 space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-800 mb-1">
                                        Conferma rimozione
                                    </p>
                                    <p className="text-xs text-red-700">
                                        Stai per rimuovere questo candidato dalla rosa.
                                        Potrai aggiungerlo nuovamente in seguito.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-bigster-primary flex items-center justify-center">
                                    <User className="h-5 w-5 text-bigster-primary-text" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-bigster-text">
                                        {application.nome} {application.cognome}
                                    </p>
                                    <p className="text-xs text-bigster-text-muted">{application.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-bigster-border">
                            <Button
                                variant="outline"
                                onClick={() => setIsRemoveFromRosaDialogOpen(false)}
                                className="flex-1 rounded-none border border-bigster-border"
                            >
                                Annulla
                            </Button>
                            <Button
                                onClick={handleRemoveFromRosa}
                                disabled={isRemovingFromRosa}
                                className="flex-1 rounded-none bg-red-600 hover:bg-red-700 text-white border border-red-500"
                            >
                                {isRemovingFromRosa ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Rimuovi dalla Rosa
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
