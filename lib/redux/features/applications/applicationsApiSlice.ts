import { apiSlice } from "../api/apiSlice";
import type {
  Application,
  ApplicationListItem,
  ApplicationDetail,
  ApplicationListResponse,
  FilterOptionsResponse,
  CreateApplicationPayload,
  UpdateApplicationPayload,
  ChangeApplicationStatusPayload,
  RegisterInterviewPayload,
  GetApplicationsQueryParams,
  TestVerifyResponse,
  CompleteTestPayload,
  Interview,
  ApplicationStatsResponse,
  AttestatoAsoStatus,
  RegisterInterviewResponse,
} from "@/types/application";

interface MarkApplicationAsReadResponse {
  success: true;
  message: string;
  data: { id: number; read: boolean };
}

interface ApplicationResponse {
  message: string;
  data: Application;
}

interface ApplicationDetailResponse {
  data: ApplicationDetail;
}

interface SendTestResponse {
  message: string;
  data: {
    test_id: number;
    token_accesso: string;
    inviato_il: string;
  };
}

export interface CvDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
  filename: string;
}

interface UpdateCvKeyResponse {
  message: string;
  data: Application;
}

interface DeleteCvResponse {
  message: string;
}

interface CreateApplicationResponse {
  message: string;
  data: {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    data_creazione: string;
  };
}

interface CompleteTestResponse {
  message: string;
  data: {
    test_id: number;
    punteggio_totale: number | null;
    valutazione: string | null;
    completato_il: string;
  };
}

export type { ApplicationListItem, ApplicationDetail } from "@/types/application";

