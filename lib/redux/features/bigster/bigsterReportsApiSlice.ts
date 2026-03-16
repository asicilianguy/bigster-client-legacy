import { apiSlice } from "../api/apiSlice";
import type {
    CanGenerateResponse,
    ReportInfo,
    ReportInfoResponse,
    ReportBatchRequest,
    ReportBatchResponse,
} from "@/types/bigster";

export const bigsterReportsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        canGenerateBigsterReport: builder.query<
            { can: boolean; reason?: string },
            number
        >({
            query: (id) => `/bigster-reports/${id}/can-generate`,
            transformResponse: (response: CanGenerateResponse) => response.data,
        }),

        getBigsterReportInfo: builder.query<ReportInfo, number>({
            query: (id) => `/bigster-reports/${id}/info`,
            transformResponse: (response: ReportInfoResponse) => response.data,
            providesTags: (result, error, id) => [{ type: "BigsterReport", id }],
        }),

        verifyBigsterReportBatch: builder.mutation<
            ReportBatchResponse,
            ReportBatchRequest
        >({
            query: (body) => ({
                url: "/bigster-reports/batch",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useCanGenerateBigsterReportQuery,
    useLazyCanGenerateBigsterReportQuery,
    useGetBigsterReportInfoQuery,
    useLazyGetBigsterReportInfoQuery,
    useVerifyBigsterReportBatchMutation,
} = bigsterReportsApiSlice;
