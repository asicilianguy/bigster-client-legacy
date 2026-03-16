import { apiSlice } from "../api/apiSlice";
import type {
    BigsterTestFilters,
    BigsterTestListItem,
    BigsterTestListResponse,
    BigsterTestDetailRaw,
    BigsterTestDetail,
    BigsterTestByApplicationResponse,
    CreateBigsterTestRequest,
    CreateBigsterTestResponse,
    ResendBigsterTestRequest,
    ResendBigsterTestResponse,
    CancelBigsterTestResponse,
    BigsterProfile,
    BigsterTestFilterOptionsResponse,
    MarkBigsterTestAsReadResponse,
    TestAnswersResponse,
    CreateBigsterProfileRequest,
    CreateBigsterProfileResponse,
} from "@/types/bigster";

function transformTestDetail(raw: BigsterTestDetailRaw): BigsterTestDetail {
    return {
        id: raw.id,
        applicationId: raw.application_id,
        hashTest: raw.hash_test,
        status: raw.status,

        firstName: raw.candidate.first_name,
        lastName: raw.candidate.last_name,
        email: raw.candidate.email,
        phone: raw.candidate.phone,
        sex: raw.candidate.sex,
        birthDate: raw.candidate.birth_date,

        sentAt: raw.sent_at,
        startedAt: raw.started_at,
        completedAt: raw.completed_at,
        expiresAt: raw.expires_at,
        isExpired: raw.is_expired,

        completed: raw.completed,
        eligible: raw.eligible,
        suspect: raw.suspect,
        unreliable: raw.unreliable,
        evaluation: raw.evaluation,
        read: raw.read,

        questionProgress: raw.question_progress,
        totalQuestions: raw.total_questions,

        scores: raw.scores,
        malus: raw.malus,
        calculationLog: raw.calculation_log,

        profile: raw.profile,
        application: raw.application,
        selection: raw.selection,

        isInShortlist: raw.is_in_shortlist,
        shortlistedIn: raw.shortlisted_in,

        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
    };
}

