"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Users,
  FileCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useGetDeadlineMonitoringQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import {
  getSelectionsWithDeadlines,
  sortByUrgency,
  formatTimeRemaining,
  getUrgencyColor,
  UrgencyLevel,
  type SelectionWithDeadline,
} from "@/lib/utils/selection-deadlines";
import { SelectionStatus } from "@/types/selection";
import { Spinner } from "@/components/ui/spinner";

type TabType = "hr_assegnata" | "job_approvata";

export function SelectionsDeadlinesMonitor() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("hr_assegnata");

  const {
    data: selections,
    isLoading,
    error,
  } = useGetDeadlineMonitoringQuery();

  const { hrAssegnataSelections, jobApprovataSelections, allSelections } =
    useMemo(() => {
      if (!selections) {
        return {
          hrAssegnataSelections: [],
          jobApprovataSelections: [],
          allSelections: [],
        };
      }

      const withDeadlines = getSelectionsWithDeadlines(selections);

      return {
        hrAssegnataSelections: sortByUrgency(
          withDeadlines.filter((s) => s.stato === SelectionStatus.HR_ASSEGNATA)
        ),
        jobApprovataSelections: sortByUrgency(
          withDeadlines.filter(
            (s) => s.stato === SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE
          )
        ),
        allSelections: sortByUrgency(withDeadlines),
      };
    }, [selections]);

  const hasDeadlines = allSelections.length > 0;
  const hasHrAssegnata = hrAssegnataSelections.length > 0;
  const hasJobApprovata = jobApprovataSelections.length > 0;

  useMemo(() => {
    if (isExpanded && hasDeadlines) {
      if (activeTab === "hr_assegnata" && !hasHrAssegnata && hasJobApprovata) {
        setActiveTab("job_approvata");
      } else if (
        activeTab === "job_approvata" &&
        !hasJobApprovata &&
        hasHrAssegnata
      ) {
        setActiveTab("hr_assegnata");
      }
    }
  }, [isExpanded, hasDeadlines, hasHrAssegnata, hasJobApprovata, activeTab]);

  const countByUrgency = (list: SelectionWithDeadline[]) => {
    const result = { total: list.length, overdue: 0, critical: 0, warning: 0, ok: 0 };
    list.forEach((s) => {
      switch (s.deadlineInfo.urgencyLevel) {
        case UrgencyLevel.OVERDUE: result.overdue++; break;
        case UrgencyLevel.CRITICAL: result.critical++; break;
        case UrgencyLevel.WARNING: result.warning++; break;
        case UrgencyLevel.OK: result.ok++; break;
      }
    });
    return result;
  };

  const globalCounts = useMemo(() => countByUrgency(allSelections), [allSelections]);
  const hrCounts = useMemo(() => countByUrgency(hrAssegnataSelections), [hrAssegnataSelections]);
  const jobCounts = useMemo(() => countByUrgency(jobApprovataSelections), [jobApprovataSelections]);

  const badgeColor = !hasDeadlines
    ? "#10b981"
    : globalCounts.overdue > 0
      ? "#ef4444"
      : globalCounts.critical > 0
        ? "#f97316"
        : globalCounts.warning > 0
          ? "#f59e0b"
          : "#10b981";

  const activeSelections =
    activeTab === "hr_assegnata"
      ? hrAssegnataSelections
      : jobApprovataSelections;

  if (isLoading) {
    return (
      <div className="fixed bottom-0 right-6 z-50">
        <div className="bg-bigster-surface border border-bigster-border shadow-lg px-4 py-3 flex items-center gap-2">
          <Spinner className="h-4 w-4 text-bigster-text" />
          <span className="text-xs font-semibold text-bigster-text-muted">
            Scadenze...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 right-6 z-50">
        <div className="bg-bigster-surface border border-red-300 shadow-lg px-4 py-3 flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold text-red-700">
            Errore scadenze
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 z-50">
      <AnimatePresence mode="wait">
        {!isExpanded ? (

          <motion.button
            key="pill"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 bg-bigster-surface border border-bigster-border shadow-lg px-4 py-2.5 hover:shadow-xl transition-shadow group"
            style={{ borderLeftWidth: 3, borderLeftColor: badgeColor }}
          >
            <Clock
              className="h-4 w-4 flex-shrink-0"
              style={{ color: badgeColor }}
            />

            {hasDeadlines ? (
              <>

                <div className="flex items-center gap-1.5">
                  {globalCounts.overdue > 0 && (
                    <span
                      className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "#ef4444" }}
                    >
                      {globalCounts.overdue}
                    </span>
                  )}
                  {globalCounts.critical > 0 && (
                    <span
                      className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "#f97316" }}
                    >
                      {globalCounts.critical}
                    </span>
                  )}
                  {globalCounts.warning > 0 && (
                    <span
                      className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "#f59e0b" }}
                    >
                      {globalCounts.warning}
                    </span>
                  )}
                  {globalCounts.ok > 0 && (
                    <span
                      className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "#10b981" }}
                    >
                      {globalCounts.ok}
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-bigster-text">
                  {globalCounts.total} scadenz{globalCounts.total === 1 ? "a" : "e"}
                </span>
              </>
            ) : (
              <span className="text-xs font-semibold text-bigster-text-muted">
                Nessuna scadenza
              </span>
            )}

            <ChevronUp className="h-3.5 w-3.5 text-bigster-text-muted group-hover:text-bigster-text transition-colors" />
          </motion.button>
        ) : (

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-bigster-surface border border-bigster-border shadow-xl overflow-hidden"
            style={{
              width: 380,
              maxHeight: "calc(100vh - 8rem)",
              borderTopWidth: 3,
              borderTopColor: badgeColor,
            }}
          >

            <div className="px-4 py-3 bg-bigster-card-bg border-b border-bigster-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4" style={{ color: badgeColor }} />
                <div>
                  <h3 className="text-sm font-bold text-bigster-text leading-tight">
                    Scadenze
                  </h3>
                  <p className="text-[10px] text-bigster-text-muted">
                    {hasDeadlines
                      ? `${globalCounts.total} da monitorare`
                      : "Tutto in ordine"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">

                {hasDeadlines && (
                  <div className="flex items-center gap-1">
                    {globalCounts.overdue > 0 && (
                      <span
                        className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        {globalCounts.overdue}
                      </span>
                    )}
                    {globalCounts.critical > 0 && (
                      <span
                        className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: "#f97316" }}
                      >
                        {globalCounts.critical}
                      </span>
                    )}
                    {globalCounts.warning > 0 && (
                      <span
                        className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: "#f59e0b" }}
                      >
                        {globalCounts.warning}
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-bigster-muted-bg transition-colors"
                >
                  <X className="h-4 w-4 text-bigster-text-muted" />
                </button>
              </div>
            </div>

            {hasDeadlines ? (
              <>

                <div className="flex border-b border-bigster-border bg-bigster-surface">
                  <TabButton
                    active={activeTab === "hr_assegnata"}
                    disabled={!hasHrAssegnata}
                    onClick={() => setActiveTab("hr_assegnata")}
                    icon={Users}
                    label="HR Assegnata"
                    count={hrCounts.total}
                    counts={hrCounts}
                  />
                  <TabButton
                    active={activeTab === "job_approvata"}
                    disabled={!hasJobApprovata}
                    onClick={() => setActiveTab("job_approvata")}
                    icon={FileCheck}
                    label="Job Approvata"
                    count={jobCounts.total}
                    counts={jobCounts}
                  />
                </div>

                <div className="max-h-80 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeSelections.length > 0 ? (
                        <div className="divide-y divide-bigster-border">
                          {activeSelections.map((selection) => (
                            <SelectionDeadlineItem
                              key={selection.id}
                              selection={selection}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <p className="text-xs text-bigster-text-muted">
                            Nessuna scadenza in questa categoria
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            ) : (

              <div className="px-4 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-bigster-text mb-1">
                  Tutto in Ordine
                </p>
                <p className="text-xs text-bigster-text-muted leading-relaxed">
                  Nessuna selezione con scadenze attive.
                  <br />
                  Monitoraggio su{" "}
                  <span className="font-semibold">"HR Assegnata"</span> (3gg) e{" "}
                  <span className="font-semibold">"Job Approvata"</span> (60gg).
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  active,
  disabled,
  onClick,
  icon: Icon,
  label,
  count,
  counts,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count: number;
  counts: { overdue: number; critical: number; warning: number };
}) {
  const worstColor =
    counts.overdue > 0
      ? "#ef4444"
      : counts.critical > 0
        ? "#f97316"
        : counts.warning > 0
          ? "#f59e0b"
          : "#10b981";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-3 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all text-xs font-bold ${active
        ? "border-bigster-text text-bigster-text bg-bigster-card-bg"
        : "border-transparent text-bigster-text-muted hover:bg-bigster-muted-bg"
        } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {count > 0 && (
        <span
          className="w-4.5 h-4.5 px-1 flex items-center justify-center text-[9px] font-bold"
          style={{
            backgroundColor: active ? `${worstColor}15` : "#f5f5f7",
            color: active ? worstColor : "#666666",
            border: `1px solid ${active ? worstColor : "#d8d8d8"}`,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SelectionDeadlineItem({
  selection,
}: {
  selection: SelectionWithDeadline;
}) {
  const colors = getUrgencyColor(selection.deadlineInfo.urgencyLevel);
  const timeText = formatTimeRemaining(selection.deadlineInfo);

  const UrgencyIcon =
    selection.deadlineInfo.urgencyLevel === UrgencyLevel.OVERDUE
      ? XCircle
      : selection.deadlineInfo.urgencyLevel === UrgencyLevel.CRITICAL
        ? AlertTriangle
        : selection.deadlineInfo.urgencyLevel === UrgencyLevel.WARNING
          ? AlertCircle
          : CheckCircle2;

  return (
    <Link href={`/selezioni/${selection.id}`}>
      <div
        className="px-4 py-3 hover:bg-bigster-muted-bg transition-colors cursor-pointer group"
        style={{ borderLeftWidth: 3, borderLeftColor: colors.border }}
      >

        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-bigster-text line-clamp-1 group-hover:underline">
              {selection.titolo}
            </h4>
            <p className="text-[11px] text-bigster-text-muted line-clamp-1">
              {selection.company?.nome || "—"}
            </p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-bigster-text-muted flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-3">

          <div className="flex-1 h-1 bg-bigster-border overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, selection.deadlineInfo.progressPercentage)}%`,
                backgroundColor: colors.border,
              }}
            />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <UrgencyIcon
              className="h-3 w-3"
              style={{ color: colors.icon }}
            />
            <span
              className="text-[11px] font-bold"
              style={{ color: colors.text }}
            >
              {timeText}
            </span>
          </div>

          <span className="text-[10px] text-bigster-text-muted flex-shrink-0">
            {selection.deadlineInfo.daysElapsed}/{selection.deadlineInfo.deadlineDays}gg
          </span>
        </div>
      </div>
    </Link>
  );
}
