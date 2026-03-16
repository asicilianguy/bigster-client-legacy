"use client";

import { useState } from "react";
import {
  UserPlus,
  ArrowRight,
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
  Zap,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { useUserRole } from "@/hooks/use-user-role";
import { AssignHRModal } from "./AssignHRModal";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { CloseSelectionModal } from "./CloseSelectionModal";
import { CancelSelectionModal } from "./CancelSelectionModal";
import { motion } from "framer-motion";
import { PutOnTrialModal } from "./PutOnTrialModal";

interface SelectionActionsPanelProps {
  selection: SelectionDetail;
}

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ElementType;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  delay?: number;
}

function ActionCard({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  onClick,
  variant = "secondary",
  delay = 0,
}: ActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-bigster-card-bg border border-bigster-border p-5 hover:border-bigster-text transition-colors"
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 flex items-center justify-center border-2 flex-shrink-0 ${variant === "primary"
            ? "bg-bigster-primary border-yellow-200"
            : variant === "danger"
              ? "bg-red-50 border-red-200"
              : variant === "success"
                ? "bg-green-50 border-green-200"
                : "bg-bigster-surface border-bigster-border"
            }`}
        >
          <Icon
            className={`h-6 w-6 ${variant === "primary"
              ? "text-bigster-primary-text"
              : variant === "danger"
                ? "text-red-600"
                : variant === "success"
                  ? "text-green-600"
                  : "text-bigster-text"
              }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-bigster-text mb-1">
            {title}
          </h3>
          <p className="text-xs text-bigster-text-muted leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <Button
        onClick={onClick}
        className={`w-full rounded-none border font-semibold ${variant === "primary"
          ? "bg-bigster-primary text-bigster-primary-text border-yellow-200 hover:opacity-90"
          : variant === "danger"
            ? "border-red-400 text-red-600 hover:bg-red-50 bg-bigster-surface"
            : variant === "success"
              ? "border-green-400 text-green-700 hover:bg-green-50 bg-bigster-surface"
              : "border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
          }`}
      >
        <ButtonIcon className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </motion.div>
  );
}