export const bigsterTestApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getBigsterTests: builder.query<BigsterTestListResponse, BigsterTestFilters | void>({
            query: (params) => {
                const queryParams: Record<string, string> = {};

                if (params) {

                    if (params.status) queryParams.status = params.status;
                    if (params.completed !== undefined) queryParams.completed = String(params.completed);
                    if (params.eligible !== undefined) queryParams.eligible = String(params.eligible);
                    if (params.suspect !== undefined) queryParams.suspect = String(params.suspect);
                    if (params.unreliable !== undefined) queryParams.unreliable = String(params.unreliable);
                    if (params.read !== undefined) queryParams.read = String(params.read);

                    if (params.application_id) queryParams.application_id = String(params.application_id);
                    if (params.selection_id) queryParams.selection_id = String(params.selection_id);
                    if (params.announcement_id) queryParams.announcement_id = String(params.announcement_id);
                    if (params.company_id) queryParams.company_id = String(params.company_id);
                    if (params.profile_id) queryParams.profile_id = String(params.profile_id);

                    if (params.is_shortlisted !== undefined) queryParams.is_shortlisted = String(params.is_shortlisted);

                    if (params.candidate_sex) queryParams.candidate_sex = params.candidate_sex;
                    if (params.candidate_regione) queryParams.candidate_regione = params.candidate_regione;

                    if (params.candidate_provincia) queryParams.candidate_provincia = params.candidate_provincia;
                    if (params.candidate_citta) queryParams.candidate_citta = params.candidate_citta;
                    if (params.domicilio_regione) queryParams.domicilio_regione = params.domicilio_regione;
                    if (params.domicilio_provincia) queryParams.domicilio_provincia = params.domicilio_provincia;
                    if (params.domicilio_citta) queryParams.domicilio_citta = params.domicilio_citta;

                    if (params.automunito !== undefined) queryParams.automunito = String(params.automunito);
                    if (params.disponibilita_trasferte !== undefined) queryParams.disponibilita_trasferte = String(params.disponibilita_trasferte);
                    if (params.partita_iva !== undefined) queryParams.partita_iva = String(params.partita_iva);
                    if (params.attestato_aso) queryParams.attestato_aso = params.attestato_aso;
                    if (params.disponibilita_immediata !== undefined) queryParams.disponibilita_immediata = String(params.disponibilita_immediata);
                    if (params.char_k_min !== undefined) queryParams.char_k_min = String(params.char_k_min);
                    if (params.char_k_max !== undefined) queryParams.char_k_max = String(params.char_k_max);
                    if (params.char_l_min !== undefined) queryParams.char_l_min = String(params.char_l_min);
                    if (params.char_l_max !== undefined) queryParams.char_l_max = String(params.char_l_max);
                    if (params.char_egl_min !== undefined) queryParams.char_egl_min = String(params.char_egl_min);
                    if (params.char_egl_max !== undefined) queryParams.char_egl_max = String(params.char_egl_max);
                    if (params.char_etl_min !== undefined) queryParams.char_etl_min = String(params.char_etl_min);
                    if (params.char_etl_max !== undefined) queryParams.char_etl_max = String(params.char_etl_max);
                    if (params.char_m_min !== undefined) queryParams.char_m_min = String(params.char_m_min);
                    if (params.char_m_max !== undefined) queryParams.char_m_max = String(params.char_m_max);

                    if (params.three_lies_critical !== undefined) queryParams.three_lies_critical = String(params.three_lies_critical);
                    if (params.high_defensiveness !== undefined) queryParams.high_defensiveness = String(params.high_defensiveness);

                    if (params.sent_from) queryParams.sent_from = params.sent_from;
                    if (params.sent_to) queryParams.sent_to = params.sent_to;
                    if (params.completed_from) queryParams.completed_from = params.completed_from;
                    if (params.completed_to) queryParams.completed_to = params.completed_to;
                    if (params.expires_from) queryParams.expires_from = params.expires_from;
                    if (params.expires_to) queryParams.expires_to = params.expires_to;

                    if (params.search) queryParams.search = params.search;

                    if (params.sort_by) queryParams.sort_by = params.sort_by;
                    if (params.sort_order) queryParams.sort_order = params.sort_order;

                    if (params.page) queryParams.page = String(params.page);
                    if (params.limit) queryParams.limit = String(params.limit);
                }

                return {
                    url: "/bigster-tests",
                    params: queryParams,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "BigsterTest" as const,
                            id,
                        })),
                        { type: "BigsterTest", id: "LIST" },
                    ]
                    : [{ type: "BigsterTest", id: "LIST" }],
        }),

        getBigsterTestAnswers: builder.query<TestAnswersResponse, number>({
            query: (id) => `/bigster-tests/${id}/answers`,
            providesTags: (result, error, id) => [
                { type: "BigsterTest", id: `${id}-answers` },
            ],
        }),

        getBigsterTestFilterOptions: builder.query<BigsterTestFilterOptionsResponse, void>({
            query: () => "/bigster-tests/filter-options",
            keepUnusedDataFor: 300,
        }),

        getBigsterTestById: builder.query<BigsterTestDetail, number>({
            query: (id) => `/bigster-tests/${id}`,
            transformResponse: (response: BigsterTestDetailRaw) =>
                transformTestDetail(response),
            providesTags: (result, error, id) => [{ type: "BigsterTest", id }],
        }),

        getBigsterTestByApplication: builder.query<
            BigsterTestByApplicationResponse,
            number
        >({
            query: (applicationId) =>
                `/bigster-tests/by-application/${applicationId}`,
            providesTags: (result) =>
                result ? [{ type: "BigsterTest", id: result.id }] : [],
        }),

        createBigsterTest: builder.mutation<
            CreateBigsterTestResponse,
            CreateBigsterTestRequest
        >({
            query: (data) => ({
                url: "/bigster-tests",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                { type: "BigsterTest", id: "LIST" },
                { type: "Application", id: "LIST" },
            ],
        }),

        resendBigsterTest: builder.mutation<
            ResendBigsterTestResponse,
            { id: number; data?: ResendBigsterTestRequest }
        >({
            query: ({ id, data }) => ({
                url: `/bigster-tests/${id}/resend`,
                method: "POST",
                body: data || {},
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "BigsterTest", id },
                { type: "BigsterTest", id: "LIST" },
            ],
        }),

        markBigsterTestAsRead: builder.mutation<MarkBigsterTestAsReadResponse, number>({
            query: (id) => ({
                url: `/bigster-tests/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "BigsterTest", id },
                { type: "BigsterTest", id: "LIST" },
                { type: "BigsterStats", id: "LIST" },
                "BigsterStats",
            ],
        }),

        cancelBigsterTest: builder.mutation<CancelBigsterTestResponse, number>({
            query: (id) => ({
                url: `/bigster-tests/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "BigsterTest", id },
                { type: "BigsterTest", id: "LIST" },
            ],
        }),

        getBigsterProfiles: builder.query<BigsterProfile[], void>({
            query: () => "/bigster-tests/profiles",
            providesTags: [{ type: "BigsterProfile", id: "LIST" }],
        }),

        createBigsterProfile: builder.mutation<
            CreateBigsterProfileResponse,
            CreateBigsterProfileRequest
        >({
            query: (data) => ({
                url: "/bigster-tests/profiles",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "BigsterProfile", id: "LIST" }],
        }),
    }),
});

export const {
    useGetBigsterTestsQuery,
    useLazyGetBigsterTestsQuery,
    useGetBigsterTestFilterOptionsQuery,
    useGetBigsterTestByIdQuery,
    useLazyGetBigsterTestByIdQuery,
    useGetBigsterTestByApplicationQuery,
    useLazyGetBigsterTestByApplicationQuery,
    useCreateBigsterTestMutation,
    useResendBigsterTestMutation,
    useMarkBigsterTestAsReadMutation,
    useCancelBigsterTestMutation,
    useGetBigsterProfilesQuery,
    useLazyGetBigsterProfilesQuery,
    useGetBigsterTestAnswersQuery,
    useCreateBigsterProfileMutation,
} = bigsterTestApiSlice;
