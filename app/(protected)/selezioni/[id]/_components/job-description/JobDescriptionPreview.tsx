"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { JobDescriptionForm, JobDescriptionType } from "@/types/jobDescription";
import { useSelector } from "react-redux";

interface JobDescriptionPreviewProps {
  formData: JobDescriptionForm;
  tipo: JobDescriptionType;
  companyName?: string;
  selectionId: number;
  onClose: () => void;
  onUploadSuccess?: (jobCollectionId?: number) => void;
  jobCollectionId?: number;
  mode?: "preview" | "upload";
}

export function JobDescriptionPreview({
  formData,
  tipo,
  companyName,
  selectionId,
  onClose,
  onUploadSuccess,
  jobCollectionId,
  mode = "upload",
}: JobDescriptionPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveProgress, setSaveProgress] = useState(0);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = useSelector((state: any) => state.auth?.token);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const analisi = formData.analisi_organizzativa;

  const generatePreview = useCallback(async () => {
    if (!token) return;

    setPreviewLoading(true);
    setPreviewError(null);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/job-collections/preview-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
        body: JSON.stringify({ formData, companyName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Errore ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      console.error("Errore anteprima PDF:", error);
      setPreviewError(
        error instanceof Error ? error.message : "Errore nella generazione dell'anteprima"
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [formData, companyName, token, API_BASE_URL]);

  useEffect(() => {
    generatePreview();

    return () => {

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      let blob: Blob;

      if (blobUrlRef.current) {

        const response = await fetch(blobUrlRef.current);
        blob = await response.blob();
      } else {

        const response = await fetch(`${API_BASE_URL}/job-collections/preview-pdf`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          body: JSON.stringify({ formData, companyName }),
        });

        if (!response.ok) throw new Error("Errore generazione PDF");
        blob = await response.blob();
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Job_Description_${tipo}_${analisi.dati_anagrafici.ragione_sociale || "Documento"
        }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Errore download PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveProgress(20);

    try {
      setSaveProgress(40);

      const response = await fetch(`${API_BASE_URL}/api/job-collections/generate-and-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectionId,
          formData,
          companyName,
        }),
      });

      setSaveProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Errore ${response.status}`);
      }

      const result = await response.json();
      setSaveProgress(100);
      setSaveSuccess(true);

      onUploadSuccess?.(result.id);

    } catch (error) {
      console.error("Errore salvataggio:", error);
      setSaveError(
        error instanceof Error ? error.message : "Errore durante il salvataggio"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded-none border border-bigster-border shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-bigster-primary" />
            <div>
              <h2 className="text-lg font-bold text-bigster-text">
                Anteprima Job Description
              </h2>
              <p className="text-xs text-bigster-text-muted">
                {tipo === JobDescriptionType.DO
                  ? "Dentist Organizer (DO)"
                  : "Assistente di Studio Odontoiatrico (ASO)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <Button
              onClick={generatePreview}
              disabled={previewLoading || isSaving}
              variant="outline"
              className="rounded-none border border-bigster-border"
              title="Rigenera anteprima"
            >
              <RefreshCw className={`h-4 w-4 ${previewLoading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading || isSaving || previewLoading}
              variant="outline"
              className="rounded-none border border-bigster-border"
            >
              {isDownloading ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Scarica PDF
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-none border border-bigster-border"
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-200">
          {previewLoading && (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <Spinner className="h-8 w-8 mx-auto mb-4 text-bigster-primary" />
                <p className="text-sm text-bigster-text-muted">
                  Generazione anteprima PDF...
                </p>
              </div>
            </div>
          )}

          {previewError && (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-bigster-text mb-2">
                  Errore nell&apos;anteprima
                </p>
                <p className="text-xs text-bigster-text-muted mb-4">
                  {previewError}
                </p>
                <Button
                  onClick={generatePreview}
                  variant="outline"
                  className="rounded-none border border-bigster-border"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Riprova
                </Button>
              </div>
            </div>
          )}

          {previewUrl && !previewLoading && !previewError && (
            <iframe
              src={previewUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Anteprima Job Description PDF"
            />
          )}
        </div>

        {mode === "upload" && (
          <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex-shrink-0">

            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-800">
                    {jobCollectionId
                      ? "Job Collection aggiornata con successo!"
                      : "Job Collection creata con successo!"}
                  </p>
                  <p className="text-xs text-green-700">
                    Il documento PDF e i dati del form sono stati salvati.
                  </p>
                </div>
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800">
                    Errore durante il salvataggio
                  </p>
                  <p className="text-xs text-red-700">{saveError}</p>
                </div>
              </div>
            )}

            {isSaving && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Spinner className="h-4 w-4 text-bigster-primary" />
                  <span className="text-sm text-bigster-text">
                    {saveProgress < 40
                      ? "Preparazione..."
                      : saveProgress < 80
                        ? "Generazione e upload PDF..."
                        : "Finalizzazione..."}
                  </span>
                </div>
                <div className="w-full h-2 bg-bigster-border">
                  <div
                    className="h-full bg-bigster-primary transition-all"
                    style={{ width: `${saveProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-bigster-text-muted">
                {jobCollectionId
                  ? "Clicca per aggiornare il PDF e i dati salvati"
                  : "Clicca per salvare il PDF e i dati del form"}
              </p>

              {!saveSuccess && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving || previewLoading}
                  className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                >
                  {isSaving ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {jobCollectionId ? "Aggiorna" : "Salva"} su S3
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDescriptionPreview;