export function SelectionActionsPanel({
  selection,
}: SelectionActionsPanelProps) {
  const { canAssignHR, canChangeSelectionStatus, hasHighAccess } =
    useUserRole();
  const [showAssignHRModal, setShowAssignHRModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [showCloseSelectionModal, setShowCloseSelectionModal] = useState(false);
  const [showCancelSelectionModal, setShowCancelSelectionModal] = useState(false);
  const [showPutOnTrialModal, setShowPutOnTrialModal] = useState(false);

  const availableActions = getAvailableActions(selection, {
    canAssignHR,
    canChangeSelectionStatus,
    hasHighAccess,
  });

  const getNoActionsMessage = () => {
    if (selection.stato === SelectionStatus.CHIUSA) {
      return "Questa selezione è stata chiusa con successo. Non sono disponibili ulteriori azioni.";
    }
    if (selection.stato === SelectionStatus.ANNULLATA) {
      return "Questa selezione è stata annullata. Non sono disponibili ulteriori azioni.";
    }
    if (
      selection.stato === SelectionStatus.FATTURA_AV_SALDATA &&
      selection.risorsa_umana_id
    ) {
      return "La risorsa umana è già stata assegnata. Attendi che l'HR completi le fasi successive.";
    }
    if (!canAssignHR && !canChangeSelectionStatus && !hasHighAccess) {
      return "Non hai i permessi necessari per eseguire azioni su questa selezione.";
    }
    return "Al momento non ci sono azioni disponibili per questa selezione.";
  };

  return (
    <>
      <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-bigster-text" />
            <div>
              <h2 className="text-lg font-bold text-bigster-text">
                Azioni Disponibili
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {availableActions.length > 0
                  ? `${availableActions.length} ${availableActions.length === 1
                    ? "azione disponibile"
                    : "azioni disponibili"
                  }`
                  : "Nessuna azione disponibile"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {availableActions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-bigster-muted-bg border border-bigster-border"
            >
              {selection.stato === SelectionStatus.CHIUSA ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-bigster-text mb-1">
                    Selezione Completata
                  </p>
                </>
              ) : selection.stato === SelectionStatus.ANNULLATA ? (
                <>
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-bigster-text mb-1">
                    Selezione Annullata
                  </p>
                </>
              ) : (
                <>
                  <Shield className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-bigster-text mb-1">
                    Nessuna Azione Disponibile
                  </p>
                </>
              )}
              <p className="text-xs text-bigster-text-muted max-w-md mx-auto">
                {getNoActionsMessage()}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {availableActions.includes("ASSIGN_HR") && (
                <ActionCard
                  icon={UserPlus}
                  title="Assegna Risorsa Umana"
                  description="Assegna una risorsa umana alla selezione per iniziare il processo di recruiting"
                  buttonText="Assegna HR"
                  buttonIcon={UserPlus}
                  onClick={() => setShowAssignHRModal(true)}
                  variant="secondary"
                  delay={0.1}
                />
              )}

              {availableActions.includes("CHANGE_STATUS") && (
                <ActionCard
                  icon={ArrowRight}
                  title="Avanza Stato"
                  description="Fai avanzare la selezione alla fase successiva del processo"
                  buttonText="Cambia Stato"
                  buttonIcon={ArrowRight}
                  onClick={() => setShowChangeStatusModal(true)}
                  variant="primary"
                  delay={0.2}
                />
              )}

              {availableActions.includes("CLOSE_WITH_SUCCESS") && (
                <ActionCard
                  icon={Trophy}
                  title="Chiudi con Successo"
                  description="Chiudi la selezione scegliendo il candidato assunto. Questa azione è definitiva"
                  buttonText="Chiudi e Assumi"
                  buttonIcon={Trophy}
                  onClick={() => setShowCloseSelectionModal(true)}
                  variant="success"
                  delay={0.3}
                />
              )}

              {availableActions.includes("PUT_ON_TRIAL") && (
                <ActionCard
                  icon={UserPlus}
                  title="Candidato in Prova"
                  description="Seleziona un candidato da inserire in azienda per il periodo di prova di 6 mesi"
                  buttonText="Metti in Prova"
                  buttonIcon={UserPlus}
                  onClick={() => setShowPutOnTrialModal(true)}
                  variant="primary"
                  delay={0.3}
                />
              )}

              {availableActions.includes("CANCEL") && (
                <ActionCard
                  icon={XCircle}
                  title="Annulla Selezione"
                  description="Annulla questa selezione in modo permanente. Questa azione non può essere annullata"
                  buttonText="Annulla"
                  buttonIcon={XCircle}
                  onClick={() => setShowCancelSelectionModal(true)}
                  variant="danger"
                  delay={0.4}
                />
              )}
            </div>
          )}

          {availableActions.length > 0 &&
            (!canChangeSelectionStatus || !hasHighAccess) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-bigster-card-bg border border-bigster-border"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-bigster-text mb-1">
                      Permessi Limitati
                    </p>
                    <p className="text-xs text-bigster-text-muted leading-relaxed">
                      Alcune azioni potrebbero non essere visibili in base ai
                      tuoi permessi. Contatta un amministratore se hai bisogno
                      di accesso ad altre funzionalità.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          {availableActions.length === 0 &&
            selection.stato !== SelectionStatus.CHIUSA &&
            selection.stato !== SelectionStatus.ANNULLATA &&
            selection.risorsa_umana_id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-4 border-2 border-green-200 bg-green-50"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800 mb-1">
                      Selezione in Corso
                    </p>
                    <p className="text-xs text-green-700 leading-relaxed">
                      La selezione sta procedendo normalmente. La risorsa umana
                      assegnata ({selection.risorsa_umana?.nome}{" "}
                      {selection.risorsa_umana?.cognome}) sta gestendo le fasi
                      successive del processo.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
        </div>
      </div>

      {showAssignHRModal && (
        <AssignHRModal
          selectionId={selection.id}
          isOpen={showAssignHRModal}
          onClose={() => setShowAssignHRModal(false)}
        />
      )}

      {showPutOnTrialModal && (
        <PutOnTrialModal
          selection={selection}
          isOpen={showPutOnTrialModal}
          onClose={() => setShowPutOnTrialModal(false)}
        />
      )}

      {showChangeStatusModal && (
        <ChangeStatusModal
          selection={selection}
          isOpen={showChangeStatusModal}
          onClose={() => setShowChangeStatusModal(false)}
        />
      )}

      {showCloseSelectionModal && (
        <CloseSelectionModal
          selection={selection}
          isOpen={showCloseSelectionModal}
          onClose={() => setShowCloseSelectionModal(false)}
        />
      )}

      {showCancelSelectionModal && (
        <CancelSelectionModal
          selection={selection}
          isOpen={showCancelSelectionModal}
          onClose={() => setShowCancelSelectionModal(false)}
        />
      )}
    </>
  );
}

function getAvailableActions(
  selection: SelectionDetail,
  permissions: {
    canAssignHR: boolean;
    canChangeSelectionStatus: boolean;
    hasHighAccess: boolean;
  }
): string[] {
  const actions: string[] = [];

  if (
    permissions.canAssignHR &&
    selection.stato === SelectionStatus.FATTURA_AV_SALDATA &&
    !selection.risorsa_umana_id
  ) {
    actions.push("ASSIGN_HR");
  }

  if (
    permissions.canChangeSelectionStatus &&
    ![
      SelectionStatus.FATTURA_AV_SALDATA,
      SelectionStatus.CHIUSA,
      SelectionStatus.ANNULLATA,
    ].includes(selection.stato as SelectionStatus)
  ) {
    actions.push("CHANGE_STATUS");
  }

  if (
    permissions.canChangeSelectionStatus &&
    selection.stato === SelectionStatus.CANDIDATO_IN_PROVA
  ) {
    actions.push("CLOSE_WITH_SUCCESS");
  }

  if (
    permissions.canChangeSelectionStatus &&
    [
      SelectionStatus.ANNUNCIO_PUBBLICATO,
      SelectionStatus.CANDIDATURE_RICEVUTE,
      SelectionStatus.COLLOQUI_IN_CORSO,
      SelectionStatus.SELEZIONI_IN_SOSTITUZIONE,
    ].includes(selection.stato as SelectionStatus)
  ) {
    actions.push("PUT_ON_TRIAL");
  }

  if (
    permissions.hasHighAccess &&
    ![
      SelectionStatus.CHIUSA,
      SelectionStatus.ANNULLATA,
    ].includes(selection.stato as SelectionStatus)
  ) {
    actions.push("CANCEL");
  }

  return actions;
}
