"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  calculateDeadlineInfo,
  formatTimeRemaining,
  getUrgencyColor,
  UrgencyLevel,
} from "@/lib/utils/selection-deadlines";
import { SelectionDetail } from "@/types/selection";

interface SelectionDeadlineCardProps {
  selection: SelectionDetail;
}

export function SelectionDeadlineCard({
  selection,
}: SelectionDeadlineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const deadlineInfo = useMemo(() => {
    return calculateDeadlineInfo(selection);
  }, [selection]);

  if (!deadlineInfo) {
    return null;
  }

  const colors = getUrgencyColor(deadlineInfo.urgencyLevel);
  const timeText = formatTimeRemaining(deadlineInfo);

  const UrgencyIcon =
    deadlineInfo.urgencyLevel === UrgencyLevel.OVERDUE
      ? XCircle
      : deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL
        ? AlertTriangle
        : deadlineInfo.urgencyLevel === UrgencyLevel.WARNING
          ? AlertCircle
          : CheckCircle2;

  const urgencyLabel =
    deadlineInfo.urgencyLevel === UrgencyLevel.OVERDUE
      ? "SCADUTA"
      : deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL
        ? "CRITICA"
        : deadlineInfo.urgencyLevel === UrgencyLevel.WARNING
          ? "ATTENZIONE"
          : "IN LINEA";

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getMessage = () => {
    if (deadlineInfo.isOverdue) {
      return "Scadenza superata. Agire tempestivamente per avanzare al prossimo stato.";
    }
    if (deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL) {
      return "Scadenza vicina. Completare le azioni richieste al più presto.";
    }
    if (deadlineInfo.urgencyLevel === UrgencyLevel.WARNING) {
      return "Superato un terzo del tempo disponibile. Monitorare il progresso.";
    }
    return "In linea con i tempi previsti.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-bigster-surface border border-bigster-border overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: colors.border }}
    >

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-bigster-muted-bg transition-colors"
      >

        <UrgencyIcon
          className="h-4 w-4 flex-shrink-0"
          style={{ color: colors.icon }}
        />

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-bigster-text truncate">
            {deadlineInfo.statusLabel}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 flex-shrink-0"
            style={{
              color: colors.text,
              backgroundColor: colors.bg,
            }}
          >
            {urgencyLabel}
          </span>
        </div>

        <div className="flex-1" />

        <span
          className="text-xs font-bold flex-shrink-0 hidden sm:block"
          style={{ color: colors.icon }}
        >
          {timeText}
        </span>

        <div className="w-16 h-1.5 bg-bigster-border flex-shrink-0 hidden md:block">
          <div
            className="h-full transition-all"
            style={{
              width: `${Math.min(100, deadlineInfo.progressPercentage)}%`,
              backgroundColor: colors.border,
            }}
          />
        </div>

        <span className="text-xs text-bigster-text-muted flex-shrink-0">
          {deadlineInfo.daysElapsed}/{deadlineInfo.deadlineDays}gg
        </span>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-bigster-border space-y-4">

              <div
                className="flex items-start gap-2 px-3 py-2"
                style={{ backgroundColor: `${colors.bg}80` }}
              >
                <UrgencyIcon
                  className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: colors.icon }}
                />
                <p className="text-xs leading-relaxed" style={{ color: colors.text }}>
                  {getMessage()}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Avanzamento
                  </span>
                  <span className="text-xs font-bold text-bigster-text">
                    {Math.round(deadlineInfo.progressPercentage)}%
                  </span>
                </div>
                <div className="h-2 bg-bigster-border overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, deadlineInfo.progressPercentage)}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full"
                    style={{ backgroundColor: colors.border }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 bg-bigster-card-bg border border-bigster-border">
                  <p className="text-[10px] font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Trascorsi
                  </p>
                  <p className="text-lg font-bold text-bigster-text">
                    {deadlineInfo.daysElapsed}
                    <span className="text-xs font-normal text-bigster-text-muted ml-0.5">gg</span>
                  </p>
                </div>
                <div className="p-2.5 bg-bigster-card-bg border border-bigster-border">
                  <p className="text-[10px] font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Rimanenti
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: deadlineInfo.isOverdue ? colors.icon : "#6c4e06" }}
                  >
                    {deadlineInfo.isOverdue ? 0 : deadlineInfo.daysRemaining}
                    <span className="text-xs font-normal text-bigster-text-muted ml-0.5">gg</span>
                  </p>
                </div>
                <div className="p-2.5 bg-bigster-card-bg border border-bigster-border">
                  <p className="text-[10px] font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Ingresso
                  </p>
                  <p className="text-xs font-semibold text-bigster-text mt-1">
                    {formatDate(deadlineInfo.dateEntered)}
                  </p>
                </div>
                <div className="p-2.5 bg-bigster-card-bg border border-bigster-border">
                  <p className="text-[10px] font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Scadenza
                  </p>
                  <p
                    className="text-xs font-semibold mt-1"
                    style={{ color: deadlineInfo.isOverdue ? colors.icon : "#6c4e06" }}
                  >
                    {formatDate(deadlineInfo.deadlineDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-bigster-card-bg border border-bigster-border">
                <ArrowRight className="h-3.5 w-3.5 text-bigster-text flex-shrink-0" />
                <p className="text-xs text-bigster-text">
                  <span className="font-semibold">Prossimo passo:</span>{" "}
                  avanzare a{" "}
                  <span className="font-semibold">"{deadlineInfo.nextStateLabel}"</span>
                  {deadlineInfo.isOverdue
                    ? " il prima possibile."
                    : ` entro ${deadlineInfo.daysRemaining} ${deadlineInfo.daysRemaining === 1 ? "giorno" : "giorni"}.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
