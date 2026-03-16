import { SelectionStatus } from "@/types/selection";

export const DEADLINE_CONFIG = {
  [SelectionStatus.HR_ASSEGNATA]: {
    days: 3,
    label: "Prima Call",
    nextState: SelectionStatus.PRIMA_CALL_COMPLETATA,
  },
  [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: {
    days: 60,
    label: "Avanzamento Processo",
    nextState: SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
  },
} as const;

export type DeadlineStatus =
  | SelectionStatus.HR_ASSEGNATA
  | SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE;

export enum UrgencyLevel {
  OK = "OK",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
  OVERDUE = "OVERDUE",
}

export interface DeadlineInfo {
  status: DeadlineStatus;
  statusLabel: string;
  dateEntered: Date;
  deadlineDays: number;
  deadlineDate: Date;
  daysElapsed: number;
  daysRemaining: number;
  hoursRemaining: number;
  progressPercentage: number;
  urgencyLevel: UrgencyLevel;
  isOverdue: boolean;
  nextStateLabel: string;
}

export interface SelectionWithDeadline {
  id: number;
  titolo: string;
  stato: SelectionStatus;
  company?: {
    nome: string;
  };
  storico_stati?: Array<{
    stato_nuovo: SelectionStatus;
    data_cambio: string;
  }>;
  deadlineInfo: DeadlineInfo;
}

export function hasDeadline(status: SelectionStatus): status is DeadlineStatus {
  return status in DEADLINE_CONFIG;
}

export function getStateEntryDate(selection: {
  stato: SelectionStatus;
  storico_stati?: Array<{
    stato_nuovo: SelectionStatus;
    data_cambio: string;
  }>;
}): Date | null {
  if (!selection.storico_stati || selection.storico_stati.length === 0) {
    return null;
  }

  const stateHistory = [...selection.storico_stati]
    .reverse()
    .find((h) => h.stato_nuovo === selection.stato);

  if (!stateHistory) {
    return null;
  }

  return new Date(stateHistory.data_cambio);
}

export function calculateDeadlineInfo(selection: {
  stato: SelectionStatus;
  storico_stati?: Array<{
    stato_nuovo: SelectionStatus;
    data_cambio: string;
  }>;
}): DeadlineInfo | null {
  if (!hasDeadline(selection.stato)) {
    return null;
  }

  const dateEntered = getStateEntryDate(selection);
  if (!dateEntered) {
    return null;
  }

  const config = DEADLINE_CONFIG[selection.stato];
  const now = new Date();

  const deadlineDate = new Date(dateEntered);
  deadlineDate.setDate(deadlineDate.getDate() + config.days);

  const msElapsed = now.getTime() - dateEntered.getTime();
  const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));

  const msRemaining = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60));

  const progressPercentage = Math.min(
    100,
    Math.max(0, (daysElapsed / config.days) * 100)
  );

  const isOverdue = daysRemaining < 0;
  let urgencyLevel: UrgencyLevel;

  if (isOverdue) {
    urgencyLevel = UrgencyLevel.OVERDUE;
  } else if (progressPercentage >= 66) {
    urgencyLevel = UrgencyLevel.CRITICAL;
  } else if (progressPercentage >= 33) {
    urgencyLevel = UrgencyLevel.WARNING;
  } else {
    urgencyLevel = UrgencyLevel.OK;
  }

  const nextStateLabels: Record<SelectionStatus, string> = {
    [SelectionStatus.FATTURA_AV_SALDATA]: "Fattura AV Saldata",
    [SelectionStatus.HR_ASSEGNATA]: "HR Assegnata",
    [SelectionStatus.PRIMA_CALL_COMPLETATA]: "Prima Call Completata",
    [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]:
      "Raccolta Job in Approvazione",
    [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: "Raccolta Job Approvata",
    [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]:
      "Bozza Annuncio in Approvazione CEO",
    [SelectionStatus.ANNUNCIO_APPROVATO]: "Annuncio Approvato",
    [SelectionStatus.ANNUNCIO_PUBBLICATO]: "Annuncio Pubblicato",
    [SelectionStatus.CANDIDATURE_RICEVUTE]: "Candidature Ricevute",
    [SelectionStatus.COLLOQUI_IN_CORSO]: "Colloqui in Corso",
    [SelectionStatus.CANDIDATO_IN_PROVA]: "Candidato in Prova",
    [SelectionStatus.SELEZIONI_IN_SOSTITUZIONE]: "Selezioni in Sostituzione",
    [SelectionStatus.CHIUSA]: "Chiusa",
    [SelectionStatus.ANNULLATA]: "Annullata",
  };

  return {
    status: selection.stato,
    statusLabel: nextStateLabels[selection.stato],
    dateEntered,
    deadlineDays: config.days,
    deadlineDate,
    daysElapsed,
    daysRemaining,
    hoursRemaining,
    progressPercentage,
    urgencyLevel,
    isOverdue,
    nextStateLabel: nextStateLabels[config.nextState],
  };
}

