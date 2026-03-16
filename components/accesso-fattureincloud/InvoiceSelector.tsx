"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Euro,
  Building,
  Search,
  Filter,
  Download,
  AlertCircle,
  X,
  RefreshCw,
  Pin,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { Invoice, useFattureInCloudAuth } from "@/hooks/useFattureInCloudAuth";
import { useGetCompanyByIdQuery } from "@/lib/redux/features/companies/companiesApiSlice";
import { useGetUsedInvoiceFicIdsQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useInvoicesCache } from "@/app/contexts/InvoicesContext";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
type FilterCode = "ALL" | "AV" | "INS" | "MDO";

interface InvoiceSelectorProps {
  companyId: number;
  onSelect: (invoiceId: number, invoice: Invoice) => void;
  selectedId?: number | null;
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Data (più recente)" },
  { value: "date-asc", label: "Data (più vecchia)" },
  { value: "amount-desc", label: "Importo (maggiore)" },
  { value: "amount-asc", label: "Importo (minore)" },
];

export default function InvoiceSelector({
  companyId,
  onSelect,
  selectedId,
}: InvoiceSelectorProps) {
  const { data: company } = useGetCompanyByIdQuery(companyId);
  const { data: usedInvoicesData } = useGetUsedInvoiceFicIdsQuery();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterCode, setFilterCode] = useState<FilterCode>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { isCached, getCacheAge } = useInvoicesCache();

  const {
    isAuthenticated,
    isLoading,
    fetchInvoices,
    companyId: ficCompanyId,
    startAuthorization,
  } = useFattureInCloudAuth({
    clientId: "MTtGdO45g82xfjERs9lGODOmXHRuaBWM",
    clientSecret:
      "XRm8t8N4l5jEwJMEKM6p02zYCJ6BJcxfDVSYgUeeRUVZMmxbFgfFowBetpT4Kig0",
    redirectUri: `http://localhost:3001/amministrazione`,
    companyIndex: 0,
    companyId: 709890,
  });

  const usedFicIds = useMemo(
    () => new Set(usedInvoicesData?.used_fic_ids ?? []),
    [usedInvoicesData]
  );

  const handleLoadInvoices = async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingInvoices(true);
      const data = await fetchInvoices(forceRefresh);
      setInvoices(data);
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && company && invoices.length === 0) {
      handleLoadInvoices(false);
    }
  }, [isAuthenticated, company]);

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === selectedId),
    [invoices, selectedId]
  );

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (selectedId) {
      filtered = filtered.filter((inv) => inv.id !== selectedId);
    }

    if (filterCode !== "ALL") {
      filtered = filtered.filter((invoice) =>
        invoice.items_codes?.includes(filterCode)
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.contract_number?.toLowerCase().includes(search) ||
          invoice.number.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {

      const aUsed = usedFicIds.has(a.id);
      const bUsed = usedFicIds.has(b.id);
      if (aUsed !== bUsed) return aUsed ? 1 : -1;

      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount_gross - a.amount_gross;
        case "amount-asc":
          return a.amount_gross - b.amount_gross;
        default:
          return 0;
      }
    });

    return filtered;
  }, [invoices, filterCode, searchTerm, sortBy, selectedId, usedFicIds]);

  const codeCounts = useMemo(() => {
    const counts = {
      ALL: invoices.length,
      AV: 0,
      INS: 0,
      MDO: 0,
    };

    invoices.forEach((invoice) => {
      if (invoice.items_codes?.includes("AV")) counts.AV++;
      if (invoice.items_codes?.includes("INS")) counts.INS++;
      if (invoice.items_codes?.includes("MDO")) counts.MDO++;
    });

    return counts;
  }, [invoices]);

  const activeFiltersCount = filterCode !== "ALL" ? 1 : 0;

  const clearAllFilters = () => {
    setFilterCode("ALL");
    setSearchTerm("");
    setSortBy("date-desc");
  };

  const hasActiveFilters =
    filterCode !== "ALL" || searchTerm || sortBy !== "date-desc";

  const cacheInfo = useMemo(() => {
    if (!ficCompanyId) return null;

    const cached = isCached(ficCompanyId);
    const age = getCacheAge(ficCompanyId);

    return {
      isCached: cached,
      age: age ? Math.round(age / 1000) : null,
      ageText: age ? `${Math.round(age / 1000)}s fa` : null,
    };
  }, [ficCompanyId, isCached, getCacheAge, invoices.length]);

  const CodeBadge = ({ code }: { code: string }) => (
    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold border border-bigster-border bg-bigster-surface text-bigster-text rounded-none">
      {code}
    </span>
  );

  const InvoiceCard = ({
    invoice,
    isPinned = false,
  }: {
    invoice: Invoice;
    isPinned?: boolean;
  }) => {
    const isUsed = usedFicIds.has(invoice.id);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          if (!isUsed) onSelect(invoice.id, invoice);
        }}
        className={`w-full p-4 text-left transition-colors ${isUsed
          ? "opacity-50 cursor-not-allowed bg-bigster-muted-bg"
          : `hover:bg-bigster-muted-bg cursor-pointer ${isPinned ? "bg-bigster-surface" : ""}`
          }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isPinned && <Pin className="h-4 w-4 text-bigster-text" />}
              {isUsed && <Lock className="h-4 w-4 text-red-400" />}
              <FileText className="h-5 w-5 text-bigster-text-muted" />
              <h4 className="font-semibold text-base text-bigster-text">
                Fattura {invoice.number}
              </h4>
              {isPinned && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-bigster-primary text-bigster-primary-text border border-yellow-200 rounded-none">
                  Selezionato
                </span>
              )}
              {isUsed && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-none">
                  Già associata
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-bigster-text-muted flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(invoice.date).toLocaleDateString("it-IT")}
              </p>
              <p className="text-sm text-bigster-text-muted">
                Contratto:{" "}
                <span className="font-medium text-bigster-text">
                  {invoice.contract_number || "N/D"}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right bg-bigster-card-bg p-3 border border-bigster-border rounded-none">
            <p className="font-semibold text-xl text-bigster-text flex items-center gap-1">
              <Euro className="h-5 w-5" />
              {invoice.amount_gross.toFixed(2)}
            </p>
          </div>
        </div>

        {invoice.items_codes && invoice.items_codes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {invoice.items_codes.map((code, idx) => (
              <CodeBadge key={idx} code={code} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  if (isLoading || !company) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-12 w-12 text-bigster-text" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="shadow-bigster-card border border-bigster-border rounded-none">
        <CardContent className="p-8 text-center space-y-6">
          <div>
            <AlertCircle className="h-16 w-16 mx-auto text-bigster-text-muted mb-4" />
            <h3 className="text-lg font-semibold text-bigster-text mb-2">
              Connessione a Fatture in Cloud richiesta
            </h3>
            <p className="text-sm text-bigster-text-muted max-w-md mx-auto">
              Per visualizzare e selezionare le fatture è necessario
              autenticarsi con Fatture in Cloud
            </p>
          </div>

          <Button
            onClick={() => {
              startAuthorization({ companyId: companyId.toString() });
            }}
            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
          >
            <Building className="mr-2 h-5 w-5" />
            Connetti Fatture in Cloud
          </Button>

          <p className="text-xs text-bigster-text-muted">
            Sarai reindirizzato alla pagina di autenticazione sicura di Fatture
            in Cloud
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none bg-bigster-surface">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-bigster-text-muted" />
                <div>
                  <h3 className="font-semibold text-base text-bigster-text">
                    {company.nome}
                  </h3>
                  <p className="text-sm text-bigster-text-muted">
                    {company.citta}, CAP ({company.cap})
                  </p>
                </div>
              </div>

              {cacheInfo?.isCached && invoices.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-none">
                    📦 Cached
                  </span>
                  {cacheInfo.ageText && (
                    <span className="text-xs text-bigster-text-muted">
                      {cacheInfo.ageText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {invoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-bigster-card border border-bigster-border rounded-none">
            <CardContent className="p-6 text-center">
              <Button
                onClick={() => handleLoadInvoices(false)}
                disabled={isLoadingInvoices}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
              >
                {isLoadingInvoices ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Carica Fatture
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-[15px] font-semibold text-bigster-text">
                Fatture
              </h3>

              <div className="relative flex-1 min-w-0">
                <span className="absolute left-2.5 top-2.5">
                  <Search
                    width={18}
                    height={18}
                    className="text-bigster-text-muted"
                  />
                </span>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca contratto, numero..."
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
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-bigster-primary-text text-xs flex items-center justify-center"
                    style={{ backgroundColor: "#e4d72b" }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <div className="w-[220px]">
                <StandardSelect
                  value={sortBy}
                  onChange={(value: string) => {
                    if (value !== "all") setSortBy(value as SortOption);
                  }}
                  options={SORT_OPTIONS}
                  emptyLabel="Ordinamento"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => handleLoadInvoices(true)}
                disabled={isLoadingInvoices}
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-3 py-2 hover:bg-bigster-muted-bg"
                title="Ricarica fatture (bypass cache)"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isLoadingInvoices ? "animate-spin" : ""
                    }`}
                />
              </Button>

              {usedFicIds.size > 0 && (
                <span className="text-xs text-bigster-text-muted flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {usedFicIds.size} già associate
                </span>
              )}
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
                      Filtra per codice servizio
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["ALL", "AV", "INS", "MDO"] as FilterCode[]).map(
                        (code) => (
                          <Button
                            key={code}
                            onClick={() => setFilterCode(code)}
                            className={`rounded-none border ${filterCode === code
                              ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                              : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                              }`}
                          >
                            {code === "ALL" ? "Tutti" : code} (
                            {codeCounts[code]})
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearAllFilters();
                        setIsFiltersOpen(false);
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
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {selectedInvoice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-bigster-card border-2 border-bigster-primary rounded-none">
                <CardHeader className="bg-bigster-primary">
                  <CardTitle className="text-base font-semibold text-bigster-primary-text flex items-center gap-2">
                    <Pin className="h-5 w-5" />
                    Selezione corrente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <InvoiceCard invoice={selectedInvoice} isPinned={true} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: selectedInvoice ? 0.3 : 0.2 }}
          >
            <Card className="shadow-bigster-card border border-bigster-border rounded-none">
              <CardHeader className="bg-bigster-card-bg">
                <CardTitle className="text-lg font-semibold text-bigster-text">
                  <span className="font-normal text-bigster-text-muted mr-2">
                    {selectedInvoice ? "Altre fatture:" : "Trovate:"}
                  </span>
                  {filteredAndSortedInvoices.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-bigster-border">
                  {filteredAndSortedInvoices.map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
