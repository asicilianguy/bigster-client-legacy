"use client";

import { forwardRef } from "react";
import {
  Building2,
  User,
  Briefcase,
  GraduationCap,
  Gift,
  CheckSquare,
  Check,
  Star,
  Globe,
} from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionType,
  SERVIZI_ODONTOIATRICI_LABELS,
  ServizioOdontoiatrico,
  ATTIVITA_DO_LABELS,
  ATTIVITA_ASO_LABELS,
  COMPETENZE_HARD_DO_LABELS,
  COMPETENZE_HARD_ASO_LABELS,
  CONOSCENZE_TECNICHE_DO_LABELS,
  CONOSCENZE_TECNICHE_ASO_LABELS,
  CARATTERISTICHE_DO_LABELS,
  CARATTERISTICHE_ASO_LABELS,
  CONTRACT_TYPE_LABELS,
  REQUIREMENT_LEVEL_LABELS,
  WorkSchedule,
} from "@/types/jobDescription";

interface JobDescriptionPdfContentProps {
  formData: JobDescriptionForm;
  tipo: JobDescriptionType;
  companyName?: string;
}

const CheckItem = ({
  checked,
  label,
  note,
}: {
  checked: boolean;
  label: string;
  note?: string;
}) => (
  <div
    className="flex items-start gap-2 py-0.5 pdf-row"
    style={{
      pageBreakInside: "avoid",
      breakInside: "avoid",
    }}
  >
    <span
      className={`flex-shrink-0 w-4 h-4 flex items-center justify-center border ${checked
        ? "bg-bigster-primary border-yellow-400 text-bigster-primary-text"
        : "bg-white border-gray-300"
        }`}
    >
      {checked && <Check className="w-2.5 h-2.5" />}
    </span>
    <div className="flex-1">
      <span className={`text-xs ${checked ? "font-medium" : "text-gray-500"}`}>
        {label}
      </span>
      {note && checked && (
        <p className="text-[10px] text-gray-600 mt-0.5 italic">{note}</p>
      )}
    </div>
  </div>
);

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div
    className="mb-4 pdf-section"
    style={{
      pageBreakInside: "avoid",
      breakInside: "avoid",
    }}
  >
    <div
      className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-bigster-primary pdf-section-header"
      style={{
        pageBreakAfter: "avoid",
        breakAfter: "avoid",
      }}
    >
      <Icon className="w-4 h-4 text-bigster-text" />
      <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div
      className="pl-1 pdf-keep-together"
      style={{
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | number | undefined;
  fullWidth?: boolean;
}) => {
  if (!value) return null;
  return (
    <div
      className={`mb-1 pdf-row ${fullWidth ? "col-span-2" : ""}`}
      style={{
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      <span className="text-[10px] font-semibold text-gray-500 uppercase">
        {label}
      </span>
      <p className="text-xs text-bigster-text">{value}</p>
    </div>
  );
};

const InfoBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`pdf-keep-together ${className}`}
    style={{
      pageBreakInside: "avoid",
      breakInside: "avoid",
    }}
  >
    {children}
  </div>
);

export const JobDescriptionPdfContent = forwardRef<
  HTMLDivElement,
  JobDescriptionPdfContentProps
