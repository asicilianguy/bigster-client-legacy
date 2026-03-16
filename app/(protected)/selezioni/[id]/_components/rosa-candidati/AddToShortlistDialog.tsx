"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Star, Save } from "lucide-react";
import { useAddToShortlistMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { ApplicationListItem } from "@/types/application";
import { toast } from "sonner";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface AddToShortlistDialogProps {
    application: ApplicationListItem;
    selectionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentCount: number;
}

export function AddToShortlistDialog({
    application,
    selectionId,
    open,
    onOpenChange,
    currentCount,
}: AddToShortlistDialogProps) {
    const [note, setNote] = useState("");
    const [addToShortlist, { isLoading }] = useAddToShortlistMutation();

    const fullName = `${application.nome} ${application.cognome}`;
    const nextOrdine = currentCount + 1;

    const handleSubmit = async () => {
        try {
            await addToShortlist({
                selectionId,
                body: {
                    application_id: application.id,
                    ordine: nextOrdine,
                    note: note.trim() || null,
                },
            }).unwrap();

            toast.success("Aggiunto alla rosa", {
                description: `${fullName} è stato aggiunto alla rosa candidati in posizione ${nextOrdine}`,
            });

            setNote("");
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile aggiungere alla rosa candidati",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
                <DialogHeader title="Aggiungi alla Rosa Candidati" onClose={() => onOpenChange(false)} />

                <div className="space-y-5 p-5 pt-0">

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-bigster-primary text-bigster-primary-text font-bold border border-yellow-200">
                                {nextOrdine}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-bigster-text">{fullName}</p>
                                <p className="text-xs text-bigster-text-muted">{application.email}</p>
                            </div>
                            <Star className="h-5 w-5 text-bigster-star ml-auto" />
                        </div>
                    </div>

                    <p className="text-sm text-bigster-text-muted">
                        Il candidato verrà aggiunto in <span className="font-semibold">posizione {nextOrdine}</span> nella rosa
                        candidati.
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-bigster-text">Note (opzionale)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Aggiungi note sul candidato..."
                            rows={3}
                            className={inputBase}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
                        >
                            {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Aggiungi alla Rosa
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

export default AddToShortlistDialog;
