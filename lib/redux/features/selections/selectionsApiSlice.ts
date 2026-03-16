import { apiSlice } from "../api/apiSlice";
import type {
  SelectionListItem,
  SelectionDetail,
  SelectionByConsulenteItem,
  SelectionResponse,
  SelectionInvoicesStatusResponse,
  CreateSelectionPayload,
  UpdateSelectionPayload,
  AssignHRPayload,
  ChangeStatusPayload,
  GetSelectionsQueryParams,
  DeleteSelectionResponse,
  SelectionDeadlineMonitoring,

  GetSelectionsPaginatedQueryParams,
  SelectionsPaginatedResponse,
  SelectionFilterOptions,
  SelectionStats,

  GetShortlistResponse,
  AddToShortlistPayload,
  AddToShortlistResponse,
  UpdateShortlistEntryPayload,
  UpdateShortlistEntryResponse,
  ReorderShortlistPayload,
  ReorderShortlistResponse,
  RemoveFromShortlistResponse,
  ClearShortlistResponse,
  CloseWithSuccessResponse,
  CloseWithSuccessPayload,
  PutOnTrialResponse,
  PutOnTrialPayload,
  UsedInvoiceFicIdsResponse,
  PendingInvoicesResponse,
  RegisterInvoicePaymentResponse,
  RegisterInvoicePaymentPayload,
  AddInvoiceToSelectionResponse,
  AddInvoiceToSelectionPayload,
} from "@/types/selection";

