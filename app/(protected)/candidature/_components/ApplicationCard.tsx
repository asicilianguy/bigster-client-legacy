"use client";

import Link from "next/link";
import {
    Phone,
    MapPin,
    FileText,
    Calendar,
    Building2,
    Briefcase,
    ClipboardCheck,
    CheckCircle,
    Clock,
    PlayCircle,
    XCircle,
    Ban,
    Car,
    Plane,
    Cake,
    MessageSquare,
    EyeOff,
} from "lucide-react";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { calculateAge } from "@/types/application";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Star } from "lucide-react";

interface ApplicationCardProps {
    isInRosa?: boolean;
    application: {
        id: number;
        nome: string;
        cognome: string;
        email: string;
        telefono?: string | null;
        sesso?: string | null;
        birthdate?: string | null;
        eta?: number | null;
        regione?: string | null;
        provincia?: string | null;
        citta?: string | null;
        domicilio_regione?: string | null;
        domicilio_provincia?: string | null;
        domicilio_citta?: string | null;
        automunito?: boolean | null;
        disponibilita_trasferte?: boolean | null;
        disponibilita_immediata?: boolean | null;
        titoli_studio?: string | null;
        cv_s3_key?: string | null;
        stato: string;
        note?: string | null;
        read?: boolean | null;
        data_creazione: string;
        annuncio?: {
            id: number;
            piattaforma?: string | null;
            selezione?: {
                id: number;
                titolo: string;
                figura_ricercata?: string | null;
                company?: {
                    id: number;
                    nome: string;
                };
            };
        };
        test?: {
            id: number;
            completato_il?: string | null;
            punteggio_totale?: number | null;
        } | null;
        test_bigster?: {
            id: number;
            status: string;
            completed: boolean;
            completedAt?: string | null;
            evaluation?: string | null;
            questionProgress: number;
        } | null;
        colloqui?: Array<{
            id: number;
            tipo: string;
            esito?: string | null;
        }>;
    };
}

const getTestStatusConfig = (status: string) => {
    switch (status) {
        case "PENDING":
            return { label: "In attesa", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock };
        case "IN_PROGRESS":
            return { label: "In corso", color: "bg-blue-100 text-blue-700 border-blue-300", icon: PlayCircle };
        case "COMPLETED":
            return { label: "Completato", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle };
        case "EXPIRED":
            return { label: "Scaduto", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle };
        case "CANCELLED":
            return { label: "Annullato", color: "bg-gray-100 text-gray-700 border-gray-300", icon: Ban };
        default:
            return { label: status, color: "bg-gray-100 text-gray-700 border-gray-300", icon: Clock };
    }
};

