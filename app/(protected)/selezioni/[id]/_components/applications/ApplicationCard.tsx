"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Download,
  ClipboardCheck,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  Ban,
  ExternalLink,
  Loader2,
  Car,
  Plane,
  Cake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLazyGetCvDownloadUrlQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { useBigsterReportDownload } from "@/lib/redux/features/bigster/useBigsterReportDownload";
import { ApplicationListItem, calculateAge, hasDifferentDomicilio } from "@/types/application";
import { BigsterTestStatus } from "@/types/bigster";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { ApplicationDetailDialog } from "./ApplicationDetailDialog";
import { ChangeApplicationStatusDialog } from "./ChangeApplicationStatusDialog";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

interface ApplicationCardProps {
  application: ApplicationListItem;
}

const getTestStatusConfig = (status: BigsterTestStatus) => {
  switch (status) {
    case BigsterTestStatus.PENDING:
      return {
        label: "In attesa",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: Clock,
      };
    case BigsterTestStatus.IN_PROGRESS:
      return {
        label: "In corso",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: PlayCircle,
      };
    case BigsterTestStatus.COMPLETED:
      return {
        label: "Completato",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
      };
    case BigsterTestStatus.EXPIRED:
      return {
        label: "Scaduto",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle,
      };
    case BigsterTestStatus.CANCELLED:
      return {
        label: "Annullato",
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: Ban,
      };
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: Clock,
      };
  }
};

