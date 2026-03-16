"use client";

import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";

interface DigitalizzazioneSectionProps {
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

const CheckboxWithNote = ({
  label,
  checked,
  onCheckedChange,
  noteValue,
  onNoteChange,
  notePlaceholder,
  inputBase,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  noteValue: string;
  onNoteChange: (value: string) => void;
  notePlaceholder: string;
  inputBase: string;
}) => (
  <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
      />
      <span className="text-sm font-medium text-bigster-text">{label}</span>
    </label>
    {checked && (
      <input
        type="text"
        value={noteValue}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={notePlaceholder}
        className={inputBase}
      />
    )}
  </div>
);

export function DigitalizzazioneSection({
  formData,
  updateNestedData,
  inputBase,
}: DigitalizzazioneSectionProps) {
  const digital = formData.analisi_organizzativa.digitalizzazione;

  const updateDigital = (field: string, value: any) => {
    updateNestedData("analisi_organizzativa", "digitalizzazione", {
      ...digital,
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
          "Quali e quanti applicativi informatici oggi sono in uso nel suo
          studio? Usa il web e i social network? Ha un sito web?"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CheckboxWithNote
          label="Applicativi per la contabilità"
          checked={digital.applicativi_contabilita}
          onCheckedChange={(checked) =>
            updateDigital("applicativi_contabilita", checked)
          }
          noteValue={digital.applicativi_contabilita_note}
          onNoteChange={(value) =>
            updateDigital("applicativi_contabilita_note", value)
          }
          notePlaceholder="Quali applicativi? (es: Fatture in Cloud, TeamSystem...)"
          inputBase={inputBase}
        />

        <CheckboxWithNote
          label="Software gestionali odontoiatrici"
          checked={digital.software_gestionali_odontoiatrici}
          onCheckedChange={(checked) =>
            updateDigital("software_gestionali_odontoiatrici", checked)
          }
          noteValue={digital.software_gestionali_odontoiatrici_note}
          onNoteChange={(value) =>
            updateDigital("software_gestionali_odontoiatrici_note", value)
          }
          notePlaceholder="Quali software? (es: DentalPro, CGM...)"
          inputBase={inputBase}
        />

        <CheckboxWithNote
          label="Altri app/strumenti"
          checked={digital.altri_app_strumenti}
          onCheckedChange={(checked) =>
            updateDigital("altri_app_strumenti", checked)
          }
          noteValue={digital.altri_app_strumenti_note}
          onNoteChange={(value) =>
            updateDigital("altri_app_strumenti_note", value)
          }
          notePlaceholder="Specificare quali..."
          inputBase={inputBase}
        />

        <CheckboxWithNote
          label="Sito Web"
          checked={digital.sito}
          onCheckedChange={(checked) => updateDigital("sito", checked)}
          noteValue={digital.sito_url}
          onNoteChange={(value) => updateDigital("sito_url", value)}
          notePlaceholder="URL del sito web"
          inputBase={inputBase}
        />

        <CheckboxWithNote
          label="Social Network"
          checked={digital.social}
          onCheckedChange={(checked) => updateDigital("social", checked)}
          noteValue={digital.social_note}
          onNoteChange={(value) => updateDigital("social_note", value)}
          notePlaceholder="Quali social? (es: Facebook, Instagram, LinkedIn...)"
          inputBase={inputBase}
        />

        <CheckboxWithNote
          label="Piattaforme per attività di Marketing"
          checked={digital.piattaforme_marketing}
          onCheckedChange={(checked) =>
            updateDigital("piattaforme_marketing", checked)
          }
          noteValue={digital.piattaforme_marketing_note}
          onNoteChange={(value) =>
            updateDigital("piattaforme_marketing_note", value)
          }
          notePlaceholder="Quali piattaforme? (es: Mailchimp, HubSpot...)"
          inputBase={inputBase}
        />
      </div>


      <div className="p-4 bg-bigster-card-bg border border-bigster-border">
        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-3">
          Livello Digitalizzazione
        </p>
        <div className="flex flex-wrap gap-2">
          {digital.applicativi_contabilita && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium">
              ✓ Contabilità
            </span>
          )}
          {digital.software_gestionali_odontoiatrici && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium">
              ✓ Gestionale
            </span>
          )}
          {digital.sito && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium">
              ✓ Sito Web
            </span>
          )}
          {digital.social && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium">
              ✓ Social
            </span>
          )}
          {digital.piattaforme_marketing && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium">
              ✓ Marketing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
