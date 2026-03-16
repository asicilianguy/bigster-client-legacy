export enum BigsterTestStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
}

export enum BigsterSex {
    MALE = "MALE",
    FEMALE = "FEMALE",
}

export type BigsterEvaluation =
    | "IDONEO"
    | "PARZIALMENTE_IDONEO"
    | "NON_IDONEO"
    | null;

export interface BigsterProfile {
    id: number;
    name: string;
    slug: string;
    cvRequired?: boolean;
    enabled?: boolean;
}

export interface BigsterProfileListItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    enabled: boolean;
    attitudesCount: number;
    testsCount: number;
    createdAt: string;
}

export interface BigsterProfilesResponse {
    data: BigsterProfileListItem[];
}

export interface BigsterScoresBase {
    A: number | null;
    B: number | null;
    C: number | null;
    D: number | null;
    E: number | null;
    F: number | null;
    G: number | null;
    H: number | null;
    I: number | null;
    J: number | null;
}

export interface BigsterScoresValidity {
    K: number | null;
    L: number | null;
    EGL: number | null;
    ETL: number | null;
    M: number | null;
}

export interface BigsterScoresComposite {
    C1: number | null;
    C2: number | null;
    C3: number | null;
    C4: number | null;
    C5: number | null;
    C6: number | null;
    C7: number | null;
    C8: number | null;
    C9: number | null;
    C10: number | null;
}

export interface BigsterScoresNeurotic {
    N1: number | null;
    N2: number | null;
    N3: number | null;
    N4: number | null;
    N5: number | null;
}

export interface BigsterScoresPathologic {
    P1: number | null;
    P2: number | null;
    P3: number | null;
    P4: number | null;
    P5: number | null;
}

export interface BigsterTestScores {
    base: BigsterScoresBase;
    validity: BigsterScoresValidity;
    composite: BigsterScoresComposite;
    neurotic: BigsterScoresNeurotic;
    pathologic: BigsterScoresPathologic;
}

export interface BigsterTestCandidate {
    name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    sex: BigsterSex;
    birth_date?: string;
}

export interface BigsterTestCandidateList {
    name: string;
    email: string;
    sex: BigsterSex;
}

export interface BigsterTestCandidateRaw {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    sex: BigsterSex;
    birth_date: string | null;
}

export interface ShortlistedInLight {
    selection_id: number;
    ordine: number;
}

export interface ShortlistedInDetail {
    id: number;
    selection_id: number;
    ordine: number;
    note: string | null;
    data_inserimento: string;
}

export interface BigsterTestListItem {
    id: number;
    application_id: number;
    hash_test: string;
    status: BigsterTestStatus;

    candidate: BigsterTestCandidateList;

    sent_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    expires_at: string | null;
    is_expired: boolean;

    completed: boolean;
    eligible: boolean;
    suspect: boolean;
    unreliable: boolean;
    evaluation: BigsterEvaluation;
    read: boolean;
    validity_scores: ValidityScores | null;
    question_progress: number;

    profile: BigsterProfile | null;

    application: {
        id: number;
        nome: string;
        cognome: string;
        email: string;
        stato: string;
        regione?: string | null;
        citta?: string | null;
        annuncio: {
            id: number;
            selezione: {
                id: number;
                titolo: string;
                figura_ricercata: string | null;
                company: {
                    id: number;
                    nome: string;
                };
            };
        };
    };

    is_in_shortlist: boolean;
    shortlisted_in?: ShortlistedInLight[];

    created_at: string;
    updated_at: string;
}

export interface BigsterTestDetailRaw {
    id: number;
    application_id: number;
    hash_test: string;
    status: BigsterTestStatus;

    candidate: BigsterTestCandidateRaw;

    sent_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    expires_at: string | null;
    is_expired: boolean;

    completed: boolean;
    eligible: boolean;
    suspect: boolean;
    unreliable: boolean;
    evaluation: BigsterEvaluation;
    read: boolean;

