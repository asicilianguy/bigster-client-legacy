"use client";

import { useState } from "react";
import { useAssignHrMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetUsersByRoleQuery } from "@/lib/redux/features/users/usersApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus, CheckCircle2, FileText } from "lucide-react";
import { useNotify } from "@/hooks/use-notify";
import { UserRole } from "@/types/user";
import { StandardSelect } from "@/components/ui/StandardSelect";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface AssignHRModalProps {
  selectionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignHRModal({
  selectionId,
  isOpen,
  onClose,
}: AssignHRModalProps) {
  const notify = useNotify();
  const [selectedHrId, setSelectedHrId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { data: hrUsers, isLoading: isLoadingHrUsers } = useGetUsersByRoleQuery(
    UserRole.RISORSA_UMANA
  );
  const [assignHr, { isLoading: isAssigning }] = useAssignHrMutation();

  const handleSubmit = async () => {
    if (!selectedHrId) {
      notify.error("Errore", "Seleziona una risorsa umana");
      return;
    }
    try {
      await assignHr({
        id: selectionId,
        body: {
          risorsa_umana_id: parseInt(selectedHrId),
          note: note.trim() || undefined,
        },
      }).unwrap();

      notify.success(
        "Risorsa Umana Assegnata",
        "La risorsa umana è stata assegnata con successo e notificata via email"
      );
      onClose();

      setSelectedHrId("");
      setNote("");
    } catch (error) {
      notify.error(
        "Errore",
        "Si è verificato un errore durante l'assegnazione della risorsa umana"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md">
        <DialogHeader title="Assegna Risorsa Umana" onClose={onClose} />

        <div className="p-5 space-y-5">
          {isLoadingHrUsers ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>

              <StandardSelect
                label="Seleziona Risorsa Umana *"
                value={selectedHrId}
                onChange={(value) => setSelectedHrId(value)}
                options={(hrUsers || []).map((hr) => ({
                  value: String(hr.id),
                  label: `${hr.nome} ${hr.cognome} (${hr.email})`,
                }))}
                emptyLabel="-- Seleziona una risorsa --"
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Note per la HR (opzionale)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Es: Il cliente è molto esigente sulla puntualità. Richiesta esperienza pregressa di almeno 1 anno..."
                  className={inputBase}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-bigster-text-muted">
                  {note.length}/500 caratteri
                  {note.trim() &&
                    " • Queste note verranno incluse nell'email di notifica"}
                </p>
              </div>

              <div className="p-4 border border-blue-200 bg-blue-50">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Nota:</strong> Assegnando una risorsa umana, lo stato
                  della selezione passerà automaticamente a "HR Assegnata" e
                  verrà inviata un'email di notifica alla risorsa selezionata
                  {note.trim() && " con le tue note incluse"}.
                </p>
              </div>


              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedHrId || isAssigning}
                  className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
                >
                  {isAssigning ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Assegnazione...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Conferma Assegnazione
                    </>
                  )}
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isAssigning}
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
