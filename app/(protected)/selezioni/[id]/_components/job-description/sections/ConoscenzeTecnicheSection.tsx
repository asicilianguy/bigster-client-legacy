"use client";

import { Wrench } from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionFormDO,
  JobDescriptionFormASO,
  JobDescriptionType,
} from "@/types/jobDescription";

interface ConoscenzeTecnicheSectionProps {
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

const ConoscenzaItem = ({
  field,
  label,
  checked,
  noteValue,
  onCheckedChange,
  onNoteChange,
  inputBase,
}: {
  field: string;
  label: string;
  checked: boolean;
  noteValue: string;
  onCheckedChange: (checked: boolean) => void;
  onNoteChange: (value: string) => void;
  inputBase: string;
}) => {
  return (
    <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
        />
        <span className="text-sm font-medium text-bigster-text flex-1">
          {label}
        </span>
      </label>
      {checked && (
        <textarea
          value={noteValue}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Qualche indicazione specifica? Quanto è rilevante? A che livello deve essere solida?"
          className={inputBase}
          rows={2}
        />
      )}
    </div>
  );
};

export function ConoscenzeTecnicheSection({
  formData,
  updateNestedData,
  tipo,
  inputBase,
}: ConoscenzeTecnicheSectionProps) {
  const conoscenze =
    tipo === JobDescriptionType.DO
      ? (formData as JobDescriptionFormDO).analisi_profilo.conoscenze_tecniche
      : (formData as JobDescriptionFormASO).analisi_profilo.conoscenze_tecniche;

  const labels =
    tipo === JobDescriptionType.DO
      ? {
          contabilita_informatica:
            "Conoscenze base di contabilità e applicativi informatici/software gestionali",
          fasi_produttive:
            "Conoscenza delle fasi produttive caratteristiche dello studio dentistico",
          odontoiatria_clinica:
            "Conoscenza base dell'odontoiatria clinica (patologie, diagnosi, terapie)",
          excel_pivot:
            "Conoscenza di Excel e formule per analizzare i dati (pivot)",
          aspetti_normativi:
            "Aspetti normativi in odontoiatria (sicurezza, contratti, privacy)",
          sistema_normativo_etico:
            "Conoscenza del sistema normativo, aspetti etici e deontologici",
          marketing_operativo:
            "Conoscenza dei processi e strumenti di marketing operativo",
          altro: "Altro",
        }
      : {
          anatomia_generale:
            "Cenni di anatomia generale (in particolare bocca e denti)",
          composti_farmaci:
            "Conoscenza dei composti dei farmaci, malattie e allergeni",
          odontoiatria_clinica: "Conoscenza base dell'odontoiatria clinica",
          legislazione_sanitaria:
            "Legislazione sanitaria: sistema normativo, aspetti etici",
          altro: "Altro",
        };

  const updateConoscenza = (field: string, subField: string, value: any) => {
    updateNestedData("analisi_profilo", "conoscenze_tecniche", {
      ...conoscenze,
      [field]: {
        ...(conoscenze as any)[field],
        [subField]: value,
      },
    });
  };

  return (
    <div className="space-y-6">

      <div className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Wrench className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">
              Conoscenze Tecniche
            </p>
            <p className="text-xs text-blue-700">
              I contenuti tecnici che la persona avrà dovuto apprendere da
              percorsi di formazione formali e non formali.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-800 mb-2">
          💡 Suggerimento per l'intervista
        </p>
        <p className="text-xs text-yellow-700 italic">
          "Quali conoscenze sono indispensabili? Quali possono essere apprese
          sul campo?"
        </p>
      </div>


      <div className="space-y-3">
        {Object.entries(labels).map(([key, label]) => {
          const con = (conoscenze as any)[key];
          return (
            <ConoscenzaItem
              key={key}
              field={key}
              label={label}
              checked={con?.selezionata || false}
              noteValue={con?.note || ""}
              onCheckedChange={(checked) =>
                updateConoscenza(key, "selezionata", checked)
              }
              onNoteChange={(value) => updateConoscenza(key, "note", value)}
              inputBase={inputBase}
            />
          );
        })}
      </div>
    </div>
  );
}
