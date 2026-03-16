"use client";

import { Users, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  JobDescriptionForm,
  JobDescriptionType,
  StrutturaDipendente,
} from "@/types/jobDescription";

interface StrutturaSectionProps {
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

export function StrutturaSection({
  formData,
  updateNestedData,
  inputBase,
}: StrutturaSectionProps) {
  const struttura = formData.analisi_organizzativa.struttura_ad_oggi;

  const addDipendente = () => {
    const newDipendenti = [
      ...struttura.dipendenti,
      {
        nome_cognome: "",
        ruolo_mansione: "",
        eta: "",
        dettagli_presenza: ""
      },
    ];

    updateNestedData("analisi_organizzativa", "struttura_ad_oggi", {
      ...struttura,
      dipendenti: newDipendenti,
      n_dipendenti: newDipendenti.length,
    });
  };

  const removeDipendente = (index: number) => {
    const newDipendenti = struttura.dipendenti.filter((_, i) => i !== index);

    updateNestedData("analisi_organizzativa", "struttura_ad_oggi", {
      ...struttura,
      dipendenti: newDipendenti,
      n_dipendenti: newDipendenti.length,
    });
  };

  const updateDipendente = (
    index: number,
    field: keyof StrutturaDipendente,
    value: string
  ) => {
    const updated = [...struttura.dipendenti];
    updated[index] = { ...updated[index], [field]: value };
    updateNestedData("analisi_organizzativa", "struttura_ad_oggi", {
      ...struttura,
      dipendenti: updated,
    });
  };

  const addCollaboratore = () => {
    const newCollaboratori = [
      ...struttura.collaboratori,
      {
        nome_cognome: "",
        ruolo_mansione: "",
        eta: "",
        dettagli_presenza: ""
      },
    ];

    updateNestedData("analisi_organizzativa", "struttura_ad_oggi", {
      ...struttura,
      collaboratori: newCollaboratori,
      n_collaboratori: newCollaboratori.length,
    });
  };

  const removeCollaboratore = (index: number) => {
    const newCollaboratori = struttura.collaboratori.filter(
      (_, i) => i !== index
    );

    updateNestedData("analisi_organizzativa", "struttura_ad_oggi", {
      ...struttura,
      collaboratori: newCollaboratori,
      n_collaboratori: newCollaboratori.length,
    });
  };

  const updateCollaboratore = (
    index: number,
    field: keyof StrutturaDipendente,
    value: string
  ) => {
    const updated = [...struttura.collaboratori];
    updated[index] = { ...updated[index], [field]: value };
    updateNestedData("analisi_organizzativa", "struttura_ad_oggi", {
      ...struttura,
      collaboratori: updated,
    });
  };

  return (
    <div className="space-y-8">

      <div className="p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-800 mb-2">
          💡 Suggerimento per l'intervista
        </p>
        <p className="text-xs text-yellow-700 italic">
          "Quante persone oggi lavorano con lei e con che ruoli/mansioni?"
        </p>
      </div>


      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-bigster-text" />
            <h4 className="text-base font-bold text-bigster-text">
              Dipendenti
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-bigster-primary text-bigster-primary-text font-semibold text-sm">
              {struttura.dipendenti.length} dipendent
              {struttura.dipendenti.length !== 1 ? "i" : "e"}
            </div>
            <Button
              type="button"
              onClick={addDipendente}
              variant="outline"
              size="sm"
              className="rounded-none border border-bigster-border"
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi
            </Button>
          </div>
        </div>


        {struttura.dipendenti.length > 0 ? (
          <div className="space-y-3">
            {struttura.dipendenti.map((dip, index) => (
              <div
                key={index}
                className="p-4 bg-bigster-card-bg border border-bigster-border"
              >
                <div className="flex items-start gap-4">
                  <User className="h-5 w-5 text-bigster-text-muted mt-2" />
                  <div className="flex-1 space-y-3">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Nome e Cognome
                        </label>
                        <input
                          type="text"
                          value={dip.nome_cognome}
                          onChange={(e) =>
                            updateDipendente(index, "nome_cognome", e.target.value)
                          }
                          placeholder="Es: Mario Rossi"
                          className={inputBase}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Ruolo / Mansione
                        </label>
                        <input
                          type="text"
                          value={dip.ruolo_mansione}
                          onChange={(e) =>
                            updateDipendente(
                              index,
                              "ruolo_mansione",
                              e.target.value
                            )
                          }
                          placeholder="Es: ASO, Segretaria, Assistente alla poltrona..."
                          className={inputBase}
                        />
                      </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Età
                        </label>
                        <input
                          type="text"
                          value={dip.eta}
                          onChange={(e) =>
                            updateDipendente(index, "eta", e.target.value)
                          }
                          placeholder="Es: 28 anni"
                          className={inputBase}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Tempo in Studio / Dettagli
                        </label>
                        <input
                          type="text"
                          value={dip.dettagli_presenza}
                          onChange={(e) =>
                            updateDipendente(
                              index,
                              "dettagli_presenza",
                              e.target.value
                            )
                          }
                          placeholder="Es: 3 anni, full-time 40h/settimana"
                          className={inputBase}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDipendente(index)}
                    className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-bigster-muted-bg border border-bigster-border text-center">
            <Users className="h-8 w-8 text-bigster-text-muted mx-auto mb-2" />
            <p className="text-sm text-bigster-text-muted">
              Nessun dipendente inserito
            </p>
            <p className="text-xs text-bigster-text-muted">
              Clicca "Aggiungi" per inserire i dettagli sui dipendenti
            </p>
          </div>
        )}
      </div>


      <div className="border-t border-bigster-border" />


      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-bigster-text" />
            <h4 className="text-base font-bold text-bigster-text">
              Collaboratori Esterni
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-bigster-primary text-bigster-primary-text font-semibold text-sm">
              {struttura.collaboratori.length} collaborator
              {struttura.collaboratori.length !== 1 ? "i" : "e"}
            </div>
            <Button
              type="button"
              onClick={addCollaboratore}
              variant="outline"
              size="sm"
              className="rounded-none border border-bigster-border"
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi
            </Button>
          </div>
        </div>


        {struttura.collaboratori.length > 0 ? (
          <div className="space-y-3">
            {struttura.collaboratori.map((coll, index) => (
              <div
                key={index}
                className="p-4 bg-bigster-card-bg border border-bigster-border"
              >
                <div className="flex items-start gap-4">
                  <User className="h-5 w-5 text-bigster-text-muted mt-2" />
                  <div className="flex-1 space-y-3">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Nome e Cognome
                        </label>
                        <input
                          type="text"
                          value={coll.nome_cognome}
                          onChange={(e) =>
                            updateCollaboratore(index, "nome_cognome", e.target.value)
                          }
                          placeholder="Es: Laura Bianchi"
                          className={inputBase}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Ruolo / Mansione
                        </label>
                        <input
                          type="text"
                          value={coll.ruolo_mansione}
                          onChange={(e) =>
                            updateCollaboratore(
                              index,
                              "ruolo_mansione",
                              e.target.value
                            )
                          }
                          placeholder="Es: Igienista, Ortodontista..."
                          className={inputBase}
                        />
                      </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Età
                        </label>
                        <input
                          type="text"
                          value={coll.eta}
                          onChange={(e) =>
                            updateCollaboratore(index, "eta", e.target.value)
                          }
                          placeholder="Es: 35 anni"
                          className={inputBase}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-bigster-text-muted">
                          Tempo in Studio / Dettagli
                        </label>
                        <input
                          type="text"
                          value={coll.dettagli_presenza}
                          onChange={(e) =>
                            updateCollaboratore(
                              index,
                              "dettagli_presenza",
                              e.target.value
                            )
                          }
                          placeholder="Es: 6 mesi, part-time 2 giorni/settimana"
                          className={inputBase}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCollaboratore(index)}
                    className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-bigster-muted-bg border border-bigster-border text-center">
            <Users className="h-8 w-8 text-bigster-text-muted mx-auto mb-2" />
            <p className="text-sm text-bigster-text-muted">
              Nessun collaboratore inserito
            </p>
          </div>
        )}
      </div>


      <div className="p-4 bg-bigster-card-bg border border-bigster-border">
        <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-2">
          Riepilogo Struttura
        </p>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-2xl font-bold text-bigster-text">
              {struttura.dipendenti.length}
            </p>
            <p className="text-xs text-bigster-text-muted">Dipendenti</p>
          </div>
          <div className="h-8 w-px bg-bigster-border" />
          <div>
            <p className="text-2xl font-bold text-bigster-text">
              {struttura.collaboratori.length}
            </p>
            <p className="text-xs text-bigster-text-muted">Collaboratori</p>
          </div>
          <div className="h-8 w-px bg-bigster-border" />
          <div>
            <p className="text-2xl font-bold text-bigster-text">
              {struttura.dipendenti.length + struttura.collaboratori.length}
            </p>
            <p className="text-xs text-bigster-text-muted">Totale Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
