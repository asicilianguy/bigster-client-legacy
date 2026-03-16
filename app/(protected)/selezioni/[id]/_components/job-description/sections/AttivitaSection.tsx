"use client";

import { ClipboardList, AlertCircle } from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionFormDO,
  JobDescriptionFormASO,
  JobDescriptionType,
  ATTIVITA_DO_LABELS,
  ATTIVITA_ASO_LABELS,
  AttivitaDO,
  AttivitaASO,
} from "@/types/jobDescription";

interface AttivitaSectionProps {
  formData: JobDescriptionForm;
  updateFormData: <K extends keyof JobDescriptionForm>(
    key: K,
    value: JobDescriptionForm[K]
  ) => void;
  updateNestedData: <K extends keyof JobDescriptionForm>(
    key: K,
    nestedKey: string,
    value: any
  ) => void;
  tipo: JobDescriptionType;
  inputBase: string;
}

export function AttivitaSection({
  formData,
  updateNestedData,
  tipo,
  inputBase,
}: AttivitaSectionProps) {
  const attivita =
    tipo === JobDescriptionType.DO
      ? (formData as JobDescriptionFormDO).analisi_profilo.attivita
      : (formData as JobDescriptionFormASO).analisi_profilo.attivita;

  const updateAttivita = (field: string, value: any) => {
    updateNestedData("analisi_profilo", "attivita", {
      ...attivita,
      [field]: value,
    });
  };

  const countSelected = () => {
    const labels = tipo === JobDescriptionType.DO ? ATTIVITA_DO_LABELS : ATTIVITA_ASO_LABELS;
    return Object.keys(labels).filter(
      (key) => (attivita as any)[key] === true
    ).length;
  };

  const ActivityCheckbox = ({
    field,
    label,
    hasAsterisk = false,
  }: {
    field: string;
    label: string;
    hasAsterisk?: boolean;
  }) => (
    <label className="flex items-start gap-3 p-3 bg-bigster-card-bg border border-bigster-border hover:border-bigster-text transition-colors cursor-pointer">
      <input
        type="checkbox"
        checked={(attivita as any)[field] || false}
        onChange={(e) => updateAttivita(field, e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
      />
      <span className="text-sm text-bigster-text flex-1">
        {label}
        {hasAsterisk && (
          <span className="text-xs text-bigster-text-muted ml-1">*</span>
        )}
      </span>
    </label>
  );

  return (
    <div className="space-y-6">

      <div className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <ClipboardList className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-2">
              {tipo === JobDescriptionType.DO
                ? "Dentist Organizer - Definizione"
                : "Assistente di Studio Odontoiatrico - Definizione"}
            </p>
            <p className="text-xs text-blue-700 leading-relaxed">
              {tipo === JobDescriptionType.DO ? (
                <>
                  Il professionista che si occupa del coordinamento e della
                  gestione dello studio dentistico, dalla segreteria
                  all'accoglienza e alla relazione con i pazienti. Non è una
                  figura sanitaria ma deve conoscere le dinamiche che si creano
                  all'interno dello studio.
                </>
              ) : (
                <>
                  Il professionista che garantisce e si occupa del supporto e
                  dell'assistenza all'odontoiatra e ai professionisti sanitari
                  durante la loro prestazione clinica. Svolge la propria
                  attività negli studi odontoiatrici e nelle strutture sanitarie
                  che erogano prestazioni odontostomatologiche.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-800 mb-2">
          💡 Suggerimento per l'intervista
        </p>
        <p className="text-xs text-yellow-700 italic">
          "Quali sono oggi le attività più urgenti da gestire in autonomia?
          Quali risultano essere critiche e dove le persone hanno avuto
          maggiori difficoltà in passato?"
        </p>
      </div>

      
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-bigster-text">
          Attività Previste dal Ruolo
        </h4>
        <span className="text-sm font-medium text-bigster-text-muted">
          {countSelected()} selezionate
        </span>
      </div>

      
      <div className="grid grid-cols-1 gap-2">
        {tipo === JobDescriptionType.DO ? (
          
          <>
            {Object.entries(ATTIVITA_DO_LABELS).map(([key, label]) => (
              <ActivityCheckbox key={key} field={key} label={label} />
            ))}
          </>
        ) : (
          
          <>
            {Object.entries(ATTIVITA_ASO_LABELS).map(([key, label]) => {
              const hasAsterisk = [
                "gestisce_prenotazioni",
                "gestisce_agende",
                "gestisce_rapporti_fornitori",
                "gestisce_magazzino_cassa",
                "utilizza_programmi_informatici",
              ].includes(key);
              return (
                <ActivityCheckbox
                  key={key}
                  field={key}
                  label={label}
                  hasAsterisk={hasAsterisk}
                />
              );
            })}
          </>
        )}
      </div>

      
      {tipo === JobDescriptionType.ASO && (
        <div className="p-3 bg-bigster-muted-bg border border-bigster-border">
          <p className="text-xs text-bigster-text-muted">
            <span className="font-semibold">*</span> Queste attività sono
            previste nel caso in cui non sia presente in studio un Dentist
            Organizer (DO).
          </p>
        </div>
      )}

      
      {(attivita as any).altro && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Specifica "Altro"
          </label>
          <textarea
            value={(attivita as any).altro_specifica || ""}
            onChange={(e) => updateAttivita("altro_specifica", e.target.value)}
            placeholder="Descrivi le altre attività non elencate..."
            className={inputBase}
            rows={3}
          />
        </div>
      )}

      
      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Note sulle Attività
        </label>
        <textarea
          value={(attivita as any).note_attivita || ""}
          onChange={(e) => updateAttivita("note_attivita", e.target.value)}
          placeholder="Eventuali note aggiuntive sulle attività (priorità, criticità, esperienze passate...)"
          className={inputBase}
          rows={4}
        />
      </div>
    </div>
  );
}