    question_progress: number;
    total_questions: number;

    scores: BigsterTestScores | null;
    malus: number | null;
    calculation_log: string | null;

    profile: BigsterProfile | null;

    application: {
        id: number;
        nome: string;
        cognome: string;
        email: string;
        telefono: string | null;
        sesso: BigsterSex | null;
        eta: number | null;
        regione: string | null;
        citta: string | null;
        stato: string;
    };

    selection: {
        id: number;
        titolo: string;
        figura_ricercata: string | null;
        company: {
            id: number;
            nome: string;
            partita_iva?: string;
            indirizzo?: string;
            citta?: string;
            cap?: string;
            telefono?: string;
            email?: string;
        };
    };

    is_in_shortlist: boolean;
    shortlisted_in?: ShortlistedInDetail[];

    created_at: string;
    updated_at: string;
}

export const VALIDITY_THRESHOLDS = {

    HIGH_DEFENSIVENESS_K: 80,

    SUSPECT_M: 49,

    THREE_LIES_L: 80,
    THREE_LIES_EGL: 80,
    THREE_LIES_ETL: 80,
} as const;

export interface BigsterTestDetail {

    id: number;
    applicationId: number;
    hashTest: string;
    status: BigsterTestStatus;

    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    sex: BigsterSex;
    birthDate: string | null;

    sentAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    expiresAt: string | null;
    isExpired: boolean;

    completed: boolean;
    eligible: boolean;
    suspect: boolean;
    unreliable: boolean;
    evaluation: BigsterEvaluation;
    read: boolean;

    questionProgress: number;
    totalQuestions: number;

    scores: BigsterTestScores | null;
    malus: number | null;
    calculationLog: string | null;

    profile: BigsterProfile | null;

    application: {
        id: number;
        nome: string;
        cognome: string;
        email: string;
        telefono: string | null;
        sesso: BigsterSex | null;
        eta: number | null;
        regione: string | null;
        citta: string | null;
        stato: string;
    };

    selection: {
        id: number;
        titolo: string;
        figura_ricercata: string | null;
        company: {
            id: number;
            nome: string;
            partita_iva?: string;
            indirizzo?: string;
            citta?: string;
            cap?: string;
            telefono?: string;
            email?: string;
        };
    };

    isInShortlist: boolean;
    shortlistedIn?: ShortlistedInDetail[];

    createdAt: string;
    updatedAt: string;
}

