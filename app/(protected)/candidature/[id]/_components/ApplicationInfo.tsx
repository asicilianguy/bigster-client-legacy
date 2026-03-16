"use client";

import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Users,
    Home,
    Car,
    Briefcase,
    Clock,
    Award,
    FileCheck,
    Plane,
    CreditCard,
    Cake,
} from "lucide-react";
import {
    AttestatoAsoStatus,
    getAttestatoAsoLabel,
    calculateAge,
} from "@/types/application";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ApplicationInfoProps {
    application: {
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
        partita_iva?: boolean | null;
        attestato_aso?: AttestatoAsoStatus | null;
        disponibilita_immediata?: boolean | null;
        preavviso_settimane?: number | null;

        titoli_studio?: string | null;
        data_creazione: string;
    };
}

const getSessoLabel = (sesso?: string | null): string => {
    switch (sesso) {
        case "M":
            return "Maschio";
        case "F":
            return "Femmina";
        case "ALTRO":
            return "Altro";
        case "NON_SPECIFICATO":
            return "Non specificato";
        default:
            return "Non indicato";
    }
};

const formatLocation = (
    citta: string | null,
    provincia: string | null,
    regione: string | null
): string | null => {
    const parts = [citta, provincia, regione].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
};

const hasDifferentDomicilio = (app: {
    citta?: string | null;
    provincia?: string | null;
    regione?: string | null;
    domicilio_citta?: string | null;
    domicilio_provincia?: string | null;
    domicilio_regione?: string | null;
}): boolean => {

    if (!app.domicilio_citta && !app.domicilio_provincia && !app.domicilio_regione) {
        return false;
    }

    return (
        app.domicilio_citta !== app.citta ||
        app.domicilio_provincia !== app.provincia ||
        app.domicilio_regione !== app.regione
    );
};

const InfoRow = ({
    icon: Icon,
    label,
    value,
    highlight = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
    highlight?: boolean;
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-bigster-border last:border-b-0">
        <Icon
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${highlight ? "text-bigster-primary" : "text-bigster-text-muted"
                }`}
        />
        <div className="flex-1">
            <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-0.5">
                {label}
            </p>
            <p className={`text-sm ${highlight ? "font-semibold text-bigster-text" : "text-bigster-text"}`}>
                {value || (
                    <span className="italic text-bigster-text-muted">Non indicato</span>
                )}
            </p>
        </div>
    </div>
);

const BooleanBadge = ({
    value,
    trueLabel = "Sì",
    falseLabel = "No",
}: {
    value: boolean | null | undefined;
    trueLabel?: string;
    falseLabel?: string;
}) => {
    if (value === null || value === undefined) {
        return <span className="italic text-bigster-text-muted">Non indicato</span>;
    }
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${value
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
        >
            {value ? trueLabel : falseLabel}
        </span>
    );
};

export function ApplicationInfo({ application }: ApplicationInfoProps) {

    const age = application.birthdate
        ? calculateAge(application.birthdate)
        : application.eta;

    const formattedBirthdate = application.birthdate
        ? format(new Date(application.birthdate), "d MMMM yyyy", { locale: it })
        : null;

    const residenzaCompleta = formatLocation(
        application.citta || null,
        application.provincia || null,
        application.regione || null
    );

    const domicilioCompleto = hasDifferentDomicilio(application)
        ? formatLocation(
            application.domicilio_citta || null,
            application.domicilio_provincia || null,
            application.domicilio_regione || null
        )
        : null;

    const disponibilitaLabel = application.disponibilita_immediata
        ? "Immediata"
        : application.preavviso_settimane
            ? `Preavviso di ${application.preavviso_settimane} settiman${application.preavviso_settimane === 1 ? "a" : "e"
            }`
            : null;

    return (
        <div className="space-y-6">

            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Dati Personali
                    </h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">

                        <div>
                            <InfoRow
                                icon={User}
                                label="Nome Completo"
                                value={`${application.nome} ${application.cognome}`}
                            />
                            <InfoRow icon={Mail} label="Email" value={application.email} />
                            <InfoRow
                                icon={Phone}
                                label="Telefono"
                                value={application.telefono}
                            />
                            <InfoRow
                                icon={Users}
                                label="Genere"
                                value={getSessoLabel(application.sesso)}
                            />
                        </div>

                        <div>

                            <InfoRow
                                icon={Cake}
                                label="Data di Nascita"
                                value={formattedBirthdate}
                            />

                            <InfoRow
                                icon={Calendar}
                                label="Età"
                                value={age ? `${age} anni` : null}
                            />
                            <InfoRow
                                icon={GraduationCap}
                                label="Titolo di Studio"
                                value={application.titoli_studio}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Residenza e Domicilio
                    </h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">

                        <div>
                            <h3 className="text-sm font-semibold text-bigster-text mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-bigster-text-muted" />
                                Residenza
                            </h3>
                            {residenzaCompleta ? (
                                <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                                    <p className="text-sm text-bigster-text">{residenzaCompleta}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-bigster-text-muted italic">
                                    Non indicata
                                </p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-bigster-text mb-3 flex items-center gap-2">
                                <Home className="h-4 w-4 text-bigster-text-muted" />
                                Domicilio
                                {domicilioCompleto && (
                                    <span className="text-xs font-normal text-bigster-text-muted">
                                        (diverso da residenza)
                                    </span>
                                )}
                            </h3>
                            {domicilioCompleto ? (
                                <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                                    <p className="text-sm text-bigster-text">{domicilioCompleto}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-bigster-text-muted italic">
                                    Coincide con residenza
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Informazioni Professionali
                    </h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Car className="h-4 w-4 text-bigster-text-muted" />
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Automunito
                                </p>
                            </div>
                            <BooleanBadge value={application.automunito} />
                        </div>

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Plane className="h-4 w-4 text-bigster-text-muted" />
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Trasferte
                                </p>
                            </div>
                            <BooleanBadge
                                value={application.disponibilita_trasferte}
                                trueLabel="Disponibile"
                                falseLabel="Non disponibile"
                            />
                        </div>

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-bigster-text-muted" />
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Partita IVA
                                </p>
                            </div>
                            <BooleanBadge
                                value={application.partita_iva}
                                trueLabel="Possiede"
                                falseLabel="Non possiede"
                            />
                        </div>

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="h-4 w-4 text-bigster-text-muted" />
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Attestato ASO
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.attestato_aso === AttestatoAsoStatus.SI
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : application.attestato_aso === AttestatoAsoStatus.IN_CORSO
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : application.attestato_aso === AttestatoAsoStatus.NO
                                            ? "bg-gray-50 text-gray-600 border-gray-200"
                                            : "bg-gray-50 text-gray-500 border-gray-200"
                                    }`}
                            >
                                {getAttestatoAsoLabel(application.attestato_aso || null)}
                            </span>
                        </div>

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border col-span-2 md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-bigster-text-muted" />
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Disponibilità Lavorativa
                                </p>
                            </div>
                            {disponibilitaLabel ? (
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.disponibilita_immediata
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        }`}
                                >
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    {disponibilitaLabel}
                                </span>
                            ) : (
                                <span className="italic text-sm text-bigster-text-muted">
                                    Non indicata
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
