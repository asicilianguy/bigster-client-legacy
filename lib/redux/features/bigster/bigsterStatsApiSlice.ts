import { apiSlice } from "../api/apiSlice";
import type {
    StatsOverview,
    TrendsResponse,
    StatsByProfile,
    StatsByCompany,
    StatsBySex,
    StatsAlerts,
    ScoreDistribution,
    DashboardData,
    StatsFilters,
    StatsByRegion,
    AggregateScoresResult,
    AggregateScoresFilters,
} from "@/types/bigster-stats";

interface OverviewResponse {
    success: boolean;
    data: StatsOverview;
}

interface TrendsApiResponse {
    success: boolean;
    data: TrendsResponse;
}

interface ByProfileResponse {
    success: boolean;
    data: StatsByProfile[];
}

interface ByCompanyResponse {
    success: boolean;
    data: StatsByCompany[];
}

interface BySexResponse {
    success: boolean;
    data: StatsBySex[];
}

interface AlertsResponse {
    success: boolean;
    data: StatsAlerts;
}

interface ScoreDistributionResponse {
    success: boolean;
    data: ScoreDistribution[];
}

interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}

interface ByRegionResponse {
    success: boolean;
    data: StatsByRegion[];
}

interface AggregateScoresResponse {
    success: boolean;
    data: AggregateScoresResult;
}

interface TrendsQueryParams extends StatsFilters {
    period?: "daily" | "weekly" | "monthly";
    months?: number;
}

export const bigsterStatsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getBigsterStatsOverview: builder.query<StatsOverview, StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/overview",
                params: filters ?? undefined,
            }),
            transformResponse: (response: OverviewResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterStatsTrends: builder.query<TrendsResponse, TrendsQueryParams | void>({
            query: (params) => ({
                url: "/bigster-stats/trends",
                params: params ?? undefined,
            }),
            transformResponse: (response: TrendsApiResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterStatsByProfile: builder.query<StatsByProfile[], StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/by-profile",
                params: filters ?? undefined,
            }),
            transformResponse: (response: ByProfileResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterStatsByCompany: builder.query<StatsByCompany[], StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/by-company",
                params: filters ?? undefined,
            }),
            transformResponse: (response: ByCompanyResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterStatsBySex: builder.query<StatsBySex[], StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/by-sex",
                params: filters ?? undefined,
            }),
            transformResponse: (response: BySexResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterStatsAlerts: builder.query<StatsAlerts, StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/alerts",
                params: filters ?? undefined,
            }),
            transformResponse: (response: AlertsResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterScoreDistribution: builder.query<ScoreDistribution[], StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/score-distribution",
                params: filters ?? undefined,
            }),
            transformResponse: (response: ScoreDistributionResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterStatsByRegion: builder.query<StatsByRegion[], StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/by-region",
                params: filters ?? undefined,
            }),
            transformResponse: (response: ByRegionResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterAggregateScores: builder.query<AggregateScoresResult, AggregateScoresFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/aggregate-scores",
                params: filters ?? undefined,
            }),
            transformResponse: (response: AggregateScoresResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

        getBigsterDashboard: builder.query<DashboardData, StatsFilters | void>({
            query: (filters) => ({
                url: "/bigster-stats/dashboard",
                params: filters ?? undefined,
            }),
            transformResponse: (response: DashboardResponse) => response.data,
            providesTags: ["BigsterStats"],
        }),

    }),
});

export const {

    useGetBigsterStatsOverviewQuery,
    useGetBigsterStatsTrendsQuery,
    useGetBigsterStatsByProfileQuery,
    useGetBigsterStatsByCompanyQuery,
    useGetBigsterStatsBySexQuery,
    useGetBigsterStatsAlertsQuery,
    useGetBigsterScoreDistributionQuery,
    useGetBigsterStatsByRegionQuery,
    useGetBigsterAggregateScoresQuery,
    useGetBigsterDashboardQuery,
} = bigsterStatsApiSlice;
