export interface StatsOverview {
    total_tests: number;
    completed_tests: number;
    pending_tests: number;
    in_progress_tests: number;
    expired_tests: number;
    cancelled_tests: number;
    completion_rate: number;
    eligibility_rate: number;
    average_completion_days: number | null;
    tests_last_30_days: number;
    tests_last_7_days: number;

    eligible_tests: number;
    not_eligible_tests: number;

    unread_tests: number;

    tests_current_month: number;
    tests_previous_month: number;
    change_vs_previous_month: number | null;
    tests_same_month_previous_year: number;
    change_vs_previous_year: number | null;
}

export interface StatsTimeSeries {
    period: "daily" | "weekly" | "monthly";
    date: string;
    total: number;
    completed: number;
    eligible: number;
}

export interface TrendsResponse {
    period: "daily" | "weekly" | "monthly";
    months: number;
    trends: StatsTimeSeries[];
}

export interface StatsByProfile {
    profile_id: number;
    profile_name: string;
    profile_slug: string;
    total_tests: number;
    completed_tests: number;
    eligible_tests: number;
    eligibility_rate: number;
    average_score_a?: number;
    average_score_b?: number;
    average_score_c?: number;
}

export interface StatsByCompany {
    company_id: number;
    company_name: string;
    total_tests: number;
    completed_tests: number;
    eligible_tests: number;
    eligibility_rate: number;
}

import { BigsterSex } from "./bigster";

export interface StatsBySex {
    sex: BigsterSex;
    total_tests: number;
    completed_tests: number;
    eligible_tests: number;
    eligibility_rate: number;

    average_score_a?: number;
    average_score_b?: number;
    average_score_c?: number;
}

export interface StatsByRegion {
    region: string;
    total_tests: number;
    completed_tests: number;
    eligible_tests: number;
    eligibility_rate: number;
}

export interface AlertExpiringSoon {
    id: number;
    candidate_name: string;
    email: string;
    expires_at: string;
    days_remaining: number;
}

export interface AlertHighDefensiveness {
    id: number;
    candidate_name: string;
    char_k: number;
    completed_at: string;
}

export interface AlertSuspectTest {
    id: number;
    candidate_name: string;
    char_m: number;
    completed_at: string;
}

export interface AlertUnreliableTest {
    id: number;
    candidate_name: string;
    char_k: number;
    completed_at: string;
}

export interface AlertThreeLiesCritical {
    id: number;
    candidate_name: string;
    char_l: number;
    char_egl: number;
    char_etl: number;
    completed_at: string;
}

export interface StatsAlerts {
    total_alerts: number;
    expiring_soon: AlertExpiringSoon[];
    high_defensiveness: AlertHighDefensiveness[];
    suspect_tests: AlertSuspectTest[];
    unreliable_tests: AlertUnreliableTest[];
    three_lies_critical: AlertThreeLiesCritical[];
}

export interface ScoreDistribution {
    characteristic: string;
    characteristic_name: string;
    min: number;
    max: number;
    average: number;
    median: number;
    percentile_25: number;
    percentile_75: number;
}

export interface DashboardData {
    overview: StatsOverview;
    trends: StatsTimeSeries[];
    by_profile: StatsByProfile[];
    by_region: StatsByRegion[];
    alerts: {
        total: number;
        expiring_soon: AlertExpiringSoon[];
        high_defensiveness: AlertHighDefensiveness[];
        suspect_tests: AlertSuspectTest[];
        unreliable_tests: AlertUnreliableTest[];
        three_lies_critical: AlertThreeLiesCritical[];
    };
    score_distribution: ScoreDistribution[];
}

export interface StatsFilters {
    company_id?: number;
    selection_id?: number;
    profile_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface CharacteristicStats {
    avg: number;
    min: number;
    max: number;
    median: number;
    std_dev: number;
}

export interface AggregateScoresFilters extends StatsFilters {
    region?: string;
    province?: string;
    city?: string;
    sex?: "MALE" | "FEMALE";
    age_min?: number;
    age_max?: number;
}

export interface AggregateScoresResult {
    sample_size: number;
    eligible_count: number;
    not_eligible_count: number;
    suspect_count: number;
    unreliable_count: number;
    eligibility_rate: number;
    filters_applied: Record<string, string | number | boolean>;
    scores: {
        base: Record<"A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J", CharacteristicStats>;
        validity: Record<"K" | "L" | "EGL" | "ETL" | "M", CharacteristicStats>;
        composite: Record<"C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" | "C10", CharacteristicStats>;
        neurotic: Record<"N1" | "N2" | "N3" | "N4" | "N5", CharacteristicStats>;
        pathologic: Record<"P1" | "P2" | "P3" | "P4" | "P5", CharacteristicStats>;
    };
    sex_breakdown: {
        male_count: number;
        female_count: number;
    };
    age_breakdown: Array<{
        range: string;
        count: number;
    }>;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
}
