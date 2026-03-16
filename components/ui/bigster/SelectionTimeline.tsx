"use client";

import type React from "react";
import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Users,
  FileText,
  MessageSquare,
  Crown,
  XCircle,
  ChevronDown,
  ChevronUp,
  History,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

export enum SelectionStatus {
  CREATA = "CREATA",
  APPROVATA = "APPROVATA",
  IN_CORSO = "IN_CORSO",
  ANNUNCI_PUBBLICATI = "ANNUNCI_PUBBLICATI",
  CANDIDATURE_RICEVUTE = "CANDIDATURE_RICEVUTE",
  COLLOQUI_IN_CORSO = "COLLOQUI_IN_CORSO",
  COLLOQUI_CEO = "COLLOQUI_CEO",
  CHIUSA = "CHIUSA",
  ANNULLATA = "ANNULLATA",
}

export interface StatusHistory {
  id: number;
  selezione_id: number;
  stato_precedente: string;
  stato_nuovo: string;
  risorsa_umana_id: number | null;
  risorsa_umana_precedente_id?: number | null;
  data_cambio: string;
  note: string;
  tipo_cambio?: "stato" | "risorsa" | "entrambi" | "altro";
  risorsa_umana: {
    id: number;
    nome: string;
    cognome: string;
  } | null;
  risorsa_umana_precedente?: {
    id: number;
    nome: string;
    cognome: string;
  } | null;
}

export interface SelectionTimelineProps {
  selection: {
    id: number;
    titolo: string;
    stato: SelectionStatus | string;
    note?: string | null;
    data_creazione: string | Date;
    data_modifica: string | Date;
    data_chiusura?: string | Date | null;
    storico_stati?: StatusHistory[];
  } | null;
  className?: string;
}

const statusConfig = {
  [SelectionStatus.CREATA]: {
    label: "Creata",
    icon: FileText,
    color: "#d8d8d8",
    description: "Selezione creata",
  },
  [SelectionStatus.APPROVATA]: {
    label: "Approvata",
    icon: CheckCircle,
    color: "#6c4e06",
    description: "Approvata dal CEO",
  },
  [SelectionStatus.IN_CORSO]: {
    label: "In Corso",
    icon: Clock,
    color: "#6c4e06",
    description: "HR assegnato",
  },
  [SelectionStatus.ANNUNCI_PUBBLICATI]: {
    label: "Annunci",
    icon: FileText,
    color: "#6c4e06",
    description: "Annunci pubblicati",
  },
  [SelectionStatus.CANDIDATURE_RICEVUTE]: {
    label: "Candidature",
    icon: Users,
    color: "#6c4e06",
    description: "Candidature ricevute",
  },
  [SelectionStatus.COLLOQUI_IN_CORSO]: {
    label: "Colloqui",
    icon: MessageSquare,
    color: "#6c4e06",
    description: "Colloqui in corso",
  },
  [SelectionStatus.COLLOQUI_CEO]: {
    label: "CEO",
    icon: Crown,
    color: "#6c4e06",
    description: "Colloqui finali",
  },
  [SelectionStatus.CHIUSA]: {
    label: "Chiusa",
    icon: CheckCircle,
    color: "#333333",
    description: "Completata",
  },
  [SelectionStatus.ANNULLATA]: {
    label: "Annullata",
    icon: XCircle,
    color: "#666666",
    description: "Annullata",
  },
};

