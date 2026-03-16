"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, Search, MapPin, Plus, Filter, X, Pin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
} from "@/lib/redux/features/companies/companiesApiSlice";
import type { CompanyListItem } from "@/types/company";
import { toast } from "sonner";
import { StandardSelect } from "../ui/StandardSelect";

type CompanySortOption = "name-asc" | "name-desc" | "citta";

interface CompanySelectorProps {
  onSelect: (companyId: number) => void;
  selectedId?: number | null;
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

export default function CompanySelector({
  onSelect,
  selectedId,
}: CompanySelectorProps) {
  const { data: companies = [], isLoading } = useGetCompaniesQuery();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<CompanySortOption>("name-asc");
  const [cittaFilter, setCittaFilter] = useState<string>("ALL");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    partita_iva: "",
    indirizzo: "",
    citta: "",
    cap: "",
    telefono: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((comp) => comp.id === selectedId),
    [companies, selectedId]
  );

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = [...companies];

    if (selectedId) {
      filtered = filtered.filter((comp) => comp.id !== selectedId);
    }

    if (cittaFilter !== "ALL") {
      filtered = filtered.filter((company) => company.citta === cittaFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.nome.toLowerCase().includes(search) ||
          company.citta.toLowerCase().includes(search) ||
          company.cap.toLowerCase().includes(search) ||
          company.indirizzo.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.nome.localeCompare(b.nome);
        case "name-desc":
          return b.nome.localeCompare(a.nome);
        case "citta":
          return a.citta.localeCompare(b.citta);
        default:
          return 0;
      }
    });

    return filtered;
  }, [companies, cittaFilter, searchTerm, sortBy, selectedId]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(companies.map((c) => c.citta));
    return Array.from(cities).sort();
  }, [companies]);

  const cittaStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: companies.length };
    companies.forEach((company) => {
      stats[company.citta] = (stats[company.citta] || 0) + 1;
    });
    return stats;
  }, [companies]);

  const activeFiltersCount = cittaFilter !== "ALL" ? 1 : 0;

  const clearAllFilters = () => {
    setCittaFilter("ALL");
    setSearchTerm("");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    cittaFilter !== "ALL" || searchTerm || sortBy !== "name-asc";

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim() || formData.nome.length < 2) {
      errors.nome = "Il nome deve contenere almeno 2 caratteri";
    }

    if (!formData.partita_iva.trim() || formData.partita_iva.length < 11) {
      errors.partita_iva = "La partita IVA deve contenere almeno 11 caratteri";
    }

    if (!formData.indirizzo.trim() || formData.indirizzo.length < 5) {
      errors.indirizzo = "L'indirizzo deve contenere almeno 5 caratteri";
    }

    if (!formData.citta.trim() || formData.citta.length < 2) {
      errors.citta = "La città deve contenere almeno 2 caratteri";
    }

    if (!/^\d{5}$/.test(formData.cap)) {
      errors.cap = "Il CAP deve essere di 5 cifre";
    }

    if (!formData.telefono.trim() || formData.telefono.length < 8) {
      errors.telefono = "Il telefono deve contenere almeno 8 caratteri";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Inserisci un'email valida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCompany = async () => {
    if (!validateForm()) {
      toast.error("Compila correttamente tutti i campi obbligatori");
      return;
    }

    try {
      const result = await createCompany(formData).unwrap();
      toast.success("Azienda creata con successo!");
      setIsCreateModalOpen(false);
      setFormData({
        nome: "",
        partita_iva: "",
        indirizzo: "",
        citta: "",
        cap: "",
        telefono: "",
        email: "",
      });
      setFormErrors({});
      onSelect(result.id);
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Errore durante la creazione dell'azienda"
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleScrapeCustomer = async () => {
    if (!scrapeUrl.trim()) {
      toast.error("Inserisci un URL valido");
      return;
    }

    if (!scrapeUrl.match(/^https:\/\/my\.dentalead\.ch\/customers\/\d+$/)) {
      toast.error(
        "URL non valido. Formato: https://my.dentalead.ch/customers/[ID]"
      );
      return;
    }

    setIsScraping(true);

    try {
      const response = await fetch("/api/scrape-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Errore durante lo scraping");
        return;
      }

      setFormData({
        nome: result.data.nome || "",
        partita_iva: result.data.partita_iva || "",
        indirizzo: result.data.indirizzo || "",
        citta: result.data.citta || "",
        cap: result.data.cap || "",
        telefono: result.data.telefono || "",
        email: result.data.email || "",
      });

      const filledFields = Object.values(result.data).filter(
        (v: any) => v && v.trim()
      ).length;

      toast.success(
        `Dati estratti con successo! ${filledFields}/7 campi compilati`
      );
    } catch (error) {
      console.error("Errore durante lo scraping:", error);
      toast.error("Errore durante l'estrazione dei dati");
    } finally {
      setIsScraping(false);
    }
  };

  const resetCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      nome: "",
      partita_iva: "",
      indirizzo: "",
      citta: "",
      cap: "",
      telefono: "",
      email: "",
    });
    setFormErrors({});
    setScrapeUrl("");
  };

  const CompanyCard = ({
    company,
    isPinned = false,
  }: {
    company: CompanyListItem;
    isPinned?: boolean;
  }) => (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(company.id)}
      className={`w-full p-5 text-left hover:bg-bigster-muted-bg transition-colors ${isPinned ? "bg-bigster-surface" : ""
        }`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-bigster-card-bg rounded-none">
          <Building2 className="h-6 w-6 text-bigster-text flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {isPinned && <Pin className="h-4 w-4 text-bigster-text" />}
            <h4 className="font-bold text-lg text-bigster-text">
              {company.nome}
            </h4>
            {isPinned && (
              <span className="px-3 py-1 text-xs font-bold bg-bigster-primary text-bigster-primary-text border border-yellow-200 rounded-none">
                SELEZIONATO
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-bigster-text flex-shrink-0" />
              <p className="text-base font-semibold text-bigster-text">
                {company.citta} - CAP {company.cap}
              </p>
            </div>

            <p className="text-sm text-bigster-text-muted pl-7">
              {company.indirizzo}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-12 w-12 text-bigster-text" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-[15px] font-semibold text-bigster-text">
            Seleziona Azienda
          </h3>

          <div className="relative flex-1 min-w-0">
            <span className="absolute left-2.5 top-2.5">
              <Search width={18} height={18} className="text-bigster-text-muted" />
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, città, CAP..."
              className={`${inputBase} pl-10`}
            />
          </div>

          <Button
            variant="outline"
            className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-3 py-2 hover:bg-bigster-muted-bg"
            onClick={() => setIsFiltersOpen(true)}
          >
            <Filter className="h-5 w-5" />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                style={{ backgroundColor: "#e4d72b" }}
              >
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <div className="w-[200px]">
            <StandardSelect
              value={sortBy}
              onChange={(value: string) => {
                if (value !== "all") setSortBy(value as CompanySortOption);
              }}
              options={[
                { value: "name-asc", label: "Nome (A-Z)" },
                { value: "name-desc", label: "Nome (Z-A)" },
                { value: "citta", label: "Città (A-Z)" },
              ]}
              emptyLabel="Ordinamento"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="ml-auto rounded-none border px-4 py-2 font-semibold bg-bigster-primary text-bigster-primary-text border-yellow-200"
          >
            <Plus className="h-5 w-5 mr-2 inline" />
            Crea Nuova Azienda
          </button>
        </div>
      </motion.div>

      {isFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bigster-surface border border-bigster-border rounded-none shadow-bigster-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-bigster-border bg-bigster-card-bg">
              <h2 className="text-lg font-semibold text-bigster-text">
                Filtra e ordina
              </h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="text-bigster-text-muted hover:text-bigster-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Filtra per città
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setCittaFilter("ALL")}
                    className={`rounded-none border px-3 py-2 text-sm font-semibold transition-colors ${cittaFilter === "ALL"
                      ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                      : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                      }`}
                  >
                    Tutte ({cittaStats.ALL})
                  </button>
                  {uniqueCities.map((citta) => (
                    <button
                      key={citta}
                      onClick={() => setCittaFilter(citta)}
                      className={`rounded-none border px-3 py-2 text-sm font-semibold transition-colors ${cittaFilter === citta
                        ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                        : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                        }`}
                    >
                      {citta} ({cittaStats[citta] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsFiltersOpen(false);
                  }}
                  className="w-full rounded-none border font-semibold px-4 py-2 transition-colors"
                  style={{
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    backgroundColor: "rgba(239,68,68,0.05)",
                  }}
                >
                  <X className="h-4 w-4 mr-2 inline" />
                  Cancella tutti i filtri
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 !mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bigster-surface border border-bigster-border rounded-none shadow-bigster-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-bigster-border bg-bigster-card-bg">
              <h2 className="text-lg font-semibold text-bigster-text">
                Crea nuova azienda
              </h2>
              <button
                onClick={resetCreateModal}
                className="text-bigster-text-muted hover:text-bigster-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-3 p-4 bg-bigster-card-bg border border-bigster-border">
                <h3 className="text-sm font-bold text-bigster-text">
                  Auto-compila da Dentalead
                </h3>
                <p className="text-xs text-bigster-text-muted">
                  Inserisci l'URL del cliente Dentalead per compilare
                  automaticamente i campi. Trova i clienti su{" "}
                  <a
                    href="https://my.dentalead.ch/customers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-bigster-text underline hover:text-bigster-primary-text"
                  >
                    my.dentalead.ch/customers
                  </a>
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    placeholder="https://my.dentalead.ch/customers/[ID]"
                    className={inputBase}
                    disabled={isScraping}
                  />
                  <button
                    onClick={handleScrapeCustomer}
                    disabled={isScraping || !scrapeUrl.trim()}
                    className="rounded-none border px-4 py-2 font-semibold whitespace-nowrap bg-bigster-primary text-bigster-primary-text border-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScraping ? "Caricamento..." : "Importa"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Nome Azienda
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Es: Studio Dentistico Rossi"
                  className={inputBase}
                />
                {formErrors.nome && (
                  <p className="text-red-600 text-xs">{formErrors.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={formData.partita_iva}
                  onChange={(e) =>
                    handleInputChange("partita_iva", e.target.value)
                  }
                  placeholder="Es: 12345678901"
                  className={inputBase}
                />
                {formErrors.partita_iva && (
                  <p className="text-red-600 text-xs">
                    {formErrors.partita_iva}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={formData.indirizzo}
                  onChange={(e) =>
                    handleInputChange("indirizzo", e.target.value)
                  }
                  placeholder="Es: Via Roma 123"
                  className={inputBase}
                />
                {formErrors.indirizzo && (
                  <p className="text-red-600 text-xs">{formErrors.indirizzo}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-bigster-text">
                    Città
                  </label>
                  <input
                    type="text"
                    value={formData.citta}
                    onChange={(e) => handleInputChange("citta", e.target.value)}
                    placeholder="Es: Milano"
                    className={inputBase}
                  />
                  {formErrors.citta && (
                    <p className="text-red-600 text-xs">{formErrors.citta}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-bigster-text">
                    CAP
                  </label>
                  <input
                    type="text"
                    value={formData.cap}
                    onChange={(e) => handleInputChange("cap", e.target.value)}
                    placeholder="Es: 20100"
                    maxLength={5}
                    className={inputBase}
                  />
                  {formErrors.cap && (
                    <p className="text-red-600 text-xs">{formErrors.cap}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    handleInputChange("telefono", e.target.value)
                  }
                  placeholder="Es: +39 02 1234567"
                  className={inputBase}
                />
                {formErrors.telefono && (
                  <p className="text-red-600 text-xs">{formErrors.telefono}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Es: info@studiodentistico.it"
                  className={inputBase}
                />
                {formErrors.email && (
                  <p className="text-red-600 text-xs">{formErrors.email}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetCreateModal}
                  className="flex-1 rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-4 py-2 hover:bg-bigster-muted-bg transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateCompany}
                  disabled={isCreating}
                  className="flex-1 rounded-none border px-4 py-2 font-semibold bg-bigster-primary text-bigster-primary-text border-yellow-200 disabled:opacity-50"
                >
                  {isCreating ? "Creazione..." : "Crea Azienda"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {selectedCompany && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-bigster-card border-2 border-bigster-primary rounded-none">
            <CardHeader className="bg-bigster-primary">
              <CardTitle className="text-base font-semibold text-bigster-primary-text flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Selezione corrente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CompanyCard company={selectedCompany} isPinned={true} />
            </CardContent>
          </Card>
        </motion.div>
      )}


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: selectedCompany ? 0.2 : 0.1 }}
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none">
          <CardHeader className="bg-bigster-card-bg">
            <CardTitle className="text-lg font-semibold text-bigster-text">
              <span className="font-normal text-bigster-text-muted mr-2">
                {selectedCompany ? "Altre aziende:" : "Trovate:"}
              </span>
              {filteredAndSortedCompanies.length}
              {filteredAndSortedCompanies.length !==
                companies.length - (selectedCompany ? 1 : 0) && (
                  <span className="text-sm font-normal text-bigster-text-muted ml-2">
                    su {companies.length - (selectedCompany ? 1 : 0)}
                  </span>
                )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAndSortedCompanies.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <Building2 className="h-16 w-16 text-bigster-text-muted mx-auto opacity-50" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-bigster-text">
                    Nessuna azienda trovata
                  </p>
                  <p className="text-sm text-bigster-text-muted">
                    {searchTerm || cittaFilter !== "ALL"
                      ? "Prova a modificare i filtri di ricerca"
                      : "Non ci sono aziende disponibili"}
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-none border px-6 py-3 font-semibold bg-bigster-primary text-bigster-primary-text border-yellow-200"
                >
                  <Plus className="h-5 w-5 mr-2 inline" />
                  Crea Nuova Azienda
                </button>
              </div>
            ) : (
              <div className="divide-y divide-bigster-border">
                {filteredAndSortedCompanies.map((company: CompanyListItem) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