export const selectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getSelections: builder.query<SelectionListItem[], GetSelectionsQueryParams>({
      query: (params) => ({ url: "/selections", params }),
      transformResponse: (response: SelectionsPaginatedResponse | SelectionListItem[]) => {

        if (response && typeof response === "object" && "data" in response && "pagination" in response) {
          return (response as SelectionsPaginatedResponse).data;
        }

        return response as SelectionListItem[];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }: { id: number }) => ({
              type: "Selection" as const,
              id,
            })),
            { type: "Selection", id: "LIST" },
          ]
          : [{ type: "Selection", id: "LIST" }],
    }),

    getSelectionsPaginated: builder.query<SelectionsPaginatedResponse, GetSelectionsPaginatedQueryParams>({
      query: (params) => {

        const cleanParams: Record<string, string | number | boolean> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            cleanParams[key] = value;
          }
        });
        return { url: "/selections", params: cleanParams };
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "Selection" as const,
              id,
            })),
            { type: "Selection", id: "LIST" },
          ]
          : [{ type: "Selection", id: "LIST" }],
    }),

    getSelectionFilterOptions: builder.query<SelectionFilterOptions, void>({
      query: () => "/selections/filter-options",
      providesTags: [{ type: "Selection", id: "FILTER_OPTIONS" }],
    }),

    getSelectionStats: builder.query<SelectionStats, void>({
      query: () => "/selections/stats",
      providesTags: [{ type: "Selection", id: "STATS" }],
    }),

    getSelectionById: builder.query<SelectionDetail, number>({
      query: (id) => `/selections/${id}`,
      providesTags: (result, error, id) => [
        { type: "Selection", id },
        { type: "Shortlist", id: `SELECTION_${id}` },
      ],
    }),

    getSelectionsByConsulente: builder.query<SelectionByConsulenteItem[], number>({
      query: (consulente_id) => `/selections/by-consulente/${consulente_id}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Selection" as const,
              id,
            })),
            { type: "Selection", id: "BY_CONSULENTE" },
          ]
          : [{ type: "Selection", id: "BY_CONSULENTE" }],
    }),

    getSelectionInvoicesStatus: builder.query<SelectionInvoicesStatusResponse, number>({
      query: (id) => `/selections/${id}/invoices-status`,
      providesTags: (result, error, id) => [
        { type: "Selection", id },
        { type: "Invoice", id: "LIST" },
      ],
    }),

    createSelection: builder.mutation<SelectionResponse, CreateSelectionPayload>({
      query: (body) => ({
        url: "/selections",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
        { type: "Selection", id: "FILTER_OPTIONS" },
        { type: "Invoice", id: "USED_FIC_IDS" },
      ],
    }),

    updateSelection: builder.mutation<SelectionResponse, { id: number; body: UpdateSelectionPayload }>({
      query: ({ id, body }) => ({
        url: `/selections/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
        { type: "Selection", id: "FILTER_OPTIONS" },
      ],
    }),

    deleteSelection: builder.mutation<DeleteSelectionResponse, number>({
      query: (id) => ({
        url: `/selections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
        { type: "Selection", id: "FILTER_OPTIONS" },
      ],
    }),

    assignHr: builder.mutation<SelectionResponse, { id: number; body: AssignHRPayload }>({
      query: ({ id, body }) => ({
        url: `/selections/${id}/assign-hr`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
      ],
    }),

    changeSelectionStatus: builder.mutation<SelectionResponse, { id: number; body: { nuovo_stato: string; note?: string } }>({
      query: ({ id, body }) => ({
        url: `/selections/${id}/change-status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
        { type: "Selection", id: "FILTER_OPTIONS" },
      ],
    }),

    closeSelectionWithSuccess: builder.mutation<CloseWithSuccessResponse, { id: number; body: CloseWithSuccessPayload }>({
      query: ({ id, body }) => ({
        url: `/selections/${id}/close-with-success`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
        { type: "Selection", id: "FILTER_OPTIONS" },
        { type: "Application", id: "LIST" },
        { type: "Shortlist", id: `SELECTION_${id}` },
        { type: "Shortlist", id: "LIST" },
      ],
    }),

    putCandidateOnTrial: builder.mutation<PutOnTrialResponse, { id: number; body: PutOnTrialPayload }>({
      query: ({ id, body }) => ({
        url: `/selections/${id}/put-on-trial`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Selection", id },
        { type: "Selection", id: "LIST" },
        { type: "Selection", id: "STATS" },
        { type: "Selection", id: "FILTER_OPTIONS" },
        { type: "Application", id: "LIST" },
        { type: "Shortlist", id: `SELECTION_${id}` },
        { type: "Shortlist", id: "LIST" },
      ],
    }),

    getDeadlineMonitoring: builder.query<SelectionDeadlineMonitoring[], void>({
      query: () => "/selections/deadline-monitoring",
      providesTags: [{ type: "Selection", id: "DEADLINES" }],
    }),

    getShortlist: builder.query<GetShortlistResponse, number>({
      query: (selectionId) => `/selections/${selectionId}/shortlist`,
      providesTags: (result, error, selectionId) => [
        { type: "Shortlist", id: `SELECTION_${selectionId}` },
        { type: "Shortlist", id: "LIST" },
      ],
    }),

    addToShortlist: builder.mutation<AddToShortlistResponse, { selectionId: number; body: AddToShortlistPayload }>({
      query: ({ selectionId, body }) => ({
        url: `/selections/${selectionId}/shortlist`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "Shortlist", id: `SELECTION_${selectionId}` },
        { type: "Shortlist", id: "LIST" },
        { type: "Selection", id: selectionId },
        { type: "Selection", id: "LIST" },
        { type: "Application", id: "LIST" },
      ],
    }),

    updateShortlistEntry: builder.mutation<UpdateShortlistEntryResponse, { selectionId: number; applicationId: number; body: UpdateShortlistEntryPayload }>({
      query: ({ selectionId, applicationId, body }) => ({
        url: `/selections/${selectionId}/shortlist/${applicationId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "Shortlist", id: `SELECTION_${selectionId}` },
        { type: "Shortlist", id: "LIST" },
      ],
    }),

    reorderShortlist: builder.mutation<ReorderShortlistResponse, { selectionId: number; body: ReorderShortlistPayload }>({
      query: ({ selectionId, body }) => ({
        url: `/selections/${selectionId}/shortlist/reorder`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "Shortlist", id: `SELECTION_${selectionId}` },
        { type: "Shortlist", id: "LIST" },
      ],
    }),

    removeFromShortlist: builder.mutation<RemoveFromShortlistResponse, { selectionId: number; applicationId: number }>({
      query: ({ selectionId, applicationId }) => ({
        url: `/selections/${selectionId}/shortlist/${applicationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "Shortlist", id: `SELECTION_${selectionId}` },
        { type: "Shortlist", id: "LIST" },
        { type: "Selection", id: selectionId },
        { type: "Application", id: "LIST" },
      ],
    }),

    clearShortlist: builder.mutation<ClearShortlistResponse, number>({
      query: (selectionId) => ({
        url: `/selections/${selectionId}/shortlist`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, selectionId) => [
        { type: "Shortlist", id: `SELECTION_${selectionId}` },
        { type: "Shortlist", id: "LIST" },
        { type: "Selection", id: selectionId },
        { type: "Application", id: "LIST" },
      ],
    }),

    getUsedInvoiceFicIds: builder.query<UsedInvoiceFicIdsResponse, void>({
      query: () => "/selections/used-invoices",
      providesTags: [{ type: "Invoice", id: "USED_FIC_IDS" }],
    }),

    getPendingInvoices: builder.query<PendingInvoicesResponse, void>({
      query: () => "/selections/pending-invoices",
      providesTags: [
        { type: "Invoice", id: "PENDING" },
        { type: "Selection", id: "LIST" },
      ],
    }),

    addInvoiceToSelection: builder.mutation<
      AddInvoiceToSelectionResponse,
      { selectionId: number; body: AddInvoiceToSelectionPayload }
    >({
      query: ({ selectionId, body }) => ({
        url: `/selections/${selectionId}/invoices`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "Invoice", id: "PENDING" },
        { type: "Invoice", id: "USED_FIC_IDS" },
        { type: "Invoice", id: "LIST" },
        { type: "Selection", id: selectionId },
        { type: "Selection", id: "LIST" },
      ],
    }),

    registerInvoicePayment: builder.mutation<
      RegisterInvoicePaymentResponse,
      { selectionId: number; invoiceId: number; body: RegisterInvoicePaymentPayload }
    >({
      query: ({ selectionId, invoiceId, body }) => ({
        url: `/selections/${selectionId}/invoices/${invoiceId}/payment`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { selectionId }) => [
        { type: "Invoice", id: "PENDING" },
        { type: "Invoice", id: "LIST" },
        { type: "Selection", id: selectionId },
        { type: "Selection", id: "LIST" },
      ],
    }),

  }),
});

export const {

  useGetSelectionsQuery,

  useGetSelectionsPaginatedQuery,
  useGetSelectionFilterOptionsQuery,
  useGetSelectionStatsQuery,

  useGetSelectionByIdQuery,
  useGetSelectionsByConsulenteQuery,
  useGetSelectionInvoicesStatusQuery,
  useCreateSelectionMutation,
  useUpdateSelectionMutation,
  useDeleteSelectionMutation,
  useAssignHrMutation,
  useChangeSelectionStatusMutation,
  useGetDeadlineMonitoringQuery,

  useGetShortlistQuery,
  useAddToShortlistMutation,
  useUpdateShortlistEntryMutation,
  useReorderShortlistMutation,
  useRemoveFromShortlistMutation,
  useClearShortlistMutation,
  useCloseSelectionWithSuccessMutation,
  usePutCandidateOnTrialMutation,
  useGetUsedInvoiceFicIdsQuery,
  useGetPendingInvoicesQuery,
  useAddInvoiceToSelectionMutation,
  useRegisterInvoicePaymentMutation,

} = selectionsApiSlice;
