"use client";

import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    CheckCircle2,
    Search,
    Star,
    User,
    AlertCircle,
    Clock,
} from "lucide-react";
import { SelectionDetail } from "@/types/selection";
import { usePutCandidateOnTrialMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetApplicationsBySelectionIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useNotify } from "@/hooks/use-notify";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface PutOnTrialModalProps {
    selection: SelectionDetail;
    isOpen: boolean;
    onClose: () => void;
}

export function PutOnTrialModal({
    selection,
    isOpen,
    onClose,
}: PutOnTrialModalProps) {
    const notify = useNotify();
    const [selectedApplicationId, setSelectedApplicationId] = useState<
        number | null
    >(null);
    const [note, setNote] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllCandidates, setShowAllCandidates] = useState(false);

    const [putOnTrial, { isLoading }] =
        usePutCandidateOnTrialMutation();

    const {
        data: applications = [],
        isLoading: isLoadingApplications,
    } = useGetApplicationsBySelectionIdQuery(selection.id, {
        skip: !isOpen,
    });

    const shortlistedIds = useMemo(() => {
        return new Set(
            (selection.rosa_candidati || []).map((s) => s.application_id)
        );
    }, [selection.rosa_candidati]);

    const shortlistOrderMap = useMemo(() => {
        const map = new Map<number, number>();
        (selection.rosa_candidati || []).forEach((s) => {
            map.set(s.application_id, s.ordine);
        });
        return map;
    }, [selection.rosa_candidati]);

    const eligibleApplications = useMemo(() => {
        return applications.filter(
            (app) => app.stato === "IN_CORSO"
        );
    }, [applications]);

    const shortlistedApplications = useMemo(() => {
        return eligibleApplications
            .filter((app) => shortlistedIds.has(app.id))
            .sort((a, b) => {
                const orderA = shortlistOrderMap.get(a.id) ?? 999;
                const orderB = shortlistOrderMap.get(b.id) ?? 999;
                return orderA - orderB;
            });
    }, [eligibleApplications, shortlistedIds, shortlistOrderMap]);

    const otherApplications = useMemo(() => {
        return eligibleApplications.filter((app) => !shortlistedIds.has(app.id));
    }, [eligibleApplications, shortlistedIds]);

    const filterBySearch = (apps: typeof eligibleApplications) => {
        if (!searchQuery.trim()) return apps;
        const q = searchQuery.toLowerCase().trim();
        return apps.filter(
            (app) =>
                app.nome.toLowerCase().includes(q) ||
                app.cognome.toLowerCase().includes(q) ||
                app.email.toLowerCase().includes(q)
        );
    };

    const filteredShortlisted = filterBySearch(shortlistedApplications);
    const filteredOther = filterBySearch(otherApplications);

    const selectedApplication = useMemo(() => {
        if (!selectedApplicationId) return null;
        return applications.find((app) => app.id === selectedApplicationId) || null;
    }, [selectedApplicationId, applications]);

    const handleSubmit = async () => {
        if (!selectedApplicationId) {
            notify.error("Errore", "Seleziona un candidato da mettere in prova");
            return;
        }

        try {
            await putOnTrial({
                id: selection.id,
                body: {
                    application_id: selectedApplicationId,
                    note: note.trim() || undefined,
                },
            }).unwrap();

            notify.success(
                "Candidato in Prova",
                `${selectedApplication?.nome} ${selectedApplication?.cognome} è stato messo in prova con successo`
            );
            onClose();
        } catch (error: any) {
            const errorMessage =
                error?.data?.error || "Errore nel mettere il candidato in prova";
            notify.error("Errore", errorMessage);
        }
    };

    const hasShortlistedCandidates = shortlistedApplications.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader
                    title="Metti Candidato in Prova"
                    onClose={onClose}
                />

                <div className="space-y-5 p-5 pt-0 overflow-y-auto flex-1">

                    <p className="text-sm text-bigster-text-muted">
                        Seleziona il candidato da inserire in prova per &quot;{selection.titolo}&quot;
                    </p>

                    <div className="p-4 bg-orange-50 border border-orange-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-orange-800 mb-1">
                                    Periodo di Prova
                                </p>
                                <p className="text-xs text-orange-700">
                                    Il candidato selezionato verrà inserito in azienda per un periodo di prova di 6 mesi.
                                    La selezione passerà allo stato &quot;Candidato in Prova&quot;.
                                    Durante questo periodo sarà possibile chiudere con successo o mettere la selezione in sostituzione.
                                </p>
                            </div>
                        </div>
                    </div>

                    {isLoadingApplications ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner className="h-6 w-6 mr-2" />
                            <span className="text-sm text-bigster-text-muted">
                                Caricamento candidati...
                            </span>
                        </div>
                    ) : eligibleApplications.length === 0 ? (
                        <div className="text-center py-8 bg-bigster-muted-bg border border-bigster-border">
                            <User className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                            <p className="text-sm font-medium text-bigster-text-muted mb-1">
                                Nessun Candidato Disponibile
                            </p>
                            <p className="text-xs text-bigster-text-muted">
                                Non ci sono candidature in corso per questa selezione
                            </p>
                        </div>
                    ) : (
                        <>

                            {eligibleApplications.length > 3 && (
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-bigster-text-muted" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cerca candidato per nome, cognome o email..."
                                        className={`${inputBase} pl-10`}
                                    />
                                </div>
                            )}

                            {hasShortlistedCandidates && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-bigster-star" />
                                        <p className="text-sm font-semibold text-bigster-text">
                                            Rosa Candidati ({filteredShortlisted.length})
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        {filteredShortlisted.map((app) => (
                                            <CandidateRow
                                                key={app.id}
                                                application={app}
                                                isSelected={selectedApplicationId === app.id}
                                                isShortlisted={true}
                                                shortlistOrder={shortlistOrderMap.get(app.id)}
                                                onSelect={() => setSelectedApplicationId(app.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hasShortlistedCandidates && otherApplications.length > 0 && (
                                <button
                                    onClick={() => setShowAllCandidates(!showAllCandidates)}
                                    className="text-xs font-semibold text-bigster-text-muted hover:text-bigster-text transition-colors"
                                >
                                    {showAllCandidates
                                        ? "▼ Nascondi altri candidati"
                                        : `▶ Mostra altri ${otherApplications.length} candidati`}
                                </button>
                            )}

                            {(!hasShortlistedCandidates || showAllCandidates) && (
                                <div className="space-y-2">
                                    {!hasShortlistedCandidates && (
                                        <p className="text-sm font-semibold text-bigster-text">
                                            Candidati Disponibili ({filteredOther.length + filteredShortlisted.length})
                                        </p>
                                    )}
                                    <div className="space-y-1 max-h-[250px] overflow-y-auto">
                                        {(hasShortlistedCandidates ? filteredOther : [...filteredShortlisted, ...filteredOther]).map(
                                            (app) => (
                                                <CandidateRow
                                                    key={app.id}
                                                    application={app}
                                                    isSelected={selectedApplicationId === app.id}
                                                    isShortlisted={shortlistedIds.has(app.id)}
                                                    shortlistOrder={shortlistOrderMap.get(app.id)}
                                                    onSelect={() => setSelectedApplicationId(app.id)}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedApplication && (
                                <div className="p-4 bg-orange-50 border-2 border-orange-300">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-orange-800">
                                                {selectedApplication.nome} {selectedApplication.cognome}
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                Verrà inserito in prova per 6 mesi
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-bigster-text">
                                    Note (opzionale)
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Aggiungi eventuali note sull'inserimento in prova..."
                                    rows={3}
                                    className={inputBase}
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedApplicationId || isLoading}
                                    className="flex-1 rounded-none border font-semibold"
                                    style={{
                                        backgroundColor: selectedApplicationId ? "#ea580c" : undefined,
                                        borderColor: selectedApplicationId ? "#c2410c" : undefined,
                                        color: selectedApplicationId ? "#ffffff" : undefined,
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner className="h-4 w-4 mr-2" />
                                            Inserimento in corso...
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Conferma Inserimento in Prova
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    disabled={isLoading}
                                    className="flex-1 rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                                >
                                    Annulla
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface CandidateRowProps {
    application: {
        id: number;
        nome: string;
        cognome: string;
        email: string;
        telefono?: string | null;
        stato: string;
    };
    isSelected: boolean;
    isShortlisted: boolean;
    shortlistOrder?: number;
    onSelect: () => void;
}

function CandidateRow({
    application,
    isSelected,
    isShortlisted,
    shortlistOrder,
    onSelect,
}: CandidateRowProps) {
    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-3 border transition-colors flex items-center gap-3 ${isSelected
                    ? "bg-orange-50 border-2 border-orange-400"
                    : "bg-bigster-surface border-bigster-border hover:bg-bigster-muted-bg hover:border-bigster-text"
                }`}
        >

            <div
                className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                        ? "border-orange-500 bg-orange-500"
                        : "border-bigster-border bg-bigster-surface"
                    }`}
            >
                {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-bigster-text truncate">
                        {application.nome} {application.cognome}
                    </p>
                    {isShortlisted && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-50 border border-yellow-200 text-[10px] font-bold text-yellow-700">
                            <Star className="h-2.5 w-2.5" />
                            #{shortlistOrder ?? "-"}
                        </span>
                    )}
                </div>
                <p className="text-xs text-bigster-text-muted truncate">
                    {application.email}
                    {application.telefono && ` · ${application.telefono}`}
                </p>
            </div>
        </button>
    );
}
