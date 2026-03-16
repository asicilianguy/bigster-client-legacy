"use client";

import { Building2, MapPin } from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionType,
  AnalisiOrganizzativa,
} from "@/types/jobDescription";

interface DatiAnagraficiSectionProps {
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

export function DatiAnagraficiSection({
  formData,
  updateNestedData,
  inputBase,
}: DatiAnagraficiSectionProps) {
  const dati = formData.analisi_organizzativa.dati_anagrafici;

  const updateField = (field: string, value: string) => {
    updateNestedData("analisi_organizzativa", "dati_anagrafici", {
      ...dati,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      <div className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">
              Dati Anagrafici Aziendali
            </p>
            <p className="text-xs text-blue-700">
              Questi dati identificano lo studio del cliente. Compila tutti i
              campi per una corretta identificazione.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Ragione Sociale *
          </label>
          <input
            type="text"
            value={dati.ragione_sociale}
            onChange={(e) => updateField("ragione_sociale", e.target.value)}
            placeholder="Es: Studio Dentistico Rossi S.r.l."
            className={inputBase}
          />
          <p className="text-xs text-bigster-text-muted">
            Nome legale completo dello studio
          </p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Indirizzo *
          </label>
          <input
            type="text"
            value={dati.indirizzo}
            onChange={(e) => updateField("indirizzo", e.target.value)}
            placeholder="Es: Via Roma 123"
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Città *
          </label>
          <input
            type="text"
            value={dati.citta}
            onChange={(e) => updateField("citta", e.target.value)}
            placeholder="Es: Milano"
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Provincia *
          </label>
          <input
            type="text"
            value={dati.provincia}
            onChange={(e) => updateField("provincia", e.target.value)}
            placeholder="Es: Milano"
            className={inputBase}
          />
        </div>
      </div>

      {dati.ragione_sociale && dati.citta && (
        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
          <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-2">
            Riepilogo
          </p>
          <p className="text-sm text-bigster-text font-medium">
            {dati.ragione_sociale}
          </p>
          <p className="text-xs text-bigster-text-muted">
            {[dati.indirizzo, dati.citta, dati.provincia]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
