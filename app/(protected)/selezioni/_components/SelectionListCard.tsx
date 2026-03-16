"use client";

import { useMemo } from "react";
import {
    Building2,
    UserCheck,
    AlertCircle,
    Users,
    Star,
    FileCheck,
    Megaphone,
    Calendar,
    Briefcase,
    Package,
} from "lucide-react";
import { SelectionListItem, SelectionStatus, PackageType } from "@/types/selection";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    [SelectionStatus.FATTURA_AV_SALDATA]: {
        label: "Fattura Saldata",
        color: "#92400e",
        bgColor: "#fef3c7",
        borderColor: "#fcd34d",
    },
    [SelectionStatus.HR_ASSEGNATA]: {
        label: "HR Assegnata",
        color: "#1e40af",
        bgColor: "#dbeafe",
        borderColor: "#93c5fd",
    },
    [SelectionStatus.PRIMA_CALL_COMPLETATA]: {
        label: "Prima Call",
        color: "#5b21b6",
        bgColor: "#ede9fe",
        borderColor: "#c4b5fd",
    },
    [SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE]: {
        label: "Job in Approv.",
        color: "#9a3412",
        bgColor: "#ffedd5",
        borderColor: "#fdba74",
    },
    [SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE]: {
        label: "Job Approvata",
        color: "#166534",
        bgColor: "#dcfce7",
        borderColor: "#86efac",
    },
    [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO]: {
        label: "Bozza CEO",
        color: "#9a3412",
        bgColor: "#ffedd5",
        borderColor: "#fdba74",
    },
    [SelectionStatus.ANNUNCIO_APPROVATO]: {
        label: "Annuncio OK",
        color: "#0e7490",
        bgColor: "#cffafe",
        borderColor: "#67e8f9",
    },
    [SelectionStatus.ANNUNCIO_PUBBLICATO]: {
        label: "Pubblicato",
        color: "#0e7490",
        bgColor: "#cffafe",
        borderColor: "#67e8f9",
    },
    [SelectionStatus.CANDIDATURE_RICEVUTE]: {
        label: "Candidature",
        color: "#6d28d9",
        bgColor: "#f5f3ff",
        borderColor: "#c4b5fd",
    },
    [SelectionStatus.COLLOQUI_IN_CORSO]: {
        label: "Colloqui",
        color: "#4338ca",
        bgColor: "#eef2ff",
        borderColor: "#a5b4fc",
    },
    [SelectionStatus.CANDIDATO_IN_PROVA]: {
        label: "Candidato in Prova",
        color: "#0f766e",
        bgColor: "#f0fdfa",
        borderColor: "#5eead4",
    },
    [SelectionStatus.SELEZIONI_IN_SOSTITUZIONE]: {
        label: "Sostituzione",
        color: "#c2410c",
        bgColor: "#fff7ed",
        borderColor: "#fb923c",
    },
    [SelectionStatus.CHIUSA]: {
        label: "Chiusa",
        color: "#166534",
        bgColor: "#f0fdf4",
        borderColor: "#86efac",
    },
    [SelectionStatus.ANNULLATA]: {
        label: "Annullata",
        color: "#991b1b",
        bgColor: "#fef2f2",
        borderColor: "#fca5a5",
    },
};

function getTopBarColor(stato: SelectionStatus): string {
    if (stato === SelectionStatus.CHIUSA) return "#22c55e";
    if (stato === SelectionStatus.ANNULLATA) return "#ef4444";
    return "#fde01c";
}

interface SelectionListCardProps {
    selection: SelectionListItem;
    onClick: () => void;
}

export function SelectionListCard({ selection, onClick }: SelectionListCardProps) {
    const statusConfig = STATUS_CONFIG[selection.stato] ?? {
        label: selection.stato,
        color: "#6c4e06",
        bgColor: "#f5f5f7",
        borderColor: "#d8d8d8",
    };

    const topBarColor = getTopBarColor(selection.stato);

    const formattedDate = useMemo(() => {
        try {
            return new Date(selection.data_creazione).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "—";
        }
    }, [selection.data_creazione]);

    const totalApplications = selection.totalApplications ?? 0;
    const shortlistCount = selection.shortlistCount ?? selection._count?.rosa_candidati ?? 0;
    const annunciCount = selection._count?.annunci ?? 0;
    const hasJobCollection = selection.hasJobCollection ?? false;

    return (
        <div
            onClick={onClick}
            className="bg-bigster-surface border border-bigster-border hover:border-bigster-text hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >

            <div
                className="h-1 w-full"
                style={{ backgroundColor: topBarColor }}
            />

            <div className="p-4 space-y-3">

                <div className="flex items-center justify-between gap-2">
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wide truncate"
                        style={{
                            color: statusConfig.color,
                            backgroundColor: statusConfig.bgColor,
                            borderColor: statusConfig.borderColor,
                        }}
                    >
                        {statusConfig.label}
                    </span>
                    <span className="text-[10px] font-semibold text-bigster-text-muted flex items-center gap-1 flex-shrink-0">
                        <Package className="h-3 w-3" />
                        {selection.pacchetto}
                    </span>
                </div>

                <h3 className="text-sm font-bold text-bigster-text leading-tight line-clamp-2 group-hover:text-bigster-primary-text transition-colors">
                    {selection.titolo}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                        {selection.company?.nome ?? "—"}
                        {selection.company?.citta && (
                            <span className="text-bigster-text-muted/60"> — {selection.company.citta}</span>
                        )}
                    </span>
                </div>

                {selection.figura_ricercata && (
                    <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{selection.figura_ricercata}</span>
                    </div>
                )}

                <div>
                    {selection.risorsa_umana ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCheck className="h-3 w-3" />
                            {selection.risorsa_umana.nome} {selection.risorsa_umana.cognome}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200">
                            <AlertCircle className="h-3 w-3" />
                            HR non assegnata
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-bigster-border">

                    <div className="flex items-center gap-1 text-[10px] text-bigster-text-muted" title="Candidature">
                        <Users className="h-3 w-3" />
                        <span className="font-semibold">{totalApplications}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-bigster-text-muted" title="Rosa candidati">
                        <Star className="h-3 w-3" />
                        <span className="font-semibold">{shortlistCount}</span>
                    </div>

                    {hasJobCollection && (
                        <div className="flex items-center gap-1 text-[10px] text-green-600" title="Raccolta Job presente">
                            <FileCheck className="h-3 w-3" />
                        </div>
                    )}

                    {annunciCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-bigster-text-muted" title="Annunci">
                            <Megaphone className="h-3 w-3" />
                            <span className="font-semibold">{annunciCount}</span>
                        </div>
                    )}

                    <div className="ml-auto flex items-center gap-1 text-[10px] text-bigster-text-muted">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </div>
                </div>
            </div>
        </div>
    );
}
