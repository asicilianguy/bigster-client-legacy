import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import type { ReportOptions } from "@/types/bigster";

interface DownloadState {
    isLoading: boolean;
    error: string | null;
}

interface UseReportDownloadReturn {
    downloadPdf: (
        id: number,
        candidateName?: string,
        options?: ReportOptions
    ) => Promise<void>;
    previewPdf: (id: number) => Promise<void>;
    isDownloading: boolean;
    isPreviewing: boolean;
    error: string | null;
}

export function useBigsterReportDownload(): UseReportDownloadReturn {
    const [downloadState, setDownloadState] = useState<DownloadState>({
        isLoading: false,
        error: null,
    });
    const [previewState, setPreviewState] = useState<DownloadState>({
        isLoading: false,
        error: null,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = useSelector((state: any) => state.auth?.token);

    const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const downloadPdf = useCallback(
        async (
            id: number,
            candidateName?: string,
            options?: ReportOptions
        ): Promise<void> => {
            if (!token) {
                throw new Error("Non autenticato");
            }

            setDownloadState({ isLoading: true, error: null });

            try {

                const params = new URLSearchParams();
                if (options?.raw_scores !== undefined) {
                    params.append("raw_scores", String(options.raw_scores));
                }
                if (options?.interpretation !== undefined) {
                    params.append("interpretation", String(options.interpretation));
                }
                if (options?.validity !== undefined) {
                    params.append("validity", String(options.validity));
                }
                if (options?.lang) {
                    params.append("lang", options.lang);
                }

                const queryString = params.toString();
                const url = `${API_BASE_URL}/api/bigster-reports/${id}/pdf${queryString ? `?${queryString}` : ""}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/pdf",
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
                    }
                    if (response.status === 403) {
                        throw new Error("Non hai i permessi per scaricare questo report.");
                    }
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Errore ${response.status}`);
                }

                const contentDisposition = response.headers.get("Content-Disposition");
                let filename = candidateName
                    ? `report-bigster-${candidateName}-${id}.pdf`
                    : `report-bigster-${id}.pdf`;

                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
                    if (match) {
                        filename = match[1];
                    }
                }

        
                const blob = await response.blob();

        
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);

                setDownloadState({ isLoading: false, error: null });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Errore nel download";
                setDownloadState({ isLoading: false, error: errorMessage });
                throw error;
            }
        },
        [token, API_BASE_URL]
    );

    const previewPdf = useCallback(
        async (id: number): Promise<void> => {
            if (!token) {
                throw new Error("Non autenticato");
            }

            setPreviewState({ isLoading: true, error: null });

            try {
                const url = `${API_BASE_URL}/api/bigster-reports/${id}/preview`;

        
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/pdf",
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
                    }
                    if (response.status === 403) {
                        throw new Error("Non hai i permessi per visualizzare questo report.");
                    }
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Errore ${response.status}`);
                }

        
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");

        
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                }, 60000);

                setPreviewState({ isLoading: false, error: null });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Errore nella preview";
                setPreviewState({ isLoading: false, error: errorMessage });
                throw error;
            }
        },
        [token, API_BASE_URL]
    );

    return {
        downloadPdf,
        previewPdf,
        isDownloading: downloadState.isLoading,
        isPreviewing: previewState.isLoading,
        error: downloadState.error || previewState.error,
    };
}
