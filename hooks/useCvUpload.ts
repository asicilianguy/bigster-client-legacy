import { useState, useCallback } from "react";
import { useGetCvUploadUrlMutation } from "@/lib/redux/features/public/publicApiSlice";

export interface CvUploadProgress {
  status: "idle" | "getting-url" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export interface CvUploadResult {
  key: string;
  filename: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
};

export function useCvUpload() {
  const [uploadProgress, setUploadProgress] = useState<CvUploadProgress>({
    status: "idle",
    progress: 0,
  });

  const [getCvUploadUrl] = useGetCvUploadUrlMutation();

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {

      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: "Formato non supportato. Carica un file PDF o Word.",
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          valid: false,
          error: "Il file è troppo grande. Dimensione massima: 5MB",
        };
      }

      return { valid: true };
    },
    []
  );

  const uploadCv = useCallback(
    async (
      file: File,
      announcementId?: number
    ): Promise<CvUploadResult | null> => {

      setUploadProgress({ status: "idle", progress: 0 });

      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error: validation.error,
        });
        return null;
      }

      try {

        setUploadProgress({ status: "getting-url", progress: 10 });

        const { uploadUrl, key } = await getCvUploadUrl({
          filename: file.name,
          contentType: file.type,
          announcementId: announcementId || null,
        }).unwrap();

        setUploadProgress({ status: "uploading", progress: 30 });

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante il caricamento del file");
        }

        setUploadProgress({ status: "success", progress: 100 });

        return {
          key,
          filename: file.name,
        };
      } catch (error: any) {
        const errorMessage =
          error?.data?.error ||
          error?.message ||
          "Errore durante il caricamento del CV";

        setUploadProgress({
          status: "error",
          progress: 0,
          error: errorMessage,
        });

        return null;
      }
    },
    [getCvUploadUrl, validateFile]
  );

  const resetUpload = useCallback(() => {
    setUploadProgress({ status: "idle", progress: 0 });
  }, []);

  const getFileTypeLabel = useCallback((contentType: string): string => {
    return TYPE_LABELS[contentType] || "Documento";
  }, []);

  const isFileValid = useCallback(
    (file: File): boolean => {
      return validateFile(file).valid;
    },
    [validateFile]
  );

  return {
    uploadProgress,
    uploadCv,
    resetUpload,
    validateFile,
    isFileValid,
    getFileTypeLabel,

    MAX_FILE_SIZE,
    ALLOWED_TYPES,
  };
}