export interface BigsterTestListResponse {
    data: BigsterTestListItem[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export interface BigsterTestByApplicationResponse {
    id: number;
    application_id: number;
    hash_test: string;
    status: BigsterTestStatus;
    completed: boolean;
    eligible: boolean;
    suspect: boolean;
    unreliable: boolean;
    evaluation: BigsterEvaluation;
    read: boolean;
    sent_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    expires_at: string | null;
    is_expired: boolean;
    profile: BigsterProfile | null;
}

export interface CreateBigsterTestRequest {
    application_id: number;
    profile_id?: number;
    expires_in_days?: number;
    send_email?: boolean;
}

export interface CreateBigsterTestResponse {
    success: true;
    message: string;
    data: {
        test_id: number;
        hash_test: string;
        test_url: string;
        email_sent: boolean;
    };
}

export interface ResendBigsterTestRequest {
    extend_expiration_days?: number;
}

export interface ResendBigsterTestResponse {
    success: true;
    message: string;
    data: {
        test_id: number;
        new_expires_at: string;
        test_url: string;
        email_sent: boolean;
    };
}

export interface CancelBigsterTestResponse {
    success: true;
    message: string;
}

export interface MarkBigsterTestAsReadResponse {
    success: true;
    message: string;
    data: {
        id: number;
        read: boolean;
        updated_at?: string;
    };
}

export interface BigsterTestFilters {

    status?: BigsterTestStatus;
    completed?: boolean;
    eligible?: boolean;
    suspect?: boolean;
    unreliable?: boolean;
    read?: boolean;

    application_id?: number;
    selection_id?: number;
    announcement_id?: number;
    company_id?: number;
    profile_id?: number;

    is_shortlisted?: boolean;

    candidate_sex?: "MALE" | "FEMALE";
    candidate_regione?: string;

    candidate_provincia?: string;
    candidate_citta?: string;
    domicilio_regione?: string;
    domicilio_provincia?: string;
    domicilio_citta?: string;

    automunito?: boolean;
    disponibilita_trasferte?: boolean;
    partita_iva?: boolean;
    attestato_aso?: string;
    disponibilita_immediata?: boolean;

    char_k_min?: number;
    char_k_max?: number;
    char_l_min?: number;
    char_l_max?: number;
    char_egl_min?: number;
    char_egl_max?: number;
    char_etl_min?: number;
    char_etl_max?: number;
    char_m_min?: number;
    char_m_max?: number;

    three_lies_critical?: boolean;
    high_defensiveness?: boolean;

    sent_from?: string;
    sent_to?: string;
    completed_from?: string;
    completed_to?: string;
    expires_from?: string;
    expires_to?: string;

    search?: string;

    sort_by?:
    | "recent"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "status"
    | "completion"
    | "eligible"
    | "sent_at"
    | "completed_at"
    | "expires_at"
    | "progress"
    | "read";
    sort_order?: "asc" | "desc";

    page?: number;
    limit?: number;
}

export interface BigsterTestFilterOptionsResponse {
    regioni: string[];
    province: string[];
    citta: string[];
    domicilio_regioni: string[];
    evaluations: string[];
}

export interface ValidityScores {
    K: number | null;
    L: number | null;
    EGL: number | null;
    ETL: number | null;
    M: number | null;
}

export interface BigsterTestPublicInfo {
    hash: string;
    status: BigsterTestStatus;
    candidate_name: string;
    total_questions: number;
    questions_answered: number;
    expires_at: string | null;
    is_expired: boolean;
    is_completed: boolean;
    can_start: boolean;
    privacy_policy: string | null;
    greetings_message: string | null;
    rules: string | null;
    profile: { name: string } | null;
}

export interface VerifyHashResponse {
    valid: boolean;
    can_proceed: boolean;
    reason: string | null;
    status: BigsterTestStatus;
    candidate_first_name: string;
}

export interface StartBigsterTestRequest {
    accept_privacy: true;
    birth_date?: string;
}

export interface StartBigsterTestResponse {
    success: true;
    message: string;
    status: "IN_PROGRESS";
}

export interface BigsterQuestion {
    id: number;
    number: number;
    description: string;
    answers: {
        id: number;
        description: string;
    }[];
    answered?: boolean;
    selectedAnswerId?: number | null;
}

export interface BigsterQuestionsResponse {
    questions: BigsterQuestion[];
    total: number;
    answered: number;
    remaining: number;
}

export interface SubmitAnswerRequest {
    question_id: number;
    answer_id: number;
}

export interface SubmitAnswerResponse {
    success: true;
    progress: {
        answered: number;
        total: number;
        percentage: number;
    };
}

export interface SubmitAnswersBatchRequest {
    answers: SubmitAnswerRequest[];
}

export interface SubmitAnswersBatchResponse {
    success: true;
    saved: number;
    progress: {
        answered: number;
        total: number;
        percentage: number;
    };
}

export interface BigsterProgressResponse {
    hash: string;
    status: BigsterTestStatus;
    total_questions: number;
    questions_answered: number;
    progress_percentage: number;
    is_completed: boolean;
    can_complete: boolean;
    remaining_questions: number;
    time_elapsed_seconds: number | null;
}

export interface CompleteTestRequest {
    confirm_completion: true;
}

export interface CompleteTestResponse {
    success: true;
    message: string;
    completed_at: string;
}

export interface StatsFilters {
    company_id?: number;
    selection_id?: number;
    profile_id?: number;
    date_from?: string;
    date_to?: string;
}

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
}

export interface StatsOverviewResponse {
    success: true;
    data: StatsOverview;
}

export interface StatsTrend {
    period: "daily" | "weekly" | "monthly";
    date: string;
    total: number;
    completed: number;
    eligible: number;
}

export interface StatsTrendsResponse {
    success: true;
    data: {
        period: "daily" | "weekly" | "monthly";
        months: number;
        trends: StatsTrend[];
    };
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

export interface StatsByProfileResponse {
    success: true;
    data: StatsByProfile[];
}

export interface StatsByCompany {
    company_id: number;
    company_name: string;
    total_tests: number;
    completed_tests: number;
    eligible_tests: number;
    eligibility_rate: number;
}

export interface StatsByCompanyResponse {
    success: true;
    data: StatsByCompany[];
}

export interface StatsBySex {
    sex: BigsterSex;
    total_tests: number;
    completed_tests: number;
    eligible_tests: number;
    eligibility_rate: number;
}

export interface StatsBySexResponse {
    success: true;
    data: StatsBySex[];
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

export interface AlertSuspect {
    id: number;
    candidate_name: string;
    char_m: number;
    completed_at: string;
}

export interface AlertUnreliable {
    id: number;
    candidate_name: string;
    char_k: number;
    completed_at: string;
}

export interface Alerts {
    total_alerts: number;
    expiring_soon: AlertExpiringSoon[];
    high_defensiveness: AlertHighDefensiveness[];
    suspect_tests: AlertSuspect[];
    unreliable_tests: AlertUnreliable[];
}

export interface AlertsResponse {
    success: true;
    data: Alerts;
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

export interface ScoreDistributionResponse {
    success: true;
    data: ScoreDistribution[];
}

export interface DashboardData {
    overview: StatsOverview;
    trends: StatsTrend[];
    by_profile: StatsByProfile[];
    alerts: {
        total: number;
        expiring_soon: AlertExpiringSoon[];
        high_defensiveness: AlertHighDefensiveness[];
    };
    score_distribution: ScoreDistribution[];
}

export interface DashboardResponse {
    success: true;
    data: DashboardData;
}

export interface ReportOptions {
    raw_scores?: boolean;
    interpretation?: boolean;
    validity?: boolean;
    lang?: "it" | "en";
}

export interface CanGenerateResponse {
    success: true;
    data: {
        can: boolean;
        reason?: string;
    };
}

export interface ReportInfo {
    id: number;
    candidate_name: string;
    email: string;
    profile: string | null;
    position: string | null;
    company: string;
    completed: boolean;
    completed_at: string | null;
    eligible: boolean;
    suspect: boolean;
    unreliable: boolean;
    can_generate_report: boolean;
    cannot_generate_reason?: string;
    suggested_filename: string;
}

export interface ReportInfoResponse {
    success: true;
    data: ReportInfo;
}

export interface ReportBatchRequest {
    result_ids: number[];
}

export interface ReportBatchResult {
    id: number;
    success: boolean;
    filename?: string;
    error?: string;
}

export interface ReportBatchResponse {
    success: true;
    data: {
        total: number;
        successful: number;
        failed: number;
        results: ReportBatchResult[];
    };
}

export interface TestAnswerOption {
    id: number;
    description: string;
}

export interface TestAnswerQuestion {
    id: number;
    number: number;
    description: string;
    answers: TestAnswerOption[];
    selected_answer_id: number | null;
}

export interface TestAnswersResponse {
    test_id: number;
    candidate_name: string;
    started_at: string | null;
    completed_at: string | null;
    total_questions: number;
    total_answered: number;
    questions: TestAnswerQuestion[];
}

export interface CreateBigsterProfileRequest {
    name: string;
    slug?: string;
    cv_required?: boolean;
    lang?: string;
}

export interface CreateBigsterProfileResponse {
    success: boolean;
    message: string;
    data: BigsterProfile;
}
