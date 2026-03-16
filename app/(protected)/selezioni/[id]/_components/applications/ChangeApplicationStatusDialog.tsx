"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  AlertCircle,
  Save,
} from "lucide-react";
import { ApplicationWithDetails } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useChangeApplicationStatusMutation } from "@/lib/redux/features/applications/applicationsApiSlice";
import { ApplicationStatus } from "@/types/application";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { toast } from "sonner";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface ChangeApplicationStatusDialogProps {
  application: ApplicationWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StatusOption {
  value: ApplicationStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const statusOptions: StatusOption[] = [
  {
    value: ApplicationStatus.IN_CORSO,
    label: "In Corso",
    description: "La candidatura è attiva e in valutazione",
    icon: Clock,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },

  {
    value: ApplicationStatus.IN_PROVA,
    label: "In Prova",
    description: "Il candidato è in periodo di prova in azienda (6 mesi)",
    icon: Clock,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    value: ApplicationStatus.ASSUNTO,
    label: "Assunto",
    description: "Il candidato è stato assunto",
    icon: CheckCircle2,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: ApplicationStatus.SCARTATO,
    label: "Scartato",
    description: "La candidatura è stata rifiutata",
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    value: ApplicationStatus.RITIRATO,
    label: "Ritirato",
    description: "Il candidato si è ritirato dalla selezione",
    icon: UserX,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
];

export function ChangeApplicationStatusDialog({
  application,
  open,
  onOpenChange,
}: ChangeApplicationStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    application.stato
  );
  const [note, setNote] = useState(application.note || "");

  const [changeStatus, { isLoading }] = useChangeApplicationStatusMutation();

  useEffect(() => {
    if (open) {
      setSelectedStatus(application.stato);
      setNote(application.note || "");
    }
  }, [open, application]);

  const fullName = `${application.nome} ${application.cognome}`;
  const hasChanges =
    selectedStatus !== application.stato || note !== (application.note || "");

  const handleSubmit = async () => {
    try {
      await changeStatus({
        id: application.id,
        data: {
          stato: selectedStatus,
          note: note.trim() || undefined,
          data_chiusura:
            selectedStatus !== ApplicationStatus.IN_CORSO
              ? new Date().toISOString()
              : undefined,
        },
      }).unwrap();

      toast.success("Stato aggiornato", {
        description: `La candidatura di ${fullName} è ora "${statusOptions.find((s) => s.value === selectedStatus)?.label}"`,
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("Errore", {
        description: "Impossibile aggiornare lo stato della candidatura",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-lg shadow-lg">
        <DialogHeader
          title="Cambia Stato Candidatura"
          onClose={() => onOpenChange(false)}
        />

        <div className="space-y-5 p-5 pt-0">

          <p className="text-sm text-bigster-text-muted">
            {fullName} • Candidatura #{application.id}
          </p>

          <div className="p-4 bg-bigster-card-bg border border-bigster-border">
            <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-2">
              Stato Attuale
            </p>
            <ApplicationStatusBadge status={application.stato} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-bigster-text">
              Seleziona Nuovo Stato
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                const isCurrent = application.stato === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    disabled={isCurrent}
                    className={`
                      p-3 text-left border-2 transition-all
                      ${isSelected
                        ? `${option.bgColor} ${option.borderColor}`
                        : "bg-bigster-surface border-bigster-border hover:bg-bigster-muted-bg"
                      }
                      ${isCurrent ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={`h-4 w-4 ${isSelected ? option.color : "text-bigster-text-muted"}`}
                      />
                      <span
                        className={`text-sm font-semibold ${isSelected ? option.color : "text-bigster-text"}`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-bigster-text-muted">
                      {option.description}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-bigster-text-muted mt-1 italic">
                        (stato attuale)
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Note (opzionale)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Aggiungi note sulla candidatura..."
              rows={3}
              className={inputBase}
            />
          </div>

          {selectedStatus !== ApplicationStatus.IN_CORSO &&
            selectedStatus !== application.stato && (
              <div className="p-4 bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-800 mb-1">
                      Attenzione
                    </p>
                    <p className="text-xs text-yellow-700">
                      Cambiando lo stato a "
                      {statusOptions.find((s) => s.value === selectedStatus)?.label}
                      " la candidatura verrà considerata chiusa con data odierna.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || isLoading}
              className="flex-1 rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salva Modifiche
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
