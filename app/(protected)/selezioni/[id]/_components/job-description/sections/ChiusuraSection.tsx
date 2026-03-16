"use client";

import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";

interface ChiusuraSectionProps {
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
  companyName?: string;
}

export function ChiusuraSection({
  formData,
  updateFormData,
  inputBase,
  companyName,
}: ChiusuraSectionProps) {
  const chiusura = formData.chiusura;

  const updateField = (field: string, value: string) => {
    updateFormData("chiusura", {
      ...chiusura,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      <div className="p-4 bg-orange-50 border border-orange-200">
        <p className="text-xs text-orange-700">
          <span className="font-semibold">Chiusura intervista:</span> "Sulla
          base di quanto ci siam detti attiveremo i nostri canali per arrivare
          al target di candidati più in linea. Elaboreremo il tutto in una
          scheda di sintesi che le invieremo per firma e approvazione."
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Canali Specifici da Attivare
        </label>
        <textarea
          value={chiusura.canali_specifici}
          onChange={(e) => updateField("canali_specifici", e.target.value)}
          placeholder="Vi sono canali, mezzi locali e specifici che il cliente ritiene efficaci? Realtà/organizzazioni/network nella zona da intercettare?"
          className={inputBase}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Note Aggiuntive
        </label>
        <textarea
          value={chiusura.note_aggiuntive}
          onChange={(e) => updateField("note_aggiuntive", e.target.value)}
          placeholder="Informazioni, indicazioni utili per integrare i messaggi per attrarre candidati in linea..."
          className={inputBase}
          rows={4}
        />
      </div>

      <div className="p-6 bg-bigster-card-bg border border-bigster-border space-y-4">
        <h4 className="text-base font-bold text-bigster-text">
          Firma per Accettazione
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Luogo
            </label>
            <input
              type="text"
              value={chiusura.luogo}
              onChange={(e) => updateField("luogo", e.target.value)}
              placeholder="Es: Milano"
              className={inputBase}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Data
            </label>
            <input
              type="date"
              value={chiusura.data}
              onChange={(e) => updateField("data", e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Il Cliente (Nome e Cognome)
          </label>
          <input
            type="text"
            value={chiusura.firma_cliente}
            onChange={(e) => updateField("firma_cliente", e.target.value)}
            placeholder="Nome e cognome del cliente firmatario"
            className={inputBase}
          />
        </div>

        {companyName && false && (
          <p className="text-xs text-bigster-text-muted">
            Per conto di: <span className="font-semibold">{companyName}</span>
          </p>
        )}
      </div>

      <div className="p-4 bg-green-50 border border-green-200">
        <p className="text-sm font-semibold text-green-800 mb-2">
          ✓ Intervista Completata
        </p>
        <p className="text-xs text-green-700">
          Una volta salvato, potrai rivedere e modificare i dati in qualsiasi
          momento. La scheda di sintesi sarà disponibile per l'invio al cliente.
        </p>
      </div>
    </div>
  );
}
