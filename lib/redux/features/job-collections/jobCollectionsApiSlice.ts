import { apiSlice } from "../api/apiSlice";
import type {
  JobCollectionResponse,
  JobCollectionDetail,
  UploadUrlResponse,
  DownloadUrlResponse,
  CreateJobCollectionPayload,
  UpdateJobCollectionPayload,
  ReplaceJobCollectionPdfPayload,
  UpdateJobCollectionJsonPayload,
  DeleteJobCollectionResponse,
  SendToClientPayload,
  SendToClientResponse,
  ClientViewResponse,
  ClientApprovalPayload,
  ClientApprovalResponse,
} from "@/types/jobCollection";

export const jobCollectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getUploadUrl: builder.mutation<UploadUrlResponse, number>({
      query: (selectionId) => ({
        url: `/job-collections/upload-url/${selectionId}`,
        method: "POST",
      }),
    }),

    getReplacementUploadUrl: builder.mutation<UploadUrlResponse, number>({
      query: (id) => ({
        url: `/job-collections/${id}/replacement-upload-url`,
        method: "POST",
      }),
    }),

    getUploadJsonUrl: builder.mutation<UploadUrlResponse, number>({
      query: (selectionId) => ({
        url: `/job-collections/upload-json-url/${selectionId}`,
        method: "POST",
      }),
    }),

    getReplacementUploadJsonUrl: builder.mutation<UploadUrlResponse, number>({
      query: (id) => ({
        url: `/job-collections/${id}/replacement-upload-json-url`,
        method: "POST",
      }),
    }),

    createJobCollection: builder.mutation<
      JobCollectionResponse,
      CreateJobCollectionPayload
    >({
      query: (payload) => ({
        url: "/job-collections",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { selezione_id }) => [
        { type: "JobCollection", id: "LIST" },
        { type: "JobCollection", id: `SELECTION_${selezione_id}` },
        { type: "Selection", id: selezione_id },
      ],
    }),

    getJobCollectionById: builder.query<JobCollectionDetail, number>({
      query: (id) => `/job-collections/${id}`,
      providesTags: (result, error, id) => [
        { type: "JobCollection", id },
        ...(result
          ? [{ type: "Selection" as const, id: result.selezione_id }]
          : []),
      ],
    }),

    getJobCollectionBySelectionId: builder.query<JobCollectionResponse, number>(
      {
        query: (selectionId) => `/job-collections/selection/${selectionId}`,
        providesTags: (result, error, selectionId) => [
          { type: "JobCollection", id: `SELECTION_${selectionId}` },
          ...(result
            ? [{ type: "JobCollection" as const, id: result.id }]
            : []),
        ],
      }
    ),

    updateJobCollection: builder.mutation<
      JobCollectionResponse,
      { id: number } & UpdateJobCollectionPayload
    >({
      query: ({ id, ...data }) => ({
        url: `/job-collections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        ...(result
          ? [
            {
              type: "JobCollection" as const,
              id: `SELECTION_${result.selezione_id}`,
            },
            { type: "Selection" as const, id: result.selezione_id },
          ]
          : []),
      ],
    }),

    replaceJobCollectionPdf: builder.mutation<
      JobCollectionResponse,
      { id: number } & ReplaceJobCollectionPdfPayload
    >({
      query: ({ id, s3_key }) => ({
        url: `/job-collections/${id}/replace-pdf`,
        method: "PUT",
        body: { s3_key },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        ...(result
          ? [
            {
              type: "JobCollection" as const,
              id: `SELECTION_${result.selezione_id}`,
            },
            { type: "Selection" as const, id: result.selezione_id },
          ]
          : []),
      ],
    }),

    updateJobCollectionJson: builder.mutation<
      JobCollectionResponse,
      { id: number } & UpdateJobCollectionJsonPayload
    >({
      query: ({ id, s3_key_json }) => ({
        url: `/job-collections/${id}/update-json`,
        method: "PUT",
        body: { s3_key_json },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        ...(result
          ? [
            {
              type: "JobCollection" as const,
              id: `SELECTION_${result.selezione_id}`,
            },
            { type: "Selection" as const, id: result.selezione_id },
          ]
          : []),
      ],
    }),

    deleteJobCollection: builder.mutation<DeleteJobCollectionResponse, number>({
      query: (id) => ({
        url: `/job-collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "JobCollection", id: "LIST" }],
    }),

    getDownloadUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-url`,
    }),

    lazyGetDownloadUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-url`,
    }),

    getDownloadJsonUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-json-url`,
    }),

    lazyGetDownloadJsonUrl: builder.query<DownloadUrlResponse, number>({
      query: (id) => `/job-collections/${id}/download-json-url`,
    }),

    sendToClient: builder.mutation<SendToClientResponse, SendToClientPayload>({
      query: ({ id, email }) => ({
        url: `/job-collections/${id}/send-to-client`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        ...(result
          ? [
            {
              type: "JobCollection" as const,
              id: `SELECTION_${result.selezione_id}`,
            },
            { type: "Selection" as const, id: result.selezione_id },
          ]
          : []),
      ],
    }),

    getClientView: builder.query<ClientViewResponse, number>({
      query: (id) => `/job-collections/${id}/client-view`,
      providesTags: (result, error, id) => [
        { type: "JobCollection", id: `CLIENT_${id}` },
      ],
    }),

    generateAndSavePdf: builder.mutation<
      JobCollectionResponse & { _generated: boolean },
      { selectionId: number; formData: any; companyName?: string }
    >({
      query: (payload) => ({
        url: "/job-collections/generate-and-save",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "JobCollection", id: "LIST" },
        { type: "JobCollection", id: `SELECTION_${selectionId}` },
        { type: "Selection", id: selectionId },
      ],
    }),

    clientApproval: builder.mutation<
      ClientApprovalResponse,
      ClientApprovalPayload
    >({
      query: ({ id, note_cliente }) => ({
        url: `/job-collections/${id}/client-approval`,
        method: "POST",
        body: { note_cliente },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobCollection", id },
        { type: "JobCollection", id: `CLIENT_${id}` },
      ],
    }),
  }),
});

export const {

  useGetUploadUrlMutation,
  useGetReplacementUploadUrlMutation,

  useGenerateAndSavePdfMutation,

  useGetUploadJsonUrlMutation,
  useGetReplacementUploadJsonUrlMutation,

  useCreateJobCollectionMutation,
  useUpdateJobCollectionMutation,
  useReplaceJobCollectionPdfMutation,
  useUpdateJobCollectionJsonMutation,
  useDeleteJobCollectionMutation,

  useGetJobCollectionByIdQuery,
  useGetJobCollectionBySelectionIdQuery,
  useGetDownloadUrlQuery,
  useLazyGetDownloadUrlQuery,

  useGetDownloadJsonUrlQuery,
  useLazyGetDownloadJsonUrlQuery,

  useSendToClientMutation,

  useGetClientViewQuery,
  useClientApprovalMutation,
} = jobCollectionsApiSlice;
