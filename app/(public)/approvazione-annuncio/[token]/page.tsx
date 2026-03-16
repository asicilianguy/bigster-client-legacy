"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Building2,
  User,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import BigsterLoader from "@/components/shared/BigsterLoader";

interface AnnouncementApprovalPublic {
  id: number;
  testo_markdown: string;
  approvato: boolean;
  data_richiesta: string;
  data_approvazione: string | null;
  note_approvazione: string | null;
  already_approved?: boolean;
  message?: string;
  selezione: {
    id: number;
    titolo: string;
    stato: string;
    figura_ricercata: string | null;
    company: { id: number; nome: string };
    risorsa_umana: { id: number; nome: string; cognome: string } | null;
  };
}

type PageStatus =
  | "loading"
  | "ready"
  | "already_approved"
  | "expired"
  | "not_found"
  | "error"
  | "submitting"
  | "success";

export default function ApprovazioneAnnuncioPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<PageStatus>("loading");
  const [data, setData] = useState<AnnouncementApprovalPublic | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [note, setNote] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/announcement-approvals/public/${token}`
        );

        if (response.status === 404) {
          setStatus("not_found");
          return;
        }

        if (response.status === 410) {
          setStatus("expired");
          return;
        }

        if (!response.ok) {
          throw new Error("Errore nel caricamento");
        }

        const result = await response.json();

        if (result.already_approved) {
          setStatus("already_approved");
          setData(result);
          return;
        }

        setData(result);
        setStatus("ready");
      } catch (error) {
        console.error("Errore:", error);
        setStatus("error");
        setErrorMessage(
          "Si è verificato un errore nel caricamento della pagina."
        );
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleSubmit = async (approved: boolean) => {
    setStatus("submitting");
    setActionType(approved ? "approve" : "reject");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/announcement-approvals/public/${token}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvato: approved,
            note_approvazione: note.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante l'operazione");
      }

      const result = await response.json();
      setResultMessage(result.message);
      setStatus("success");
    } catch (error: any) {
      console.error("Errore:", error);
      setStatus("error");
      setErrorMessage(error.message || "Si è verificato un errore");
    }
  };

  if (status === "loading") {
    return <BigsterLoader text="Caricamento bozza annuncio" />;
  }

  if (status === "not_found") {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-md w-full p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-bigster-text mb-2">
            Bozza Non Trovata
          </h1>
          <p className="text-sm text-bigster-text-muted">
            Il link non è valido o la bozza è stata eliminata.
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-md w-full p-8 text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-bigster-text mb-2">
            Link Scaduto
          </h1>
          <p className="text-sm text-bigster-text-muted">
            Il link di approvazione è scaduto. Contatta il team HR per ricevere
            un nuovo link.
          </p>
        </div>
      </div>
    );
  }

  if (status === "already_approved" && data) {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-md w-full p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-bigster-text mb-2">
            Già Approvata
          </h1>
          <p className="text-sm text-bigster-text-muted mb-4">
            Questa bozza annuncio è già stata approvata
            {data.data_approvazione && (
              <>
                {" "}
                il{" "}
                {new Date(data.data_approvazione).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
            .
          </p>
          <div className="p-4 bg-bigster-card-bg border border-bigster-border text-left">
            <p className="text-xs font-semibold text-bigster-text-muted uppercase mb-1">
              Selezione
            </p>
            <p className="text-sm font-medium text-bigster-text">
              {data.selezione.titolo}
            </p>
            <p className="text-xs text-bigster-text-muted">
              {data.selezione.company.nome}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-bigster-text mb-2">Errore</h1>
          <p className="text-sm text-bigster-text-muted">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-bigster-surface border border-bigster-border max-w-md w-full p-8 text-center"
        >
          {actionType === "approve" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-bigster-text mb-2">
                Bozza Approvata!
              </h1>
              <p className="text-sm text-bigster-text-muted">{resultMessage}</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <ThumbsDown className="h-10 w-10 text-orange-600" />
              </div>
              <h1 className="text-xl font-bold text-bigster-text mb-2">
                Modifiche Richieste
              </h1>
              <p className="text-sm text-bigster-text-muted">{resultMessage}</p>
            </>
          )}

          <p className="text-xs text-bigster-text-muted mt-6">
            Puoi chiudere questa pagina.
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "submitting") {
    return (
      <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
        <div className="bg-bigster-surface border border-bigster-border max-w-md w-full p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-bigster-primary mx-auto mb-4" />
          <p className="text-bigster-text">
            {actionType === "approve"
              ? "Approvazione in corso..."
              : "Invio richiesta modifiche..."}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-bigster-background">

      <header className="bg-bigster-surface border-b border-bigster-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Dentalead"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-bigster-text">Dentalead</h1>
              <p className="text-xs text-bigster-text-muted">
                Approvazione Bozza Annuncio
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold">
            <Clock className="h-3 w-3" />
            In Attesa Approvazione
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bigster-surface border border-bigster-border mb-6"
        >
          <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
            <h2 className="text-lg font-bold text-bigster-text">
              Dettagli Selezione
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Studio
                  </p>
                  <p className="text-sm font-medium text-bigster-text">
                    {data.selezione.company.nome}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Posizione
                  </p>
                  <p className="text-sm font-medium text-bigster-text">
                    {data.selezione.figura_ricercata || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                    HR Assegnata
                  </p>
                  <p className="text-sm font-medium text-bigster-text">
                    {data.selezione.risorsa_umana
                      ? `${data.selezione.risorsa_umana.nome} ${data.selezione.risorsa_umana.cognome}`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                    Data Richiesta
                  </p>
                  <p className="text-sm font-medium text-bigster-text">
                    {new Date(data.data_richiesta).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bigster-surface border border-bigster-border mb-6"
        >
          <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center gap-3">
            <FileText className="h-5 w-5 text-bigster-text" />
            <div>
              <h2 className="text-lg font-bold text-bigster-text">
                Bozza Annuncio
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {data.selezione.titolo}
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.testo_markdown}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bigster-surface border border-bigster-border mb-6"
        >
          <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
            <h2 className="text-lg font-bold text-bigster-text">
              Note (Opzionale)
            </h2>
            <p className="text-xs text-bigster-text-muted">
              Aggiungi commenti o richieste di modifica
            </p>
          </div>
          <div className="p-6">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Inserisci eventuali note o feedback..."
              rows={4}
              className="w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-3 text-sm resize-none"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => handleSubmit(true)}
            className="flex-1 h-14 rounded-none bg-green-600 text-white border border-green-500 hover:bg-green-700 text-lg font-semibold"
          >
            <ThumbsUp className="h-5 w-5 mr-3" />
            Approva Bozza
          </Button>

          <Button
            onClick={() => handleSubmit(false)}
            variant="outline"
            className="flex-1 h-14 rounded-none border-2 border-orange-400 text-orange-600 hover:bg-orange-50 text-lg font-semibold"
          >
            <ThumbsDown className="h-5 w-5 mr-3" />
            Richiedi Modifiche
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Cosa succede dopo?</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>
                  • <strong>Approva:</strong> L'annuncio sarà pronto per la
                  pubblicazione sui canali di recruiting.
                </li>
                <li>
                  • <strong>Richiedi Modifiche:</strong> L'HR riceverà una
                  notifica e potrà modificare la bozza.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-bigster-border bg-bigster-surface mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-bigster-text-muted">
            © {new Date().getFullYear()} Dentalead - Selezione del Personale per
            Studi Dentistici
          </p>
        </div>
      </footer>
    </div>
  );
}
