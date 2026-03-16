"use client";

import { useState, useMemo } from "react";
import { ApplicationStatusBadge } from "../../_components/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { useChangeApplicationStatusMutation } from "@/lib/redux/features/applications/applicationsApiSlice";
import {
    User,
    Building2,
    Briefcase,
    Calendar,
    UserCheck,
    UserX,
    LogOut,
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ApplicationStatus } from "@/types/application";
import { toast } from "sonner";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface ApplicationHeaderProps {
    application: {
        id: number;
        nome: string;
        cognome: string;
        stato: string;
        data_creazione: string;
        data_chiusura?: string | null;
        annuncio?: {
            selezione?: {
                id: number;
                titolo: string;
                figura_ricercata?: string | null;
                stato?: string;
                company?: {
                    nome: string;
                };
            };
        };
    };
    onRefetch: () => void;
}

type NewStatus = "IN_PROVA" | "ASSUNTO" | "SCARTATO" | "RITIRATO";

interface StatusAction {
    status: NewStatus;
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
}

const ALL_STATUS_ACTIONS: StatusAction[] = [
    {
        status: "IN_PROVA",
        label: "Metti in Prova",
        icon: Clock,
        color: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
        description: "Avvia il periodo di prova di 6 mesi",
    },
    {
        status: "ASSUNTO",
        label: "Segna come Assunto",
        icon: UserCheck,
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-300",
        description: "Conferma l'assunzione definitiva",
    },
    {
        status: "SCARTATO",
        label: "Segna come Scartato",
        icon: UserX,
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
        description: "Il candidato non è idoneo",
    },
    {
        status: "RITIRATO",
        label: "Segna come Ritirato",
        icon: LogOut,
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-300",
        description: "Il candidato si è ritirato",
    },
];

function getAvailableTransitions(currentStatus: string): NewStatus[] {
    switch (currentStatus) {
        case "IN_CORSO":

            return ["IN_PROVA", "ASSUNTO", "SCARTATO", "RITIRATO"];
        case "IN_PROVA":

            return ["ASSUNTO", "SCARTATO"];
        case "ASSUNTO":
        case "SCARTATO":
        case "RITIRATO":

            return [];
        default:
            return [];
    }
}

const STATUS_LABELS: Record<string, string> = {
    IN_CORSO: "In Corso",
    IN_PROVA: "In Prova",
    ASSUNTO: "Assunto",
    SCARTATO: "Scartato",
    RITIRATO: "Ritirato",
};

