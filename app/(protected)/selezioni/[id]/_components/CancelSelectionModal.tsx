"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { XCircle, AlertCircle } from "lucide-react";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { useChangeSelectionStatusMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useNotify } from "@/hooks/use-notify";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface CancelSelectionModalProps {
    selection: SelectionDetail;
    isOpen: boolean;
    onClose: () => void;
}

export function CancelSelectionModal({
    selection,
    isOpen,
    onClose,
}: CancelSelectionModalProps) {
    const notify = useNotify();
    const [note, setNote] = useState("");
    const [confirmText, setConfirmText] = useState("");

    const [changeStatus, { isLoading }] = useChangeSelectionStatusMutation();

    const canConfirm = confirmText.toLowerCase() === "annulla";

    const handleSubmit = async () => {
        if (!canConfirm) return;

        try {
            await changeStatus({
                id: selection.id,
                body: {
                    nuovo_stato: SelectionStatus.ANNULLATA,
                    note: note.trim() || `Selezione annullata manualmente`,
                },
            }).unwrap();

            notify.success(
                "Selezione Annullata",
                `La selezione "${selection.titolo}" è stata annullata con successo`
            );
            onClose();
        } catch (error: any) {
            const errorMessage =
                error?.data?.error || "Errore nell'annullamento della selezione";
            notify.error("Errore", errorMessage);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-lg shadow-lg">
                <DialogHeader
                    title="Annulla Selezione"
                    onClose={() => onClose()}
                />

                <div className="space-y-5 p-5 pt-0">

                    <p className="text-sm text-bigster-text-muted">
                        {selection.titolo} • Selezione #{selection.id}
                    </p>

                    <div className="p-4 bg-red-50 border-2 border-red-200">
                        <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-red-800 mb-1">
                                    Azione Irreversibile
                                </p>
                                <p className="text-xs text-red-700 leading-relaxed">
                                    Stai per annullare questa selezione in modo permanente.
                                    Lo stato passerà ad &quot;Annullata&quot; e non sarà più possibile
                                    ripristinarla. Tutte le candidature associate rimarranno
                                    invariate ma la selezione non sarà più attiva.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-2">
                            Stato Attuale
                        </p>
                        <p className="text-sm font-semibold text-bigster-text">
                            {selection.stato?.replace(/_/g, " ")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-bigster-text">
                            Motivo Annullamento (opzionale)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Inserisci il motivo dell'annullamento..."
                            rows={3}
                            className={inputBase}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-bigster-text">
                            Digita <span className="text-red-600 font-bold">annulla</span> per
                            confermare
                        </label>
                        <input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder='Scrivi "annulla" per confermare...'
                            className={`${inputBase} ${confirmText.length > 0 && !canConfirm
                                    ? "border-red-400"
                                    : confirmText.length > 0 && canConfirm
                                        ? "border-green-400"
                                        : ""
                                }`}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!canConfirm || isLoading}
                            className="flex-1 rounded-none border-2 border-red-400 font-semibold hover:opacity-90 disabled:opacity-50"
                            style={{
                                backgroundColor: canConfirm ? "#dc2626" : undefined,
                                color: canConfirm ? "#ffffff" : undefined,
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner className="h-4 w-4 mr-2" />
                                    Annullamento in corso...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Annulla Selezione
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={onClose}
                            variant="outline"
                            disabled={isLoading}
                            className="flex-1 rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            Indietro
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
