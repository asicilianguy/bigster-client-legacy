"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetSelectionByIdQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useUserRole } from "@/hooks/use-user-role";
import { BigsterLoader } from "@/components/shared/BigsterLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

import { SelectionInfoCard } from "./_components/SelectionInfoCard";
import { SelectionActionsPanel } from "./_components/SelectionActionsPanel";
import { StatusFlowDiagram } from "./_components/StatusFlowDiagram";
import { InvoicesSection } from "./_components/InvoicesSection";
import { StatusHistorySection } from "./_components/StatusHistorySection";
import { SelectionDeadlineCard } from "@/app/(protected)/selezioni/_components/SelectionDeadlineCard";
import { JobDescriptionSection } from "./_components/job-description";
import { AnnouncementApprovalSection } from "./_components/announcement-approval";
import { AnnouncementPublishSection } from "./_components/AnnouncementPublishSection";
import { ApplicationsSection } from "./_components/applications";
import { BigsterTestsSection } from "./_components/bigster-tests";
import { RosaCandidatiSection } from "./_components/rosa-candidati";
import { TrialCandidateCard } from "./_components/TrialCandidateCard";
import { HiredCandidateCard } from "./_components/HiredCandidateCard";

export default function SelectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const selectionId = parseInt(params.id as string);

  const { user, canViewSelection } = useUserRole();
  const {
    data: selection,
    isLoading,
    error,
  } = useGetSelectionByIdQuery(selectionId);

  if (isLoading) {
    return <BigsterLoader text="Caricamento selezione" />;
  }

  if (error || !selection) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-7xl mx-auto py-8 px-4"
      >
        <Alert className="rounded-none border border-red-400 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            {error ? "Errore nel caricamento della selezione" : "Selezione non trovata"}
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild variant="outline" className="rounded-none border border-bigster-border">
            <Link href="/selezioni">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle selezioni
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!canViewSelection(selection)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-7xl mx-auto py-8 px-4"
      >
        <Alert className="rounded-none border border-red-400 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Non hai i permessi per visualizzare questa selezione
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild variant="outline" className="rounded-none border border-bigster-border">
            <Link href="/selezioni">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle selezioni
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bigster-background"
    >

      <div className="mx-auto space-y-6 p-6">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/selezioni")}
            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle selezioni
          </Button>
        </motion.div>

        <TrialCandidateCard selection={selection} />

        <HiredCandidateCard selection={selection} />

        <SelectionInfoCard selection={selection} />

        <SelectionDeadlineCard selection={selection} />

        <SelectionActionsPanel selection={selection} />

        <JobDescriptionSection selection={selection} />

        <AnnouncementApprovalSection selection={selection} />

        {shouldShowAnnouncementPublish(selection.stato) && (
          <AnnouncementPublishSection selection={selection} />
        )}

        <ApplicationsSection selection={selection} />

        <RosaCandidatiSection selection={selection} />

        <BigsterTestsSection selection={selection} />

        <StatusFlowDiagram selection={selection} />

        <InvoicesSection selection={selection} />

        <StatusHistorySection selection={selection} />
      </div>
    </motion.div>
  );
}

function shouldShowAnnouncementPublish(stato: string): boolean {
  const visibleStates = [
    "ANNUNCIO_APPROVATO",
    "ANNUNCIO_PUBBLICATO",
    "CANDIDATURE_RICEVUTE",
    "COLLOQUI_IN_CORSO",
    "CANDIDATO_IN_PROVA",
    "SELEZIONI_IN_SOSTITUZIONE",
    "CHIUSA",
  ];
  return visibleStates.includes(stato);
}

function shouldShowAnnouncements(stato: string): boolean {
  const visibleStates = [
    "RACCOLTA_JOB_APPROVATA_CLIENTE",
    "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
    "ANNUNCIO_APPROVATO",
    "ANNUNCIO_PUBBLICATO",
    "CANDIDATURE_RICEVUTE",
    "COLLOQUI_IN_CORSO",
    "CANDIDATO_IN_PROVA",
    "SELEZIONI_IN_SOSTITUZIONE",
    "CHIUSA",
  ];
  return visibleStates.includes(stato);
}
