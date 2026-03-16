"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { X, ChevronDown } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { SelectionStatus, PackageType } from "@/types/selection";
import type { SelectionFilterOptions } from "@/types/selection";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors appearance-none";

const STATUS_OPTIONS = [
  { value: SelectionStatus.FATTURA_AV_SALDATA, label: "Fattura AV Saldata" },
  { value: SelectionStatus.HR_ASSEGNATA, label: "HR Assegnata" },
  { value: SelectionStatus.PRIMA_CALL_COMPLETATA, label: "Prima Call Completata" },
  { value: SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE, label: "Job in Approvazione" },
  { value: SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE, label: "Job Approvata" },
  { value: SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO, label: "Bozza in Approvazione CEO" },
  { value: SelectionStatus.ANNUNCIO_APPROVATO, label: "Annuncio Approvato" },
  { value: SelectionStatus.ANNUNCIO_PUBBLICATO, label: "Annuncio Pubblicato" },
  { value: SelectionStatus.CANDIDATURE_RICEVUTE, label: "Candidature Ricevute" },
  { value: SelectionStatus.COLLOQUI_IN_CORSO, label: "Colloqui in Corso" },
  { value: SelectionStatus.CANDIDATO_IN_PROVA, label: "Candidato in Prova" },
  { value: SelectionStatus.SELEZIONI_IN_SOSTITUZIONE, label: "In Sostituzione" },
  { value: SelectionStatus.CHIUSA, label: "Chiusa" },
  { value: SelectionStatus.ANNULLATA, label: "Annullata" },
];

const PACCHETTO_OPTIONS = [
  { value: PackageType.BASE, label: "BASE" },
  { value: PackageType.MDO, label: "MDO" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Sì" },
  { value: "no", label: "No" },
];

const HR_STATUS_OPTIONS = [
  { value: "assigned", label: "Con HR assegnata" },
  { value: "unassigned", label: "Senza HR" },
];

export interface FilterState {

  stato: string;
  pacchetto: string;
  figura_ricercata: string;

  has_hr: string;
  risorsa_umana_id: string;

  company_id: string;
  consulente_id: string;

  has_job_collection: string;
  has_annunci: string;
  has_shortlist: string;

  data_da: string;
  data_a: string;
  data_chiusura_da: string;
  data_chiusura_a: string;
}

export const INITIAL_FILTERS: FilterState = {
  stato: "all",
  pacchetto: "all",
  figura_ricercata: "all",
  has_hr: "all",
  risorsa_umana_id: "all",
  company_id: "all",
  consulente_id: "all",
  has_job_collection: "all",
  has_annunci: "all",
  has_shortlist: "all",
  data_da: "",
  data_a: "",
  data_chiusura_da: "",
  data_chiusura_a: "",
};

interface SelectionFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filterOptions?: SelectionFilterOptions;
}

