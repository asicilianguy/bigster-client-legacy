"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Download,
  FileText,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  useLazyGetCvDownloadUrlQuery,
  useDeleteApplicationCvMutation
} from "@/lib/redux/features/applications/applicationsApiSlice";
import { toast } from "sonner";

interface CvDownloadButtonProps {
  applicationId: number;
  cvS3Key: string | null;
  candidateName?: string;
  variant?: "default" | "compact" | "card";
  showDelete?: boolean;
  onDeleted?: () => void;
}

export function CvDownloadButton({
  applicationId,
  cvS3Key,
  candidateName = "Candidato",
  variant = "default",
  showDelete = false,
  onDeleted,
}: CvDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [getCvDownloadUrl] = useLazyGetCvDownloadUrlQuery();
  const [deleteCv] = useDeleteApplicationCvMutation();

  const handleDownload = useCallback(async () => {
    if (!cvS3Key) {
      toast.error("Nessun CV disponibile per questa candidatura");
      return;
    }

    setIsDownloading(true);

    try {
      const result = await getCvDownloadUrl(applicationId).unwrap();

      window.open(result.downloadUrl, "_blank");

      toast.success("Download avviato");
    } catch (error: any) {
      console.error("Errore download CV:", error);
      toast.error(
        error?.data?.error || "Errore durante il download del CV"
      );
    } finally {
      setIsDownloading(false);
    }
  }, [applicationId, cvS3Key, getCvDownloadUrl]);

  const handleDelete = useCallback(async () => {
    if (!cvS3Key) return;

    const confirmDelete = window.confirm(
      `Sei sicuro di voler eliminare il CV di ${candidateName}? Questa azione non può essere annullata.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      await deleteCv(applicationId).unwrap();
      toast.success("CV eliminato con successo");
      onDeleted?.();
    } catch (error: any) {
      console.error("Errore eliminazione CV:", error);
      toast.error(
        error?.data?.error || "Errore durante l'eliminazione del CV"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [applicationId, cvS3Key, candidateName, deleteCv, onDeleted]);

  if (!cvS3Key) {
    if (variant === "compact") {
      return (
        <span className="text-xs text-bigster-text-muted italic">
          Nessun CV
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2 text-bigster-text-muted">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Nessun CV caricato</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        className="h-8 px-2 text-bigster-text hover:text-bigster-primary rounded-none"
      >
        {isDownloading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <>
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">CV</span>
          </>
        )}
      </Button>
    );
  }

  if (variant === "card") {
    return (
      <div className="p-4 bg-bigster-card-bg border border-bigster-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bigster-surface border border-bigster-border">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bigster-text">
                Curriculum Vitae
              </p>
              <p className="text-xs text-bigster-text-muted">
                {candidateName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-none border-bigster-border text-bigster-text hover:bg-bigster-muted-bg"
            >
              {isDownloading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica
                </>
              )}
            </Button>

            {showDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
              >
                {isDeleting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        className="rounded-none border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
      >
        {isDownloading ? (
          <>
            <Spinner className="h-4 w-4 mr-2" />
            Scaricamento...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Scarica CV
          </>
        )}
      </Button>

      {showDelete && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          title="Elimina CV"
        >
          {isDeleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

export default CvDownloadButton;
