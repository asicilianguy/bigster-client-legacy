"use client";

import { Gift, Euro, Clock, FileCheck } from "lucide-react";
import {
  JobDescriptionForm,
  JobDescriptionType,
  ContractTypeJD,
  RequirementLevel,
  WorkSchedule,
  CONTRACT_TYPE_LABELS,
  REQUIREMENT_LEVEL_LABELS,
  WORK_SCHEDULE_LABELS,
} from "@/types/jobDescription";
import { StandardSelect } from "@/components/ui/StandardSelect";

interface OffertaSectionProps {
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

export function OffertaSection({
  formData,
  updateFormData,
  inputBase,
}: OffertaSectionProps) {
  const offerta = formData.offerta;

  const updateField = (field: string, value: any) => {
    updateFormData("offerta", {
      ...offerta,
      [field]: value,
    });
  };

  const updateBenefit = (field: string, value: any) => {
    updateFormData("offerta", {
      ...offerta,
      benefits: {
        ...offerta.benefits,
        [field]: value,
      },
    });
  };

  const toggleContractType = (type: ContractTypeJD) => {
    const current = offerta.tipi_contratto || [];
    if (current.includes(type)) {
      updateField(
        "tipi_contratto",
        current.filter((t) => t !== type)
      );
    } else {
      updateField("tipi_contratto", [...current, type]);
    }
  };

  return (
    <div className="space-y-8">

      <div className="p-4 bg-green-50 border border-green-200">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">
              Dettagli dell'Offerta
            </p>
            <p className="text-xs text-green-700">
              Compila i dati relativi all'offerta che il cliente prevede per la
              persona da inserire.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Numero persone ricercate
          </label>
          <input
            type="number"
            min={1}
            value={offerta.numero_persone}
            onChange={(e) =>
              updateField("numero_persone", parseInt(e.target.value) || 1)
            }
            className={inputBase}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bigster-text">
            Motivo della ricerca
          </label>
          <textarea
            value={offerta.motivo_ricerca}
            onChange={(e) => updateField("motivo_ricerca", e.target.value)}
            placeholder="Es: Sostituzione maternità, ampliamento organico..."
            className={inputBase}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text">
          Requisiti Anagrafici
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Età preferita
            </label>
            <textarea
              value={offerta.eta}
              onChange={(e) => updateField("eta", e.target.value)}
              placeholder="Es: 25-35 anni"
              className={inputBase}
              rows={2}
            />
            <StandardSelect
              value={offerta.eta_livello}
              onChange={(value: string) => {
                if (value !== "all") updateField("eta_livello", value as RequirementLevel);
              }}
              options={Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
              emptyLabel="Seleziona livello"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">Patente</label>
            <StandardSelect
              value={offerta.patente}
              onChange={(value: string) => {
                if (value !== "all") updateField("patente", value as RequirementLevel);
              }}
              options={Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
              emptyLabel="Seleziona livello"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Automunita
            </label>
            <StandardSelect
              value={offerta.automunita}
              onChange={(value: string) => {
                if (value !== "all") updateField("automunita", value as RequirementLevel);
              }}
              options={Object.entries(REQUIREMENT_LEVEL_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
              emptyLabel="Seleziona livello"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Tipologia Contratto (seleziona una o più opzioni)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => {
            const isSelected = (offerta.tipi_contratto || []).includes(
              key as ContractTypeJD
            );
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleContractType(key as ContractTypeJD)}
                className={`p-3 text-xs font-medium text-left border transition-colors ${isSelected
                    ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Orario di Lavoro
        </label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(WORK_SCHEDULE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => updateField("orario", key as WorkSchedule)}
              className={`p-4 text-sm font-semibold border transition-colors ${offerta.orario === key
                  ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                  : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {offerta.orario === WorkSchedule.PART_TIME && (
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Dettagli Part Time
            </label>
            <textarea
              value={offerta.orario_part_time_dettagli}
              onChange={(e) =>
                updateField("orario_part_time_dettagli", e.target.value)
              }
              placeholder="Es: 20 ore settimanali, mattino..."
              className={inputBase}
              rows={4}
            />
          </div>
        )}
        {offerta.orario === WorkSchedule.FULL_TIME && (
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Dettagli Full Time
            </label>
            <textarea
              value={offerta.orario_full_time_dettagli}
              onChange={(e) =>
                updateField("orario_full_time_dettagli", e.target.value)
              }
              placeholder="Es: 40 ore settimanali, lun-ven 9-18..."
              className={inputBase}
              rows={4}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Retribuzione
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Compenso Mensile Netto
            </label>
            <textarea
              value={offerta.compenso_mensile_netto}
              onChange={(e) =>
                updateField("compenso_mensile_netto", e.target.value)
              }
              placeholder="Es: 1.500 - 1.800 €"
              className={inputBase}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-bigster-text-muted">
              Composizione Retribuzione
            </label>
            <textarea
              value={offerta.composizione_retribuzione}
              onChange={(e) =>
                updateField("composizione_retribuzione", e.target.value)
              }
              placeholder="Es: Fisso + variabile, premi..."
              className={inputBase}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-bigster-text">
          Prospettive di Crescita
        </label>
        <textarea
          value={offerta.prospettive_crescita}
          onChange={(e) => updateField("prospettive_crescita", e.target.value)}
          placeholder="Quali prospettive di crescita può offrire lo studio? In cosa si traducono?"
          className={inputBase}
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-bigster-text">
          Altri Elementi dell'Offerta / Benefits
        </label>
        <p className="text-xs text-bigster-text-muted">
          Cosa altro potrà trovare la persona nello studio?
        </p>

        <div className="space-y-2">

          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.affiancamenti || false}
              onChange={(e) => updateBenefit("affiancamenti", e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Affiancamenti
              </span>
            </div>
          </label>


          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.auto_aziendale || false}
              onChange={(e) =>
                updateBenefit("auto_aziendale", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Auto aziendale
              </span>
            </div>
          </label>


          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.benefits || false}
                onChange={(e) => updateBenefit("benefits", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Benefits (specificare)
                </span>
              </div>
            </label>
            {offerta.benefits.benefits && (
              <textarea
                value={offerta.benefits.benefits_specifica || ""}
                onChange={(e) =>
                  updateBenefit("benefits_specifica", e.target.value)
                }
                placeholder="Specificare i benefits offerti..."
                className={inputBase}
                rows={3}
              />
            )}
          </div>


          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.corsi_aggiornamento || false}
              onChange={(e) =>
                updateBenefit("corsi_aggiornamento", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Corsi di aggiornamento professionale
              </span>
            </div>
          </label>


          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.incentivi || false}
                onChange={(e) => updateBenefit("incentivi", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Incentivi
                </span>
              </div>
            </label>
            {offerta.benefits.incentivi && (
              <textarea
                value={offerta.benefits.incentivi_specifica || ""}
                onChange={(e) =>
                  updateBenefit("incentivi_specifica", e.target.value)
                }
                placeholder="Es: Scattano al rinnovo del contratto"
                className={inputBase}
                rows={3}
              />
            )}
          </div>


          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.master_dto || false}
                onChange={(e) => updateBenefit("master_dto", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Master DTO
                </span>
              </div>
            </label>
            {offerta.benefits.master_dto && (
              <textarea
                value={offerta.benefits.master_dto_specifica || ""}
                onChange={(e) =>
                  updateBenefit("master_dto_specifica", e.target.value)
                }
                placeholder="Es: Master in Dental Team Organization..."
                className={inputBase}
                rows={3}
              />
            )}
          </div>


          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.quote_societarie || false}
              onChange={(e) =>
                updateBenefit("quote_societarie", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Possibilità di acquisire quote societarie
              </span>
            </div>
          </label>


          <label className="flex items-start gap-2 p-3 bg-bigster-card-bg border border-bigster-border cursor-pointer">
            <input
              type="checkbox"
              checked={offerta.benefits.rimborso_spese || false}
              onChange={(e) =>
                updateBenefit("rimborso_spese", e.target.checked)
              }
              className="w-5 h-5 mt-0.5 rounded-none"
            />
            <div className="flex-1">
              <span className="text-sm text-bigster-text font-medium">
                Rimborso spese
              </span>
            </div>
          </label>


          <div className="p-3 bg-bigster-card-bg border border-bigster-border space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offerta.benefits.altro || false}
                onChange={(e) => updateBenefit("altro", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-none"
              />
              <div className="flex-1">
                <span className="text-sm text-bigster-text font-medium">
                  Altro (specificare)
                </span>
              </div>
            </label>
            {offerta.benefits.altro && (
              <textarea
                value={offerta.benefits.altro_specifica || ""}
                onChange={(e) =>
                  updateBenefit("altro_specifica", e.target.value)
                }
                placeholder="Specificare altro..."
                className={inputBase}
                rows={3}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