>(({ formData, tipo, companyName }, ref) => {
  const analisi = formData.analisi_organizzativa;
  const profilo = formData.analisi_profilo;
  const offerta = formData.offerta;
  const chiusura = formData.chiusura;

  const getServizioNome = (servizioId: string): string => {
    if (
      Object.values(ServizioOdontoiatrico).includes(
        servizioId as ServizioOdontoiatrico
      )
    ) {
      return SERVIZI_ODONTOIATRICI_LABELS[servizioId as ServizioOdontoiatrico];
    }
    const personalizzato = analisi.servizi_personalizzati?.find(
      (s) => s.id === servizioId
    );
    return personalizzato?.nome || servizioId;
  };

  const attivitaLabels =
    tipo === JobDescriptionType.DO ? ATTIVITA_DO_LABELS : ATTIVITA_ASO_LABELS;
  const competenzeLabels =
    tipo === JobDescriptionType.DO
      ? COMPETENZE_HARD_DO_LABELS
      : COMPETENZE_HARD_ASO_LABELS;
  const conoscenzeLabels =
    tipo === JobDescriptionType.DO
      ? CONOSCENZE_TECNICHE_DO_LABELS
      : CONOSCENZE_TECNICHE_ASO_LABELS;
  const caratteristicheLabels =
    tipo === JobDescriptionType.DO
      ? CARATTERISTICHE_DO_LABELS
      : CARATTERISTICHE_ASO_LABELS;

  const attivita = profilo.attivita;
  const competenze = profilo.competenze_hard;
  const conoscenze = profilo.conoscenze_tecniche;
  const caratteristiche = profilo.caratteristiche_personali;

  return (
    <div
      ref={ref}
      className="bg-white p-6 shadow-lg mx-auto max-w-[210mm] text-[11px]"
    >

      <style>
        {`
          @media print {
            .pdf-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .pdf-section-header {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            .pdf-keep-together {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .pdf-row {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .pdf-page-break {
              page-break-before: always !important;
              break-before: always !important;
            }
          }

          .pdf-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          .pdf-section-header {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .pdf-keep-together {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-row {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-page-break {
            page-break-before: always !important;
            break-before: always !important;
          }
        `}
      </style>

      <div
        className="text-center mb-4 pb-3 border-b-2 border-bigster-primary pdf-keep-together"
        style={{
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        <h1 className="text-xl font-bold text-bigster-text mb-1">
          SCHEDA RACCOLTA JOB
        </h1>
        <p className="text-base font-semibold text-bigster-primary">
          {tipo === JobDescriptionType.DO
            ? "DENTIST ORGANIZER (DO)"
            : "ASSISTENTE DI STUDIO ODONTOIATRICO (ASO)"}
        </p>
        {companyName && false && (
          <p className="text-xs text-gray-600 mt-1">{companyName}</p>
        )}
      </div>

      <div className="mb-6">
        <div
          className="bg-bigster-card-bg px-3 py-1.5 mb-3 pdf-section-header"
          style={{
            pageBreakInside: "avoid",
            breakInside: "avoid",
            pageBreakAfter: "avoid",
            breakAfter: "avoid",
          }}
        >
          <h2 className="text-sm font-bold text-bigster-text">
            1. ANALISI ORGANIZZATIVA
          </h2>
        </div>

        <Section title="Dati Anagrafici" icon={Building2}>
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <Field
              label="Ragione Sociale"
              value={analisi.dati_anagrafici.ragione_sociale}
              fullWidth
            />
            <Field
              label="Indirizzo"
              value={analisi.dati_anagrafici.indirizzo}
              fullWidth
            />
            <Field label="Città" value={analisi.dati_anagrafici.citta} />
            <Field
              label="Provincia"
              value={analisi.dati_anagrafici.provincia}
            />
          </div>
        </Section>

        <Section title="Lo Studio" icon={Building2}>
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <Field
              label="Anni di Attività"
              value={analisi.studio_info.anni_attivita}
            />
            <Field
              label="Evoluzioni nel Tempo"
              value={analisi.studio_info.evoluzioni_nel_tempo}
              fullWidth
            />
          </div>
        </Section>

        <Section title="Struttura ad Oggi" icon={User}>
          <div
            className="grid grid-cols-2 gap-3 mb-3"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <InfoBox className="p-2 bg-bigster-card-bg">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">
                Dipendenti
              </span>
              <p className="text-lg font-bold text-bigster-text">
                {analisi.struttura_ad_oggi.n_dipendenti}
              </p>
            </InfoBox>
            <InfoBox className="p-2 bg-bigster-card-bg">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">
                Collaboratori
              </span>
              <p className="text-lg font-bold text-bigster-text">
                {analisi.struttura_ad_oggi.n_collaboratori}
              </p>
            </InfoBox>
          </div>

          {analisi.struttura_ad_oggi.dipendenti?.length > 0 && (
            <InfoBox className="mb-2">
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                DIPENDENTI
              </p>
              <div className="space-y-1">
                {analisi.struttura_ad_oggi.dipendenti.map((dip, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-1.5 bg-bigster-card-bg flex justify-between pdf-row"
                    style={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    <span className="font-medium">
                      {dip.nome_cognome
                        ? `${dip.nome_cognome}${dip.ruolo_mansione ? ` — ${dip.ruolo_mansione}` : ""}`
                        : dip.ruolo_mansione || `Dipendente ${idx + 1}`}
                    </span>
                    <span className="text-gray-600">
                      {dip.eta && `${dip.eta} anni`}
                      {dip.dettagli_presenza && ` • ${dip.dettagli_presenza}`}
                    </span>
                  </div>
                ))}
              </div>
            </InfoBox>
          )}

          {analisi.struttura_ad_oggi.collaboratori?.length > 0 && (
            <InfoBox>
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                COLLABORATORI
              </p>
              <div className="space-y-1">
                {analisi.struttura_ad_oggi.collaboratori.map((coll, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-1.5 bg-blue-50 border border-blue-100 flex justify-between pdf-row"
                    style={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    <span className="font-medium">
                      {coll.nome_cognome
                        ? `${coll.nome_cognome}${coll.ruolo_mansione ? ` — ${coll.ruolo_mansione}` : ""}`
                        : coll.ruolo_mansione || `Collaboratore ${idx + 1}`}
                    </span>
                    <span className="text-gray-600">
                      {coll.eta && `${coll.eta} anni`}
                      {coll.dettagli_presenza && ` • ${coll.dettagli_presenza}`}
                    </span>
                  </div>
                ))}
              </div>
            </InfoBox>
          )}
        </Section>

        <Section title="Servizi e Clientela" icon={Briefcase}>
          <Field
            label="Clienti / Segmenti"
            value={analisi.clienti_segmenti}
            fullWidth
          />

          {analisi.distribuzione_servizi?.some((s) => s.attivo) && (
            <InfoBox className="mb-2">
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                DISTRIBUZIONE SERVIZI
              </p>
              <div
                className="grid grid-cols-2 gap-1"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                {analisi.distribuzione_servizi
                  .filter((s) => s.attivo)
                  .map((s) => (
                    <div
                      key={s.servizio}
                      className="flex justify-between items-center p-1.5 bg-bigster-card-bg text-xs pdf-row"
                      style={{
                        pageBreakInside: "avoid",
                        breakInside: "avoid",
                      }}
                    >
                      <span>{SERVIZI_ODONTOIATRICI_LABELS[s.servizio]}</span>
                      <span className="font-semibold">{s.percentuale}%</span>
                    </div>
                  ))}
              </div>
            </InfoBox>
          )}

          {(analisi.servizi_personalizzati?.filter((s) => s.attivo && s.nome)
            .length ?? 0) > 0 && (
              <InfoBox className="mb-2">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">
                  SERVIZI PERSONALIZZATI
                </p>
                <div
                  className="grid grid-cols-2 gap-1"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  {analisi.servizi_personalizzati
                    ?.filter((s) => s.attivo && s.nome)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between items-center p-1.5 bg-blue-50 border border-blue-200 text-xs pdf-row"
                        style={{
                          pageBreakInside: "avoid",
                          breakInside: "avoid",
                        }}
                      >
                        <span>{s.nome}</span>
                        <span className="font-semibold">{s.percentuale}%</span>
                      </div>
                    ))}
                </div>
              </InfoBox>
            )}

          {(analisi.servizi_di_punta?.length ?? 0) > 0 && (
            <InfoBox className="mb-2">
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                SERVIZI DI PUNTA
              </p>
              <div
                className="flex flex-wrap gap-1"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                {analisi.servizi_di_punta?.map((servizioId) => (
                  <span
                    key={servizioId}
                    className="px-2 py-0.5 bg-bigster-primary text-bigster-primary-text text-xs font-semibold flex items-center gap-1"
                  >
                    <Star className="w-2.5 h-2.5" />
                    {getServizioNome(servizioId)}
                  </span>
                ))}
              </div>
              {analisi.servizi_di_punta_note && (
                <div
                  className="mt-1 p-1.5 bg-yellow-50 border border-yellow-200 pdf-row"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <p className="text-[10px] font-semibold text-yellow-800">
                    NOTE:
                  </p>
                  <p className="text-xs text-yellow-900">
                    {analisi.servizi_di_punta_note}
                  </p>
                </div>
              )}
            </InfoBox>
          )}

          <div
            className="grid grid-cols-2 gap-x-4"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <Field label="Fatturato Annuo" value={analisi.fatturato_annuo} />
            <Field
              label="Forniture e Magazzino"
              value={analisi.forniture_e_magazzino}
            />
          </div>
        </Section>

        <Section title="Digitalizzazione" icon={Globe}>
          <div
            className="grid grid-cols-2 gap-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <CheckItem
              checked={analisi.digitalizzazione.applicativi_contabilita}
              label="Applicativi contabilità"
              note={analisi.digitalizzazione.applicativi_contabilita_note}
            />
            <CheckItem
              checked={
                analisi.digitalizzazione.software_gestionali_odontoiatrici
              }
              label="Software gestionali"
              note={
                analisi.digitalizzazione.software_gestionali_odontoiatrici_note
              }
            />
            <CheckItem
              checked={analisi.digitalizzazione.sito}
              label="Sito Web"
              note={analisi.digitalizzazione.sito_url}
            />
            <CheckItem
              checked={analisi.digitalizzazione.social}
              label="Social Network"
              note={analisi.digitalizzazione.social_note}
            />
            <CheckItem
              checked={analisi.digitalizzazione.piattaforme_marketing}
              label="Piattaforme Marketing"
              note={analisi.digitalizzazione.piattaforme_marketing_note}
            />
            <CheckItem
              checked={analisi.digitalizzazione.altri_app_strumenti}
              label="Altri strumenti"
              note={analisi.digitalizzazione.altri_app_strumenti_note}
            />
          </div>
        </Section>

        <Section title="SWOT e Obiettivi" icon={CheckSquare}>
          <Field
            label="Tratti Distintivi"
            value={analisi.tratti_distintivi}
            fullWidth
          />
          <Field
            label="Obiettivi di Sviluppo"
            value={analisi.obiettivi_di_sviluppo}
            fullWidth
          />
          <Field
            label="SWOT Analysis"
            value={analisi.swot_analysis}
            fullWidth
          />
        </Section>
      </div>

      <div
        className="mb-6 pdf-page-break"
        style={{
          pageBreakBefore: "always",
          breakBefore: "always",
        }}
      >
        <div
          className="bg-bigster-card-bg px-3 py-1.5 mb-3 pdf-section-header"
          style={{
            pageBreakInside: "avoid",
            breakInside: "avoid",
            pageBreakAfter: "avoid",
            breakAfter: "avoid",
          }}
        >
          <h2 className="text-sm font-bold text-bigster-text">
            2. ANALISI DEL PROFILO
          </h2>
        </div>

        <Section title="Attività Previste dal Ruolo" icon={Briefcase}>
          <div
            className="grid grid-cols-2 gap-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            {Object.entries(attivitaLabels).map(([key, label]) => {
              if (key === "altro_specifica" || key === "note_attivita")
                return null;
              return (
                <CheckItem
                  key={key}
                  checked={(attivita as any)[key] || false}
                  label={label}
                />
              );
            })}
          </div>
          {(attivita as any).altro_specifica && (
            <InfoBox className="mt-1 p-1.5 bg-yellow-50 border border-yellow-200">
              <p className="text-[10px] font-semibold text-yellow-800">
                ALTRO:
              </p>
              <p className="text-xs text-yellow-900">
                {(attivita as any).altro_specifica}
              </p>
            </InfoBox>
          )}
          {(attivita as any).note_attivita && (
            <InfoBox className="mt-1 p-1.5 bg-blue-50 border border-blue-200">
              <p className="text-[10px] font-semibold text-blue-800">NOTE:</p>
              <p className="text-xs text-blue-900">
                {(attivita as any).note_attivita}
              </p>
            </InfoBox>
          )}
        </Section>

        <Section title="Competenze Hard" icon={GraduationCap}>
          <div
            className="space-y-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            {Object.entries(competenzeLabels).map(([key, label]) => {
              const comp = competenze as any;
              const isChecked =
                typeof comp[key] === "boolean"
                  ? comp[key]
                  : comp[key]?.selezionata || false;
              const note = typeof comp[key] === "object" ? comp[key]?.note : "";
              return (
                <CheckItem
                  key={key}
                  checked={isChecked}
                  label={label}
                  note={note}
                />
              );
            })}
          </div>
        </Section>

        <Section title="Conoscenze Tecniche" icon={GraduationCap}>
          <div
            className="space-y-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            {Object.entries(conoscenzeLabels).map(([key, label]) => {
              const con = conoscenze as any;
              const isChecked =
                typeof con[key] === "boolean"
                  ? con[key]
                  : con[key]?.selezionata || false;
              const note = typeof con[key] === "object" ? con[key]?.note : "";
              return (
                <CheckItem
                  key={key}
                  checked={isChecked}
                  label={label}
                  note={note}
                />
              );
            })}
          </div>
        </Section>

        <Section title="Caratteristiche Personali" icon={User}>
          <div
            className="grid grid-cols-2 gap-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            {Object.entries(caratteristicheLabels).map(([key, label]) => {
              if (key === "altro_specifica") return null;
              return (
                <CheckItem
                  key={key}
                  checked={(caratteristiche as any)[key] || false}
                  label={label}
                />
              );
            })}
          </div>
          {(caratteristiche as any).altro_specifica && (
            <InfoBox className="mt-1 p-1.5 bg-yellow-50 border border-yellow-200">
              <p className="text-[10px] font-semibold text-yellow-800">
                ALTRO:
              </p>
              <p className="text-xs text-yellow-900">
                {(caratteristiche as any).altro_specifica}
              </p>
            </InfoBox>
          )}
        </Section>

        <Section title="Formazione ed Esperienza" icon={GraduationCap}>
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >

            <InfoBox className="col-span-2 mb-2">
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                PERCORSO FORMATIVO
              </p>
              <div className="space-y-1">

                {profilo.percorso_formativo.diploma && (
                  <div
                    className="flex items-start gap-2 py-0.5 pdf-row"
                    style={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center border bg-bigster-primary border-yellow-400 text-bigster-primary-text">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-medium">Diploma</span>
                      <p className="text-[10px] text-gray-600 italic">
                        {profilo.percorso_formativo.diploma}
                      </p>
                    </div>
                  </div>
                )}

                {profilo.percorso_formativo.laurea_triennale && (
                  <div
                    className="flex items-start gap-2 py-0.5 pdf-row"
                    style={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center border bg-bigster-primary border-yellow-400 text-bigster-primary-text">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-medium">
                        Laurea Triennale
                      </span>
                      <p className="text-[10px] text-gray-600 italic">
                        {profilo.percorso_formativo.laurea_triennale}
                      </p>
                    </div>
                  </div>
                )}

                {profilo.percorso_formativo.laurea_magistrale && (
                  <div
                    className="flex items-start gap-2 py-0.5 pdf-row"
                    style={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                    }}
                  >
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center border bg-bigster-primary border-yellow-400 text-bigster-primary-text">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-medium">
                        Laurea Magistrale
                      </span>
                      <p className="text-[10px] text-gray-600 italic">
                        {profilo.percorso_formativo.laurea_magistrale}
                      </p>
                    </div>
                  </div>
                )}

                <CheckItem
                  checked={
                    profilo.percorso_formativo.nessun_titolo_preferenziale
                  }
                  label="Nessun titolo preferenziale"
                />

                {!profilo.percorso_formativo.diploma &&
                  !profilo.percorso_formativo.laurea_triennale &&
                  !profilo.percorso_formativo.laurea_magistrale &&
                  !profilo.percorso_formativo.nessun_titolo_preferenziale && (
                    <p className="text-xs text-gray-500 italic">
                      Nessun requisito formativo specificato
                    </p>
                  )}
              </div>
            </InfoBox>

            <InfoBox>
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                ESPERIENZA RICHIESTA
              </p>
              <p className="text-xs">
                {profilo.esperienza.richiesta
                  ? `Sì, ${profilo.esperienza.anni || "non specificato"}`
                  : "Non richiesta"}
              </p>
            </InfoBox>

            <InfoBox>
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                LINGUE
              </p>
              <div className="space-y-0.5 text-xs">
                {profilo.lingue.inglese.richiesta && (
                  <p>Inglese: {profilo.lingue.inglese.livello || "Base"}</p>
                )}
                {profilo.lingue.altra_lingua.richiesta && (
                  <p>
                    {profilo.lingue.altra_lingua_nome || "Altra lingua"}:{" "}
                    {profilo.lingue.altra_lingua.livello || "Base"}
                  </p>
                )}
                {!profilo.lingue.inglese.richiesta &&
                  !profilo.lingue.altra_lingua.richiesta && (
                    <p className="text-gray-500">
                      Nessun requisito linguistico
                    </p>
                  )}
              </div>
            </InfoBox>
          </div>
        </Section>
      </div>

      <div
        className="mb-6 pdf-page-break"
        style={{
          pageBreakBefore: "always",
          breakBefore: "always",
        }}
      >
        <div
          className="bg-bigster-card-bg px-3 py-1.5 mb-3 pdf-section-header"
          style={{
            pageBreakInside: "avoid",
            breakInside: "avoid",
            pageBreakAfter: "avoid",
            breakAfter: "avoid",
          }}
        >
          <h2 className="text-sm font-bold text-bigster-text">3. OFFERTA</h2>
        </div>

        <Section title="Dettagli Offerta" icon={Gift}>
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <Field
              label="N. Persone Ricercate"
              value={offerta.numero_persone}
            />
            <Field
              label="Motivo della Ricerca"
              value={offerta.motivo_ricerca}
            />
          </div>

          <InfoBox className="mb-3">
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              REQUISITI ANAGRAFICI
            </p>
            <div
              className="grid grid-cols-3 gap-2"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <div
                className="p-1.5 bg-bigster-card-bg pdf-row"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                <span className="text-[10px] text-gray-500">Età</span>
                <p className="text-xs font-medium">
                  {offerta.eta || "-"}{" "}
                  <span className="text-[10px] text-gray-500">
                    ({REQUIREMENT_LEVEL_LABELS[offerta.eta_livello]})
                  </span>
                </p>
              </div>
              <div
                className="p-1.5 bg-bigster-card-bg pdf-row"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                <span className="text-[10px] text-gray-500">Patente</span>
                <p className="text-xs font-medium">
                  {REQUIREMENT_LEVEL_LABELS[offerta.patente]}
                </p>
              </div>
              <div
                className="p-1.5 bg-bigster-card-bg pdf-row"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                <span className="text-[10px] text-gray-500">Automunita</span>
                <p className="text-xs font-medium">
                  {REQUIREMENT_LEVEL_LABELS[offerta.automunita]}
                </p>
              </div>
            </div>
          </InfoBox>

          {offerta.tipi_contratto?.length > 0 && (
            <InfoBox className="mb-3">
              <p className="text-[10px] font-semibold text-gray-500 mb-1">
                TIPOLOGIA CONTRATTO
              </p>
              <div
                className="flex flex-wrap gap-1"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                {offerta.tipi_contratto.map((contratto) => (
                  <span
                    key={contratto}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium"
                  >
                    {CONTRACT_TYPE_LABELS[contratto]}
                  </span>
                ))}
              </div>
            </InfoBox>
          )}

          <InfoBox className="mb-3">
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              ORARIO DI LAVORO
            </p>
            <div
              className="p-2 bg-green-50 border border-green-200 pdf-row"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <p className="text-xs font-semibold text-green-800">
                {offerta.orario === WorkSchedule.FULL_TIME
                  ? "Full Time"
                  : "Part Time"}
              </p>
              {offerta.orario === WorkSchedule.PART_TIME &&
                offerta.orario_part_time_dettagli && (
                  <p className="text-xs text-green-700 mt-0.5">
                    {offerta.orario_part_time_dettagli}
                  </p>
                )}
              {offerta.orario === WorkSchedule.FULL_TIME &&
                offerta.orario_full_time_dettagli && (
                  <p className="text-xs text-green-700 mt-0.5">
                    {offerta.orario_full_time_dettagli}
                  </p>
                )}
            </div>
          </InfoBox>

          <div
            className="grid grid-cols-2 gap-x-4 gap-y-1"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <Field
              label="Compenso Mensile Netto"
              value={offerta.compenso_mensile_netto}
            />
            <Field
              label="Composizione Retribuzione"
              value={offerta.composizione_retribuzione}
            />
            <Field
              label="Prospettive di Crescita"
              value={offerta.prospettive_crescita}
              fullWidth
            />
          </div>

          <InfoBox className="mt-2">
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              BENEFITS
            </p>
            <div
              className="grid grid-cols-2 gap-1"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <CheckItem
                checked={offerta.benefits.affiancamenti}
                label="Affiancamenti"
              />
              <CheckItem
                checked={offerta.benefits.auto_aziendale}
                label="Auto aziendale"
              />
              <CheckItem
                checked={offerta.benefits.corsi_aggiornamento}
                label="Corsi di aggiornamento professionale"
              />
              {offerta.benefits.incentivi && (
                <CheckItem
                  checked={true}
                  label="Incentivi"
                  note={offerta.benefits.incentivi_specifica}
                />
              )}
              <CheckItem
                checked={offerta.benefits.quote_societarie}
                label="Possibilità di acquisire quote societarie"
              />
              <CheckItem
                checked={offerta.benefits.rimborso_spese}
                label="Rimborso spese"
              />
              {offerta.benefits.benefits && (
                <CheckItem
                  checked={true}
                  label="Benefits"
                  note={offerta.benefits.benefits_specifica}
                />
              )}
              {offerta.benefits.altro && (
                <CheckItem
                  checked={true}
                  label="Altro"
                  note={offerta.benefits.altro_specifica}
                />
              )}
            </div>
          </InfoBox>
        </Section>
      </div>

      <div className="mb-4">
        <div
          className="bg-bigster-card-bg px-3 py-1.5 mb-3 pdf-section-header"
          style={{
            pageBreakInside: "avoid",
            breakInside: "avoid",
            pageBreakAfter: "avoid",
            breakAfter: "avoid",
          }}
        >
          <h2 className="text-sm font-bold text-bigster-text">4. CHIUSURA</h2>
        </div>

        <Section title="Note e Firma" icon={CheckSquare}>
          <Field
            label="Canali Specifici da Attivare"
            value={chiusura.canali_specifici}
            fullWidth
          />
          <Field
            label="Note Aggiuntive"
            value={chiusura.note_aggiuntive}
            fullWidth
          />

          <InfoBox className="mt-4 pt-3 border-t border-gray-300">
            <div
              className="grid grid-cols-2 gap-x-4"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <Field label="Luogo" value={chiusura.luogo} />
              <Field
                label="Data"
                value={
                  chiusura.data
                    ? new Date(chiusura.data).toLocaleDateString("it-IT")
                    : undefined
                }
              />
            </div>
            {chiusura.firma_cliente && (
              <div
                className="mt-3 pdf-row"
                style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
              >
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">
                  Firma Cliente
                </p>
                <div className="p-3 border border-gray-300 bg-gray-50 min-h-[40px]">
                  <p className="text-sm italic text-gray-700">
                    {chiusura.firma_cliente}
                  </p>
                </div>
              </div>
            )}
          </InfoBox>
        </Section>
      </div>

      <div
        className="text-center pt-3 border-t border-gray-200 text-[10px] text-gray-500 pdf-keep-together"
        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
      >
        <p>
          Documento generato il{" "}
          {new Date().toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
});

JobDescriptionPdfContent.displayName = "JobDescriptionPdfContent";
