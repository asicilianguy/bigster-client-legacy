import { apiSlice } from "../api/apiSlice";
import type {
  AnnouncementListItem,
  AnnouncementDetail,
  AnnouncementBySelectionItem,
  AnnouncementByCompanyItem,
  AnnouncementResponse,
  PublishAnnouncementResponse,
  CloseAnnouncementResponse,
  AnnouncementStatsResponse,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  PublishAnnouncementPayload,
  GetAnnouncementsQueryParams,
  DeleteAnnouncementResponse,
} from "@/types/announcement";

export const announcementsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getAnnouncements: builder.query<
      AnnouncementListItem[],
      GetAnnouncementsQueryParams | void
    >({
      query: (params) => ({
        url: "/announcements",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Announcement" as const,
              id,
            })),
            { type: "Announcement", id: "LIST" },
          ]
          : [{ type: "Announcement", id: "LIST" }],
    }),

    getAnnouncementById: builder.query<AnnouncementDetail, number>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [
        { type: "Announcement" as const, id },
      ],
    }),

    getAnnouncementBySelectionId: builder.query<AnnouncementDetail, number>({
      query: (selectionId) => `/announcements/selection/${selectionId}`,
      providesTags: (result) =>
        result ? [{ type: "Announcement" as const, id: result.id }] : [],
    }),

    getAnnouncementsBySelection: builder.query<
      AnnouncementBySelectionItem[],
      number
    >({
      query: (selezione_id) => `/announcements/by-selection/${selezione_id}`,
      providesTags: (result, error, selezione_id) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Announcement" as const,
              id,
            })),
            { type: "Announcement", id: `LIST_SELECTION_${selezione_id}` },
          ]
          : [{ type: "Announcement", id: `LIST_SELECTION_${selezione_id}` }],
    }),

    getAnnouncementsByCompany: builder.query<
      AnnouncementByCompanyItem[],
      number
    >({
      query: (company_id) => `/announcements/by-company/${company_id}`,
      providesTags: (result, error, company_id) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Announcement" as const,
              id,
            })),
            { type: "Announcement", id: `LIST_COMPANY_${company_id}` },
          ]
          : [{ type: "Announcement", id: `LIST_COMPANY_${company_id}` }],
    }),

    getAnnouncementStats: builder.query<AnnouncementStatsResponse, void>({
      query: () => "/announcements/stats",
      providesTags: [{ type: "Announcement", id: "STATS" }],
    }),

    createAnnouncement: builder.mutation<
      AnnouncementResponse,
      CreateAnnouncementPayload
    >({
      query: (newAnnouncement) => ({
        url: "/announcements",
        method: "POST",
        body: newAnnouncement,
      }),
      invalidatesTags: (result, error, { selezione_id, company_id }) => [
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: `LIST_SELECTION_${selezione_id}` },
        { type: "Announcement", id: `LIST_COMPANY_${company_id}` },
        { type: "Selection", id: selezione_id },
        { type: "Announcement", id: "STATS" },
      ],
    }),

    updateAnnouncement: builder.mutation<
      AnnouncementResponse,
      { id: number; data: UpdateAnnouncementPayload }
    >({
      query: ({ id, data }) => ({
        url: `/announcements/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
        ...(result
          ? [
            { type: "Selection" as const, id: result.selezione_id },
            {
              type: "Announcement" as const,
              id: `LIST_SELECTION_${result.selezione_id}`,
            },
            {
              type: "Announcement" as const,
              id: `LIST_COMPANY_${result.company_id}`,
            },
          ]
          : []),
      ],
    }),

    publishAnnouncement: builder.mutation<
      PublishAnnouncementResponse,
      { id: number; data: PublishAnnouncementPayload }
    >({
      query: ({ id, data }) => ({
        url: `/announcements/${id}/publish`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: "STATS" },
        { type: "Selection", id: "LIST" },
        ...(result?.announcement
          ? [
            { type: "Selection" as const, id: result.announcement.selezione_id },
            {
              type: "Announcement" as const,
              id: `LIST_SELECTION_${result.announcement.selezione_id}`,
            },
            {
              type: "Announcement" as const,
              id: `LIST_COMPANY_${result.announcement.company_id}`,
            },
          ]
          : []),
      ],
    }),

    closeAnnouncement: builder.mutation<CloseAnnouncementResponse, number>({
      query: (id) => ({
        url: `/announcements/${id}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: "STATS" },
        ...(result
          ? [
            { type: "Selection" as const, id: result.selezione_id },
            {
              type: "Announcement" as const,
              id: `LIST_SELECTION_${result.selezione_id}`,
            },
            {
              type: "Announcement" as const,
              id: `LIST_COMPANY_${result.company_id}`,
            },
          ]
          : []),
      ],
    }),

    deleteAnnouncement: builder.mutation<DeleteAnnouncementResponse, number>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Announcement", id: "LIST" },
        { type: "Announcement", id: "STATS" },
      ],
    }),
  }),
});

export const {

  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useGetAnnouncementBySelectionIdQuery,
  useGetAnnouncementsBySelectionQuery,
  useGetAnnouncementsByCompanyQuery,
  useGetAnnouncementStatsQuery,

  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  usePublishAnnouncementMutation,
  useCloseAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementsApiSlice;

export const {
  useGetAnnouncementsBySelectionQuery: useGetAnnouncementsBySelectionIdQuery,
} = announcementsApiSlice;