export function ApplicationHeader({
    application,
    onRefetch,
}: ApplicationHeaderProps) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<NewStatus | null>(null);
    const [statusNote, setStatusNote] = useState("");

    const [changeStatus, { isLoading: isChangingStatus }] =
        useChangeApplicationStatusMutation();

    const fullName = `${application.nome} ${application.cognome}`;
    const currentStatus = application.stato;

    const availableTransitions = useMemo(
        () => getAvailableTransitions(currentStatus),
        [currentStatus]
    );

    const availableActions = useMemo(
        () => ALL_STATUS_ACTIONS.filter((a) => availableTransitions.includes(a.status)),
        [availableTransitions]
    );

    const isFinalized = availableTransitions.length === 0;
    const isSelectingAssunto = selectedStatus === "ASSUNTO";
    const isSelectingInProva = selectedStatus === "IN_PROVA";
    const isFromInProva = currentStatus === "IN_PROVA";

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const handleStatusChange = async () => {
        if (!selectedStatus) return;

        try {
            await changeStatus({
                id: application.id,
                data: {
                    stato: selectedStatus as ApplicationStatus,
                    note: statusNote || undefined,
                },
            }).unwrap();

            toast.success(
                isSelectingAssunto ? "Candidato assunto" : "Stato aggiornato",
                {
                    description: isSelectingAssunto
                        ? `${fullName} è stato assunto. La selezione è stata chiusa automaticamente.`
                        : `La candidatura di ${fullName} è ora "${STATUS_LABELS[selectedStatus] || selectedStatus}"`,
                }
            );

            setIsStatusDialogOpen(false);
            setSelectedStatus(null);
            setStatusNote("");
            onRefetch();
        } catch (error: any) {
            const errorMessage =
                error?.data?.message || error?.data?.error || "Impossibile aggiornare lo stato della candidatura";
            toast.error("Errore", { description: errorMessage });
        }
    };

    const handleCloseDialog = () => {
        setIsStatusDialogOpen(false);
        setSelectedStatus(null);
        setStatusNote("");
    };

    return (
        <>
            <div className="bg-bigster-surface border border-bigster-border">

                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                    <ApplicationStatusBadge status={application.stato} size="lg" />

                    {!isFinalized && (
                        <Button
                            onClick={() => setIsStatusDialogOpen(true)}
                            variant="outline"
                            className="rounded-none border border-bigster-border text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            Cambia Stato
                        </Button>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div>
                            <h1 className="text-2xl font-bold text-bigster-text flex items-center gap-3 mb-2">
                                <User className="h-7 w-7 text-bigster-text-muted" />
                                {fullName}
                            </h1>

                            {application.annuncio?.selezione && (
                                <div className="ml-10 space-y-1">
                                    <p className="text-sm text-bigster-text flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-bigster-text-muted" />
                                        {application.annuncio.selezione.titolo}
                                        {application.annuncio.selezione.figura_ricercata && (
                                            <span className="text-bigster-text-muted">
                                                • {application.annuncio.selezione.figura_ricercata}
                                            </span>
                                        )}
                                    </p>
                                    {application.annuncio.selezione.company && (
                                        <p className="text-sm text-bigster-text-muted flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {application.annuncio.selezione.company.nome}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <p className="text-sm text-bigster-text-muted flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Candidatura: {formatDate(application.data_creazione)}
                            </p>
                            {application.data_chiusura && (
                                <p className="text-sm text-bigster-text-muted flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Chiusura: {formatDate(application.data_chiusura)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg max-h-[90dvh] overflow-y-auto">
                    <DialogHeader
                        title="Cambia Stato Candidatura"
                        onClose={handleCloseDialog}
                    />

                    <div className="space-y-5 p-5 pt-0">

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-bigster-text-muted">
                                {fullName} • #{application.id}
                            </p>
                            <ApplicationStatusBadge status={currentStatus} size="sm" />
                        </div>

                        {isFromInProva && (
                            <div className="p-3 bg-orange-50 border border-orange-200 flex items-start gap-3">
                                <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-orange-800 mb-0.5">
                                        Candidato attualmente in prova
                                    </p>
                                    <p className="text-xs text-orange-700">
                                        Puoi confermare l'assunzione o scartare il candidato al termine del periodo di prova.
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStatus === "IN_CORSO" && (
                            <div className="p-3 bg-bigster-card-bg border border-bigster-border flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-bigster-text-muted">
                                    Seleziona il nuovo stato per questa candidatura. Le transizioni verso stati finali sono irreversibili.
                                </p>
                            </div>
                        )}

                        
                        <div className="space-y-2">
                            {availableActions.map((action) => {
                                const Icon = action.icon;
                                const isSelected = selectedStatus === action.status;

                                return (
                                    <button
                                        key={action.status}
                                        onClick={() => setSelectedStatus(action.status)}
                                        className={`w-full p-4 border-2 flex items-start gap-3 transition-all text-left ${isSelected
                                            ? `${action.bgColor} ${action.borderColor}`
                                            : "border-bigster-border hover:bg-bigster-muted-bg"
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${action.color}`} />
                                        <div>
                                            <span
                                                className={`font-semibold text-sm block ${isSelected ? action.color : "text-bigster-text"
                                                    }`}
                                            >
                                                {action.label}
                                            </span>
                                            <span className="text-xs text-bigster-text-muted">
                                                {action.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        
                        {isSelectingAssunto && (
                            <div className="p-4 border-2 border-orange-200 bg-orange-50">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-orange-800 mb-1">
                                            Attenzione: questa azione chiuderà la selezione
                                        </p>
                                        <p className="text-xs text-orange-700 leading-relaxed">
                                            Contrassegnando il candidato come{" "}
                                            <strong>assunto</strong>, la selezione associata verrà{" "}
                                            <strong>chiusa automaticamente</strong> e non sarà più
                                            possibile gestire altre candidature al suo interno.
                                        </p>
                                        {!isFromInProva && (
                                            <p className="text-xs text-orange-700 leading-relaxed mt-2">
                                                Se il candidato è ancora in{" "}
                                                <strong>periodo di prova</strong>, usa prima lo stato
                                                "Metti in Prova".
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        
                        {isSelectingInProva && (
                            <div className="p-4 border-2 border-blue-200 bg-blue-50">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-800 mb-1">
                                            La selezione passerà a "Candidato in Prova"
                                        </p>
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            Lo stato della selezione verrà aggiornato
                                            automaticamente. Il candidato inizierà il periodo di
                                            prova di 6 mesi, al termine del quale potrà essere
                                            confermato come assunto o scartato.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        
                        {selectedStatus && (
                            <div className="flex items-center justify-center gap-3 py-1">
                                <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                                    {STATUS_LABELS[currentStatus] || currentStatus}
                                </span>
                                <ArrowRight className="h-4 w-4 text-bigster-text-muted" />
                                <span className={`text-xs font-semibold uppercase ${ALL_STATUS_ACTIONS.find((a) => a.status === selectedStatus)?.color || "text-bigster-text"
                                    }`}>
                                    {STATUS_LABELS[selectedStatus] || selectedStatus}
                                </span>
                            </div>
                        )}

                        
                        {selectedStatus && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-bigster-text">
                                    Note (opzionale)
                                </label>
                                <textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="Aggiungi una nota sul cambio di stato..."
                                    rows={3}
                                    className={inputBase}
                                />
                            </div>
                        )}

                        
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                onClick={handleStatusChange}
                                disabled={!selectedStatus || isChangingStatus}
                                className={`flex-1 rounded-none border font-semibold disabled:opacity-50 ${isSelectingAssunto
                                    ? "bg-green-600 text-white border-green-700 hover:bg-green-700"
                                    : "bg-bigster-primary text-bigster-primary-text border-yellow-200 hover:opacity-90"
                                    }`}
                            >
                                {isChangingStatus ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : isSelectingAssunto ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                    <UserCheck className="h-4 w-4 mr-2" />
                                )}
                                {isChangingStatus
                                    ? "Salvataggio..."
                                    : isSelectingAssunto
                                        ? "Conferma Assunzione"
                                        : "Conferma"}
                            </Button>

                            <Button
                                onClick={handleCloseDialog}
                                variant="outline"
                                disabled={isChangingStatus}
                                className="flex-1 rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                            >
                                Annulla
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
