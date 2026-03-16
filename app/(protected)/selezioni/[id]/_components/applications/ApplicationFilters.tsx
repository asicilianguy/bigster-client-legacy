"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Search, Filter, X, ArrowUpDown, ChevronDown } from "lucide-react";
import { ApplicationStatus, Gender, ApplicationListItem } from "@/types/application";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors appearance-none";

const STATUS_OPTIONS = [
  { value: ApplicationStatus.IN_CORSO, label: "In Corso" },
  { value: ApplicationStatus.IN_PROVA, label: "In Prova" },
  { value: ApplicationStatus.ASSUNTO, label: "Assunto" },
  { value: ApplicationStatus.SCARTATO, label: "Scartato" },
  { value: ApplicationStatus.RITIRATO, label: "Ritirato" },
];

const GENDER_OPTIONS = [
  { value: Gender.M, label: "Maschio" },
  { value: Gender.F, label: "Femmina" },
  { value: Gender.ALTRO, label: "Altro" },
  { value: Gender.NON_SPECIFICATO, label: "Non specificato" },
];

const CV_OPTIONS = [
  { value: "with_cv", label: "Con CV allegato" },
  { value: "without_cv", label: "Senza CV" },
];

export interface ApplicationFiltersState {
  search: string;
  stato: ApplicationStatus | "all";
  sesso: Gender | "all";
  regione: string;
  citta: string;
  etaMin: string;
  etaMax: string;
  cvStatus: "all" | "with_cv" | "without_cv";
  dataCreazioneDa: string;
  dataCreazioneA: string;
  sortBy: "recent" | "oldest" | "name" | "status" | "age";
}

interface ApplicationFiltersProps {
  filters: ApplicationFiltersState;
  onFiltersChange: (filters: ApplicationFiltersState) => void;
  totalCount: number;
  filteredCount: number;
  applications: ApplicationListItem[];
}