export type ApplicationWithDetails = ApplicationListItem;

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getApplications: builder.query<
      ApplicationListResponse,
      GetApplicationsQueryParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};

        if (params) {

          if (params.annuncio_id) queryParams.annuncio_id = String(params.annuncio_id);
          if (params.selezione_id) queryParams.selezione_id = String(params.selezione_id);
          if (params.company_id) queryParams.company_id = String(params.company_id);

          if (params.stato) queryParams.stato = params.stato;

          if (params.sesso) queryParams.sesso = params.sesso;
          if (params.regione) queryParams.regione = params.regione;
          if (params.provincia) queryParams.provincia = params.provincia;
          if (params.citta) queryParams.citta = params.citta;
          if (params.titolo_studio) queryParams.titolo_studio = params.titolo_studio;
          if (params.eta_min) queryParams.eta_min = String(params.eta_min);
          if (params.eta_max) queryParams.eta_max = String(params.eta_max);

          if (params.domicilio_regione) queryParams.domicilio_regione = params.domicilio_regione;
          if (params.domicilio_provincia) queryParams.domicilio_provincia = params.domicilio_provincia;
          if (params.domicilio_citta) queryParams.domicilio_citta = params.domicilio_citta;

          if (params.automunito !== undefined) queryParams.automunito = String(params.automunito);
          if (params.disponibilita_trasferte !== undefined) queryParams.disponibilita_trasferte = String(params.disponibilita_trasferte);
          if (params.partita_iva !== undefined) queryParams.partita_iva = String(params.partita_iva);
          if (params.attestato_aso) queryParams.attestato_aso = params.attestato_aso;
          if (params.disponibilita_immediata !== undefined) queryParams.disponibilita_immediata = String(params.disponibilita_immediata);
          if (params.preavviso_min !== undefined) queryParams.preavviso_min = String(params.preavviso_min);
          if (params.preavviso_max !== undefined) queryParams.preavviso_max = String(params.preavviso_max);

          if (params.has_cv !== undefined) queryParams.has_cv = String(params.has_cv);
          if (params.has_note !== undefined) queryParams.has_note = String(params.has_note);
          if (params.is_read !== undefined) queryParams.is_read = String(params.is_read);

          if (params.has_test !== undefined) queryParams.has_test = String(params.has_test);
          if (params.test_status) queryParams.test_status = params.test_status;
          if (params.test_completed !== undefined) queryParams.test_completed = String(params.test_completed);
          if (params.test_eligible !== undefined) queryParams.test_eligible = String(params.test_eligible);
          if (params.test_suspect !== undefined) queryParams.test_suspect = String(params.test_suspect);
          if (params.test_unreliable !== undefined) queryParams.test_unreliable = String(params.test_unreliable);
          if (params.test_preferred !== undefined) queryParams.test_preferred = String(params.test_preferred);
          if (params.test_read !== undefined) queryParams.test_read = String(params.test_read);
          if (params.test_evaluation) queryParams.test_evaluation = params.test_evaluation;
          if (params.test_profile_id !== undefined) queryParams.test_profile_id = String(params.test_profile_id);

          const scoreChars = [
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
            "k", "l", "egl", "etl", "m",
            "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10",
            "n1", "n2", "n3", "n4", "n5",
            "p1", "p2", "p3", "p4", "p5",
          ];
          for (const char of scoreChars) {
            const minKey = `score_${char}_min` as keyof typeof params;
            const maxKey = `score_${char}_max` as keyof typeof params;
            if (params[minKey] !== undefined) queryParams[`score_${char}_min`] = String(params[minKey]);
            if (params[maxKey] !== undefined) queryParams[`score_${char}_max`] = String(params[maxKey]);
          }

          if (params.has_colloqui !== undefined) queryParams.has_colloqui = String(params.has_colloqui);
          if (params.tipo_colloquio) queryParams.tipo_colloquio = params.tipo_colloquio;
          if (params.esito_colloquio) queryParams.esito_colloquio = params.esito_colloquio;
          if (params.has_colloqui_positivi !== undefined) queryParams.has_colloqui_positivi = String(params.has_colloqui_positivi);

          if (params.is_shortlisted !== undefined) queryParams.is_shortlisted = String(params.is_shortlisted);

          if (params.piattaforma) queryParams.piattaforma = params.piattaforma;

          if (params.data_da) queryParams.data_da = params.data_da;
          if (params.data_a) queryParams.data_a = params.data_a;

          if (params.data_chiusura_da) queryParams.data_chiusura_da = params.data_chiusura_da;
          if (params.data_chiusura_a) queryParams.data_chiusura_a = params.data_chiusura_a;

          if (params.search) queryParams.search = params.search;

          if (params.sort_by) queryParams.sort_by = params.sort_by;
          if (params.sort_order) queryParams.sort_order = params.sort_order;

          if (params.page) queryParams.page = String(params.page);
          if (params.limit) queryParams.limit = String(params.limit);
        }

        return {
          url: "/applications",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: "Application" as const, id })),
            { type: "Application", id: "LIST" },
          ]
          : [{ type: "Application", id: "LIST" }],
    }),

    getFilterOptions: builder.query<FilterOptionsResponse, void>({
      query: () => "/applications/filter-options",
      keepUnusedDataFor: 300,
    }),

    getApplicationById: builder.query<ApplicationDetail, number>({
      query: (id) => `/applications/${id}`,
      transformResponse: (response: ApplicationDetailResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),

    getApplicationsBySelectionId: builder.query<ApplicationListItem[], number>({
      query: (selectionId) => `/applications/selection/${selectionId}`,
      transformResponse: (response: { data: ApplicationListItem[] }) => response.data,
      providesTags: (result, error, selectionId) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "Application" as const,
              id,
            })),
            { type: "Application", id: `LIST_SELECTION_${selectionId}` },
          ]
          : [{ type: "Application", id: `LIST_SELECTION_${selectionId}` }],
    }),

    createApplication: builder.mutation<
      CreateApplicationResponse,
      CreateApplicationPayload
    >({
      query: (newApplication) => ({
        url: "/applications",
        method: "POST",
        body: newApplication,
      }),
      invalidatesTags: [
        { type: "Application", id: "LIST" },
        { type: "Announcement", id: "LIST" },
        { type: "Selection", id: "LIST" },
      ],
    }),

    updateApplication: builder.mutation<
      ApplicationResponse,
      { id: number; data: UpdateApplicationPayload }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        { type: "Application", id: "LIST" },
      ],
    }),

    changeApplicationStatus: builder.mutation<
      ApplicationResponse,
      { id: number; data: ChangeApplicationStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        { type: "Application", id: "LIST" },
        { type: "Selection", id: "LIST" },
      ],
    }),

    getCvDownloadUrl: builder.query<CvDownloadUrlResponse, number>({
      query: (applicationId) => `/applications/${applicationId}/cv/download-url`,
      keepUnusedDataFor: 0,
    }),

    updateCvKey: builder.mutation<
      UpdateCvKeyResponse,
      { id: number; cv_s3_key: string }
    >({
      query: ({ id, cv_s3_key }) => ({
        url: `/applications/${id}/cv`,
        method: "PUT",
        body: { cv_s3_key },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
      ],
    }),

    deleteApplicationCv: builder.mutation<DeleteCvResponse, number>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}/cv`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, applicationId) => [
        { type: "Application", id: applicationId },
      ],
    }),

    sendTest: builder.mutation<SendTestResponse, number>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}/send-test`,
        method: "POST",
      }),
      invalidatesTags: (result, error, applicationId) => [
        { type: "Application", id: applicationId },
      ],
    }),

    verifyTestToken: builder.query<TestVerifyResponse, string>({
      query: (token) => `/applications/test/verify/${token}`,
    }),

    completeTest: builder.mutation<
      CompleteTestResponse,
      { token: string; data: CompleteTestPayload }
    >({
      query: ({ token, data }) => ({
        url: `/applications/test/${token}/complete`,
        method: "POST",
        body: data,
      }),
    }),

    registerInterview: builder.mutation<
      RegisterInterviewResponse,
      { applicationId: number; data: RegisterInterviewPayload }
    >({
      query: ({ applicationId, data }) => ({
        url: `/applications/${applicationId}/register-interview`,
        method: "POST",
        body: data,
      }),

      invalidatesTags: (result, error, { applicationId }) => [
        { type: "Application", id: applicationId },
        { type: "Application", id: "LIST" },
        { type: "Selection", id: "LIST" },
      ],
    }),

    markApplicationAsRead: builder.mutation<MarkApplicationAsReadResponse, number>({
      query: (id) => ({
        url: `/applications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Application", id },
        { type: "Application", id: "LIST" },
        { type: "Application", id: "STATS" },
      ],
    }),

    getApplicationStats: builder.query<
      ApplicationStatsResponse,
      { selection_id?: number; company_id?: number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params?.selection_id) {
          queryParams.selection_id = String(params.selection_id);
        }
        if (params?.company_id) {
          queryParams.company_id = String(params.company_id);
        }
        return {
          url: "/applications/stats",
          params: queryParams,
        };
      },
      providesTags: [{ type: "Application", id: "STATS" }],
    }),
  }),
});

export const {

  useGetApplicationsQuery,
  useGetFilterOptionsQuery,
  useGetApplicationByIdQuery,
  useGetApplicationsBySelectionIdQuery,
  useGetCvDownloadUrlQuery,
  useLazyGetCvDownloadUrlQuery,
  useVerifyTestTokenQuery,

  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useChangeApplicationStatusMutation,
  useUpdateCvKeyMutation,
  useDeleteApplicationCvMutation,
  useSendTestMutation,
  useCompleteTestMutation,
  useRegisterInterviewMutation,
  useMarkApplicationAsReadMutation,
  useGetApplicationStatsQuery
} = applicationsApiSlice;
