import { apiSlice } from "../api/apiSlice";
import {
  AnnouncementApprovalDetail,
  AnnouncementApprovalPending,
  CreateAnnouncementApprovalPayload,
  UpdateAnnouncementApprovalPayload,
  ApproveAnnouncementPayload,
} from "@/types/announcementApproval";

export const announcementApprovalsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getAnnouncementApprovalById: builder.query<
      AnnouncementApprovalDetail,
      number
    >({
      query: (id) => `/announcement-approvals/${id}`,
      providesTags: (result, error, id) => [
        { type: "AnnouncementApproval", id },
      ],
    }),

    getAnnouncementApprovalBySelectionId: builder.query<
      AnnouncementApprovalDetail,
      number
    >({
      query: (selectionId) =>
        `/announcement-approvals/selection/${selectionId}`,
      providesTags: (result, error, selectionId) => [
        { type: "AnnouncementApproval", id: `SELECTION_${selectionId}` },
      ],
    }),

    getPendingAnnouncementApprovals: builder.query<
      AnnouncementApprovalPending[],
      void
    >({
      query: () => `/announcement-approvals/pending`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "AnnouncementApproval" as const,
                id,
              })),
              { type: "AnnouncementApproval", id: "PENDING" },
            ]
          : [{ type: "AnnouncementApproval", id: "PENDING" }],
    }),

    createAnnouncementApproval: builder.mutation<
      AnnouncementApprovalDetail,
      CreateAnnouncementApprovalPayload
    >({
      query: (data) => ({
        url: `/announcement-approvals`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AnnouncementApproval", id: "PENDING" },
        { type: "AnnouncementApproval", id: `SELECTION_${arg.selezione_id}` },
        { type: "Selection", id: arg.selezione_id },
      ],
    }),

    updateAnnouncementApproval: builder.mutation<
      AnnouncementApprovalDetail,
      UpdateAnnouncementApprovalPayload & { id: number; selezione_id: number }
    >({
      query: ({ id, ...data }) => ({
        url: `/announcement-approvals/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AnnouncementApproval", id: arg.id },
        { type: "AnnouncementApproval", id: "PENDING" },
        { type: "AnnouncementApproval", id: `SELECTION_${arg.selezione_id}` },
        { type: "Selection", id: arg.selezione_id },
      ],
    }),

    approveAnnouncementApproval: builder.mutation<
      { success: boolean; message: string; stato_aggiornato: boolean },
      ApproveAnnouncementPayload & { selezione_id: number }
    >({
      query: ({ id, selezione_id, ...data }) => ({
        url: `/announcement-approvals/${id}/approve`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AnnouncementApproval", id: arg.id },
        { type: "AnnouncementApproval", id: "PENDING" },
        { type: "AnnouncementApproval", id: `SELECTION_${arg.selezione_id}` },
        { type: "Selection", id: arg.selezione_id },
      ],
    }),

    deleteAnnouncementApproval: builder.mutation<
      { message: string },
      { id: number; selezione_id: number }
    >({
      query: ({ id }) => ({
        url: `/announcement-approvals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AnnouncementApproval", id: arg.id },
        { type: "AnnouncementApproval", id: "PENDING" },
        { type: "AnnouncementApproval", id: `SELECTION_${arg.selezione_id}` },
        { type: "Selection", id: arg.selezione_id },
      ],
    }),
  }),
});

export const {
  useGetAnnouncementApprovalByIdQuery,
  useGetAnnouncementApprovalBySelectionIdQuery,
  useGetPendingAnnouncementApprovalsQuery,
  useLazyGetAnnouncementApprovalByIdQuery,
  useLazyGetAnnouncementApprovalBySelectionIdQuery,
  useLazyGetPendingAnnouncementApprovalsQuery,
  useCreateAnnouncementApprovalMutation,
  useUpdateAnnouncementApprovalMutation,
  useApproveAnnouncementApprovalMutation,
  useDeleteAnnouncementApprovalMutation,
} = announcementApprovalsApiSlice;