export function ApplicationFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  applications,
}: ApplicationFiltersProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    base: true,
    location: false,
    demographics: false,
    dates: false,
  });

  const regioniList = useMemo(() => {
    const regioniSet = new Set<string>();
    applications.forEach((app) => {
      if (app.regione) {
        regioniSet.add(app.regione);
      }
    });
    return Array.from(regioniSet).sort();
  }, [applications]);

  const cittaList = useMemo(() => {
    const cittaSet = new Set<string>();
    applications.forEach((app) => {
      if (app.citta) {
        cittaSet.add(app.citta);
      }
    });
    return Array.from(cittaSet).sort();
  }, [applications]);

  const regioniOptions = useMemo(
    () =>
      regioniList.map((regione) => ({
        value: regione,
        label: regione,
      })),
    [regioniList]
  );

  const cittaOptions = useMemo(
    () =>
      cittaList.map((citta) => ({
        value: citta,
        label: citta,
      })),
    [cittaList]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.stato !== "all") count++;
    if (filters.sesso !== "all") count++;
    if (filters.regione) count++;
    if (filters.citta) count++;
    if (filters.etaMin) count++;
    if (filters.etaMax) count++;
    if (filters.cvStatus !== "all") count++;
    if (filters.dataCreazioneDa) count++;
    if (filters.dataCreazioneA) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      search: "",
      stato: "all",
      sesso: "all",
      regione: "",
      citta: "",
      etaMin: "",
      etaMax: "",
      cvStatus: "all",
      dataCreazioneDa: "",
      dataCreazioneA: "",
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-bigster-surface border border-bigster-border p-5 shadow-bigster-card">

      <div className="flex items-center gap-4 flex-wrap">

        <p className="text-sm text-bigster-text-muted whitespace-nowrap">
          {filteredCount === totalCount
            ? `${totalCount} candidature`
            : `${filteredCount} di ${totalCount} candidature`}
        </p>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-bigster-text-muted" />
          </span>
          <input
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            placeholder="Cerca per nome, cognome, email, telefono..."
            className={`${inputBase} pl-10`}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setIsFilterDialogOpen(true)}
          className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-4 py-2"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtri Avanzati
          {activeFiltersCount > 0 && (
            <span
              className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ backgroundColor: "#e4d72b", color: "#000" }}
            >
              {activeFiltersCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsSortDialogOpen(true)}
          className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-4 py-2"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordina
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="rounded-none border font-semibold"
            style={{
              borderColor: "#ef4444",
              color: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.05)",
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Cancella ({activeFiltersCount})
          </Button>
        )}
      </div>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
          <DialogHeader
            title="Filtra Candidature"
            onClose={() => setIsFilterDialogOpen(false)}
          />

          <div className="space-y-5 p-5 pt-0">

            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("base")}
                className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Filtri Base
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.base ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.base && (
                <div className="p-4 space-y-4">

                  <StandardSelect
                    label="Stato Candidatura"
                    value={filters.stato}
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        stato: value as ApplicationStatus | "all",
                      })
                    }
                    options={STATUS_OPTIONS}
                    emptyLabel="Tutti gli stati"
                  />

                  <StandardSelect
                    label="Curriculum Vitae"
                    value={filters.cvStatus}
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        cvStatus: value as "all" | "with_cv" | "without_cv",
                      })
                    }
                    options={CV_OPTIONS}
                    emptyLabel="Tutti"
                  />
                </div>
              )}
            </div>

            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("location")}
                className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Località
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.location ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.location && (
                <div className="p-4 space-y-4">

                  <SearchableSelect
                    label="Regione"
                    value={filters.regione}
                    onChange={(value) =>
                      onFiltersChange({ ...filters, regione: value })
                    }
                    options={regioniOptions}
                    placeholder="Cerca regione..."
                    emptyLabel="Tutte le regioni"
                  />

                  <SearchableSelect
                    label="Città"
                    value={filters.citta}
                    onChange={(value) =>
                      onFiltersChange({ ...filters, citta: value })
                    }
                    options={cittaOptions}
                    placeholder="Cerca città..."
                    emptyLabel="Tutte le città"
                  />
                </div>
              )}
            </div>

            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("demographics")}
                className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Dati Demografici
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.demographics ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.demographics && (
                <div className="p-4 space-y-4">

                  <StandardSelect
                    label="Genere"
                    value={filters.sesso}
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        sesso: value as Gender | "all",
                      })
                    }
                    options={GENDER_OPTIONS}
                    emptyLabel="Tutti"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-bigster-text block mb-2">
                        Età Minima
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="99"
                        value={filters.etaMin}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, etaMin: e.target.value })
                        }
                        placeholder="Es: 25"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-bigster-text block mb-2">
                        Età Massima
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="99"
                        value={filters.etaMax}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, etaMax: e.target.value })
                        }
                        placeholder="Es: 45"
                        className={inputBase}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-bigster-border">
              <button
                onClick={() => toggleSection("dates")}
                className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
              >
                <span className="font-semibold text-bigster-text">
                  Filtri per Data
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.dates ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.dates && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Data Candidatura - Da
                    </label>
                    <input
                      type="date"
                      value={filters.dataCreazioneDa}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          dataCreazioneDa: e.target.value,
                        })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                      Data Candidatura - A
                    </label>
                    <input
                      type="date"
                      value={filters.dataCreazioneA}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          dataCreazioneA: e.target.value,
                        })
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
                onClick={() => {
                  clearAllFilters();
                  setIsFilterDialogOpen(false);
                }}
                className="w-full rounded-none border font-semibold"
                style={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  backgroundColor: "rgba(239,68,68,0.05)",
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancella tutti i filtri
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSortDialogOpen} onOpenChange={setIsSortDialogOpen}>
        <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
          <DialogHeader
            title="Ordina per"
            onClose={() => setIsSortDialogOpen(false)}
          />

          <div className="space-y-3 p-5 pt-0">
            <button
              onClick={() => {
                onFiltersChange({ ...filters, sortBy: "recent" });
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border transition-all duration-200 ${filters.sortBy === "recent"
                ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                : "bg-bigster-surface hover:bg-bigster-muted-bg border-bigster-border"
                }`}
            >
              <p className="font-semibold">Più Recenti</p>
              <p className="text-xs opacity-80">
                Per data di candidatura decrescente
              </p>
            </button>

            <button
              onClick={() => {
                onFiltersChange({ ...filters, sortBy: "oldest" });
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border transition-all duration-200 ${filters.sortBy === "oldest"
                ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                : "bg-bigster-surface hover:bg-bigster-muted-bg border-bigster-border"
                }`}
            >
              <p className="font-semibold">Più Vecchie</p>
              <p className="text-xs opacity-80">
                Per data di candidatura crescente
              </p>
            </button>

            <button
              onClick={() => {
                onFiltersChange({ ...filters, sortBy: "name" });
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border transition-all duration-200 ${filters.sortBy === "name"
                ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                : "bg-bigster-surface hover:bg-bigster-muted-bg border-bigster-border"
                }`}
            >
              <p className="font-semibold">Nome (A-Z)</p>
              <p className="text-xs opacity-80">Ordine alfabetico per cognome</p>
            </button>

            <button
              onClick={() => {
                onFiltersChange({ ...filters, sortBy: "status" });
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border transition-all duration-200 ${filters.sortBy === "status"
                ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                : "bg-bigster-surface hover:bg-bigster-muted-bg border-bigster-border"
                }`}
            >
              <p className="font-semibold">Per Stato</p>
              <p className="text-xs opacity-80">
                Raggruppa per stato candidatura
              </p>
            </button>

            <button
              onClick={() => {
                onFiltersChange({ ...filters, sortBy: "age" });
                setIsSortDialogOpen(false);
              }}
              className={`w-full p-4 text-left border transition-all duration-200 ${filters.sortBy === "age"
                ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                : "bg-bigster-surface hover:bg-bigster-muted-bg border-bigster-border"
                }`}
            >
              <p className="font-semibold">Per Età</p>
              <p className="text-xs opacity-80">Ordine crescente per età</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