export function getSelectionsWithDeadlines(
  selections: Array<{
    id: number;
    titolo: string;
    stato: SelectionStatus;
    company?: {
      nome: string;
    };
    storico_stati?: Array<{
      stato_nuovo: SelectionStatus;
      data_cambio: string;
    }>;
  }>
): SelectionWithDeadline[] {
  return selections
    .filter((s) => hasDeadline(s.stato))
    .map((s) => ({
      ...s,
      deadlineInfo: calculateDeadlineInfo(s)!,
    }))
    .filter((s) => s.deadlineInfo !== null);
}

export function formatTimeRemaining(deadlineInfo: DeadlineInfo): string {
  if (deadlineInfo.isOverdue) {
    const daysOverdue = Math.abs(deadlineInfo.daysRemaining);
    if (daysOverdue === 1) {
      return "Scaduto da 1 giorno";
    }
    return `Scaduto da ${daysOverdue} giorni`;
  }

  if (deadlineInfo.daysRemaining === 0) {
    if (deadlineInfo.hoursRemaining <= 1) {
      return "Scade tra meno di 1 ora";
    }
    return `Scade tra ${deadlineInfo.hoursRemaining} ore`;
  }

  if (deadlineInfo.daysRemaining === 1) {
    return "Scade domani";
  }

  return `Scade tra ${deadlineInfo.daysRemaining} giorni`;
}

export function getUrgencyColor(urgency: UrgencyLevel): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (urgency) {
    case UrgencyLevel.OK:
      return {
        bg: "#d1fae5",
        border: "#10b981",
        text: "#065f46",
        icon: "#10b981",
      };
    case UrgencyLevel.WARNING:
      return {
        bg: "#fef3c7",
        border: "#f59e0b",
        text: "#92400e",
        icon: "#f59e0b",
      };
    case UrgencyLevel.CRITICAL:
      return {
        bg: "#ffedd5",
        border: "#f97316",
        text: "#9a3412",
        icon: "#f97316",
      };
    case UrgencyLevel.OVERDUE:
      return {
        bg: "#fee2e2",
        border: "#ef4444",
        text: "#991b1b",
        icon: "#ef4444",
      };
  }
}

export function sortByUrgency(
  selections: SelectionWithDeadline[]
): SelectionWithDeadline[] {
  const urgencyOrder = {
    [UrgencyLevel.OVERDUE]: 0,
    [UrgencyLevel.CRITICAL]: 1,
    [UrgencyLevel.WARNING]: 2,
    [UrgencyLevel.OK]: 3,
  };

  return [...selections].sort((a, b) => {
    const urgencyDiff =
      urgencyOrder[a.deadlineInfo.urgencyLevel] -
      urgencyOrder[b.deadlineInfo.urgencyLevel];

    if (urgencyDiff !== 0) {
      return urgencyDiff;
    }

    return a.deadlineInfo.hoursRemaining - b.deadlineInfo.hoursRemaining;
  });
}
