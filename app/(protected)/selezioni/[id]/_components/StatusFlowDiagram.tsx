"use client";

import {
  CheckCircle2,
  Circle,
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface StatusFlowDiagramProps {
  selection: SelectionDetail;
}

const STATUS_FLOW: Array<{
  status: SelectionStatus;
  label: string;
  shortLabel: string;
  description: string;
}> = [
    {
      status: SelectionStatus.FATTURA_AV_SALDATA,
      label: "Fattura AV Saldata",
      shortLabel: "Fattura",
      description: "Fattura di avvio saldata dal cliente",
    },
    {
      status: SelectionStatus.HR_ASSEGNATA,
      label: "HR Assegnata",
      shortLabel: "HR",
      description: "Risorsa umana assegnata alla selezione",
    },
    {
      status: SelectionStatus.PRIMA_CALL_COMPLETATA,
      label: "Prima Call Completata",
      shortLabel: "Call",
      description: "Prima chiamata con il cliente completata",
    },
    {
      status: SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE,
      label: "Job in Approvazione",
      shortLabel: "Job App.",
      description: "Raccolta job inviata e in attesa di approvazione",
    },
    {
      status: SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
      label: "Job Approvata",
      shortLabel: "Job OK",
      description: "Raccolta job approvata dal cliente",
    },
    {
      status: SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
      label: "Bozza in Approvazione CEO",
      shortLabel: "Bozza",
      description: "Bozza annuncio in attesa di approvazione CEO",
    },
    {
      status: SelectionStatus.ANNUNCIO_APPROVATO,
      label: "Annuncio Approvato",
      shortLabel: "Approvato",
      description: "Annuncio approvato e pronto per pubblicazione",
    },
    {
      status: SelectionStatus.ANNUNCIO_PUBBLICATO,
      label: "Annuncio Pubblicato",
      shortLabel: "Pubblicato",
      description: "Annuncio pubblicato sulle piattaforme",
    },
    {
      status: SelectionStatus.CANDIDATURE_RICEVUTE,
      label: "Candidature Ricevute",
      shortLabel: "Candidature",
      description: "Ricezione candidature in corso",
    },
    {
      status: SelectionStatus.COLLOQUI_IN_CORSO,
      label: "Colloqui in Corso",
      shortLabel: "Colloqui",
      description: "Fase di colloqui con i candidati",
    },
    {
      status: SelectionStatus.CANDIDATO_IN_PROVA,
      label: "Candidato in Prova",
      shortLabel: "Candidato in Prova",
      description: "Candidato messo in prova dal cliente",
    },
    {
      status: SelectionStatus.CHIUSA,
      label: "Chiusa",
      shortLabel: "Completata",
      description: "Selezione completata con successo",
    },
  ];

export function StatusFlowDiagram({ selection }: StatusFlowDiagramProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentStatusIndex = STATUS_FLOW.findIndex(
    (s) => s.status === selection.stato
  );

  const isAnnullata = selection.stato === SelectionStatus.ANNULLATA;
  const isSostituzione =
    selection.stato === SelectionStatus.SELEZIONI_IN_SOSTITUZIONE;
  const totalSteps = STATUS_FLOW.length;
  const completedSteps = currentStatusIndex + 1;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const getStatusDate = (status: SelectionStatus): string | null => {
    const historyItem = selection.storico_stati?.find(
      (h) => h.stato_nuovo === status
    );
    return historyItem?.data_cambio || null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Oggi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;
    return `${Math.floor(diffDays / 365)} anni fa`;
  };

  const currentStatusDate = getStatusDate(selection.stato as SelectionStatus);

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h2 className="text-lg font-bold text-bigster-text">
                Flusso Stato Selezione
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {isSostituzione ? (
                  "Processo di sostituzione in corso"
                ) : isAnnullata ? (
                  "Selezione annullata"
                ) : (
                  <>
                    Step {completedSteps} di {totalSteps} • {progressPercentage}
                    % completato
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {!isExpanded && !isAnnullata && !isSostituzione && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-bigster-text-muted font-medium">
                    Stato Corrente
                  </p>
                  <p className="text-sm font-bold text-bigster-text">
                    {STATUS_FLOW[currentStatusIndex]?.label}
                  </p>
                </div>
                <div className="px-3 py-1 border border-bigster-border bg-bigster-surface">
                  <span className="text-sm font-bold text-bigster-text">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            )}

            {!isExpanded && isAnnullata && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-red-200 bg-red-50">
                <XCircle className="h-3 w-3 text-red-600" />
                <span className="text-xs font-semibold text-red-700">
                  Annullata
                </span>
              </div>
            )}

            {!isExpanded && isSostituzione && (
              <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-orange-200 bg-orange-50">
                <RefreshCw className="h-3 w-3 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700">
                  In Sostituzione
                </span>
              </div>
            )}

            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-bigster-text flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-bigster-text flex-shrink-0" />
            )}
          </div>
        </button>

        {!isExpanded && !isAnnullata && !isSostituzione && (
          <div className="mt-3 h-1 bg-bigster-border overflow-hidden">
            <div
              className="h-full bg-bigster-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {isAnnullata ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-8 bg-red-50 border-2 border-red-200"
                >
                  <XCircle className="h-10 w-10 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-red-800 mb-1">
                      Selezione Annullata
                    </p>
                    <p className="text-sm text-red-600">
                      Questa selezione è stata annullata e non può proseguire
                      nel flusso
                    </p>
                  </div>
                </motion.div>
              ) : isSostituzione ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-8 bg-orange-50 border-2 border-orange-200"
                >
                  <RefreshCw className="h-10 w-10 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-orange-800 mb-1">
                      Selezione in Sostituzione
                    </p>
                    <p className="text-sm text-orange-700 mb-3">
                      Questa selezione è in un processo di sostituzione. Il
                      candidato inizialmente selezionato non è più disponibile e
                      si sta cercando un sostituto.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-orange-100 border border-orange-300">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                      </div>
                      <p className="text-xs text-orange-800 leading-relaxed">
                        Questo stato è speciale e non fa parte del flusso
                        lineare standard. La selezione può tornare a uno stato
                        precedente del processo per trovare un candidato
                        sostitutivo.
                      </p>
                    </div>
                    {currentStatusDate && (
                      <p className="text-xs text-orange-600 mt-3">
                        Aggiornato {getTimeAgo(currentStatusDate)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="relative">

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-bigster-text-muted">
                        Avanzamento Complessivo
                      </span>
                      <span className="text-xs font-bold text-bigster-text">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-bigster-border overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-bigster-primary"
                      />
                    </div>
                  </div>

                  <div className="hidden xl:block">
                    <div className="grid grid-cols-12 gap-2">
                      {STATUS_FLOW.map((step, index) => {
                        const isCompleted = index < currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const statusDate = getStatusDate(step.status);

                        return (
                          <div key={step.status} className="relative">

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex flex-col items-center"
                            >

                              <div
                                className={`w-12 h-12 flex items-center justify-center border-2 transition-all ${isCompleted
                                  ? "bg-bigster-primary border-yellow-200"
                                  : isCurrent
                                    ? "bg-bigster-surface border-bigster-text shadow-md"
                                    : "bg-bigster-muted-bg border-bigster-border"
                                  }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-6 w-6 text-bigster-primary-text" />
                                ) : isCurrent ? (
                                  <Circle className="h-5 w-5 text-bigster-text fill-bigster-text animate-pulse" />
                                ) : (
                                  <Circle className="h-4 w-4 text-bigster-text-muted" />
                                )}
                              </div>

                              <p
                                className={`mt-2 text-[11px] font-bold text-center leading-tight ${isCurrent
                                  ? "text-bigster-text"
                                  : isCompleted
                                    ? "text-bigster-text"
                                    : "text-bigster-text-muted"
                                  }`}
                              >
                                {step.shortLabel}
                              </p>

                              {(isCompleted || isCurrent) && statusDate && (
                                <div className="mt-1 flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5 text-bigster-text-muted" />
                                  <span className="text-[9px] text-bigster-text-muted">
                                    {formatDate(statusDate)}
                                  </span>
                                </div>
                              )}
                            </motion.div>

                            {index < STATUS_FLOW.length - 1 && (
                              <div className="absolute left-[calc(50%+24px)] top-6 w-[calc(100%-24px)] h-0.5">
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: index * 0.05 + 0.1 }}
                                  className={`h-full origin-left ${index < currentStatusIndex
                                    ? "bg-bigster-primary"
                                    : "bg-bigster-border"
                                    }`}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="hidden md:grid xl:hidden grid-cols-6 gap-4">
                    {STATUS_FLOW.map((step, index) => {
                      const isCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const statusDate = getStatusDate(step.status);

                      return (
                        <div key={step.status} className="relative">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`w-11 h-11 flex items-center justify-center border-2 transition-all ${isCompleted
                                ? "bg-bigster-primary border-yellow-200"
                                : isCurrent
                                  ? "bg-bigster-surface border-bigster-text shadow-md"
                                  : "bg-bigster-muted-bg border-bigster-border"
                                }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-bigster-primary-text" />
                              ) : isCurrent ? (
                                <Circle className="h-4 w-4 text-bigster-text fill-bigster-text animate-pulse" />
                              ) : (
                                <Circle className="h-3 w-3 text-bigster-text-muted" />
                              )}
                            </div>

                            <p
                              className={`mt-2 text-[10px] font-bold text-center leading-tight ${isCurrent
                                ? "text-bigster-text"
                                : isCompleted
                                  ? "text-bigster-text"
                                  : "text-bigster-text-muted"
                                }`}
                            >
                              {step.shortLabel}
                            </p>

                            {(isCompleted || isCurrent) && statusDate && (
                              <span className="mt-1 text-[8px] text-bigster-text-muted">
                                {formatDate(statusDate)}
                              </span>
                            )}
                          </motion.div>

                          {index < STATUS_FLOW.length - 1 &&
                            (index + 1) % 6 !== 0 && (
                              <div className="absolute left-[calc(50%+22px)] top-5 w-[calc(100%-22px)] h-0.5">
                                <div
                                  className={`h-full ${index < currentStatusIndex
                                    ? "bg-bigster-primary"
                                    : "bg-bigster-border"
                                    }`}
                                />
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="md:hidden space-y-0">
                    {STATUS_FLOW.map((step, index) => {
                      const isCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const statusDate = getStatusDate(step.status);

                      return (
                        <motion.div
                          key={step.status}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          <div className="flex items-start gap-4 py-3">

                            <div className="relative flex flex-col items-center">
                              <div
                                className={`w-10 h-10 flex items-center justify-center border-2 flex-shrink-0 z-10 ${isCompleted
                                  ? "bg-bigster-primary border-yellow-200"
                                  : isCurrent
                                    ? "bg-bigster-surface border-bigster-text shadow-md"
                                    : "bg-bigster-muted-bg border-bigster-border"
                                  }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-bigster-primary-text" />
                                ) : isCurrent ? (
                                  <Circle className="h-4 w-4 text-bigster-text fill-bigster-text animate-pulse" />
                                ) : (
                                  <Circle className="h-3 w-3 text-bigster-text-muted" />
                                )}
                              </div>

                              {index < STATUS_FLOW.length - 1 && (
                                <div
                                  className={`w-0.5 h-full absolute top-10 ${index < currentStatusIndex
                                    ? "bg-bigster-primary"
                                    : "bg-bigster-border"
                                    }`}
                                />
                              )}
                            </div>

                            <div className="flex-1 pt-1.5 pb-2">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3
                                  className={`text-sm font-bold ${isCurrent
                                    ? "text-bigster-text"
                                    : isCompleted
                                      ? "text-bigster-text"
                                      : "text-bigster-text-muted"
                                    }`}
                                >
                                  {step.label}
                                </h3>

                                {isCurrent && (
                                  <span className="px-2 py-0.5 bg-bigster-primary border border-yellow-200 text-[10px] font-bold text-bigster-primary-text">
                                    ATTUALE
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-bigster-text-muted leading-relaxed mb-2">
                                {step.description}
                              </p>

                              {(isCompleted || isCurrent) && statusDate && (
                                <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(statusDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {!isAnnullata && (
                    <div className="hidden md:block mt-8 pt-6 border-t border-bigster-border">
                      <div className="bg-bigster-card-bg border border-bigster-border p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-bigster-primary border-2 border-yellow-200 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-6 w-6 text-bigster-primary-text" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-bigster-text mb-1">
                              Stato Corrente
                            </h3>
                            <p className="text-lg font-bold text-bigster-text mb-2">
                              {STATUS_FLOW[currentStatusIndex]?.label}
                            </p>
                            <p className="text-sm text-bigster-text-muted mb-2">
                              {STATUS_FLOW[currentStatusIndex]?.description}
                            </p>
                            {currentStatusDate && (
                              <p className="text-xs text-bigster-text-muted">
                                Aggiornato {getTimeAgo(currentStatusDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
