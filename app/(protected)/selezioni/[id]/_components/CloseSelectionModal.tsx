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
    Trophy,
} from "lucide-react";
import { SelectionDetail } from "@/types/selection";
import { useCloseSelectionWithSuccessMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetApplicationsBySelectionIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useNotify } from "@/hooks/use-notify";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface CloseSelectionModalProps {
    selection: SelectionDetail;
    isOpen: boolean;
    onClose: () => void;
}

export function CloseSelectionModal({
    selection,
    isOpen,
    onClose,
}: CloseSelectionModalProps) {
    const notify = useNotify();
    const [selectedApplicationId, setSelectedApplicationId] = useState<
        number | null
    >(null);
    const [note, setNote] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllCandidates, setShowAllCandidates] = useState(false);

    const [closeSelection, { isLoading }] =
        useCloseSelectionWithSuccessMutation();

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
            (app) => app.stato === "IN_CORSO" || app.stato === "IN_PROVA"
        );
    }, [applications]);

    const trialApplications = useMemo(() => {
        return eligibleApplications.filter((app) => app.stato === "IN_PROVA");
    }, [eligibleApplications]);

    const otherEligibleApplications = useMemo(() => {
        return eligibleApplications.filter((app) => app.stato === "IN_CORSO");
    }, [eligibleApplications]);

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
            notify.error("Errore", "Seleziona un candidato da assumere");
            return;
        }

        try {
            await closeSelection({
                id: selection.id,
                body: {
                    application_id: selectedApplicationId,
                    note: note.trim() || undefined,
                },
            }).unwrap();

            notify.success(
                "Selezione Chiusa",
                `${selectedApplication?.nome} ${selectedApplication?.cognome} è stato assunto con successo`
            );
            onClose();
        } catch (error: any) {
            const errorMessage =
                error?.data?.error || "Errore nella chiusura della selezione";
            notify.error("Errore", errorMessage);
        }
    };

    const hasShortlistedCandidates = shortlistedApplications.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader
                    title="Chiudi Selezione con Successo"
                    onClose={onClose}
                />

                <div className="space-y-5 p-5 pt-0 overflow-y-auto flex-1">

                    <p className="text-sm text-bigster-text-muted">
                        Seleziona il candidato assunto per &quot;{selection.titolo}&quot;
                    </p>
                    {isLoadingApplications ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="h-6 w-6 text-bigster-text-muted" />
                            <span className="ml-3 text-sm text-bigster-text-muted">
                                Caricamento candidature...
                            </span>
                        </div>
                    ) : eligibleApplications.length === 0 ? (
                        <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
                            <AlertCircle className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                            <p className="text-sm font-medium text-bigster-text mb-1">
                                Nessun Candidato Disponibile
                            </p>
                            <p className="text-xs text-bigster-text-muted max-w-sm mx-auto">
                                Non ci sono candidature attive (in corso) per questa selezione.
                                Verifica che ci siano candidature con stato &quot;In Corso&quot;.
                            </p>
                        </div>
                    ) : (
                        <>

                            <div className="p-4 bg-green-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-green-800 mb-1">
                                            Chiusura Definitiva
                                        </p>
                                        <p className="text-xs text-green-700 leading-relaxed">
                                            Questa azione chiuderà la selezione e segnerà il candidato
                                            selezionato come &quot;Assunto&quot;. Lo stato della selezione passerà
                                            a &quot;Chiusa&quot;. Questa operazione non può essere annullata.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-bigster-text-muted" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cerca candidato per nome, cognome o email..."
                                    className={`${inputBase} pl-10`}
                                />
                            </div>

                            {hasShortlistedCandidates && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-bigster-star" />
                                        <label className="text-sm font-semibold text-bigster-text">
                                            Rosa Candidati ({filteredShortlisted.length})
                                        </label>
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

                            {otherApplications.length > 0 && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowAllCandidates(!showAllCandidates)}
                                        className="flex items-center gap-2 text-sm font-semibold text-bigster-text hover:text-bigster-primary-text transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        {showAllCandidates
                                            ? "Nascondi altri candidati"
                                            : `Mostra altri candidati (${otherApplications.length})`}
                                    </button>

                                    {showAllCandidates && (
                                        <div className="space-y-1">
                                            {filteredOther.map((app) => (
                                                <CandidateRow
                                                    key={app.id}
                                                    application={app}
                                                    isSelected={selectedApplicationId === app.id}
                                                    isShortlisted={false}
                                                    onSelect={() => setSelectedApplicationId(app.id)}
                                                />
                                            ))}
                                            {filteredOther.length === 0 && searchQuery.trim() && (
                                                <p className="text-xs text-bigster-text-muted py-2 px-4">
                                                    Nessun candidato trovato per &quot;{searchQuery}&quot;
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!hasShortlistedCandidates && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Candidati ({filteredShortlisted.length + filteredOther.length})
                                    </label>
                                    <div className="space-y-1">
                                        {filterBySearch(eligibleApplications).map((app) => (
                                            <CandidateRow
                                                key={app.id}
                                                application={app}
                                                isSelected={selectedApplicationId === app.id}
                                                isShortlisted={false}
                                                onSelect={() => setSelectedApplicationId(app.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedApplication && (
                                <div className="p-4 bg-bigster-card-bg border-2 border-bigster-text">
                                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-2">
                                        Candidato Selezionato
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 flex items-center justify-center bg-green-50 border-2 border-green-200">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-bigster-text">
                                                {selectedApplication.nome} {selectedApplication.cognome}
                                            </p>
                                            <p className="text-xs text-bigster-text-muted">
                                                {selectedApplication.email}
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
                                    placeholder="Aggiungi note sulla chiusura della selezione..."
                                    rows={3}
                                    className={inputBase}
                                />
                            </div>
                        </>
                    )}

                    {eligibleApplications.length > 0 && (
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedApplicationId || isLoading}
                                className="flex-1 rounded-none border-2 border-green-200 font-semibold hover:opacity-90"
                                style={{
                                    backgroundColor: selectedApplicationId ? "#16a34a" : undefined,
                                    color: selectedApplicationId ? "#ffffff" : undefined,
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="h-4 w-4 mr-2" />
                                        Chiusura in corso...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Chiudi Selezione e Assumi
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
                ? "bg-green-50 border-2 border-green-400"
                : "bg-bigster-surface border-bigster-border hover:bg-bigster-muted-bg hover:border-bigster-text"
                }`}
        >

            <div
                className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                    ? "border-green-500 bg-green-500"
                    : "border-bigster-border bg-bigster-surface"
                    }`}
            >
                {isSelected && (
                    <CheckCircle2 className="h-3 w-3 text-white" />
                )}
            </div>

            {isShortlisted && shortlistOrder !== undefined && (
                <div className="w-6 h-6 flex items-center justify-center bg-bigster-primary border border-yellow-200 flex-shrink-0">
                    <span className="text-xs font-bold text-bigster-primary-text">
                        {shortlistOrder}
                    </span>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-bigster-text truncate">
                    {application.nome} {application.cognome}
                </p>
                <p className="text-xs text-bigster-text-muted truncate">
                    {application.email}
                    {application.telefono && ` · ${application.telefono}`}
                </p>
            </div>

            {isShortlisted && (
                <Star className="h-4 w-4 text-bigster-star flex-shrink-0" />
            )}
        </button>
    );
}
