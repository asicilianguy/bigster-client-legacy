import { useState, useCallback } from "react";
import {

  useGetUploadUrlMutation,
  useCreateJobCollectionMutation,
  useGetReplacementUploadUrlMutation,
  useReplaceJobCollectionPdfMutation,

  useGetUploadJsonUrlMutation,
  useGetReplacementUploadJsonUrlMutation,
  useUpdateJobCollectionJsonMutation,
} from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";

interface UploadProgress {
  status:
    | "idle"
    | "getting-url"
    | "uploading-pdf"
    | "uploading-json"
    | "confirming"
    | "success"
    | "error";
  progress: number;
  error?: string;
}

export function useJobCollectionUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
  });

  const [getUploadUrl] = useGetUploadUrlMutation();
  const [createJobCollection] = useCreateJobCollectionMutation();
  const [getReplacementUploadUrl] = useGetReplacementUploadUrlMutation();
  const [replaceJobCollectionPdf] = useReplaceJobCollectionPdfMutation();

  const [getUploadJsonUrl] = useGetUploadJsonUrlMutation();
  const [getReplacementUploadJsonUrl] =
    useGetReplacementUploadJsonUrlMutation();
  const [updateJobCollectionJson] = useUpdateJobCollectionJsonMutation();

  const uploadNewPdf = useCallback(
    async (selectionId: number, file: File) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        const { upload_url, s3_key } = await getUploadUrl(selectionId).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 30 });

        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        const jobCollection = await createJobCollection({
          selezione_id: selectionId,
          s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error || error?.message || "Errore durante l'upload",
        });
        throw error;
      }
    },
    [getUploadUrl, createJobCollection]
  );

  const replacePdf = useCallback(
    async (jobCollectionId: number, file: File) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        const { upload_url, s3_key } = await getReplacementUploadUrl(
          jobCollectionId
        ).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 30 });

        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        const jobCollection = await replaceJobCollectionPdf({
          id: jobCollectionId,
          s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error ||
            error?.message ||
            "Errore durante la sostituzione del PDF",
        });
        throw error;
      }
    },
    [getReplacementUploadUrl, replaceJobCollectionPdf]
  );

  const uploadJson = useCallback(
    async (jobCollectionId: number, jsonData: object) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 10 });

        const { upload_url, s3_key } = await getReplacementUploadJsonUrl(
          jobCollectionId
        ).unwrap();

        setUploadProgress({ status: "uploading-json", progress: 30 });

        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });

        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: jsonBlob,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Errore durante l'upload del JSON su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        const jobCollection = await updateJobCollectionJson({
          id: jobCollectionId,
          s3_key_json: s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error ||
            error?.message ||
            "Errore durante l'upload del JSON",
        });
        throw error;
      }
    },
    [getReplacementUploadJsonUrl, updateJobCollectionJson]
  );

  const uploadNewPdfAndJson = useCallback(
    async (selectionId: number, pdfFile: File, jsonData: object) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 5 });

        const pdfUrlResponse = await getUploadUrl(selectionId).unwrap();

        const jsonUrlResponse = await getUploadJsonUrl(selectionId).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 15 });

        const pdfUploadResponse = await fetch(pdfUrlResponse.upload_url, {
          method: "PUT",
          body: pdfFile,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!pdfUploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "uploading-json", progress: 50 });

        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });

        const jsonUploadResponse = await fetch(jsonUrlResponse.upload_url, {
          method: "PUT",
          body: jsonBlob,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!jsonUploadResponse.ok) {
          throw new Error("Errore durante l'upload del JSON su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        const jobCollection = await createJobCollection({
          selezione_id: selectionId,
          s3_key: pdfUrlResponse.s3_key,
          s3_key_json: jsonUrlResponse.s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error || error?.message || "Errore durante l'upload",
        });
        throw error;
      }
    },
    [getUploadUrl, getUploadJsonUrl, createJobCollection]
  );

  const replacePdfAndJson = useCallback(
    async (jobCollectionId: number, pdfFile: File, jsonData: object) => {
      try {
        setUploadProgress({ status: "getting-url", progress: 5 });

        const pdfUrlResponse = await getReplacementUploadUrl(
          jobCollectionId
        ).unwrap();

        const jsonUrlResponse = await getReplacementUploadJsonUrl(
          jobCollectionId
        ).unwrap();

        setUploadProgress({ status: "uploading-pdf", progress: 15 });

        const pdfUploadResponse = await fetch(pdfUrlResponse.upload_url, {
          method: "PUT",
          body: pdfFile,
          headers: {
            "Content-Type": "application/pdf",
          },
        });

        if (!pdfUploadResponse.ok) {
          throw new Error("Errore durante l'upload del PDF su S3");
        }

        setUploadProgress({ status: "uploading-json", progress: 50 });

        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });

        const jsonUploadResponse = await fetch(jsonUrlResponse.upload_url, {
          method: "PUT",
          body: jsonBlob,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!jsonUploadResponse.ok) {
          throw new Error("Errore durante l'upload del JSON su S3");
        }

        setUploadProgress({ status: "confirming", progress: 80 });

        await replaceJobCollectionPdf({
          id: jobCollectionId,
          s3_key: pdfUrlResponse.s3_key,
        }).unwrap();

        const jobCollection = await updateJobCollectionJson({
          id: jobCollectionId,
          s3_key_json: jsonUrlResponse.s3_key,
        }).unwrap();

        setUploadProgress({ status: "success", progress: 100 });

        return jobCollection;
      } catch (error: any) {
        setUploadProgress({
          status: "error",
          progress: 0,
          error:
            error?.data?.error ||
            error?.message ||
            "Errore durante la sostituzione",
        });
        throw error;
      }
    },
    [
      getReplacementUploadUrl,
      getReplacementUploadJsonUrl,
      replaceJobCollectionPdf,
      updateJobCollectionJson,
    ]
  );

  const resetProgress = useCallback(() => {
    setUploadProgress({ status: "idle", progress: 0 });
  }, []);

  return {
    uploadProgress,

    uploadNewPdf,
    replacePdf,

    uploadJson,

    uploadNewPdfAndJson,
    replacePdfAndJson,

    resetProgress,
  };
}
