"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useGetAnnouncementByHashQuery } from "@/lib/redux/features/public/publicApiSlice";
import { ApplicationForm } from "./_components/ApplicationForm";
import { ApplicationSuccess } from "./_components/ApplicationSuccess";
import { ApplicationError } from "./_components/ApplicationError";
import { Spinner } from "@/components/ui/spinner";
import { Building2, MapPin, Briefcase } from "lucide-react";
import BigsterLoader from "@/components/shared/BigsterLoader";

export default function ApplyPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    nome: string;
    cognome: string;
    email: string;
  } | null>(null);

  const {
    data: announcement,
    isLoading,
    error,
  } = useGetAnnouncementByHashQuery(hash, {
    skip: !hash,
  });

  if (isLoading) {
    return <BigsterLoader text="Caricamento posizione" />;
  }

  if (error || !announcement) {
    return <ApplicationError type="not_found" />;
  }

  if (announcement.stato !== "PUBBLICATO") {
    return <ApplicationError type="closed" announcement={announcement} />;
  }

  if (isSubmitted && submittedData) {
    return (
      <ApplicationSuccess
        candidato={submittedData}
        posizione={announcement.selezione.titolo}
        azienda={announcement.selezione.company.nome}
      />
    );
  }

  const handleSuccess = (data: {
    nome: string;
    cognome: string;
    email: string;
  }) => {
    setSubmittedData(data);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bigster-background">

      <header className="bg-bigster-surface border-b border-bigster-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-bigster-primary border border-yellow-200 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-bigster-primary-text" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bigster-text">
                {announcement.selezione.company.nome}
              </p>
              <p className="text-xs text-bigster-text-muted">
                Stiamo assumendo!
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card mb-8">
          <div className="p-6 border-b border-bigster-border bg-bigster-card-bg">
            <h1 className="text-2xl font-bold text-bigster-text mb-2">
              {announcement.selezione.titolo}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-bigster-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {announcement.selezione.company.nome}
              </span>

              {(announcement.citta ||
                announcement.selezione.company.citta) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {announcement.citta || announcement.selezione.company.citta}
                    {announcement.regione && `, ${announcement.regione}`}
                  </span>
                )}

              {announcement.selezione.figura_ricercata && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {announcement.selezione.figura_ricercata}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

          <div className="px-6 py-4 border-b border-yellow-200 bg-bigster-primary">
            <h2 className="text-lg font-bold text-bigster-primary-text">
              Candidati per questa posizione
            </h2>
            <p className="text-sm text-bigster-primary-text opacity-80">
              Compila il form per inviare la tua candidatura
            </p>
          </div>

          <div className="p-6">
            <ApplicationForm
              announcementId={announcement.id}
              figuraRicercata={announcement.selezione.figura_ricercata ?? undefined}
              onSuccess={handleSuccess}
            />
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-xs text-bigster-text-muted">
            Powered by{" "}
            <span className="font-semibold text-bigster-text">BigsTer</span> •
            I tuoi dati saranno trattati nel rispetto del GDPR
          </p>
        </footer>
      </main>
    </div>
  );
}
