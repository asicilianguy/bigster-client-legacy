"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Zap,
  CheckCheck,
  XCircle,
  UserCheck,
  UserX,
  Package,
  FileCheck,
  Megaphone,
  Users,
  RefreshCw,
  Clock,
  ClipboardCheck,
  FileText,
  Send,
  Eye,
  CircleDollarSign,
  AlertCircle,
  Radio,
} from "lucide-react";
import type { SelectionStats } from "@/types/selection";

interface SelectionsKPIProps {
  stats: SelectionStats | undefined;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  FATTURA_AV_SALDATA: {
    label: "Fattura Saldata",
    icon: CircleDollarSign,
    color: "#059669",
    bgColor: "#d1fae5",
  },
  HR_ASSEGNATA: {
    label: "HR Assegnata",
    icon: UserCheck,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  PRIMA_CALL_COMPLETATA: {
    label: "Prima Call",
    icon: Clock,
    color: "#6366f1",
    bgColor: "#e0e7ff",
  },
  RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE: {
    label: "Job in Approv.",
    icon: FileText,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  RACCOLTA_JOB_APPROVATA_CLIENTE: {
    label: "Job Approvata",
    icon: FileCheck,
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO: {
    label: "Bozza CEO",
    icon: Eye,
    color: "#d97706",
    bgColor: "#fef3c7",
  },
  ANNUNCIO_APPROVATO: {
    label: "Annuncio OK",
    icon: ClipboardCheck,
    color: "#0891b2",
    bgColor: "#cffafe",
  },
  ANNUNCIO_PUBBLICATO: {
    label: "Pubblicato",
    icon: Radio,
    color: "#7c3aed",
    bgColor: "#ede9fe",
  },
  CANDIDATURE_RICEVUTE: {
    label: "Candidature",
    icon: Send,
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
  COLLOQUI_IN_CORSO: {
    label: "Colloqui",
    icon: Users,
    color: "#0d9488",
    bgColor: "#ccfbf1",
  },
  CANDIDATO_IN_PROVA: {
    label: "Candidato in Prova",
    icon: Megaphone,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  SELEZIONI_IN_SOSTITUZIONE: {
    label: "Sostituzione",
    icon: RefreshCw,
    color: "#f97316",
    bgColor: "#ffedd5",
  },
  CHIUSA: {
    label: "Chiusa",
    icon: CheckCheck,
    color: "#16a34a",
    bgColor: "#dcfce7",
  },
  ANNULLATA: {
    label: "Annullata",
    icon: XCircle,
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
};

function KPICard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  delay = 0,
  total,
  showPercentage = false,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
  delay?: number;
  total?: number;
  showPercentage?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 bg-bigster-card-bg border border-bigster-border"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 flex-shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-bigster-text">{value}</p>
            {showPercentage && total && total > 0 && (
              <span className="text-xs text-bigster-text-muted">
                ({Math.round((value / total) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PIPELINE_ORDER = [
  "FATTURA_AV_SALDATA",
  "HR_ASSEGNATA",
  "PRIMA_CALL_COMPLETATA",
  "RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE",
  "RACCOLTA_JOB_APPROVATA_CLIENTE",
  "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
  "ANNUNCIO_APPROVATO",
  "ANNUNCIO_PUBBLICATO",
  "CANDIDATURE_RICEVUTE",
  "COLLOQUI_IN_CORSO",
  "CANDIDATO_IN_PROVA",
  "SELEZIONI_IN_SOSTITUZIONE",
  "CHIUSA",
  "ANNULLATA",
];

export function SelectionsKPI({ stats, isLoading }: SelectionsKPIProps) {
  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-bigster-card-bg border border-bigster-border animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bigster-border" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-bigster-border w-16" />
                  <div className="h-6 bg-bigster-border w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mainMetrics = [
    {
      label: "Totale",
      value: stats.totale,
      icon: LayoutGrid,
      color: "#6c4e06",
      bgColor: "#f5f5f7",
    },
    {
      label: "Attive",
      value: stats.attive,
      icon: Zap,
      color: "#d97706",
      bgColor: "#fef3c7",
    },
    {
      label: "Chiuse",
      value: stats.chiuse,
      icon: CheckCheck,
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      label: "Annullate",
      value: stats.annullate,
      icon: XCircle,
      color: "#ef4444",
      bgColor: "#fee2e2",
    },
    {
      label: "Con HR",
      value: stats.con_hr_assegnata,
      icon: UserCheck,
      color: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      label: "Senza HR",
      value: stats.senza_hr,
      icon: UserX,
      color: "#ea580c",
      bgColor: "#ffedd5",
    },
  ];

  const pacchetti = (stats.per_pacchetto || []).map((p) => ({
    label: p.pacchetto,
    value: p.count,
    icon: Package,
    color: p.pacchetto === "MDO" ? "#7c3aed" : "#0891b2",
    bgColor: p.pacchetto === "MDO" ? "#f3e8ff" : "#cffafe",
  }));

  const firstRow = [...mainMetrics, ...pacchetti];

  const sortedStati = [...(stats.per_stato || [])].sort((a, b) => {
    const indexA = PIPELINE_ORDER.indexOf(a.stato);
    const indexB = PIPELINE_ORDER.indexOf(b.stato);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {firstRow.map((m, i) => (
          <KPICard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            color={m.color}
            bgColor={m.bgColor}
            delay={0.05 * i}
            total={stats.totale}
            showPercentage={m.label !== "Totale"}
          />
        ))}
      </div>

      {sortedStati.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bigster-surface border border-bigster-border"
        >
          <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
            <h3 className="text-xs font-bold text-bigster-text uppercase tracking-wide">
              Pipeline per Stato
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {sortedStati.map((s, i) => {
                const config = STATUS_CONFIG[s.stato] || {
                  label: s.stato.replace(/_/g, " "),
                  icon: AlertCircle,
                  color: "#6b7280",
                  bgColor: "#f3f4f6",
                };

                return (
                  <KPICard
                    key={s.stato}
                    label={config.label}
                    value={s.count}
                    icon={config.icon}
                    color={config.color}
                    bgColor={config.bgColor}
                    delay={0.35 + 0.03 * i}
                    total={stats.totale}
                    showPercentage
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
