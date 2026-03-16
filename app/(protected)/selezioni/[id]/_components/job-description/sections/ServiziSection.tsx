"use client";

import {
  DollarSign,
  Star,
  Percent,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  JobDescriptionForm,
  JobDescriptionType,
  ServizioOdontoiatrico,
  SERVIZI_ODONTOIATRICI_LABELS,
  DistribuzioneServizio,
  ServizioPersonalizzato,
} from "@/types/jobDescription";

interface ServiziSectionProps {
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

export function ServiziSection({
  formData,
  updateNestedData,
  inputBase,
}: ServiziSectionProps) {
  const analisi = formData.analisi_organizzativa;
  const serviziPersonalizzati = analisi.servizi_personalizzati ?? [];

  const updateField = (field: string, value: any) => {
    updateNestedData("analisi_organizzativa", field, value);
  };

  const updateServizio = (
    servizio: ServizioOdontoiatrico,
    field: keyof DistribuzioneServizio,
    value: any
  ) => {
    const updated = analisi.distribuzione_servizi.map((s) =>
      s.servizio === servizio ? { ...s, [field]: value } : s
    );
    updateField("distribuzione_servizi", updated);
  };

  const addServizioPersonalizzato = () => {
    const newServizio: ServizioPersonalizzato = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nome: "",
      attivo: false,
      percentuale: "",
    };
    updateField("servizi_personalizzati", [...serviziPersonalizzati, newServizio]);
  };

  const removeServizioPersonalizzato = (id: string) => {

    const updatedServizi = serviziPersonalizzati.filter((s) => s.id !== id);
    updateField("servizi_personalizzati", updatedServizi);

    const updatedPunta = (analisi.servizi_di_punta || []).filter(
      (s) => s !== id
    );
    updateField("servizi_di_punta", updatedPunta);
  };

  const updateServizioPersonalizzato = (
    id: string,
    field: keyof ServizioPersonalizzato,
    value: any
  ) => {
    const updated = serviziPersonalizzati.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    updateField("servizi_personalizzati", updated);
  };

  const toggleServizioDiPunta = (servizioId: string) => {
    const current = analisi.servizi_di_punta || [];
    const updated = current.includes(servizioId)
      ? current.filter((s) => s !== servizioId)
      : [...current, servizioId];
    updateField("servizi_di_punta", updated);
  };

  const getServizioNome = (servizioId: string): string => {

    if (
      Object.values(ServizioOdontoiatrico).includes(
        servizioId as ServizioOdontoiatrico
      )
    ) {
      return SERVIZI_ODONTOIATRICI_LABELS[servizioId as ServizioOdontoiatrico];
    }

    const personalizzato = serviziPersonalizzati.find((s) => s.id === servizioId);
    return personalizzato?.nome || servizioId;
  };

  const totalePercentuale =
    analisi.distribuzione_servizi
      .filter((s) => s.attivo)
      .reduce((acc, s) => {
        const val = parseInt(s.percentuale) || 0;
        return acc + val;
      }, 0) +
    serviziPersonalizzati
      .filter((s) => s.attivo)
      .reduce((acc, s) => {
        const val = parseInt(s.percentuale) || 0;
        return acc + val;
      }, 0);

  const serviziPredefinitiAttivi = analisi.distribuzione_servizi.filter(
    (s) => s.attivo
  );
  const serviziPersonalizzatiAttivi = serviziPersonalizzati.filter(
    (s) => s.attivo && s.nome.trim() !== ""
  );

