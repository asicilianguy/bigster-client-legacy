"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateApplicationMutation } from "@/lib/redux/features/applications/applicationsApiSlice";
import { Spinner } from "@/components/ui/spinner";
import { StickyNote, Save, X, Edit3 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

interface NotesSectionProps {
    applicationId: number;
    notes?: string | null;
    onRefetch: () => void;
}

export function NotesSection({
    applicationId,
    notes,
    onRefetch,
}: NotesSectionProps) {
    const { isConsulente } = useUserRole();
    const [isEditing, setIsEditing] = useState(false);
    const [editedNotes, setEditedNotes] = useState(notes || "");

    const [updateApplication, { isLoading }] = useUpdateApplicationMutation();

    const handleSave = async () => {
        try {
            await updateApplication({
                id: applicationId,
                data: {
                    note: editedNotes || null,
                },
            }).unwrap();

            setIsEditing(false);
            onRefetch();
        } catch (error) {
            console.error("Errore salvataggio note:", error);
        }
    };

    const handleCancel = () => {
        setEditedNotes(notes || "");
        setIsEditing(false);
    };

    return (
        <div className="bg-bigster-surface border border-bigster-border">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Note Interne
                </h2>

                {!isEditing && !isConsulente && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="rounded-none border border-bigster-border"
                    >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifica
                    </Button>
                )}
            </div>

            <div className="p-6">
                {isEditing && !isConsulente ? (
                    <div className="space-y-4">
                        <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Aggiungi note interne sulla candidatura..."
                            rows={6}
                            className="w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted px-4 py-3 text-sm focus:outline-none focus:border-bigster-text"
                        />

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="rounded-none border border-bigster-border"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Annulla
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                            >
                                {isLoading ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Salva
                            </Button>
                        </div>
                    </div>
                ) : notes ? (
                    <div className="prose prose-sm max-w-none">
                        <p className="text-sm text-bigster-text whitespace-pre-wrap">
                            {notes}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-bigster-text-muted italic">
                        {isConsulente
                            ? "Nessuna nota interna."
                            : 'Nessuna nota inserita. Clicca "Modifica" per aggiungere note interne sulla candidatura.'}
                    </p>
                )}
            </div>
        </div>
    );
}