"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionDetail, InvoiceType } from "@/types/selection";
import { useGetSelectionInvoicesStatusQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { motion, AnimatePresence } from "framer-motion";

interface InvoicesSectionProps {
  selection: SelectionDetail;
}

const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  AV: "Fattura Avvio",
  INS: "Fattura Inserimento",
  MDO: "Fattura Master DTO",
};

const INVOICE_TYPE_DESCRIPTIONS: Record<InvoiceType, string> = {
  AV: "Prima fattura all'inizio della selezione",
  INS: "Fattura al completamento dell'inserimento",
  MDO: "Fattura Master DTO per pacchetto avanzato",
};

export function InvoicesSection({ selection }: InvoicesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: invoicesStatus } = useGetSelectionInvoicesStatusQuery(
    selection.id
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const expectedInvoices = selection.pacchetto === "BASE" ? 2 : 3;
  const currentInvoices = selection.fatture.length;
  const paidInvoices = selection.fatture.filter((f) => f.data_pagamento).length;
  const completionPercentage = Math.round(
    (currentInvoices / expectedInvoices) * 100
  );
  const paymentPercentage = Math.round((paidInvoices / expectedInvoices) * 100);

  const isFullyPaid = paidInvoices === expectedInvoices;
  const isFullyIssued = currentInvoices === expectedInvoices;
  const hasPendingPayments = currentInvoices > paidInvoices;

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-bigster-text" />
            <div className="text-left">
              <h2 className="text-lg font-bold text-bigster-text">Fatture</h2>
              <p className="text-xs text-bigster-text-muted">
                {currentInvoices} di {expectedInvoices} emesse • {paidInvoices}{" "}
                saldate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {!isExpanded && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-bigster-border bg-bigster-surface">
                {isFullyPaid ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      Tutto Saldato
                    </span>
                  </>
                ) : isFullyIssued && hasPendingPayments ? (
                  <>
                    <Clock className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs text-bigster-text-muted">
                      In Attesa Pagamento •{" "}
                      <span className="font-semibold text-yellow-700">
                        {paymentPercentage}% saldato
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-bigster-text-muted" />
                    <span className="text-xs text-bigster-text-muted">
                      Fatturazione •{" "}
                      <span className="font-semibold text-bigster-text">
                        {completionPercentage}% emesse
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}

            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-bigster-text flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-bigster-text flex-shrink-0" />
            )}
          </div>
        </button>

        {!isExpanded && currentInvoices > 0 && (
          <div className="mt-3 space-y-2">

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-bigster-text-muted uppercase">
                  Emissione
                </span>
                <span className="text-[10px] font-bold text-bigster-text">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-1 bg-bigster-border overflow-hidden">
                <div
                  className={`h-full ${
                    completionPercentage === 100 ? "bg-blue-500" : "bg-blue-400"
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-bigster-text-muted uppercase">
                  Pagamenti
                </span>
                <span className="text-[10px] font-bold text-bigster-text">
                  {paymentPercentage}%
                </span>
              </div>
              <div className="h-1 bg-bigster-border overflow-hidden">
                <div
                  className={`h-full ${
                    paymentPercentage === 100 ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  style={{ width: `${paymentPercentage}%` }}
                />
              </div>
            </div>
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
              {selection.fatture.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-bigster-muted-bg border border-bigster-border"
                >
                  <FileText className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-bigster-text-muted mb-1">
                    Nessuna fattura ancora emessa
                  </p>
                  <p className="text-xs text-bigster-text-muted">
                    Le fatture verranno registrate qui man mano che vengono
                    emesse
                  </p>
                </motion.div>
              ) : (
                <>

                  <div className="mb-6 space-y-3">

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-bigster-text-muted">
                          Emissione Fatture
                        </span>
                        <span className="text-xs font-bold text-bigster-text">
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-bigster-border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full ${
                            completionPercentage === 100
                              ? "bg-blue-500"
                              : "bg-blue-400"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-bigster-text-muted">
                          Pagamenti
                        </span>
                        <span className="text-xs font-bold text-bigster-text">
                          {paymentPercentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-bigster-border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${paymentPercentage}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2,
                          }}
                          className={`h-full ${
                            paymentPercentage === 100
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {selection.fatture.map((fattura, index) => {
                      const isPaid = !!fattura.data_pagamento;
                      const daysSinceIssue = Math.floor(
                        (new Date().getTime() -
                          new Date(fattura.data_emissione).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      return (
                        <motion.div
                          key={fattura.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-bigster-border bg-bigster-card-bg hover:border-bigster-text transition-colors"
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-4">

                              <div
                                className={`w-12 h-12 flex items-center justify-center border-2 flex-shrink-0 ${
                                  isPaid
                                    ? "bg-green-50 border-green-200"
                                    : "bg-bigster-surface border-bigster-border"
                                }`}
                              >
                                {isPaid ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                                ) : (
                                  <Clock className="h-6 w-6 text-bigster-text-muted" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">

                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-[15px] font-bold text-bigster-text mb-1">
                                      {
                                        INVOICE_TYPE_LABELS[
                                          fattura.tipo_fattura
                                        ]
                                      }
                                    </h3>
                                    <p className="text-xs text-bigster-text-muted">
                                      {
                                        INVOICE_TYPE_DESCRIPTIONS[
                                          fattura.tipo_fattura
                                        ]
                                      }
                                    </p>
                                  </div>

                                  {isPaid ? (
                                    <div className="px-2 py-1 bg-green-50 border border-green-200">
                                      <span className="text-xs font-semibold text-green-700">
                                        Saldata
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="px-2 py-1 bg-yellow-50 border border-yellow-200">
                                      <span className="text-xs font-semibold text-yellow-700">
                                        In Attesa
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">

                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3 text-bigster-text-muted" />
                                    <span className="text-xs text-bigster-text-muted">
                                      N° Fattura:
                                    </span>
                                    <span className="text-xs font-mono font-semibold text-bigster-text">
                                      {fattura.numero_fattura}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <Calendar className="h-3 w-3 text-bigster-text-muted" />
                                      <span className="text-bigster-text-muted">
                                        Emessa:
                                      </span>
                                      <span className="font-medium text-bigster-text">
                                        {formatDateFull(fattura.data_emissione)}
                                      </span>
                                    </div>

                                    {isPaid && fattura.data_pagamento && (
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        <span className="text-bigster-text-muted">
                                          Saldata:
                                        </span>
                                        <span className="font-medium text-green-700">
                                          {formatDateFull(
                                            fattura.data_pagamento
                                          )}
                                        </span>
                                      </div>
                                    )}

                                    {!isPaid && daysSinceIssue > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-yellow-700">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          In attesa da {daysSinceIssue} giorni
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {currentInvoices < expectedInvoices && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 border border-bigster-border bg-bigster-card-bg mb-6"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-bigster-text mb-1">
                            Fatture Previste per Pacchetto {selection.pacchetto}
                          </p>
                          <p className="text-xs text-bigster-text-muted leading-relaxed">
                            Sono previste <strong>{expectedInvoices}</strong>{" "}
                            fatture totali:{" "}
                            {selection.pacchetto === "BASE"
                              ? "Avvio (AV) + Inserimento (INS)"
                              : "Avvio (AV) + Inserimento (INS) + Master DTO (MDO)"}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-bigster-border overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-bigster-text whitespace-nowrap">
                              {currentInvoices}/{expectedInvoices} emesse
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {hasPendingPayments && currentInvoices > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="p-4 border border-yellow-200 bg-yellow-50 mb-6"
                    >
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">
                            Pagamenti in Sospeso
                          </p>
                          <p className="text-xs text-yellow-700 leading-relaxed">
                            Ci sono{" "}
                            <strong>{currentInvoices - paidInvoices}</strong>{" "}
                            fatture emesse in attesa di pagamento.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {isFullyPaid && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 border-2 border-green-200 bg-green-50"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-green-800 mb-1">
                            Fatturazione Completata
                          </p>
                          <p className="text-xs text-green-700 leading-relaxed">
                            Tutte le fatture previste per questa selezione sono
                            state emesse e saldate. Il processo di fatturazione
                            è completato con successo.
                          </p>
                        </div>
                      </div>
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
