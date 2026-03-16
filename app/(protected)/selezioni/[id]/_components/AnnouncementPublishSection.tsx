"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Globe,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import {
  AnnouncementPlatform,
  AnnouncementStatus,
} from "@/types/announcement";
import {
  useGetAnnouncementsBySelectionQuery,
  usePublishAnnouncementMutation,
  useCreateAnnouncementMutation,
} from "@/lib/redux/features/announcements/announcementsApiSlice";
import { useGetComuniQuery } from "@/lib/redux/features/geography/geographyApiSlice";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { useItalianGeography } from "@/hooks/useItalianGeography";
import { toast } from "sonner";

interface AnnouncementPublishSectionProps {
  selection: SelectionDetail;
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const PLATFORM_OPTIONS = [
  { value: AnnouncementPlatform.INDEED, label: "Indeed" },
  { value: AnnouncementPlatform.LINKEDIN, label: "LinkedIn" },
  { value: AnnouncementPlatform.ALTRO, label: "Altro" },
];

const VISIBLE_STATES = [
  SelectionStatus.ANNUNCIO_APPROVATO,
  SelectionStatus.ANNUNCIO_PUBBLICATO,
  SelectionStatus.CANDIDATURE_RICEVUTE,
  SelectionStatus.COLLOQUI_IN_CORSO,
  SelectionStatus.CANDIDATO_IN_PROVA,
  SelectionStatus.SELEZIONI_IN_SOSTITUZIONE,
  SelectionStatus.CHIUSA,
];

export function AnnouncementPublishSection({
  selection,
}: AnnouncementPublishSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const [piattaforma, setPiattaforma] = useState<string>("");
  const [linkAnnuncio, setLinkAnnuncio] = useState("");

  const geography = useItalianGeography();

  const { data: comuniData } = useGetComuniQuery(
    { provincia: geography.state.provincia },
    { skip: !geography.state.provincia }
  );

  const cittaOptions = useMemo(() => {
    if (!comuniData) return [];
    return comuniData.map((c) => ({
      value: c.nome,
      label: c.nome,
    }));
  }, [comuniData]);

  const isVisible = VISIBLE_STATES.includes(selection.stato as SelectionStatus);

  const {
    data: announcements,
    isLoading,
    refetch,
  } = useGetAnnouncementsBySelectionQuery(selection.id, {
    skip: !isVisible,
  });

  const [publishAnnouncement, { isLoading: isPublishing }] =
    usePublishAnnouncementMutation();

  const [createAnnouncement, { isLoading: isCreating }] =
    useCreateAnnouncementMutation();

  const inizializzato = useMemo(() => {
    if (!announcements) return null;
    return announcements.find(
      (a) => a.stato === AnnouncementStatus.INIZIALIZZATO
    ) ?? null;
  }, [announcements]);

  const pubblicati = useMemo(() => {
    if (!announcements) return [];
    return announcements.filter(
      (a) => a.stato !== AnnouncementStatus.INIZIALIZZATO
    );
  }, [announcements]);

  const totalCandidature = useMemo(() => {
    if (!announcements) return 0;
    return announcements.reduce(
      (sum, a) => sum + (a._count?.candidature ?? 0),
      0
    );
  }, [announcements]);

  const linkCandidatura = useMemo(() => {
    if (announcements && announcements.length > 0) {
      return announcements[0].link_candidatura;
    }

    if (selection.annunci && selection.annunci.length > 0) {
      return selection.annunci[0].link_candidatura;
    }
    return null;
  }, [announcements, selection.annunci]);

  const hashCandidatura = useMemo(() => {
    if (announcements && announcements.length > 0) {
      return announcements[0].hash_candidatura;
    }
    if (selection.annunci && selection.annunci.length > 0) {
      return selection.annunci[0].hash_candidatura;
    }
    return null;
  }, [announcements, selection.annunci]);

  const getSubtitle = (): string => {
    if (isLoading) return "Caricamento...";
    const total = announcements?.length ?? selection.annunci.length;
    const pubCount = pubblicati.length;
    if (pubCount > 0) {
      return `${pubCount} annunci pubblicati · ${totalCandidature} candidature totali`;
    }
    if (inizializzato) return "Completa i dati per pubblicare";
    if (total === 0) return "Nessun annuncio creato";
    return "Configurazione annunci";
  };

  const isFormComplete =
    piattaforma &&
    geography.state.citta &&
    geography.state.provincia &&
    geography.state.regione;

  const isSubmitting = isPublishing || isCreating;

  useEffect(() => {
    if (inizializzato) {
      if (inizializzato.piattaforma) setPiattaforma(inizializzato.piattaforma);
      if (inizializzato.citta) geography.setCitta(inizializzato.citta);
      if (inizializzato.provincia)
        geography.setProvincia(inizializzato.provincia);
      if (inizializzato.regione) geography.setRegione(inizializzato.regione);
      if (inizializzato.link_annuncio)
        setLinkAnnuncio(inizializzato.link_annuncio);
    }
  }, [inizializzato]);

  const handleCopyLink = async () => {
    if (!linkCandidatura) return;

    try {
      await navigator.clipboard.writeText(linkCandidatura);
      setCopied(true);
      toast.success("Link copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Errore nella copia del link");
    }
  };

  const resetForm = () => {
    setPiattaforma("");
    setLinkAnnuncio("");
    geography.reset();
  };

  const handlePublish = async () => {
    if (!isFormComplete) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const publishData = {
      piattaforma: piattaforma as AnnouncementPlatform,
      citta: geography.state.citta,
      provincia: geography.state.provincia,
      regione: geography.state.regione,
      link_annuncio: linkAnnuncio || null,
    };

    try {
      if (inizializzato) {

        await publishAnnouncement({
          id: inizializzato.id,
          data: publishData,
        }).unwrap();

        toast.success("Annuncio pubblicato con successo!");
      } else if (hashCandidatura && linkCandidatura) {

        const created = await createAnnouncement({
          selezione_id: selection.id,
          company_id: selection.company_id,
          hash_candidatura: hashCandidatura,
          link_candidatura: linkCandidatura,
          piattaforma: piattaforma as AnnouncementPlatform,
          citta: geography.state.citta,
          provincia: geography.state.provincia,
          regione: geography.state.regione,
          link_annuncio: linkAnnuncio || null,
        }).unwrap();

        if (created && created.id && created.stato === AnnouncementStatus.INIZIALIZZATO) {
          await publishAnnouncement({
            id: created.id,
            data: publishData,
          }).unwrap();
        }

        toast.success("Nuovo annuncio creato e pubblicato!");
      } else {
        toast.error("Impossibile creare l'annuncio: dati mancanti");
        return;
      }

      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Errore pubblicazione:", error);
      toast.error(error?.data?.error || "Errore nella pubblicazione");
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bigster-surface border border-bigster-border"
    >

      <div className="border-b border-bigster-border bg-bigster-card-bg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-bigster-muted-bg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bigster-primary border-2 border-yellow-200 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-bigster-primary-text" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-bigster-text">
                Configurazione Annuncio
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {getSubtitle()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalCandidature > 0 && (
              <span className="px-2 py-1 text-xs font-semibold bg-bigster-card-bg text-bigster-text border border-bigster-border flex items-center gap-1">
                <Users className="h-3 w-3" />
                {totalCandidature} candidature
              </span>
            )}
            {pubblicati.length > 0 && (
              <span className="px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                {pubblicati.length} pubblicati
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-bigster-text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-bigster-text-muted" />
            )}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6 space-y-6">

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-bigster-text-muted" />
                  <span className="ml-2 text-sm text-bigster-text-muted">
                    Caricamento annunci...
                  </span>
                </div>
              )}

              {!isLoading && (
                <>

                  {linkCandidatura && (
                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-bigster-text-muted" />
                        <span className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                          Link Candidatura (condiviso per tutti gli annunci)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 bg-bigster-surface border border-bigster-border text-sm text-bigster-text font-mono truncate">
                          {linkCandidatura}
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleCopyLink}
                          className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-3"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-bigster-text-muted mt-2">
                        Usa questo link come URL di redirect nelle impostazioni
                        della piattaforma ATS (Indeed, LinkedIn, ecc.)
                      </p>
                    </div>
                  )}

                  {pubblicati.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-bigster-text">
                          Annunci pubblicati ({pubblicati.length})
                        </h3>
                        {totalCandidature > 0 && (
                          <span className="text-xs text-bigster-text-muted flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {totalCandidature} candidature totali
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {pubblicati.map((annuncio) => {
                          const statusLabel =
                            annuncio.stato === AnnouncementStatus.PUBBLICATO
                              ? "Pubblicato"
                              : annuncio.stato === AnnouncementStatus.CHIUSO
                                ? "Chiuso"
                                : annuncio.stato === AnnouncementStatus.SCADUTO
                                  ? "Scaduto"
                                  : annuncio.stato;

                          const statusColor =
                            annuncio.stato === AnnouncementStatus.PUBBLICATO
                              ? "text-green-700 bg-green-50 border-green-200"
                              : annuncio.stato === AnnouncementStatus.CHIUSO
                                ? "text-gray-600 bg-gray-50 border-gray-300"
                                : "text-yellow-700 bg-yellow-50 border-yellow-200";

                          return (
                            <div
                              key={annuncio.id}
                              className="flex items-center justify-between p-3 bg-bigster-card-bg border border-bigster-border"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-bigster-text">
                                    {annuncio.piattaforma ?? "Piattaforma N/D"}
                                    {annuncio.citta
                                      ? ` — ${annuncio.citta}`
                                      : ""}
                                  </p>
                                  <p className="text-xs text-bigster-text-muted">
                                    {annuncio.data_pubblicazione
                                      ? new Date(
                                        annuncio.data_pubblicazione
                                      ).toLocaleDateString("it-IT", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                      : "Data N/D"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {annuncio.link_annuncio && (
                                  <a
                                    href={annuncio.link_annuncio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:bg-bigster-muted-bg transition-colors"
                                    title="Apri annuncio pubblicato"
                                  >
                                    <ExternalLink className="h-4 w-4 text-bigster-text-muted" />
                                  </a>
                                )}
                                <span
                                  className={`px-2 py-1 text-xs font-semibold border ${statusColor}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(inizializzato || pubblicati.length > 0 || (announcements && announcements.length === 0)) && (
                    <div className="space-y-4">

                      <div className="flex items-center gap-2">
                        {inizializzato ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <p className="text-sm font-semibold text-bigster-text">
                              Completa i dati per pubblicare l'annuncio
                            </p>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 text-bigster-text-muted" />
                            <p className="text-sm font-semibold text-bigster-text">
                              Crea un nuovo annuncio
                            </p>
                          </>
                        )}
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <StandardSelect
                          label="Piattaforma *"
                          value={piattaforma}
                          onChange={(value) =>
                            setPiattaforma(value === "all" ? "" : value)
                          }
                          options={PLATFORM_OPTIONS}
                          emptyLabel="Seleziona piattaforma"
                        />


                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-bigster-text">
                            Link Annuncio (opzionale)
                          </label>
                          <input
                            type="url"
                            value={linkAnnuncio}
                            onChange={(e) => setLinkAnnuncio(e.target.value)}
                            placeholder="https://..."
                            className={inputBase}
                          />
                        </div>


                        <SearchableSelect
                          label="Regione *"
                          value={geography.state.regione}
                          onChange={(value) =>
                            geography.setRegione(value === "all" ? "" : value)
                          }
                          options={geography.regioniOptions}
                          placeholder="Cerca regione..."
                          emptyLabel="Seleziona regione"
                        />


                        <SearchableSelect
                          label="Provincia *"
                          value={geography.state.provincia}
                          onChange={(value) =>
                            geography.setProvincia(value === "all" ? "" : value)
                          }
                          options={geography.provinceOptions}
                          placeholder="Cerca provincia..."
                          emptyLabel={
                            geography.state.regione
                              ? "Seleziona provincia"
                              : "Prima seleziona una regione"
                          }
                        />


                        <div className="md:col-span-2">
                          <SearchableSelect
                            label="Città *"
                            value={geography.state.citta}
                            onChange={(value) =>
                              geography.setCitta(value === "all" ? "" : value)
                            }
                            options={cittaOptions}
                            placeholder="Cerca città..."
                            emptyLabel={
                              geography.state.provincia
                                ? "Seleziona città"
                                : "Prima seleziona una provincia"
                            }
                          />
                        </div>
                      </div>


                      {(geography.state.regione ||
                        geography.state.provincia ||
                        geography.state.citta) && (
                          <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-bigster-text-muted" />
                              <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Località selezionata
                              </span>
                            </div>
                            <p className="text-sm text-bigster-text mt-1">
                              {[
                                geography.state.citta,
                                geography.state.provincia,
                                geography.state.regione,
                              ]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </p>
                          </div>
                        )}


                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handlePublish}
                          disabled={isSubmitting || !isFormComplete}
                          className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Pubblicazione in corso...
                            </>
                          ) : inizializzato ? (
                            <>
                              <Megaphone className="h-4 w-4 mr-2" />
                              Pubblica Annuncio
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Crea e Pubblica Annuncio
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}


                  {!inizializzato &&
                    pubblicati.length > 0 &&
                    !linkCandidatura && (
                      <div className="p-4 bg-green-50 border-2 border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-green-800 mb-1">
                              Tutti gli annunci sono stati pubblicati
                            </p>
                            <p className="text-xs text-green-700">
                              Puoi creare ulteriori annunci utilizzando il form
                              sopra.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
