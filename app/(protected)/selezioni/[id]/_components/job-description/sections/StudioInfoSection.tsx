"use client";

import { Calendar, TrendingUp } from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionType,
} from "@/types/jobDescription";

interface StudioInfoSectionProps {
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

export function StudioInfoSection({
  formData,
  updateNestedData,
  inputBase,
}: StudioInfoSectionProps) {
  const studioInfo = formData.analisi_organizzativa.studio_info;

  const updateField = (field: string, value: string) => {
    updateNestedData("analisi_organizzativa", "studio_info", {
      ...studioInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-800 mb-2">
          💡 Suggerimento per l'intervista
        </p>
        <p className="text-xs text-yellow-700 italic">
          "Da quanti anni siete sul mercato? Nel tempo vi sono stati
          cambiamenti/evoluzioni? Se sì, me le può raccontare?"
        </p>
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Anni di Attività *
        </label>
        <input
          type="text"
          value={studioInfo.anni_attivita}
          onChange={(e) => updateField("anni_attivita", e.target.value)}
          placeholder="Es: 15 anni (dal 2009)"
          className={inputBase}
        />
        <p className="text-xs text-bigster-text-muted">
          Indica da quanti anni lo studio è operativo
        </p>
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Evoluzioni nel Tempo
        </label>
        <textarea
          value={studioInfo.evoluzioni_nel_tempo}
          onChange={(e) => updateField("evoluzioni_nel_tempo", e.target.value)}
          placeholder="Descrivi i cambiamenti e le evoluzioni dello studio nel tempo (es: ampliamenti, nuovi servizi, trasferimenti, acquisizioni di altri studi...)"
          className={inputBase}
          rows={6}
        />
        <p className="text-xs text-bigster-text-muted">
          Storia e trasformazioni significative dello studio
        </p>
      </div>
    </div>
  );
}
