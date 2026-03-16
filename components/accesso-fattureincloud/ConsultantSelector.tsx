"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Search, Filter, X, Briefcase, Mail, Pin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetConsulentiQuery } from "@/lib/redux/features/users/usersApiSlice";
import type { UserWithSelectionCount } from "@/types/user";
import { StandardSelect } from "../ui/StandardSelect";

type ConsultantSortOption = "name-asc" | "name-desc" | "selections-desc";

interface ConsultantSelectorProps {
  onSelect: (consultantId: number) => void;
  selectedId?: number | null;
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

export default function ConsultantSelector({
  onSelect,
  selectedId,
}: ConsultantSelectorProps) {
  const { data: consultants = [], isLoading, error } = useGetConsulentiQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<ConsultantSortOption>("name-asc");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const selectedConsultant = useMemo(
    () => consultants.find((cons) => cons.id === selectedId),
    [consultants, selectedId]
  );

  const filteredAndSortedConsultants = useMemo(() => {
    let filtered = [...consultants];

    if (selectedId) {
      filtered = filtered.filter((cons) => cons.id !== selectedId);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (consultant) =>
          consultant.nome.toLowerCase().includes(search) ||
          consultant.cognome.toLowerCase().includes(search) ||
          consultant.email.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return `${a.cognome} ${a.nome}`.localeCompare(
            `${b.cognome} ${b.nome}`
          );
        case "name-desc":
          return `${b.cognome} ${b.nome}`.localeCompare(
            `${a.cognome} ${a.nome}`
          );
        case "selections-desc":
          return (
            (b._count?.selezioni_come_consulente || 0) -
            (a._count?.selezioni_come_consulente || 0)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [consultants, searchTerm, sortBy, selectedId]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSortBy("name-asc");
  };

  const hasActiveFilters = searchTerm || sortBy !== "name-asc";

  const ConsultantCard = ({
    consultant,
    isPinned = false,
  }: {
    consultant: UserWithSelectionCount;
    isPinned?: boolean;
  }) => {
    const fullName = `${consultant.nome} ${consultant.cognome}`;
    const selectionsCount = consultant._count?.selezioni_come_consulente || 0;

    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => onSelect(consultant.id)}
        className={`w-full p-4 text-left hover:bg-bigster-muted-bg transition-colors ${isPinned ? "bg-bigster-surface" : ""
          }`}
      >
        <div className="flex items-start gap-3">
          {isPinned && <Pin className="h-4 w-4 text-bigster-text mt-1" />}
          <User className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-base text-bigster-text">
                {fullName}
              </h4>
              {isPinned && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-bigster-primary text-bigster-primary-text border border-yellow-200 rounded-none">
                  Selezionato
                </span>
              )}
            </div>
            <div className="space-y-1">
              {consultant.email && (
                <div className="flex items-center gap-2 text-sm text-bigster-text-muted">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>{consultant.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold border border-bigster-border rounded-none bg-bigster-surface text-bigster-text">
                  CONSULENTE
                </span>
                {selectionsCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-bigster-text-muted">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {selectionsCount}{" "}
                      {selectionsCount === 1 ? "selezione" : "selezioni"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-12 w-12 text-bigster-text" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-bigster-card border border-bigster-border rounded-none">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-2">
            Errore nel caricamento dei consulenti
          </p>
          <p className="text-sm text-bigster-text-muted">
            {error && "data" in error
              ? JSON.stringify(error.data)
              : "Errore sconosciuto"}
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
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-[15px] font-semibold text-bigster-text">
            Consulenti
          </h3>

          <div className="relative flex-1 min-w-0">
            <span className="absolute left-2.5 top-2.5">
              <Search width={18} height={18} className="text-bigster-text-muted" />
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, cognome, email..."
              className={`${inputBase} pl-10`}
            />
          </div>

          <Button
            variant="outline"
            className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-3 py-2 hover:bg-bigster-muted-bg"
            onClick={() => setIsFiltersOpen(true)}
          >
            <Filter className="h-5 w-5" />
          </Button>

          <div className="w-[220px]">
            <StandardSelect
              value={sortBy}
              onChange={(value: string) => {
                if (value !== "all") setSortBy(value as ConsultantSortOption);
              }}
              options={[
                { value: "name-asc", label: "Nome (A-Z)" },
                { value: "name-desc", label: "Nome (Z-A)" },
                { value: "selections-desc", label: "Selezioni (maggiore)" },
              ]}
              emptyLabel="Ordinamento"
            />
          </div>
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
                  Ordina per
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setSortBy("name-asc")}
                    className={`rounded-none border ${sortBy === "name-asc"
                      ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                      : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                      }`}
                  >
                    Nome (A-Z)
                  </Button>
                  <Button
                    onClick={() => setSortBy("name-desc")}
                    className={`rounded-none border ${sortBy === "name-desc"
                      ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                      : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                      }`}
                  >
                    Nome (Z-A)
                  </Button>
                  <Button
                    onClick={() => setSortBy("selections-desc")}
                    className={`rounded-none border ${sortBy === "selections-desc"
                      ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                      : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                      }`}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Selezioni
                  </Button>
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

      {selectedConsultant && (
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
              <ConsultantCard consultant={selectedConsultant} isPinned={true} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: selectedConsultant ? 0.2 : 0.1,
        }}
      >
        <Card className="shadow-bigster-card border border-bigster-border rounded-none">
          <CardHeader className="bg-bigster-card-bg">
            <CardTitle className="text-lg font-semibold text-bigster-text">
              <span className="font-normal text-bigster-text-muted mr-2">
                {selectedConsultant ? "Altri consulenti:" : "Trovati:"}
              </span>
              {filteredAndSortedConsultants.length}
              {filteredAndSortedConsultants.length !==
                consultants.length - (selectedConsultant ? 1 : 0) && (
                  <span className="text-sm font-normal text-bigster-text-muted ml-2">
                    su {consultants.length - (selectedConsultant ? 1 : 0)}
                  </span>
                )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAndSortedConsultants.length === 0 ? (
              <div className="p-8 text-center text-bigster-text-muted">
                <p className="text-sm">
                  {searchTerm
                    ? "Nessun consulente trovato con i criteri di ricerca"
                    : "Nessun consulente disponibile"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-bigster-border">
                {filteredAndSortedConsultants.map((consultant) => (
                  <ConsultantCard key={consultant.id} consultant={consultant} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
