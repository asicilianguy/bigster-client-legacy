"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { SelectionStatus } from "@/types/selection";
import { SelectionCard } from "@/components/ui/bigster/SelectionCard";

const STATUS_CONFIG: Record<SelectionStatus, { label: string; color: string }> =
{
  [SelectionStatus.FATTURA_AV_SALDATA]: {
    label: "Fattura AV Saldata",
    color: "#10b981",
  },
  [SelectionStatus.HR_ASSEGNATA]: { label: "HR Assegnata", color: "#3b82f6" },
  [SelectionStatus.PRIMA_CALL_COMPLETATA]: {
    label: "Prima Call Completata",
    color: "#8b5cf6",
  },
  [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]: {
    label: "Job in Approvazione",
    color: "#f59e0b",
  },
  [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: {
    label: "Job Approvata",
    color: "#10b981",
  },
  [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]: {
    label: "Bozza in Approvazione CEO",
    color: "#f59e0b",
  },
  [SelectionStatus.ANNUNCIO_APPROVATO]: {
    label: "Annuncio Approvato",
    color: "#10b981",
  },
  [SelectionStatus.ANNUNCIO_PUBBLICATO]: {
    label: "Annuncio Pubblicato",
    color: "#06b6d4",
  },
  [SelectionStatus.CANDIDATURE_RICEVUTE]: {
    label: "Candidature Ricevute",
    color: "#8b5cf6",
  },
  [SelectionStatus.COLLOQUI_IN_CORSO]: {
    label: "Colloqui in Corso",
    color: "#f59e0b",
  },
  [SelectionStatus.CANDIDATO_IN_PROVA]: {
    label: "Candidato in Prova",
    color: "#3b82f6",
  },
  [SelectionStatus.SELEZIONI_IN_SOSTITUZIONE]: {
    label: "Selezioni in Sostituzione",
    color: "#f97316",
  },
  [SelectionStatus.CHIUSA]: { label: "Chiusa", color: "#6b7280" },
  [SelectionStatus.ANNULLATA]: { label: "Annullata", color: "#ef4444" },
};

interface StatusAccordionProps {
  status: SelectionStatus;
  selections: any[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const StatusAccordion = ({
  status,
  selections,
  isExpanded,
  onToggle,
}: StatusAccordionProps) => {
  const config = STATUS_CONFIG[status];
  const count = selections.length;

  return (
    <div className="w-full">

      <button
        onClick={onToggle}
        className="w-full bg-bigster-surface border border-bigster-border px-6 py-4 flex items-center justify-between hover:bg-bigster-background transition-colors"
        style={{ borderLeftWidth: "4px", borderLeftColor: config.color }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-bigster-text">
            {config.label}
          </h2>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: config.color }}
          >
            {count}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-bigster-text" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-bigster-background"
          >
            <div className="p-4 space-y-2">
              {selections.length > 0 ? (
                selections.map((selection) => (
                  <Link key={selection.id} href={`/selezioni/${selection.id}`}>
                    <SelectionCard selection={selection} />
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-bigster-text-muted">
                  Nessuna selezione in questo stato
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