  return (
    <div className="space-y-8">

      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-800 mb-2">
          💡 Suggerimento per l'intervista
        </p>
        <p className="text-xs text-yellow-700 italic">
          "Che tipologie di clienti frequentano il suo studio? In percentuale
          per che tipi di servizi si rivolgono a voi? Riesce a darmi percentuali
          anche indicative? Su quali servizi in particolare vuole puntare?"
        </p>
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Clienti / Segmenti di Clientela
        </label>
        <textarea
          value={analisi.clienti_segmenti}
          onChange={(e) => updateField("clienti_segmenti", e.target.value)}
          placeholder="Descrivi le tipologie di clienti che frequentano lo studio (es: famiglie, anziani, professionisti, bambini...)"
          className={inputBase}
          rows={3}
        />
      </div>


      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Distribuzione Servizi (percentuale clientela)
          </label>
          <div
            className={`px-3 py-1 text-sm font-semibold ${
              totalePercentuale === 100
                ? "bg-green-100 text-green-800"
                : totalePercentuale > 100
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            Totale: {totalePercentuale}%
          </div>
        </div>

        <p className="text-xs text-bigster-text-muted">
          Seleziona i servizi offerti e indica la percentuale approssimativa di
          clientela per ciascuno
        </p>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analisi.distribuzione_servizi.map((servizio) => (
            <div
              key={servizio.servizio}
              className={`p-4 border transition-all ${
                servizio.attivo
                  ? "bg-bigster-surface border-bigster-text"
                  : "bg-bigster-card-bg border-bigster-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={servizio.attivo}
                  onChange={(e) =>
                    updateServizio(
                      servizio.servizio,
                      "attivo",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
                />
                <span
                  className={`flex-1 text-sm font-medium ${
                    servizio.attivo
                      ? "text-bigster-text"
                      : "text-bigster-text-muted"
                  }`}
                >
                  {SERVIZI_ODONTOIATRICI_LABELS[servizio.servizio]}
                </span>
                {servizio.attivo && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={servizio.percentuale}
                      onChange={(e) =>
                        updateServizio(
                          servizio.servizio,
                          "percentuale",
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className={`${inputBase} w-20 text-center`}
                    />
                    <span className="text-sm text-bigster-text-muted">%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>


        {serviziPersonalizzati.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 border-t border-bigster-border" />
              <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                Servizi Personalizzati
              </span>
              <div className="flex-1 border-t border-bigster-border" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {serviziPersonalizzati.map((servizio) => (
                <div
                  key={servizio.id}
                  className={`p-4 border transition-all ${
                    servizio.attivo
                      ? "bg-bigster-surface border-bigster-text"
                      : "bg-bigster-card-bg border-bigster-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={servizio.attivo}
                      onChange={(e) =>
                        updateServizioPersonalizzato(
                          servizio.id,
                          "attivo",
                          e.target.checked
                        )
                      }
                      className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
                    />
                    <input
                      type="text"
                      value={servizio.nome}
                      onChange={(e) =>
                        updateServizioPersonalizzato(
                          servizio.id,
                          "nome",
                          e.target.value
                        )
                      }
                      placeholder="Nome servizio..."
                      className={`${inputBase} flex-1`}
                    />
                    {servizio.attivo && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={servizio.percentuale}
                          onChange={(e) =>
                            updateServizioPersonalizzato(
                              servizio.id,
                              "percentuale",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          className={`${inputBase} w-20 text-center`}
                        />
                        <span className="text-sm text-bigster-text-muted">
                          %
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeServizioPersonalizzato(servizio.id)}
                      className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        <Button
          type="button"
          onClick={addServizioPersonalizzato}
          variant="outline"
          className="w-full rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Servizio Personalizzato
        </Button>


        {totalePercentuale !== 100 && totalePercentuale > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-xs text-yellow-700">
              Il totale delle percentuali dovrebbe essere 100%. Attualmente:{" "}
              {totalePercentuale}%
            </p>
          </div>
        )}
      </div>


      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Servizi di Punta
        </label>
        <p className="text-xs text-bigster-text-muted">
          Seleziona i servizi su cui lo studio vuole puntare o sta già puntando
          maggiormente
        </p>

        {serviziPredefinitiAttivi.length > 0 ||
        serviziPersonalizzatiAttivi.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">

              {serviziPredefinitiAttivi.map((servizio) => {
                const isSelected = (analisi.servizi_di_punta || []).includes(
                  servizio.servizio
                );
                return (
                  <button
                    key={servizio.servizio}
                    type="button"
                    onClick={() => toggleServizioDiPunta(servizio.servizio)}
                    className={`px-4 py-2 text-sm font-medium border transition-all flex items-center gap-2 ${
                      isSelected
                        ? "bg-bigster-primary text-bigster-primary-text border-yellow-300"
                        : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                    }`}
                  >
                    {isSelected && <Star className="h-4 w-4 fill-current" />}
                    {SERVIZI_ODONTOIATRICI_LABELS[servizio.servizio]}
                  </button>
                );
              })}


              {serviziPersonalizzatiAttivi.map((servizio) => {
                const isSelected = (analisi.servizi_di_punta || []).includes(
                  servizio.id
                );
                return (
                  <button
                    key={servizio.id}
                    type="button"
                    onClick={() => toggleServizioDiPunta(servizio.id)}
                    className={`px-4 py-2 text-sm font-medium border transition-all flex items-center gap-2 ${
                      isSelected
                        ? "bg-bigster-primary text-bigster-primary-text border-yellow-300"
                        : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                    }`}
                  >
                    {isSelected && <Star className="h-4 w-4 fill-current" />}
                    {servizio.nome}
                  </button>
                );
              })}
            </div>


            {(analisi.servizi_di_punta || []).length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-800 mb-1">
                  Servizi di punta selezionati:
                </p>
                <p className="text-sm text-yellow-900 font-medium">
                  {(analisi.servizi_di_punta || [])
                    .map((id) => getServizioNome(id))
                    .join(", ")}
                </p>
              </div>
            )}


            <div className="space-y-2">
              <label className="text-sm font-semibold text-bigster-text">
                Note sui servizi di punta
              </label>
              <textarea
                value={analisi.servizi_di_punta_note || ""}
                onChange={(e) =>
                  updateField("servizi_di_punta_note", e.target.value)
                }
                placeholder="Motivazioni, strategie, obiettivi specifici per i servizi di punta..."
                className={inputBase}
                rows={3}
              />
            </div>
          </>
        ) : (
          <div className="p-4 bg-bigster-muted-bg border border-bigster-border text-center">
            <p className="text-sm text-bigster-text-muted">
              Seleziona prima i servizi offerti dalla sezione sopra per poter
              indicare quelli di punta.
            </p>
          </div>
        )}
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Fatturato Annuo
        </label>
        <input
          type="text"
          value={analisi.fatturato_annuo}
          onChange={(e) => updateField("fatturato_annuo", e.target.value)}
          placeholder="Es: 500.000€ / anno"
          className={inputBase}
        />
      </div>


      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Forniture e Magazzino
        </label>
        <textarea
          value={analisi.forniture_e_magazzino}
          onChange={(e) => updateField("forniture_e_magazzino", e.target.value)}
          placeholder="Come e chi gestisce i rapporti con i fornitori? Quanti e chi sono? Come è organizzato il magazzino?"
          className={inputBase}
          rows={4}
        />
      </div>
    </div>
  );
}
