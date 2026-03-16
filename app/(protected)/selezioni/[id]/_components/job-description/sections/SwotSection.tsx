"use client";

import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";

interface SwotSectionProps {
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

export function SwotSection({
  formData,
  updateNestedData,
  inputBase,
}: SwotSectionProps) {
  const analisi = formData.analisi_organizzativa;

  const updateField = (field: string, value: string) => {
    updateNestedData("analisi_organizzativa", field, value);
  };

  return (
    <div className="space-y-6">

      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-800 mb-2">
          💡 Suggerimento per l'intervista
        </p>
        <p className="text-xs text-yellow-700 italic">
          "Cosa la differenzia dai suoi colleghi? Quali sono i suoi obiettivi?
          Rispetto agli obiettivi, quali i punti di forza e le aree di
          debolezza?"
        </p>
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Tratti Distintivi
        </label>
        <textarea
          value={analisi.tratti_distintivi}
          onChange={(e) => updateField("tratti_distintivi", e.target.value)}
          placeholder="Cosa differenzia questo studio dai colleghi? Per cosa è riconosciuto sul mercato?"
          className={inputBase}
          rows={4}
        />
        <p className="text-xs text-bigster-text-muted">
          Elementi di unicità e differenziazione sul mercato
        </p>
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Obiettivi di Sviluppo
        </label>
        <textarea
          value={analisi.obiettivi_di_sviluppo}
          onChange={(e) => updateField("obiettivi_di_sviluppo", e.target.value)}
          placeholder="Quali sono gli obiettivi nel breve e medio termine? Cosa vuole ottenere di diverso? Cosa vorrebbe innovare?"
          className={inputBase}
          rows={4}
        />
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          SWOT Analysis
        </label>
        <textarea
          value={analisi.swot_analysis}
          onChange={(e) => updateField("swot_analysis", e.target.value)}
          placeholder="Rispetto agli obiettivi prefissati: quali i punti di forza attuali? Quali le aree di maggiore debolezza?"
          className={inputBase}
          rows={5}
        />
        <p className="text-xs text-bigster-text-muted">
          Punti di forza, debolezze, opportunità e minacce
        </p>
      </div>
    </div>
  );
}