export function SelectionFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filterOptions,
}: SelectionFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    base: true,
    hr: false,
    company: false,
    relational: false,
    dates: false,
  });

  const figuraOptions = useMemo(
    () =>
      (filterOptions?.figure_ricercate?.filter(Boolean) ?? []).map((f) => ({
        value: f,
        label: f,
      })),
    [filterOptions?.figure_ricercate]
  );

  const consulenteOptions = useMemo(
    () =>
      (filterOptions?.consulenti ?? []).map((c) => ({
        value: String(c.id),
        label: c.label,
      })),
    [filterOptions?.consulenti]
  );

  const hrOptions = useMemo(
    () =>
      (filterOptions?.risorse_umane ?? []).map((hr) => ({
        value: String(hr.id),
        label: hr.label,
      })),
    [filterOptions?.risorse_umane]
  );

  const companyOptions = useMemo(
    () =>
      (filterOptions?.companies ?? []).map((c) => ({
        value: String(c.id),
        label: `${c.nome}${c.citta ? ` — ${c.citta}` : ""}`,
      })),
    [filterOptions?.companies]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.stato !== "all") count++;
    if (filters.pacchetto !== "all") count++;
    if (filters.figura_ricercata !== "all") count++;
    if (filters.has_hr !== "all") count++;
    if (filters.risorsa_umana_id !== "all") count++;
    if (filters.company_id !== "all") count++;
    if (filters.consulente_id !== "all") count++;
    if (filters.has_job_collection !== "all") count++;
    if (filters.has_annunci !== "all") count++;
    if (filters.has_shortlist !== "all") count++;
    if (filters.data_da) count++;
    if (filters.data_a) count++;
    if (filters.data_chiusura_da) count++;
    if (filters.data_chiusura_a) count++;
    return count;
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: string) => {
    onFiltersChange({ ...filters, [key]: value || "all" });
  };

  const clearAllFilters = () => {
    onFiltersChange(INITIAL_FILTERS);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md bg-bigster-surface border border-bigster-border max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
        <DialogHeader title="Filtra Selezioni" onClose={onClose} />

        <div className="space-y-5 p-5 pt-0">

          <div className="border border-bigster-border">
            <button
              onClick={() => toggleSection("base")}
              className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
            >
              <span className="font-semibold text-bigster-text">Filtri Base</span>
              <ChevronDown
                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.base ? "rotate-180" : ""
                  }`}
              />
            </button>
            {expandedSections.base && (
              <div className="p-4 space-y-4">

                <StandardSelect
                  label="Stato"
                  value={filters.stato === "all" ? "" : filters.stato}
                  onChange={(value) => updateFilter("stato", value)}
                  options={STATUS_OPTIONS}
                  emptyLabel="Tutti gli stati"
                />

                <StandardSelect
                  label="Pacchetto"
                  value={filters.pacchetto === "all" ? "" : filters.pacchetto}
                  onChange={(value) => updateFilter("pacchetto", value)}
                  options={PACCHETTO_OPTIONS}
                  emptyLabel="Tutti i pacchetti"
                />

                <SearchableSelect
                  label="Figura Ricercata"
                  value={filters.figura_ricercata === "all" ? "" : filters.figura_ricercata}
                  onChange={(value) => updateFilter("figura_ricercata", value)}
                  options={figuraOptions}
                  placeholder="Cerca figura..."
                  emptyLabel="Tutte le figure"
                />
              </div>
            )}
          </div>

          <div className="border border-bigster-border">
            <button
              onClick={() => toggleSection("hr")}
              className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
            >
              <span className="font-semibold text-bigster-text">HR & Risorse Umane</span>
              <ChevronDown
                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.hr ? "rotate-180" : ""
                  }`}
              />
            </button>
            {expandedSections.hr && (
              <div className="p-4 space-y-4">

                <StandardSelect
                  label="Assegnazione HR"
                  value={filters.has_hr === "all" ? "" : filters.has_hr}
                  onChange={(value) => updateFilter("has_hr", value)}
                  options={HR_STATUS_OPTIONS}
                  emptyLabel="Tutte"
                />

                <SearchableSelect
                  label="Risorsa Umana"
                  value={filters.risorsa_umana_id === "all" ? "" : filters.risorsa_umana_id}
                  onChange={(value) => updateFilter("risorsa_umana_id", value)}
                  options={hrOptions}
                  placeholder="Cerca HR..."
                  emptyLabel="Tutte le HR"
                />
              </div>
            )}
          </div>

          <div className="border border-bigster-border">
            <button
              onClick={() => toggleSection("company")}
              className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
            >
              <span className="font-semibold text-bigster-text">Azienda & Consulente</span>
              <ChevronDown
                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.company ? "rotate-180" : ""
                  }`}
              />
            </button>
            {expandedSections.company && (
              <div className="p-4 space-y-4">

                <SearchableSelect
                  label="Azienda"
                  value={filters.company_id === "all" ? "" : filters.company_id}
                  onChange={(value) => updateFilter("company_id", value)}
                  options={companyOptions}
                  placeholder="Cerca azienda..."
                  emptyLabel="Tutte le aziende"
                />

                <SearchableSelect
                  label="Consulente"
                  value={filters.consulente_id === "all" ? "" : filters.consulente_id}
                  onChange={(value) => updateFilter("consulente_id", value)}
                  options={consulenteOptions}
                  placeholder="Cerca consulente..."
                  emptyLabel="Tutti i consulenti"
                />
              </div>
            )}
          </div>

          <div className="border border-bigster-border">
            <button
              onClick={() => toggleSection("relational")}
              className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
            >
              <span className="font-semibold text-bigster-text">Elementi Associati</span>
              <ChevronDown
                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.relational ? "rotate-180" : ""
                  }`}
              />
            </button>
            {expandedSections.relational && (
              <div className="p-4 space-y-4">

                <StandardSelect
                  label="Raccolta Job"
                  value={filters.has_job_collection === "all" ? "" : filters.has_job_collection}
                  onChange={(value) => updateFilter("has_job_collection", value)}
                  options={YES_NO_OPTIONS}
                  emptyLabel="Tutti"
                />

                <StandardSelect
                  label="Annunci Pubblicati"
                  value={filters.has_annunci === "all" ? "" : filters.has_annunci}
                  onChange={(value) => updateFilter("has_annunci", value)}
                  options={YES_NO_OPTIONS}
                  emptyLabel="Tutti"
                />

                <StandardSelect
                  label="Rosa Candidati"
                  value={filters.has_shortlist === "all" ? "" : filters.has_shortlist}
                  onChange={(value) => updateFilter("has_shortlist", value)}
                  options={YES_NO_OPTIONS}
                  emptyLabel="Tutti"
                />
              </div>
            )}
          </div>

          <div className="border border-bigster-border">
            <button
              onClick={() => toggleSection("dates")}
              className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
            >
              <span className="font-semibold text-bigster-text">Filtri per Data</span>
              <ChevronDown
                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.dates ? "rotate-180" : ""
                  }`}
              />
            </button>
            {expandedSections.dates && (
              <div className="p-4 space-y-4">

                <div>
                  <label className="text-sm font-semibold text-bigster-text block mb-2">
                    Data Creazione - Da
                  </label>
                  <input
                    type="date"
                    value={filters.data_da}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, data_da: e.target.value })
                    }
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-bigster-text block mb-2">
                    Data Creazione - A
                  </label>
                  <input
                    type="date"
                    value={filters.data_a}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, data_a: e.target.value })
                    }
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-bigster-text block mb-2">
                    Data Chiusura - Da
                  </label>
                  <input
                    type="date"
                    value={filters.data_chiusura_da}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, data_chiusura_da: e.target.value })
                    }
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-bigster-text block mb-2">
                    Data Chiusura - A
                  </label>
                  <input
                    type="date"
                    value={filters.data_chiusura_a}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, data_chiusura_a: e.target.value })
                    }
                    className={inputBase}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="p-5 pt-0">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full rounded-none border font-semibold"
              style={{
                borderColor: "#ef4444",
                color: "#ef4444",
                backgroundColor: "rgba(239,68,68,0.05)",
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancella tutti i filtri ({activeFiltersCount})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SelectionFilters;