const getEvaluationConfig = (evaluation: string | null) => {
  switch (evaluation) {
    case "IDONEO":
      return { label: "Idoneo", color: "text-green-600" };
    case "PARZIALMENTE_IDONEO":
      return { label: "Parziale", color: "text-yellow-600" };
    case "NON_IDONEO":
      return { label: "Non Idoneo", color: "text-red-600" };
    default:
      return null;
  }
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const router = useRouter();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const [getCvDownloadUrl] = useLazyGetCvDownloadUrlQuery();
  const { downloadPdf, isDownloading } = useBigsterReportDownload();

  const fullName = `${application.nome} ${application.cognome}`;

  const age = application.birthdate
    ? calculateAge(application.birthdate)
    : application.eta;

  const hasDomicilioDiverso = hasDifferentDomicilio(application);

  const location = hasDomicilioDiverso
    ? [application.domicilio_citta, application.domicilio_provincia]
      .filter(Boolean)
      .join(", ")
    : [application.citta, application.provincia || application.regione]
      .filter(Boolean)
      .join(", ");

  const formattedDate = format(
    new Date(application.data_creazione),
    "d MMM yyyy",
    { locale: it }
  );

  const testBigster = application.test_bigster;
  const hasTest = !!testBigster;
  const testCompleted = testBigster?.completed ?? false;
  const testStatus = testBigster?.status;
  const testStatusConfig = testStatus ? getTestStatusConfig(testStatus) : null;
  const evaluationConfig = testBigster?.evaluation
    ? getEvaluationConfig(testBigster.evaluation)
    : null;

  const handleOpenDetail = () => {
    setTimeout(() => {
      setIsDetailOpen(true);
    }, 0);
  };

  const handleOpenStatusDialog = () => {
    setTimeout(() => {
      setIsStatusDialogOpen(true);
    }, 0);
  };

  const handleDownloadCv = async () => {
    if (!application.cv_s3_key) {
      toast.error("Nessun CV disponibile");
      return;
    }

    try {
      const result = await getCvDownloadUrl(application.id).unwrap();
      window.open(result.downloadUrl, "_blank");
      toast.success("Download avviato");
    } catch (error: any) {
      console.error("Errore download CV:", error);
      toast.error(error?.data?.error || "Errore durante il download del CV");
    }
  };

  const handleGoToApplication = () => {
    router.push(`/candidature/${application.id}`);
  };

  const handleGoToTest = () => {
    if (!testBigster?.id) return;
    router.push(`/test-bigster/${testBigster.id}`);
  };

  const handleDownloadTestPdf = async () => {
    if (!testBigster?.id || !testCompleted) return;

    try {
      await downloadPdf(
        testBigster.id,
        `${application.nome}-${application.cognome}`
      );
      toast.success("Report PDF scaricato!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Errore nel download"
      );
    }
  };

  return (
    <>
      <div className="p-4 bg-bigster-card-bg border border-bigster-border hover:border-bigster-text transition-colors">
        <div className="flex items-start justify-between gap-4">

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-sm font-bold text-bigster-text truncate">
                {fullName}
              </h4>
              <ApplicationStatusBadge status={application.stato} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bigster-text-muted">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {application.email}
              </span>
              {application.telefono && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {application.telefono}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                  {hasDomicilioDiverso && (
                    <span className="text-[10px]">(dom.)</span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-bigster-text-muted">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
              {application.cv_s3_key && (
                <span className="inline-flex items-center gap-1 text-blue-600">
                  <FileText className="h-3.5 w-3.5" />
                  CV allegato
                </span>
              )}

              {age && (
                <span className="inline-flex items-center gap-1">
                  <Cake className="h-3.5 w-3.5" />
                  {age} anni
                </span>
              )}

              {application.automunito && (
                <span className="inline-flex items-center gap-1 text-blue-600">
                  <Car className="h-3.5 w-3.5" />
                  Automunito
                </span>
              )}

              {application.disponibilita_trasferte && (
                <span className="inline-flex items-center gap-1 text-purple-600">
                  <Plane className="h-3.5 w-3.5" />
                  Trasferte
                </span>
              )}

              {application.disponibilita_immediata && (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <Clock className="h-3.5 w-3.5" />
                  Disponibile
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToApplication}
              className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
            >
              <Eye className="h-4 w-4 mr-1" />
              Dettagli
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-2"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-none border border-bigster-border bg-bigster-surface"
              >
                <DropdownMenuItem
                  onSelect={handleOpenDetail}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizza dettagli
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleOpenStatusDialog}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Cambia stato
                </DropdownMenuItem>
                {application.cv_s3_key && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleDownloadCv}
                      className="cursor-pointer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Scarica CV
                    </DropdownMenuItem>
                  </>
                )}
                {testCompleted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleGoToTest}
                      className="cursor-pointer"
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Vedi risultati test
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={handleDownloadTestPdf}
                      className="cursor-pointer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Scarica Report PDF
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasTest && testStatusConfig && (
          <div className="mt-3 pt-3 border-t border-bigster-border">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-semibold border ${testStatusConfig.color}`}
                >
                  <testStatusConfig.icon className="h-3 w-3" />
                  Test: {testStatusConfig.label}
                </span>

                {testCompleted && evaluationConfig && (
                  <span
                    className={`text-xs font-semibold ${evaluationConfig.color}`}
                  >
                    {evaluationConfig.label}
                  </span>
                )}

                {!testCompleted && testBigster.questionProgress > 0 && (
                  <span className="text-xs text-bigster-text-muted">
                    {testBigster.questionProgress}% completato
                  </span>
                )}
              </div>

              {testCompleted && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToTest}
                    className="rounded-none border-bigster-border h-7 px-2 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Dettagli
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadTestPdf}
                    disabled={isDownloading}
                    className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 h-7 px-2 text-xs"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {application.note && (
          <div className="mt-3 pt-3 border-t border-bigster-border">
            <p className="text-xs text-bigster-text-muted">
              <span className="font-semibold">Note:</span> {application.note}
            </p>
          </div>
        )}
      </div>

      <ApplicationDetailDialog
        application={application}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onChangeStatus={() => {
          setIsDetailOpen(false);
          setIsStatusDialogOpen(true);
        }}
      />

      <ChangeApplicationStatusDialog
        application={application}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      />
    </>
  );
}
