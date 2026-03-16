"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Star,
    RefreshCw,
    AlertTriangle,
    Trash2,
    Eye,
    Download,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Edit3,
    Save,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Selection, ShortlistEntryDetail } from "@/types/selection";
import {
    useGetShortlistQuery,
    useRemoveFromShortlistMutation,
    useUpdateShortlistEntryMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { useLazyGetCvDownloadUrlQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useBigsterReportDownload } from "@/lib/redux/features/bigster/useBigsterReportDownload";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface RosaCandidatiSectionProps {
    selection: Selection;
}

interface ShortlistCardProps {
    entry: ShortlistEntryDetail;
    selectionId: number;
    onRemoved: () => void;
}

interface RemoveFromShortlistDialogProps {
    entry: ShortlistEntryDetail;
    selectionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRemoved: () => void;
}

const VISIBLE_STATES = [
    "CANDIDATURE_RICEVUTE",
    "COLLOQUI_IN_CORSO",
    "CANDIDATO_IN_PROVA",
    "SELEZIONI_IN_SOSTITUZIONE",
    "CHIUSA",
];

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-3 py-2 text-sm transition-colors";

const getTestStatusConfig = (status: string) => {
    switch (status) {
        case "PENDING":
            return { label: "In attesa", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock };
        case "IN_PROGRESS":
            return { label: "In corso", color: "bg-blue-100 text-blue-700 border-blue-300", icon: Clock };
        case "COMPLETED":
            return { label: "Completato", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle };
        case "EXPIRED":
            return { label: "Scaduto", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle };
        case "CANCELLED":
            return { label: "Annullato", color: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle };
        default:
            return { label: status, color: "bg-gray-100 text-gray-700 border-gray-300", icon: Clock };
    }
};

const getEligibleConfig = (eligible: boolean | null) => {
    if (eligible === true) return { label: "Idoneo", color: "text-green-600 bg-green-50 border-green-200" };
    if (eligible === false) return { label: "Non Idoneo", color: "text-red-600 bg-red-50 border-red-200" };
    return null;
};

function RemoveFromShortlistDialog({
    entry,
    selectionId,
    open,
    onOpenChange,
    onRemoved,
}: RemoveFromShortlistDialogProps) {
    const [removeFromShortlist, { isLoading }] = useRemoveFromShortlistMutation();

    const { application } = entry;
    const fullName = `${application.nome} ${application.cognome}`;

    const handleConfirm = async () => {
        try {
            await removeFromShortlist({
                selectionId,
                applicationId: application.id,
            }).unwrap();

            toast.success("Candidato rimosso dalla rosa", {
                description: `${fullName} è stato rimosso dalla rosa candidati`,
            });

            onOpenChange(false);
            onRemoved();
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile rimuovere il candidato dalla rosa",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
                <DialogHeader
                    title="Rimuovi dalla Rosa Candidati"
                    onClose={() => onOpenChange(false)}
                />

                <div className="space-y-5 p-5 pt-0">

                    <div className="p-4 bg-red-50 border border-red-200">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800 mb-1">
                                    Conferma rimozione
                                </p>
                                <p className="text-xs text-red-700">
                                    Stai per rimuovere questo candidato dalla rosa. L'operazione può essere annullata aggiungendolo nuovamente.
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-bigster-primary text-bigster-primary-text font-bold border border-yellow-200">
                                {entry.ordine}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-bigster-text truncate">
                                    {fullName}
                                </p>
                                <p className="text-xs text-bigster-text-muted truncate">
                                    {application.email}
                                </p>
                            </div>
                            <Star className="h-5 w-5 text-bigster-star fill-bigster-star" />
                        </div>
                    </div>


                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 rounded-none bg-red-600 text-white border border-red-700 hover:bg-red-700 font-semibold"
                        >
                            {isLoading ? (
                                <Spinner className="h-4 w-4 mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Rimuovi dalla Rosa
                        </Button>

                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            disabled={isLoading}
                            className="flex-1 rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            Annulla
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


function ShortlistCard({ entry, selectionId, onRemoved }: ShortlistCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteValue, setNoteValue] = useState(entry.note || "");
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

    const [updateEntry, { isLoading: isUpdating }] = useUpdateShortlistEntryMutation();
    const [getCvDownloadUrl] = useLazyGetCvDownloadUrlQuery();
    const { downloadPdf, isDownloading } = useBigsterReportDownload();

    const { application } = entry;
    const fullName = `${application.nome} ${application.cognome}`;
    const testBigster = application.test_bigster;
    const hasTest = !!testBigster;
    const testCompleted = testBigster?.completed ?? false;
    const testStatusConfig = testBigster?.status ? getTestStatusConfig(testBigster.status) : null;
    const eligibleConfig = testBigster?.eligible !== undefined ? getEligibleConfig(testBigster.eligible) : null;

    const formattedDate = format(new Date(entry.data_inserimento), "d MMM yyyy", { locale: it });


    const handleSaveNote = async () => {
        try {
            await updateEntry({ selectionId, applicationId: application.id, body: { note: noteValue.trim() || null } }).unwrap();
            toast.success("Nota aggiornata");
            setIsEditingNote(false);
        } catch (error: any) {
            toast.error("Errore", { description: error?.data?.error || "Impossibile aggiornare la nota" });
        }
    };

    const handleDownloadTestPdf = async () => {
        if (!testBigster?.id || !testCompleted) return;
        try {
            await downloadPdf(testBigster.id, `${application.nome}-${application.cognome}`);
            toast.success("Report PDF scaricato!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Errore nel download");
        }
    };

    const handleGoToApplication = () => router.push(`/candidature/${application.id}`);
    const handleGoToTest = () => testBigster?.id && router.push(`/test-bigster/${testBigster.id}`);

    return (
        <>
            <div className="bg-bigster-surface border border-bigster-border hover:border-bigster-text transition-colors">

                <div className="p-4">
                    <div className="flex items-center gap-4">

                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-bigster-text-muted" />
                            <div className="w-8 h-8 flex items-center justify-center bg-bigster-primary text-bigster-primary-text font-bold text-sm border border-yellow-200">
                                {entry.ordine}
                            </div>
                        </div>


                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-sm font-bold text-bigster-text truncate">{fullName}</h4>
                                <Star className="h-4 w-4 text-bigster-star fill-bigster-star" />
                                {eligibleConfig && (
                                    <span className={`text-xs px-2 py-0.5 font-semibold border ${eligibleConfig.color}`}>
                                        {eligibleConfig.label}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bigster-text-muted">
                                <span className="inline-flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {application.email}
                                </span>
                                {application.telefono && (
                                    <span className="inline-flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {application.telefono}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5" />
                                    Aggiunto il {formattedDate}
                                </span>
                            </div>
                        </div>


                        {hasTest && testStatusConfig && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-semibold border ${testStatusConfig.color}`}>
                                <testStatusConfig.icon className="h-3 w-3" />
                                {testStatusConfig.label}
                            </span>
                        )}


                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGoToApplication}
                                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Vedi
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRemoveDialogOpen(true)}
                                className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-2"
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>


                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-bigster-border bg-bigster-card-bg">
                        <div className="pt-4 space-y-4">

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                        Note sulla selezione
                                    </label>
                                    {!isEditingNote && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditingNote(true)}
                                            className="rounded-none border-bigster-border h-7 px-2 text-xs"
                                        >
                                            <Edit3 className="h-3 w-3 mr-1" />
                                            Modifica
                                        </Button>
                                    )}
                                </div>

                                {isEditingNote ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={noteValue}
                                            onChange={(e) => setNoteValue(e.target.value)}
                                            placeholder="Aggiungi note sul candidato..."
                                            rows={3}
                                            className={inputBase}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleSaveNote}
                                                disabled={isUpdating}
                                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 h-8"
                                            >
                                                {isUpdating ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4 mr-1" />}
                                                Salva
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setNoteValue(entry.note || "");
                                                    setIsEditingNote(false);
                                                }}
                                                className="rounded-none border-bigster-border h-8"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Annulla
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-bigster-text">
                                        {entry.note || <span className="text-bigster-text-muted italic">Nessuna nota</span>}
                                    </p>
                                )}
                            </div>


                            {testCompleted && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGoToTest}
                                        className="rounded-none border-bigster-border h-8 text-xs"
                                    >
                                        <FileText className="h-3.5 w-3.5 mr-1" />
                                        Vedi Test
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleDownloadTestPdf}
                                        disabled={isDownloading}
                                        className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 h-8 text-xs"
                                    >
                                        {isDownloading ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                                        Report PDF
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>


            <RemoveFromShortlistDialog
                entry={entry}
                selectionId={selectionId}
                open={isRemoveDialogOpen}
                onOpenChange={setIsRemoveDialogOpen}
                onRemoved={onRemoved}
            />
        </>
    );
}


function RosaCandidatiEmptyState() {
    return (
        <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
            <Star className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-bigster-text-muted mb-1">
                Nessun candidato nella rosa
            </p>
            <p className="text-xs text-bigster-text-muted max-w-md mx-auto">
                Aggiungi i migliori candidati alla rosa usando il pulsante
                <Star className="h-3 w-3 inline mx-1" />
                nella sezione Candidature qui sopra.
            </p>
        </div>
    );
}


export function RosaCandidatiSection({ selection }: RosaCandidatiSectionProps) {
    const isVisible = VISIBLE_STATES.includes(selection.stato);


    const totalApplications =
        selection.annunci?.reduce((sum, ann) => sum + (ann._count?.candidature || 0), 0) || 0;

    const shouldShow = isVisible && totalApplications > 0;

    const { data: shortlistData, isLoading, error, refetch, isFetching } = useGetShortlistQuery(selection.id, {
        skip: !shouldShow,
    });

    const shortlist = shortlistData?.data || [];
    const shortlistCount = shortlistData?.count || 0;


    if (!shouldShow) return null;

    return (
        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-bigster-star fill-bigster-star" />
                        <div>
                            <h2 className="text-lg font-bold text-bigster-text">Rosa Candidati</h2>
                            <p className="text-xs text-bigster-text-muted">
                                I migliori candidati selezionati per questa posizione
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        <span className="px-3 py-1 bg-bigster-primary text-bigster-primary-text text-sm font-bold border border-yellow-200">
                            {shortlistCount} / 10
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                            Aggiorna
                        </Button>
                    </div>
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
                            Errore nel caricamento della rosa candidati. Riprova più tardi.
                        </AlertDescription>
                    </Alert>
                )}


                {!isLoading && !error && (
                    <>

                        {shortlistCount === 0 ? (
                            <RosaCandidatiEmptyState />
                        ) : (
                            <>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">In Rosa</p>
                                        <p className="text-2xl font-bold text-bigster-text">{shortlistCount}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 border border-green-200">
                                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Idonei</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {shortlist.filter((e) => e.application.test_bigster?.eligible === true).length}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-200">
                                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Test Completati</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {shortlist.filter((e) => e.application.test_bigster?.completed).length}
                                        </p>
                                    </div>
                                </div>


                                <div className="space-y-3">
                                    {shortlist.map((entry) => (
                                        <ShortlistCard key={entry.id} entry={entry} selectionId={selection.id} onRemoved={() => refetch()} />
                                    ))}
                                </div>
                            </>
                        )}


                        <div className="mt-6 p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-start gap-3">
                                <Star className="h-5 w-5 text-bigster-star flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-bigster-text mb-1">Gestione Rosa Candidati</p>
                                    <p className="text-xs text-bigster-text-muted">
                                        La rosa può contenere fino a 10 candidati. Per aggiungere nuovi candidati, usa il pulsante
                                        <Star className="h-3 w-3 inline mx-1" /> nella sezione Candidature qui sopra.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default RosaCandidatiSection;
