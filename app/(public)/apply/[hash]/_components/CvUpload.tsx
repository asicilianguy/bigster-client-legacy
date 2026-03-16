"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  File,
} from "lucide-react";
import { useCvUpload } from "@/hooks/useCvUpload";

interface CvUploadProps {
  onUploadComplete: (s3Key: string | null) => void;
  announcementId?: number;
  disabled?: boolean;
}

export function CvUpload({
  onUploadComplete,
  announcementId,
  disabled = false,
}: CvUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadProgress,
    uploadCv,
    resetUpload,
    validateFile,
    getFileTypeLabel,
    MAX_FILE_SIZE,
  } = useCvUpload();

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadedKey(null);
      resetUpload();

      const validation = validateFile(file);
      if (!validation.valid) {
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);

      const result = await uploadCv(file, announcementId);

      if (result) {
        setUploadedKey(result.key);
        onUploadComplete(result.key);
      } else {
        onUploadComplete(null);
      }
    },
    [uploadCv, validateFile, resetUpload, onUploadComplete, announcementId]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setUploadedKey(null);
    resetUpload();
    onUploadComplete(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetUpload, onUploadComplete]);

  const handleSelectClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-blue-500" />;
  };

  const isUploading =
    uploadProgress.status === "getting-url" ||
    uploadProgress.status === "uploading";
  const isSuccess = uploadProgress.status === "success";
  const isError = uploadProgress.status === "error";

  return (
    <div className="space-y-3">

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!selectedFile && !isError && (
        <div
          onClick={handleSelectClick}
          className={`
            border-2 border-dashed rounded-none p-6 text-center cursor-pointer
            transition-colors
            ${disabled
              ? "border-bigster-border bg-bigster-muted-bg cursor-not-allowed opacity-60"
              : "border-bigster-border bg-bigster-surface hover:border-bigster-text hover:bg-bigster-muted-bg"
            }
          `}
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-bigster-text-muted" />
          <p className="text-sm font-semibold text-bigster-text mb-1">
            Clicca per caricare il tuo CV{" "}
            <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-bigster-text-muted">
            Formati accettati: PDF, DOC, DOCX • Max{" "}
            {formatFileSize(MAX_FILE_SIZE)}
          </p>
        </div>
      )}

      {selectedFile && isUploading && (
        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
          <div className="flex items-center gap-3">
            {getFileIcon(selectedFile)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bigster-text truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-bigster-text-muted">
                {formatFileSize(selectedFile.size)} •{" "}
                {getFileTypeLabel(selectedFile.type)}
              </p>
            </div>
            <Spinner className="h-4 w-4" />
          </div>

          <div className="mt-3">
            <div className="w-full h-2 bg-bigster-border rounded-none overflow-hidden">
              <div
                className="h-full bg-bigster-primary transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <p className="text-xs text-bigster-text-muted mt-1">
              {uploadProgress.status === "getting-url"
                ? "Preparazione upload..."
                : "Caricamento in corso..."}
            </p>
          </div>
        </div>
      )}

      {selectedFile && isSuccess && uploadedKey && (
        <div className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-700">
                {formatFileSize(selectedFile.size)} • Caricato con successo
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0 text-green-700 hover:text-green-800 hover:bg-green-100"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Rimuovi file</span>
            </Button>
          </div>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Errore durante il caricamento
              </p>
              <p className="text-xs text-red-700 mt-1">
                {uploadProgress.error ||
                  "Si è verificato un errore. Riprova."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectClick}
            className="mt-3 w-full rounded-none border-red-300 text-red-700 hover:bg-red-100"
            disabled={disabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </div>
      )}

      {!selectedFile && !isError && (
        <div className="p-3 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Il Curriculum Vitae è <strong>obbligatorio</strong> per inviare la
              candidatura. Un CV ben strutturato aumenta le tue possibilità di
              essere contattato.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CvUpload;
