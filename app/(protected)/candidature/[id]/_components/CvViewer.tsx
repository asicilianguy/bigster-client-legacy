"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    FileText,
    Download,
    ExternalLink,
    AlertCircle,
    Maximize2,
    Minimize2,
    RefreshCw,
} from "lucide-react";
import { useLazyGetCvDownloadUrlQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { toast } from "sonner";

interface CvViewerProps {
    applicationId: number;
    cvS3Key?: string | null;
}

export function CvViewer({ applicationId, cvS3Key }: CvViewerProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const [getCvDownloadUrl, { isLoading, isError }] = useLazyGetCvDownloadUrlQuery();

    const fetchPdfUrl = useCallback(async () => {
        if (!cvS3Key) {
            setPdfUrl(null);
            return;
        }

        try {
            const result = await getCvDownloadUrl(applicationId).unwrap();

            setPdfUrl(result.downloadUrl);
        } catch (error) {
            console.error("Errore fetch CV:", error);
            setPdfUrl(null);
        }
    }, [applicationId, cvS3Key, getCvDownloadUrl]);

    useEffect(() => {
        fetchPdfUrl();
    }, [fetchPdfUrl]);

    const handleDownload = useCallback(async () => {
        if (!cvS3Key) {
            toast.error("Nessun CV disponibile");
            return;
        }

        try {
            const result = await getCvDownloadUrl(applicationId).unwrap();

            const link = document.createElement("a");
            link.href = result.downloadUrl;
            link.download = result.filename || "CV.pdf";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Download avviato");
        } catch (error: any) {
            console.error("Errore download CV:", error);
            toast.error(error?.data?.error || "Errore durante il download del CV");
        }
    }, [applicationId, cvS3Key, getCvDownloadUrl]);

    const handleOpenInNewTab = useCallback(async () => {
        if (!cvS3Key) {
            toast.error("Nessun CV disponibile");
            return;
        }

        try {
            const result = await getCvDownloadUrl(applicationId).unwrap();
            window.open(result.downloadUrl, "_blank");
        } catch (error: any) {
            console.error("Errore apertura CV:", error);
            toast.error(error?.data?.error || "Errore durante l'apertura del CV");
        }
    }, [applicationId, cvS3Key, getCvDownloadUrl]);

    if (!cvS3Key) {
        return (
            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Curriculum Vitae
                    </h2>
                </div>

                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-bigster-muted-bg flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-bigster-text-muted" />
                    </div>
                    <p className="text-bigster-text font-semibold mb-2">
                        Nessun CV allegato
                    </p>
                    <p className="text-sm text-bigster-text-muted">
                        Il candidato non ha caricato un curriculum vitae
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-bigster-surface border border-bigster-border">

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                <h2 className="text-lg font-bold text-bigster-text flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Curriculum Vitae
                </h2>

                <div className="flex items-center gap-2">
                    {pdfUrl && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="rounded-none border border-bigster-border"
                            >
                                {isExpanded ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenInNewTab}
                                className="rounded-none border border-bigster-border"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Apri in nuova tab
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleDownload}
                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Scarica
                            </Button>
                        </>
                    )}

                    {!pdfUrl && !isLoading && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchPdfUrl}
                            className="rounded-none border border-bigster-border"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Riprova
                        </Button>
                    )}
                </div>
            </div>

            <div className={`relative ${isExpanded ? "h-[80vh]" : "h-[500px]"}`}>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bigster-muted-bg">
                        <div className="text-center">
                            <Spinner className="h-10 w-10 mx-auto mb-3" />
                            <p className="text-sm text-bigster-text-muted">
                                Caricamento CV...
                            </p>
                        </div>
                    </div>
                )}

                {isError && !pdfUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bigster-muted-bg">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="text-bigster-text font-semibold mb-1">
                                Errore caricamento
                            </p>
                            <p className="text-sm text-bigster-text-muted mb-4">
                                Impossibile caricare il CV
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchPdfUrl}
                                className="rounded-none border border-bigster-border"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Riprova
                            </Button>
                        </div>
                    </div>
                )}

                {pdfUrl && !isLoading && (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="CV Preview"
                    />
                )}

                {!pdfUrl && !isLoading && !isError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bigster-muted-bg">
                        <div className="text-center">
                            <Spinner className="h-10 w-10 mx-auto mb-3" />
                            <p className="text-sm text-bigster-text-muted">
                                Preparazione CV...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
