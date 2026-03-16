"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/bigster/dialog-custom";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  User,
  GraduationCap,
  Building2,
  Edit,
  Home,
  Car,
  Plane,
  Clock,
  CreditCard,
  Award,
  Cake,
} from "lucide-react";
import { ApplicationListItem } from "@/lib/redux/features/applications/applicationsApiSlice";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { CvDownloadButton } from "./CvDownloadButton";
import {
  Gender,
  AttestatoAsoStatus,
  calculateAge,
  getAttestatoAsoLabel,
  ApplicationStatus,
} from "@/types/application";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type ApplicationWithDetails = ApplicationListItem | {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string | null;
  sesso?: Gender | string | null;
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
  cv_s3_key?: string | null;
  stato: string;
  note?: string | null;
  data_creazione: string;
  data_modifica: string;
  annuncio?: {
    selezione?: {
      titolo: string;
      figura_ricercata?: string | null;
      company?: {
        id: number;
        nome: string;
        citta?: string | null;
      };
    };
  };
};

interface ApplicationDetailDialogProps {
  application: ApplicationWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeStatus?: () => void;
}

const genderLabels: Record<string, string> = {
  M: "Maschio",
  F: "Femmina",
  ALTRO: "Altro",
  NON_SPECIFICATO: "Non specificato",
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

export function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
  onChangeStatus,
}: ApplicationDetailDialogProps) {
  const fullName = `${application.nome} ${application.cognome}`;

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

  const locationFallback = residenzaCompleta;

  const formattedCreationDate = format(
    new Date(application.data_creazione),
    "d MMMM yyyy 'alle' HH:mm",
    { locale: it }
  );

  const formattedModificationDate = format(
    new Date(application.data_modifica),
    "d MMMM yyyy 'alle' HH:mm",
    { locale: it }
  );

  const disponibilitaLabel = application.disponibilita_immediata
    ? "Immediata"
    : application.preavviso_settimane
      ? `Preavviso di ${application.preavviso_settimane} settiman${application.preavviso_settimane === 1 ? "a" : "e"
      }`
      : null;

  const annuncio = application.annuncio;
  const selezione = annuncio?.selezione;
  const company = selezione?.company;

  const companyCitta = company && 'citta' in company ? company.citta : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-2xl max-h-[85vh] overflow-y-auto shadow-lg">
        <DialogHeader
          title="Dettaglio Candidatura"
          onClose={() => onOpenChange(false)}
        />

        <div className="space-y-6 p-5 pt-0">

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-bigster-text">{fullName}</h3>
              <p className="text-xs text-bigster-text-muted">
                Candidatura #{application.id}
              </p>
            </div>
            <ApplicationStatusBadge status={application.stato as ApplicationStatus} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-bigster-text flex items-center gap-2">
              <User className="h-4 w-4" />
              Informazioni Candidato
            </h3>
            <div className="p-4 bg-bigster-card-bg border border-bigster-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm text-bigster-text flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-bigster-text-muted" />
                    <a
                      href={`mailto:${application.email}`}
                      className="hover:underline"
                    >
                      {application.email}
                    </a>
                  </p>
                </div>

                {application.telefono && (
                  <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                      Telefono
                    </p>
                    <p className="text-sm text-bigster-text flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-bigster-text-muted" />
                      <a
                        href={`tel:${application.telefono}`}
                        className="hover:underline"
                      >
                        {application.telefono}
                      </a>
                    </p>
                  </div>
                )}

                {application.sesso && (
                  <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                      Genere
                    </p>
                    <p className="text-sm text-bigster-text">
                      {genderLabels[application.sesso as string] ||
                        application.sesso}
                    </p>
                  </div>
                )}

                {formattedBirthdate && (
                  <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                      Data di Nascita
                    </p>
                    <p className="text-sm text-bigster-text flex items-center gap-1.5">
                      <Cake className="h-4 w-4 text-bigster-text-muted" />
                      {formattedBirthdate}
                    </p>
                  </div>
                )}

                {age && (
                  <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                      Età
                    </p>
                    <p className="text-sm text-bigster-text">{age} anni</p>
                  </div>
                )}

                {application.titoli_studio && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                      Titoli di Studio
                    </p>
                    <p className="text-sm text-bigster-text flex items-start gap-1.5">
                      <GraduationCap className="h-4 w-4 text-bigster-text-muted mt-0.5" />
                      {application.titoli_studio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(locationFallback || domicilioCompleto) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-bigster-text flex items-center gap-2">
                <Home className="h-4 w-4" />
                Residenza e Domicilio
              </h3>
              <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                      Residenza
                    </p>
                    <p className="text-sm text-bigster-text flex items-start gap-1.5">
                      <MapPin className="h-4 w-4 text-bigster-text-muted mt-0.5" />
                      {residenzaCompleta || "Non indicata"}
                    </p>
                  </div>

                  {domicilioCompleto && (
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1">
                        Domicilio
                      </p>
                      <p className="text-sm text-bigster-text flex items-start gap-1.5">
                        <Home className="h-4 w-4 text-bigster-text-muted mt-0.5" />
                        {domicilioCompleto}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(application.automunito !== null ||
            application.disponibilita_trasferte !== null ||
            application.partita_iva !== null ||
            application.attestato_aso !== null ||
            application.disponibilita_immediata !== null) && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-bigster-text flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informazioni Professionali
                </h3>
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                  <div className="grid grid-cols-3 gap-4">

                    {application.automunito !== null && (
                      <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          Automunito
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.automunito
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                        >
                          {application.automunito ? "Sì" : "No"}
                        </span>
                      </div>
                    )}

                    {application.disponibilita_trasferte !== null && (
                      <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Plane className="h-3 w-3" />
                          Trasferte
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.disponibilita_trasferte
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                        >
                          {application.disponibilita_trasferte
                            ? "Disponibile"
                            : "Non disponibile"}
                        </span>
                      </div>
                    )}

                    {application.partita_iva !== null && (
                      <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          Partita IVA
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.partita_iva
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                        >
                          {application.partita_iva ? "Possiede" : "Non possiede"}
                        </span>
                      </div>
                    )}

                    {application.attestato_aso !== null && (
                      <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Attestato ASO
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.attestato_aso === AttestatoAsoStatus.SI
                            ? "bg-green-50 text-green-700 border-green-200"
                            : application.attestato_aso ===
                              AttestatoAsoStatus.IN_CORSO
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                        >
                          {getAttestatoAsoLabel(application.attestato_aso as AttestatoAsoStatus | null)}
                        </span>
                      </div>
                    )}

                    {disponibilitaLabel && (
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Disponibilità
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border ${application.disponibilita_immediata
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                        >
                          {disponibilitaLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-bigster-text flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Curriculum Vitae
            </h3>
            <CvDownloadButton
              applicationId={application.id}
              cvS3Key={application.cv_s3_key || null}
              candidateName={fullName}
              variant="card"
            />
          </div>

          {selezione && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-bigster-text flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Selezione di Riferimento
              </h3>
              <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                <p className="text-sm font-semibold text-bigster-text mb-1">
                  {selezione.titolo}
                </p>
                <p className="text-xs text-bigster-text-muted">
                  {company?.nome}
                  {companyCitta && ` • ${companyCitta}`}
                </p>
                {selezione.figura_ricercata && (
                  <p className="text-xs text-bigster-text-muted mt-1">
                    Figura: {selezione.figura_ricercata}
                  </p>
                )}
              </div>
            </div>
          )}

          {application.note && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-bigster-text">Note</h3>
              <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                <p className="text-sm text-bigster-text whitespace-pre-wrap">
                  {application.note}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-bigster-muted-bg border border-bigster-border">
            <div className="flex items-center gap-6 text-xs text-bigster-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Creata il {formattedCreationDate}
              </span>
              <span className="flex items-center gap-1">
                Modificata il {formattedModificationDate}
              </span>
            </div>
          </div>
        </div>

        {onChangeStatus && (
          <div className="flex items-center justify-end gap-3 p-5 pt-0">
            <Button
              onClick={onChangeStatus}
              className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
            >
              <Edit className="h-4 w-4 mr-2" />
              Cambia Stato
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
