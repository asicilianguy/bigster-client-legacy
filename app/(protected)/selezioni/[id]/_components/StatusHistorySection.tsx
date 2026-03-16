"use client";

import { useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import StatusBadge from "@/components/ui/bigster/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";

interface StatusHistorySectionProps {
  selection: SelectionDetail;
}

export function StatusHistorySection({ selection }: StatusHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "recent">("all");

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

  const sortedHistory = [...(selection.storico_stati || [])].sort(
    (a, b) =>
      new Date(b.data_cambio).getTime() - new Date(a.data_cambio).getTime()
  );

  const filteredHistory =
    selectedFilter === "recent" ? sortedHistory.slice(0, 5) : sortedHistory;

  const totalChanges = sortedHistory.length;
  const uniqueUsers = new Set(
    sortedHistory.filter((h) => h.risorsa_umana).map((h) => h.risorsa_umana!.id)
  ).size;

  const firstChange = sortedHistory[sortedHistory.length - 1];
  const lastChange = sortedHistory[0];
  const daysSinceStart = firstChange
    ? Math.floor(
        (new Date().getTime() - new Date(firstChange.data_cambio).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-bigster-text" />
            <div className="text-left">
              <h2 className="text-lg font-bold text-bigster-text">
                Storico Stati
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {totalChanges} cambiamenti di stato • {uniqueUsers} utenti
                coinvolti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isExpanded && totalChanges > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-bigster-border bg-bigster-surface">
                <Clock className="h-3 w-3 text-bigster-text-muted" />
                <span className="text-xs text-bigster-text-muted">
                  Ultimo aggiornamento:{" "}
                  <span className="font-semibold text-bigster-text">
                    {getTimeAgo(lastChange.data_cambio)}
                  </span>
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
              {sortedHistory.length === 0 ? (
                <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
                  <History className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-bigster-text-muted mb-1">
                    Nessuno storico disponibile
                  </p>
                  <p className="text-xs text-bigster-text-muted">
                    I cambiamenti di stato verranno registrati qui
                  </p>
                </div>
              ) : (
                <>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-bigster-card-bg border border-bigster-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-bigster-text-muted" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Cambiamenti
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-bigster-text">
                        {totalChanges}
                      </p>
                    </div>

                    <div className="bg-bigster-card-bg border border-bigster-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-bigster-text-muted" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Utenti
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-bigster-text">
                        {uniqueUsers}
                      </p>
                    </div>

                    <div className="bg-bigster-card-bg border border-bigster-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-bigster-text-muted" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Durata
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-bigster-text">
                        {daysSinceStart}
                        <span className="text-sm font-normal text-bigster-text-muted ml-1">
                          giorni
                        </span>
                      </p>
                    </div>
                  </div>

                  {totalChanges > 5 && (
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xs font-semibold text-bigster-text-muted">
                        Mostra:
                      </span>
                      <button
                        onClick={() => setSelectedFilter("all")}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedFilter === "all"
                            ? "bg-bigster-primary text-bigster-primary-text border-2 border-yellow-200"
                            : "bg-bigster-surface text-bigster-text border border-bigster-border hover:bg-bigster-muted-bg"
                        }`}
                      >
                        Tutti ({totalChanges})
                      </button>
                      <button
                        onClick={() => setSelectedFilter("recent")}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedFilter === "recent"
                            ? "bg-bigster-primary text-bigster-primary-text border-2 border-yellow-200"
                            : "bg-bigster-surface text-bigster-text border border-bigster-border hover:bg-bigster-muted-bg"
                        }`}
                      >
                        Recenti (5)
                      </button>
                    </div>
                  )}

                  <div className="relative">

                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-bigster-border" />

                    <div className="space-y-6">
                      {filteredHistory.map((history, index) => (
                        <motion.div
                          key={history.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative pl-12"
                        >

                          <div
                            className={`absolute left-0 w-10 h-10 flex items-center justify-center border-2 transition-all ${
                              index === 0
                                ? "bg-bigster-primary border-yellow-200 shadow-md"
                                : "bg-bigster-muted-bg border-bigster-border"
                            }`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                index === 0
                                  ? "bg-bigster-primary-text"
                                  : "bg-bigster-text-muted"
                              }`}
                            />
                          </div>

                          <div className="bg-bigster-card-bg border border-bigster-border hover:border-bigster-text transition-colors">

                            <div className="p-4 border-b border-bigster-border">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">

                                  <div className="flex items-center gap-2 flex-wrap mb-3">
                                    {history.stato_precedente ? (
                                      <>
                                        <StatusBadge
                                          status={history.stato_precedente}
                                          size="sm"
                                          showIcon={false}
                                        />
                                        <span className="text-bigster-text-muted font-bold">
                                          →
                                        </span>
                                        <StatusBadge
                                          status={history.stato_nuovo}
                                          size="sm"
                                        />
                                      </>
                                    ) : (
                                      <StatusBadge
                                        status={history.stato_nuovo}
                                        size="sm"
                                      />
                                    )}

                                    {index === 0 && (
                                      <span className="ml-2 px-2 py-0.5 bg-bigster-primary border border-yellow-200 text-[10px] font-bold text-bigster-primary-text">
                                        ULTIMO
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-bigster-text-muted">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3 w-3" />
                                      <span className="font-medium">
                                        {formatDateShort(history.data_cambio)}
                                      </span>
                                      <span className="text-bigster-text-muted">
                                        •
                                      </span>
                                      <span>
                                        {new Date(
                                          history.data_cambio
                                        ).toLocaleTimeString("it-IT", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>

                                    {history.risorsa_umana && (
                                      <div className="flex items-center gap-1.5">
                                        <User className="h-3 w-3" />
                                        <span className="font-medium">
                                          {history.risorsa_umana.nome}{" "}
                                          {history.risorsa_umana.cognome}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-1.5 text-bigster-text-muted">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {getTimeAgo(history.data_cambio)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {(history.note || history.data_scadenza) && (
                              <div className="p-4 space-y-3 bg-bigster-surface">

                                {history.note && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="h-3 w-3 text-bigster-text-muted" />
                                      <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                                        Note
                                      </span>
                                    </div>
                                    <p className="text-sm text-bigster-text leading-relaxed pl-5">
                                      {history.note}
                                    </p>
                                  </div>
                                )}

                                {history.data_scadenza && (
                                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200">
                                    <AlertCircle className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-yellow-800 mb-0.5">
                                        Scadenza Impostata
                                      </p>
                                      <p className="text-xs text-yellow-700">
                                        {formatDateTime(history.data_scadenza)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {selectedFilter === "recent" && totalChanges > 5 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 text-center"
                    >
                      <button
                        onClick={() => setSelectedFilter("all")}
                        className="text-sm font-semibold text-bigster-text hover:text-bigster-primary transition-colors"
                      >
                        Mostra altri {totalChanges - 5} cambiamenti →
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
