"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Selection } from "@/types/selection";
import { useGetApplicationsBySelectionIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { ApplicationStatus, ApplicationListItem } from "@/types/application";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ApplicationsSectionProps {
  selection: Selection;
}

const VISIBLE_STATES = [
  "ANNUNCIO_PUBBLICATO",
  "CANDIDATURE_RICEVUTE",
  "COLLOQUI_IN_CORSO",
  "CANDIDATO_IN_PROVA",
  "SELEZIONI_IN_SOSTITUZIONE",
  "CHIUSA",
];

const PREVIEW_LIMIT = 5;

interface MiniApplicationCardProps {
  application: ApplicationListItem;
  onClick: () => void;
}

function MiniApplicationCard({ application, onClick }: MiniApplicationCardProps) {
  const fullName = `${application.nome} ${application.cognome}`;
  const location = [application.citta, application.regione].filter(Boolean).join(", ");

  const formattedDate = format(
    new Date(application.data_creazione),
    "d MMM",
    { locale: it }
  );

  return (
    <div
      className="p-3 bg-bigster-card-bg border border-bigster-border hover:border-bigster-text transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-bigster-text truncate">
              {fullName}
            </h4>
            <ApplicationStatusBadge status={application.stato} size="sm" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-bigster-text-muted">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{application.email}</span>
            </span>
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-bigster-text-muted group-hover:text-bigster-text transition-colors" />
      </div>
    </div>
  );
}

function ApplicationEmptyState() {
  return (
    <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
      <Users className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
      <p className="text-sm font-medium text-bigster-text-muted mb-1">
        Nessuna candidatura ricevuta
      </p>
      <p className="text-xs text-bigster-text-muted">
        Le candidature appariranno qui quando i candidati si candidano all'annuncio
      </p>
    </div>
  );
}





export function ApplicationsSection({ selection }: ApplicationsSectionProps) {
  const router = useRouter();
  const isVisible = VISIBLE_STATES.includes(selection.stato);

  const {
    data: applications,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetApplicationsBySelectionIdQuery(selection.id, {
    skip: !isVisible,
  });

  
  const recentApplications = useMemo(() => {
    if (!applications) return [];
    return [...applications]
      .sort((a, b) => new Date(b.data_creazione).getTime() - new Date(a.data_creazione).getTime())
      .slice(0, PREVIEW_LIMIT);
  }, [applications]);

  
  const stats = useMemo(() => {
    if (!applications) return null;
    return {
      total: applications.length,
      inCorso: applications.filter((a) => a.stato === ApplicationStatus.IN_CORSO).length,
      assunti: applications.filter((a) => a.stato === ApplicationStatus.ASSUNTO).length,
      scartati: applications.filter((a) => a.stato === ApplicationStatus.SCARTATO).length,
    };
  }, [applications]);

  const hasMoreApplications = (applications?.length || 0) > PREVIEW_LIMIT;

  
  if (!isVisible) return null;

  
  const handleViewAll = () => {
    router.push(`/candidature?selezione_id=${selection.id}`);
  };

  const handleCardClick = (applicationId: number) => {
    router.push(`/candidature/${applicationId}`);
  };

  return (
    <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-bigster-text" />
            <div>
              <h2 className="text-lg font-bold text-bigster-text">
                Candidature
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {stats ? `${stats.total} candidature ricevute` : "Caricamento..."}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>


      <div className="p-6">

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}


        {error && (
          <Alert className="rounded-none border border-red-400 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              Errore nel caricamento delle candidature. Riprova più tardi.
            </AlertDescription>
          </Alert>
        )}


        {!isLoading && !error && applications && (
          <>
            {applications.length === 0 ? (
              <ApplicationEmptyState />
            ) : (
              <>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                      Totale
                    </p>
                    <p className="text-xl font-bold text-bigster-text">
                      {stats?.total || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      In Corso
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {stats?.inCorso || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                      Assunti
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {stats?.assunti || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                      Scartati
                    </p>
                    <p className="text-xl font-bold text-red-700">
                      {stats?.scartati || 0}
                    </p>
                  </div>
                </div>


                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                    Ultime {Math.min(recentApplications.length, PREVIEW_LIMIT)} candidature
                  </p>
                  {hasMoreApplications && (
                    <p className="text-xs text-bigster-text-muted">
                      +{applications.length - PREVIEW_LIMIT} altre
                    </p>
                  )}
                </div>


                <div className="space-y-2">
                  {recentApplications.map((application) => (
                    <MiniApplicationCard
                      key={application.id}
                      application={application}
                      onClick={() => handleCardClick(application.id)}
                    />
                  ))}
                </div>


                <div className="mt-6">
                  <Button
                    onClick={handleViewAll}
                    className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border-2 border-yellow-300 hover:bg-yellow-400 font-bold py-4 text-base shadow-md transition-all hover:shadow-lg"
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Gestisci tutte le {stats?.total || 0} candidature
                    <ArrowRight className="h-5 w-5 ml-3" />
                  </Button>
                  <p className="text-center text-xs text-bigster-text-muted mt-2">
                    Filtra, cerca e gestisci le candidature con strumenti avanzati
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