const getEvaluationConfig = (evaluation: string | null) => {
    switch (evaluation) {
        case "IDONEO":
            return { label: "✔ Idoneo", color: "text-green-700", bg: "bg-green-50 border-green-200" };
        case "PARZIALMENTE_IDONEO":
            return { label: "~ Parziale", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" };
        case "NON_IDONEO":
            return { label: "✗ Non Idoneo", color: "text-red-700", bg: "bg-red-50 border-red-200" };
        default:
            return null;
    }
};

function getTopBarColor(application: ApplicationCardProps["application"]): string {
    const testStatus = application.test_bigster?.status;
    if (testStatus === "COMPLETED") return "bg-green-500";
    if (testStatus === "IN_PROGRESS") return "bg-yellow-500";
    if (testStatus === "EXPIRED") return "bg-red-500";

    switch (application.stato) {
        case "IN_CORSO":
            return "bg-blue-500";
        case "ASSUNTO":
            return "bg-emerald-600";
        case "SCARTATO":
            return "bg-red-500";
        case "RITIRATO":
            return "bg-gray-400";
        default:
            return "bg-gray-400";
    }
}

export function ApplicationCard({ application, isInRosa = false }: ApplicationCardProps) {
    const fullName = `${application.nome} ${application.cognome}`;

    const age = application.birthdate
        ? calculateAge(application.birthdate)
        : application.eta;

    const hasDomicilioDiverso =
        !!application.domicilio_citta || !!application.domicilio_provincia || !!application.domicilio_regione;

    const location = hasDomicilioDiverso
        ? [application.domicilio_citta, application.domicilio_provincia].filter(Boolean).join(", ")
        : [application.citta, application.provincia || application.regione].filter(Boolean).join(", ");

    const formattedDate = format(new Date(application.data_creazione), "d MMM", { locale: it });

    const selezione = application.annuncio?.selezione;
    const companyName = selezione?.company?.nome;
    const selezioneTitolo = selezione?.titolo;
    const figuraRicercata = selezione?.figura_ricercata;

    const testBigster = application.test_bigster;
    const hasTest = !!testBigster;
    const testCompleted = testBigster?.completed ?? false;
    const testStatus = testBigster?.status;
    const testStatusConfig = testStatus ? getTestStatusConfig(testStatus) : null;
    const evaluationConfig = testBigster?.evaluation
        ? getEvaluationConfig(testBigster.evaluation)
        : null;

    const colloquiCount = application.colloqui?.length ?? 0;

    const topBarColor = getTopBarColor(application);
    const hasProfessionalBadges =
        application.automunito || application.disponibilita_trasferte || application.disponibilita_immediata;
    const isUnread = application.read === false;

    return (
        <Link
            href={`/candidature/${application.id}`}
            className={`bg-bigster-surface border hover:border-bigster-text hover:shadow-sm transition-all cursor-pointer group flex flex-col ${isInRosa
                ? "border-amber-300 border-l-4 border-l-amber-500"
                : isUnread
                    ? "border-blue-300"
                    : "border-bigster-border"
                }`}
        >

            <div className={`h-1 w-full ${topBarColor}`} />

            <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        {isUnread && (
                            <span
                                className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                                title="Da leggere"
                            />
                        )}
                        {isInRosa && (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                        <p className="font-semibold text-sm text-bigster-text truncate">
                            {fullName}
                        </p>
                    </div>
                    <p className="text-xs text-bigster-text-muted truncate mt-0.5">
                        {application.email}
                    </p>
                </div>

                <ApplicationStatusBadge status={application.stato} size="sm" />
            </div>

            <div className="px-4 pb-2 space-y-1.5">

                {(companyName || selezioneTitolo) && (
                    <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                        {companyName && (
                            <>
                                <Building2 className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate font-medium text-bigster-text">{companyName}</span>
                            </>
                        )}
                        {companyName && selezioneTitolo && (
                            <span className="text-bigster-border mx-0.5">·</span>
                        )}
                        {selezioneTitolo && (
                            <>
                                <Briefcase className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{figuraRicercata || selezioneTitolo}</span>
                            </>
                        )}
                    </div>
                )}

                {(application.telefono || location) && (
                    <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                        {application.telefono && (
                            <>
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{application.telefono}</span>
                            </>
                        )}
                        {application.telefono && location && (
                            <span className="text-bigster-border mx-0.5">·</span>
                        )}
                        {location && (
                            <>
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                    {location}
                                    {hasDomicilioDiverso && (
                                        <span className="text-[10px] ml-0.5">(dom.)</span>
                                    )}
                                </span>
                            </>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-bigster-text-muted">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>{formattedDate}</span>
                        {age && (
                            <>
                                <span className="text-bigster-border mx-0.5">·</span>
                                <Cake className="h-3 w-3 flex-shrink-0" />
                                <span>{age} anni</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {application.cv_s3_key && (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                                <FileText className="h-3 w-3" />
                                CV
                            </span>
                        )}
                        {colloquiCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-purple-600">
                                <MessageSquare className="h-3 w-3" />
                                {colloquiCount}
                            </span>
                        )}
                    </div>
                </div>

                {hasProfessionalBadges && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {application.automunito && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600">
                                <Car className="h-3 w-3" />
                                Automunito
                            </span>
                        )}
                        {application.disponibilita_trasferte && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-600">
                                <Plane className="h-3 w-3" />
                                Trasferte
                            </span>
                        )}
                        {application.disponibilita_immediata && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-green-600">
                                <Clock className="h-3 w-3" />
                                Disponibile
                            </span>
                        )}
                    </div>
                )}
            </div>

            {hasTest && !testCompleted && testBigster.questionProgress > 0 && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-bigster-border overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 transition-all"
                                style={{ width: `${testBigster.questionProgress}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-bigster-text">
                            {testBigster.questionProgress}%
                        </span>
                    </div>
                </div>
            )}

            {hasTest && testStatusConfig && (
                <div className="px-4 py-2 border-t border-bigster-border/60 bg-bigster-muted-bg flex items-center gap-2 flex-wrap mt-auto">
                    <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium border ${testStatusConfig.color}`}
                    >
                        <testStatusConfig.icon className="h-3 w-3" />
                        {testStatusConfig.label}
                    </span>

                    {testCompleted && evaluationConfig && (
                        <span
                            className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium border ${evaluationConfig.bg} ${evaluationConfig.color}`}
                        >
                            {evaluationConfig.label}
                        </span>
                    )}

                    {isUnread && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium bg-blue-50 border border-blue-300 text-blue-700">
                            <EyeOff className="h-3 w-3" />
                            Da leggere
                        </span>
                    )}

                    {application.test?.punteggio_totale != null && (
                        <>
                            <div className="flex-1" />
                            <span className="text-[11px] font-medium text-bigster-text">
                                {application.test.punteggio_totale} pt
                            </span>
                        </>
                    )}
                </div>
            )}

            {!hasTest && (application.note || isUnread) && (
                <div className="px-4 py-1.5 border-t border-bigster-border/60 bg-bigster-muted-bg mt-auto flex items-center gap-2 flex-wrap">
                    {isUnread && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium bg-blue-50 border border-blue-300 text-blue-700">
                            <EyeOff className="h-3 w-3" />
                            Da leggere
                        </span>
                    )}
                    {application.note && (
                        <p className="text-[11px] text-bigster-text-muted truncate flex-1">
                            <span className="font-semibold">Note:</span> {application.note}
                        </p>
                    )}
                </div>
            )}

            {hasTest && application.note && (
                <div className="px-4 py-1.5 border-t border-bigster-border/60">
                    <p className="text-[11px] text-bigster-text-muted truncate">
                        <span className="font-semibold">Note:</span> {application.note}
                    </p>
                </div>
            )}
        </Link>
    );
}