export default function SelectionTimeline({
  selection,
  className,
}: SelectionTimelineProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (!selection) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Nessuna selezione disponibile</p>
        </CardContent>
      </Card>
    );
  }

  const statusOrder = [
    SelectionStatus.CREATA,
    SelectionStatus.APPROVATA,
    SelectionStatus.IN_CORSO,
    SelectionStatus.ANNUNCI_PUBBLICATI,
    SelectionStatus.CANDIDATURE_RICEVUTE,
    SelectionStatus.COLLOQUI_IN_CORSO,
    SelectionStatus.COLLOQUI_CEO,
    SelectionStatus.CHIUSA,
  ];

  const getStatusIndex = (status: string) => {
    return statusOrder.indexOf(status as SelectionStatus);
  };

  const isStatusCompleted = (status: string) => {
    if (selection.stato === SelectionStatus.ANNULLATA) {
      return status === SelectionStatus.ANNULLATA;
    }
    return getStatusIndex(selection.stato) > getStatusIndex(status);
  };

  const isCurrentStatus = (status: string) => {
    return selection.stato === status;
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("it-IT");
  };

  const formatDateTime = (date: string | Date) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as SelectionStatus] || {
        label: status,
        icon: Clock,
        color: "#d8d8d8",
        description: status,
      }
    );
  };

  const getChangeType = (
    history: StatusHistory
  ): "stato" | "risorsa" | "entrambi" | "altro" => {
    if (history.tipo_cambio) {
      return history.tipo_cambio;
    }

    const hasStateChange = history.stato_precedente !== history.stato_nuovo;
    const hasResourceChange =
      history.risorsa_umana_precedente_id &&
      history.risorsa_umana_precedente_id !== history.risorsa_umana_id;

    if (hasStateChange && hasResourceChange) return "entrambi";
    if (hasStateChange) return "stato";
    if (hasResourceChange) return "risorsa";
    return "altro";
  };

  const renderChangeTypeInfo = (history: StatusHistory, changeType: string) => {
    switch (changeType) {
      case "risorsa":
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50">
                Cambio Risorsa
              </Badge>
            </div>
          </div>
        );
      case "entrambi":
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(() => {
                const PrevIcon = getStatusConfig(history.stato_precedente).icon;
                return (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: getStatusConfig(history.stato_precedente)
                        .color,
                      opacity: 0.8,
                    }}
                  >
                    <PrevIcon className="w-3 h-3 text-white" />
                  </div>
                );
              })()}
              <div className="w-4 h-0.5 bg-gray-300" />
              {(() => {
                const NewIcon = getStatusConfig(history.stato_nuovo).icon;
                return (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: getStatusConfig(history.stato_nuovo)
                        .color,
                    }}
                  >
                    <NewIcon className="w-3 h-3 text-white" />
                  </div>
                );
              })()}
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>
        );
      case "altro":
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-500">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <Badge variant="outline" className="text-xs bg-gray-50">
              Modifica
            </Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            {(() => {
              const PrevIcon = getStatusConfig(history.stato_precedente).icon;
              return (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getStatusConfig(history.stato_precedente)
                      .color,
                    opacity: 0.8,
                  }}
                >
                  <PrevIcon className="w-3 h-3 text-white" />
                </div>
              );
            })()}
            <div className="w-4 h-0.5 bg-gray-300" />
            {(() => {
              const NewIcon = getStatusConfig(history.stato_nuovo).icon;
              return (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getStatusConfig(history.stato_nuovo).color,
                  }}
                >
                  <NewIcon className="w-3 h-3 text-white" />
                </div>
              );
            })()}
          </div>
        );
    }
  };

  const renderChangeBadges = (history: StatusHistory, changeType: string) => {
    const badges = [];

    if (changeType === "stato" || changeType === "entrambi") {
      const prevConfig = getStatusConfig(history.stato_precedente);
      const newConfig = getStatusConfig(history.stato_nuovo);

      badges.push(
        <div key="stato" className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {prevConfig.label}
          </Badge>
          <span className="text-xs text-gray-500">→</span>
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: newConfig.color,
              color: newConfig.color,
            }}
          >
            {newConfig.label}
          </Badge>
        </div>
      );
    }

    if (changeType === "risorsa" || changeType === "entrambi") {
      badges.push(
        <div key="risorsa" className="flex items-center gap-2">
          {history.risorsa_umana_precedente && (
            <>
              <Badge variant="outline" className="text-xs bg-blue-50">
                {history.risorsa_umana_precedente.nome}{" "}
                {history.risorsa_umana_precedente.cognome}
              </Badge>
              <span className="text-xs text-gray-500">→</span>
            </>
          )}
          <Badge
            variant="outline"
            className="text-xs bg-blue-100 border-blue-300 text-blue-700"
          >
            {history.risorsa_umana?.nome} {history.risorsa_umana?.cognome}
          </Badge>
        </div>
      );
    }

    return badges;
  };

  const generateChangeDescription = (
    history: StatusHistory,
    changeType: string
  ): string => {
    switch (changeType) {
      case "stato":
        const prevConfig = getStatusConfig(history.stato_precedente);
        const newConfig = getStatusConfig(history.stato_nuovo);
        return `Stato cambiato da "${prevConfig.label}" a "${newConfig.label}"`;

      case "risorsa":
        if (history.risorsa_umana_precedente && history.risorsa_umana) {
          return `Risorsa umana cambiata da "${history.risorsa_umana_precedente.nome} ${history.risorsa_umana_precedente.cognome}" a "${history.risorsa_umana.nome} ${history.risorsa_umana.cognome}"`;
        } else if (history.risorsa_umana) {
          return `Risorsa umana assegnata: "${history.risorsa_umana.nome} ${history.risorsa_umana.cognome}"`;
        }
        return "Modifica risorsa umana";

      case "entrambi":
        const prevStateConfig = getStatusConfig(history.stato_precedente);
        const newStateConfig = getStatusConfig(history.stato_nuovo);
        let description = `Stato cambiato da "${prevStateConfig.label}" a "${newStateConfig.label}"`;

        if (history.risorsa_umana_precedente && history.risorsa_umana) {
          description += ` e risorsa umana cambiata da "${history.risorsa_umana_precedente.nome} ${history.risorsa_umana_precedente.cognome}" a "${history.risorsa_umana.nome} ${history.risorsa_umana.cognome}"`;
        } else if (history.risorsa_umana) {
          description += ` e risorsa umana assegnata: "${history.risorsa_umana.nome} ${history.risorsa_umana.cognome}"`;
        }

        return description;

      default:
        return "Modifica effettuata";
    }
  };

  const calculateTimeDifference = (
    currentDate: string,
    previousDate: string
  ): string => {
    const current = new Date(currentDate);
    const previous = new Date(previousDate);
    const diffInMs = previous.getTime() - current.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? "pochi minuti" : `${diffInMinutes} minuti`;
      }
      return diffInHours === 1 ? "1 ora" : `${diffInHours} ore`;
    } else if (diffInDays === 1) {
      return "1 giorno";
    } else if (diffInDays < 7) {
      return `${diffInDays} giorni`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "1 settimana" : `${weeks} settimane`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? "1 mese" : `${months} mesi`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? "1 anno" : `${years} anni`;
    }
  };

  return (
    <Card className={className + " " + "rounded-none !border-outline"}>
      <CardHeader className="p-5">
        <div className="flex items-center justify-end">
          {selection.storico_stati && selection.storico_stati.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Storico
              {isHistoryOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 px-7">

        <div className="relative">

          <div
            className="absolute top-8 left-8 right-8 h-0.5"
            style={{ backgroundColor: "#d8d8d8" }}
          />

          <div
            className="absolute top-8 left-8 h-0.5 transition-all duration-500"
            style={{
              backgroundColor: "#e4d72b",
              width:
                selection.stato === SelectionStatus.ANNULLATA
                  ? "0%"
                  : `${
                      ((getStatusIndex(selection.stato) + 1) /
                        statusOrder.length) *
                      90
                    }%`,
            }}
          />

          <div className="flex justify-between items-start relative">
            {statusOrder.map((status, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const isCurrent = isCurrentStatus(status);
              const isCompleted = isStatusCompleted(status);
              const isAnnullata = selection.stato === SelectionStatus.ANNULLATA;

              return (
                <div
                  key={status}
                  className="flex flex-col items-center relative z-10"
                >

                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent
                        ? "ring-4 ring-opacity-50 shadow-lg scale-110"
                        : ""
                    }`}
                    style={
                      {
                        backgroundColor: isCurrent
                          ? config.color
                          : isCompleted
                          ? "#e4d72b"
                          : "#ffffff",
                        borderColor: isCurrent ? "transparent" : "#6c4e06",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        "--tw-ring-color": isCurrent
                          ? config.color
                          : "transparent",
                      } as React.CSSProperties
                    }
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color:
                          isCurrent || isCompleted ? "#ffffff" : config.color,
                      }}
                    />
                  </div>

                  <div className="mt-3 text-center max-w-[100px]">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-lg text-bigster-text" : ""
                      }`}
                    >
                      {config.label}
                    </p>
                    <p
                      className={`text-xs mt-1font-semibold ${
                        isCurrent ? "text-lg text-bigster-text" : ""
                      }`}
                    >
                      {config.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {selection.stato === SelectionStatus.ANNULLATA && (
            <div className="mt-8 flex justify-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center ring-4 ring-opacity-50 shadow-lg scale-110"
                  style={
                    {
                      backgroundColor:
                        statusConfig[SelectionStatus.ANNULLATA].color,
                      "--tw-ring-color":
                        statusConfig[SelectionStatus.ANNULLATA].color,
                    } as React.CSSProperties
                  }
                >
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="mt-3 text-center">
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "#666666" }}
                  >
                    Annullata
                  </p>
                  <p className="text-xs" style={{ color: "#666666" }}>
                    Selezione annullata
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {selection.storico_stati && selection.storico_stati.length > 0 && (
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <CollapsibleContent className="mt-8">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Storico Modifiche
                </h3>
                <div className="space-y-4">
                  {[...selection.storico_stati]
                    .sort(
                      (a, b) =>
                        new Date(b.data_cambio).getTime() -
                        new Date(a.data_cambio).getTime()
                    )
                    .map((history, index, sortedArray) => {
                      const changeType = getChangeType(history);
                      const previousChange = sortedArray[index + 1];
                      const timeDifference = previousChange
                        ? calculateTimeDifference(
                            history.data_cambio,
                            previousChange.data_cambio
                          )
                        : null;

                      return (
                        <div
                          key={history.id}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">

                            {renderChangeTypeInfo(history, changeType)}

                            <div className="min-w-0 flex-1">
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  {generateChangeDescription(
                                    history,
                                    changeType
                                  )}
                                </p>
                                <div className="flex flex-col gap-2">
                                  {renderChangeBadges(history, changeType)}
                                </div>
                              </div>

                              {history.note && (
                                <div className="mb-2 p-2 bg-gray-100 rounded border-l-2 border-gray-300">
                                  <p className="text-xs text-gray-600 italic">
                                    Note: {history.note}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  {formatDateTime(history.data_cambio)}
                                </span>
                                {timeDifference && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="font-medium text-blue-600">
                                      dopo {timeDifference}
                                    </span>
                                  </div>
                                )}
                                {history.risorsa_umana &&
                                  changeType === "stato" && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>
                                        Modificato da:{" "}
                                        {history.risorsa_umana.nome}{" "}
                                        {history.risorsa_umana.cognome}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
