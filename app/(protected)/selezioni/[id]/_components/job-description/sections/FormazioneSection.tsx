"use client";

import {
  JobDescriptionForm,
  JobDescriptionFormDO,
  JobDescriptionFormASO,
  JobDescriptionType,
} from "@/types/jobDescription";

interface FormazioneSectionProps {
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

export function FormazioneSection({
  formData,
  updateNestedData,
  tipo,
  inputBase,
}: FormazioneSectionProps) {
  const profilo =
    tipo === JobDescriptionType.DO
      ? (formData as JobDescriptionFormDO).analisi_profilo
      : (formData as JobDescriptionFormASO).analisi_profilo;

  const updatePercorso = (field: string, value: any) => {
    updateNestedData("analisi_profilo", "percorso_formativo", {
      ...profilo.percorso_formativo,
      [field]: value,
    });
  };

  const updateEsperienza = (field: string, value: any) => {
    updateNestedData("analisi_profilo", "esperienza", {
      ...profilo.esperienza,
      [field]: value,
    });
  };

  const updateLingue = (lingua: string, field: string, value: any) => {
    updateNestedData("analisi_profilo", "lingue", {
      ...profilo.lingue,
      [lingua]: {
        ...(profilo.lingue as any)[lingua],
        [field]: value,
      },
    });
  };

  const updateLingueField = (field: string, value: any) => {
    updateNestedData("analisi_profilo", "lingue", {
      ...profilo.lingue,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">

      <div className="space-y-4">
        <h4 className="text-base font-bold text-bigster-text border-b border-bigster-border pb-2">
          Percorso Formativo
        </h4>

        {tipo === JobDescriptionType.ASO && (
          <div className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Nota ASO:</span> È necessario un
              titolo di scuola superiore o qualifica professionale triennale per
              frequentare il corso di formazione specifico (700 ore: 300 teoria
              + 400 tirocinio). La qualifica è acquisibile anche tramite
              apprendistato.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Laurea Triennale (preferenziale)
            </label>
            <input
              type="text"
              value={profilo.percorso_formativo.laurea_triennale}
              onChange={(e) =>
                updatePercorso("laurea_triennale", e.target.value)
              }
              placeholder="Es: Economia, Scienze della Comunicazione..."
              className={inputBase}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Laurea Magistrale (preferenziale)
            </label>
            <input
              type="text"
              value={profilo.percorso_formativo.laurea_magistrale}
              onChange={(e) =>
                updatePercorso("laurea_magistrale", e.target.value)
              }
              placeholder="Es: Management Sanitario..."
              className={inputBase}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Diploma (preferenziale)
            </label>
            <input
              type="text"
              value={profilo.percorso_formativo.diploma}
              onChange={(e) => updatePercorso("diploma", e.target.value)}
              placeholder="Es: Ragioneria, Istituto Tecnico..."
              className={inputBase}
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer w-full h-full">
              <input
                type="checkbox"
                checked={profilo.percorso_formativo.nessun_titolo_preferenziale}
                onChange={(e) =>
                  updatePercorso(
                    "nessun_titolo_preferenziale",
                    e.target.checked
                  )
                }
                className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
              />
              <span className="text-sm text-bigster-text">
                Nessun titolo preferenziale
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-base font-bold text-bigster-text border-b border-bigster-border pb-2">
          Esperienza Professionale
        </h4>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="esperienza"
              checked={profilo.esperienza.richiesta === true}
              onChange={() => updateEsperienza("richiesta", true)}
              className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
            />
            <span className="text-sm text-bigster-text">
              Sì, è richiesta esperienza
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="esperienza"
              checked={profilo.esperienza.richiesta === false}
              onChange={() => updateEsperienza("richiesta", false)}
              className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
            />
            <span className="text-sm text-bigster-text">
              No, non è richiesta
            </span>
          </label>
        </div>

        {profilo.esperienza.richiesta && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bigster-text">
              Anni di esperienza richiesti
            </label>
            <input
              type="text"
              value={profilo.esperienza.anni}
              onChange={(e) => updateEsperienza("anni", e.target.value)}
              placeholder="Es: almeno 2 anni"
              className={`${inputBase} w-48`}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-base font-bold text-bigster-text border-b border-bigster-border pb-2">
          Conoscenze Linguistiche
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profilo.lingue.inglese.richiesta}
                onChange={(e) =>
                  updateLingue("inglese", "richiesta", e.target.checked)
                }
                className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
              />
              <span className="text-sm font-medium text-bigster-text">
                Inglese
              </span>
            </label>
            {profilo.lingue.inglese.richiesta && (
              <input
                type="text"
                value={profilo.lingue.inglese.livello}
                onChange={(e) =>
                  updateLingue("inglese", "livello", e.target.value)
                }
                placeholder="Livello (es: B2, fluente...)"
                className={inputBase}
              />
            )}
          </div>

          <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profilo.lingue.altra_lingua.richiesta}
                onChange={(e) =>
                  updateLingue("altra_lingua", "richiesta", e.target.checked)
                }
                className="w-5 h-5 rounded-none border-bigster-border text-bigster-primary focus:ring-0"
              />
              <span className="text-sm font-medium text-bigster-text">
                Altra Lingua
              </span>
            </label>
            {profilo.lingue.altra_lingua.richiesta && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={profilo.lingue.altra_lingua_nome}
                  onChange={(e) =>
                    updateLingueField("altra_lingua_nome", e.target.value)
                  }
                  placeholder="Quale lingua?"
                  className={inputBase}
                />
                <input
                  type="text"
                  value={profilo.lingue.altra_lingua.livello}
                  onChange={(e) =>
                    updateLingue("altra_lingua", "livello", e.target.value)
                  }
                  placeholder="Livello richiesto"
                  className={inputBase}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
