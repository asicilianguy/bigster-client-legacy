"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  Building2,
  Briefcase,
  Calendar,
  MessageSquare,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetClientViewQuery,
  useClientApprovalMutation,
} from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";
import BigsterLoader from "@/components/shared/BigsterLoader";

export default function ApprovazioneJobPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const [noteCliente, setNoteCliente] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [approvalDate, setApprovalDate] = useState<string | null>(null);

  const {
    data: jobData,
    isLoading,
    isError,
    error,
  } = useGetClientViewQuery(id, {
    skip: isNaN(id) || id <= 0,
  });

  const [approveJob, { isLoading: isApproving }] = useClientApprovalMutation();

  useEffect(() => {
    if (jobData?.approvata_dal_cliente) {
      setIsApproved(true);
      setApprovalDate(jobData.data_approvazione_cliente);
      if (jobData.note_cliente) {
        setNoteCliente(jobData.note_cliente);
      }
    }
  }, [jobData]);

  const handleApprove = async () => {
    try {
      const result = await approveJob({
        id,
        note_cliente: noteCliente.trim() || undefined,
      }).unwrap();

      setIsApproved(true);
      setApprovalDate(result.job_collection.data_approvazione_cliente);
    } catch (err) {
      console.error("Errore approvazione:", err);
      alert("Si è verificato un errore. Riprova più tardi.");
    }
  };

  const handleDownload = () => {
    if (jobData?.download_url) {
      window.open(jobData.download_url, "_blank");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <BigsterLoader text="Caricamento documento" />;
  }

  if (isError || !jobData) {
    const errorMessage =
      (error as any)?.data?.message ||
      "Il documento richiesto non è disponibile.";

    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-md w-full">
          <div className="px-6 py-4 border-b border-bigster-border bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h1 className="text-lg font-bold text-red-800">
                Documento non disponibile
              </h1>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-bigster-text mb-4">{errorMessage}</p>
            <p className="text-xs text-bigster-text-muted">
              Se ritieni che questo sia un errore, contatta il team Dentalead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isApproved) {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-lg w-full">

          <div className="px-6 py-6 border-b border-bigster-border bg-green-50 text-center">
            <PartyPopper className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-green-800 mb-1">
              Job Description Approvata!
            </h1>
            <p className="text-sm text-green-700">Grazie per la conferma</p>
          </div>

          <div className="p-6 space-y-4">

            <div className="p-4 bg-bigster-card-bg border border-bigster-border">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-sm text-bigster-text-muted">
                    Studio:
                  </span>
                  <span className="text-sm font-semibold text-bigster-text">
                    {jobData.selezione.company.nome}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-sm text-bigster-text-muted">
                    Posizione:
                  </span>
                  <span className="text-sm font-semibold text-bigster-text">
                    {jobData.selezione.figura_ricercata || "N/D"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-sm text-bigster-text-muted">
                    Approvata il:
                  </span>
                  <span className="text-sm font-semibold text-bigster-text">
                    {formatDate(approvalDate)}
                  </span>
                </div>
              </div>
            </div>

            {noteCliente && (
              <div className="p-4 bg-bigster-muted-bg border border-bigster-border">
                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-2">
                  Le tue note
                </p>
                <p className="text-sm text-bigster-text">{noteCliente}</p>
              </div>
            )}

            <div className="p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Prossimi passi:</strong> Il team Dentalead procederà con
                la preparazione dell'annuncio di lavoro. Riceverai una
                comunicazione non appena sarà pronto per la pubblicazione.
              </p>
            </div>


            {jobData.download_url && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica Job Description (PDF)
              </Button>
            )}
          </div>


          <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg">
            <p className="text-xs text-bigster-text-muted text-center">
              Per qualsiasi domanda, contatta{" "}
              <a
                href="mailto:selezioni@dentalead.ch"
                className="text-bigster-text underline"
              >
                selezioni@dentalead.ch
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bigster-background py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="bg-bigster-surface border border-bigster-border mb-6">
          <div className="px-6 py-6 border-b border-bigster-border bg-bigster-primary text-center">
            <FileText className="h-10 w-10 text-bigster-primary-text mx-auto mb-2" />
            <h1 className="text-xl font-bold text-bigster-primary-text">
              Approvazione Job Description
            </h1>
            <p className="text-sm text-bigster-primary-text mt-1 opacity-90">
              {jobData.selezione.titolo}
            </p>
          </div>


          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Studio
                  </span>
                </div>
                <p className="text-sm font-semibold text-bigster-text">
                  {jobData.selezione.company.nome}
                </p>
              </div>
              <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-bigster-text-muted" />
                  <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Posizione
                  </span>
                </div>
                <p className="text-sm font-semibold text-bigster-text">
                  {jobData.selezione.figura_ricercata || "N/D"}
                </p>
              </div>
            </div>


            <div className="flex items-center gap-2 text-sm text-bigster-text-muted mb-6">
              <Calendar className="h-4 w-4" />
              <span>
                Documento inviato il {formatDate(jobData.data_invio_cliente)}
              </span>
            </div>


            {jobData.download_url && (
              <div className="p-4 bg-blue-50 border border-blue-200 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800 mb-2">
                      Documento da revisionare
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Prima di approvare, scarica e leggi attentamente la Job
                      Description allegata.
                    </p>
                    <Button
                      onClick={handleDownload}
                      className="rounded-none bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Scarica PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="bg-bigster-surface border border-bigster-border">
          <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
            <h2 className="text-lg font-bold text-bigster-text">
              Conferma Approvazione
            </h2>
            <p className="text-xs text-bigster-text-muted mt-1">
              Dopo aver letto il documento, conferma l'approvazione o aggiungi
              eventuali note
            </p>
          </div>

          <div className="p-6 space-y-5">

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-bigster-text">
                <MessageSquare className="h-4 w-4 text-bigster-text-muted" />
                Note o richieste di modifica (opzionale)
              </label>
              <textarea
                value={noteCliente}
                onChange={(e) => setNoteCliente(e.target.value)}
                placeholder="Inserisci eventuali osservazioni, richieste di modifica o commenti..."
                rows={4}
                maxLength={2000}
                className="w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-3 text-sm transition-colors resize-none"
              />
              <p className="text-xs text-bigster-text-muted text-right">
                {noteCliente.length}/2000 caratteri
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> Cliccando "Approva" confermi che le
                informazioni contenute nella Job Description sono corrette e
                possiamo procedere con la pubblicazione dell'annuncio.
              </p>
            </div>


            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="w-full h-12 rounded-none bg-green-600 text-white hover:bg-green-700 font-semibold text-base"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Approvazione in corso...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Approva Job Description
                </>
              )}
            </Button>


            <p className="text-xs text-bigster-text-muted text-center">
              Hai domande o dubbi? Rispondi direttamente all'email ricevuta o
              contatta{" "}
              <a
                href="mailto:selezioni@dentalead.ch"
                className="text-bigster-text underline"
              >
                selezioni@dentalead.ch
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-bigster-text-muted">
            © {new Date().getFullYear()} Dentalead. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </div>
  );
}
