"use client";

import {
  Building2,
  Briefcase,
  User,
  Users,
  Calendar,
  Clock,
  Package,
  FileText,
  MapPin,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "@/components/ui/bigster/StatusBadge";
import { SelectionDetail } from "@/types/selection";
import { motion } from "framer-motion";

interface SelectionInfoCardProps {
  selection: SelectionDetail;
}

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}

function DetailItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: DetailItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 flex items-center justify-center border ${
            highlight
              ? "bg-bigster-primary border-yellow-200"
              : "bg-bigster-card-bg border-bigster-border"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${
              highlight
                ? "text-bigster-primary-text"
                : "text-bigster-text-muted"
            }`}
          />
        </div>
        <span className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-[15px] font-semibold text-bigster-text pl-10">
        {value || (
          <span className="text-bigster-text-muted font-normal">
            Non specificato
          </span>
        )}
      </div>
    </div>
  );
}

export function SelectionInfoCard({ selection }: SelectionInfoCardProps) {
  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Oggi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi fa`;
    return `${Math.floor(diffDays / 365)} anni fa`;
  };

  const packageLabel =
    selection.pacchetto === "BASE" ? "Selezione Base" : "Selezione Master DTO";

  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(selection.data_creazione).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const daysSinceLastUpdate = Math.floor(
    (new Date().getTime() - new Date(selection.data_modifica).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-bigster-text mb-1">
              Informazioni Selezione
            </h2>
            <p className="text-xs text-bigster-text-muted">
              Creata {getTimeAgo(selection.data_creazione)} • Aggiornata{" "}
              {getTimeAgo(selection.data_modifica)}
            </p>
          </div>
          <StatusBadge status={selection.stato} />
        </div>
      </div>

      <div className="p-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bigster-card-bg border border-bigster-border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bigster-surface border border-bigster-border flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-bigster-text" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                  Giorni Attiva
                </p>
                <p className="text-2xl font-bold text-bigster-text">
                  {daysSinceCreation}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bigster-card-bg border border-bigster-border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bigster-primary border-2 border-yellow-200 flex items-center justify-center">
                <Package className="h-5 w-5 text-bigster-primary-text" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                  Pacchetto
                </p>
                <p className="text-sm font-bold text-bigster-text">
                  {selection.pacchetto}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-bigster-card-bg border border-bigster-border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bigster-surface border border-bigster-border flex items-center justify-center">
                <Clock className="h-5 w-5 text-bigster-text" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                  Ultimo Agg.
                </p>
                <p className="text-sm font-bold text-bigster-text">
                  {daysSinceLastUpdate === 0
                    ? "Oggi"
                    : `${daysSinceLastUpdate}g fa`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DetailItem
              icon={Building2}
              label="Azienda Cliente"
              value={
                <div>
                  <p className="font-bold">{selection.company.nome}</p>
                  {selection.company.citta && (
                    <p className="text-xs text-bigster-text-muted mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selection.company.citta}
                    </p>
                  )}
                </div>
              }
              highlight
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DetailItem
              icon={User}
              label="Consulente"
              value={`${selection.consulente.nome} ${selection.consulente.cognome}`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DetailItem
              icon={Users}
              label="HR Assegnata"
              value={
                selection.risorsa_umana ? (
                  <div>
                    <p className="font-semibold">
                      {selection.risorsa_umana.nome}{" "}
                      {selection.risorsa_umana.cognome}
                    </p>
                    <p className="text-xs text-bigster-text-muted mt-1">
                      {selection.risorsa_umana.email}
                    </p>
                  </div>
                ) : (
                  <span className="text-bigster-text-muted italic">
                    Non ancora assegnata
                  </span>
                )
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DetailItem
              icon={Briefcase}
              label="Figura Ricercata"
              value={
                selection.figura_ricercata ? (
                  <p className="font-semibold">{selection.figura_ricercata}</p>
                ) : (
                  <span className="text-bigster-text-muted italic">
                    Non specificata
                  </span>
                )
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <DetailItem
              icon={Calendar}
              label="Data Creazione"
              value={
                <div>
                  <p>{formatDateShort(selection.data_creazione)}</p>
                  <p className="text-xs text-bigster-text-muted mt-1">
                    {getTimeAgo(selection.data_creazione)}
                  </p>
                </div>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <DetailItem
              icon={Clock}
              label="Ultima Modifica"
              value={
                <div>
                  <p>{formatDateShort(selection.data_modifica)}</p>
                  <p className="text-xs text-bigster-text-muted mt-1">
                    {getTimeAgo(selection.data_modifica)}
                  </p>
                </div>
              }
            />
          </motion.div>

          {selection.data_chiusura && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <DetailItem
                icon={Clock}
                label="Data Chiusura"
                value={
                  <div>
                    <p>{formatDateShort(selection.data_chiusura)}</p>
                    <p className="text-xs text-bigster-text-muted mt-1">
                      {getTimeAgo(selection.data_chiusura)}
                    </p>
                  </div>
                }
              />
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-bigster-card-bg border border-bigster-border mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-bigster-primary border-2 border-yellow-200 flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-bigster-primary-text" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-bigster-text mb-1">
                {packageLabel}
              </p>
              <p className="text-xs text-bigster-text-muted leading-relaxed">
                {selection.pacchetto === "BASE"
                  ? "Pacchetto base con 2 fatture previste: Avvio (AV) e Inserimento (INS)"
                  : "Pacchetto avanzato Master DTO con 3 fatture previste: Avvio (AV), Inserimento (INS) e Master DTO (MDO)"}
              </p>
            </div>
          </div>
        </motion.div>

        {selection.note && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-bigster-text-muted" />
              <span className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                Note
              </span>
            </div>
            <div className="bg-bigster-card-bg border border-bigster-border p-4">
              <p className="text-sm text-bigster-text whitespace-pre-wrap leading-relaxed">
                {selection.note}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
