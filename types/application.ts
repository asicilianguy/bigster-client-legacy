export enum ApplicationStatus {
  IN_CORSO = "IN_CORSO",
  IN_PROVA = "IN_PROVA",
  ASSUNTO = "ASSUNTO",
  SCARTATO = "SCARTATO",
  RITIRATO = "RITIRATO",
}

export enum Gender {
  M = "M",
  F = "F",
  ALTRO = "ALTRO",
  NON_SPECIFICATO = "NON_SPECIFICATO",
}

export type Sesso = Gender;

export enum InterviewType {
  SCREENING_TELEFONICO = "SCREENING_TELEFONICO",
  INCONTRO_HR = "INCONTRO_HR",
  PROPOSTA_CLIENTE = "PROPOSTA_CLIENTE",
}

export enum InterviewOutcome {
  POSITIVO = "POSITIVO",
  NEGATIVO = "NEGATIVO",
}

export enum AttestatoAsoStatus {
  SI = "SI",
  NO = "NO",
  IN_CORSO = "IN_CORSO",
}

export enum BigsterTestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface Interview {
  id: number;
  application_id: number;
  tipo: InterviewType;
  esito: InterviewOutcome | null;
  data: string | null;
  note: string | null;
  data_creazione: string;
}

export interface BigsterResultSummary {
  id: number;
  status: BigsterTestStatus;
  completed: boolean;
  completedAt: string | null;
  questionProgress: number;
  eligible: boolean | null;
  evaluation: string | null;
}

export interface BigsterResultFull {
  id: number;
  applicationId: number;
  surveyId: number;
  profileId: number | null;
  hashTest: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  sex: "MALE" | "FEMALE";
  status: BigsterTestStatus;
  completed: boolean;
  questionProgress: number;
  attempts: number;
  sentAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  suspect: boolean;
  unreliable: boolean;
  eligible: boolean;
  charA: number;
  charB: number;
  charC: number;
  charD: number;
  charE: number;
  charF: number;
  charG: number;
  charH: number;
  charI: number;
  charJ: number;
  charK: number;
  charL: number;
  charEgl: number;
  charEtl: number;
  charM: number;
  charC1: number;
  charC2: number;
  charC3: number;
  charC4: number;
  charC5: number;
  charC6: number;
  charC7: number;
  charC8: number;
  charC9: number;
  charC10: number;
  charN1: number;
  charN2: number;
  charN3: number;
  charN4: number;
  charN5: number;
  charP1: number;
  charP2: number;
  charP3: number;
  charP4: number;
  charP5: number;
  evaluation: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestBigster {
  id: number;
  application_id: number;
  token_accesso: string | null;
  inviato_il: string | null;
  completato_il: string | null;
  punteggio_totale: number | null;
  valutazione: string | null;
  note: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface ShortlistedInLight {
  selection_id: number;
  ordine: number;
}

export interface ShortlistedInFull {
  id: number;
  selection_id: number;
  ordine: number;
  note: string | null;
  data_inserimento: string;
  selection: {
    id: number;
    titolo: string;
    company: {
      id: number;
      nome: string;
    };
  };
}

export interface Application {
  id: number;
  annuncio_id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  sesso: Gender | null;

  birthdate: string | null;

  eta: number | null;

  regione: string | null;
  provincia: string | null;
  citta: string | null;

  domicilio_regione: string | null;
  domicilio_provincia: string | null;
  domicilio_citta: string | null;

  automunito: boolean | null;
  disponibilita_trasferte: boolean | null;
  partita_iva: boolean | null;
  attestato_aso: AttestatoAsoStatus | null;
  disponibilita_immediata: boolean | null;
  preavviso_settimane: number | null;

  titoli_studio: string | null;
  cv_s3_key: string | null;
  stato: ApplicationStatus;
  note: string | null;
  read: boolean;
  data_chiusura: string | null;
  data_creazione: string;
  data_modifica: string;
}

export type ApplicationCreate = Omit<
  Application,
  "id" | "data_creazione" | "data_modifica" | "eta"
>;

export type ApplicationUpdate = Partial<Omit<ApplicationCreate, "annuncio_id">>;

export interface ChangeApplicationStatus {
  stato: ApplicationStatus;
  note?: string | null;
  data_chiusura?: string | null;
}

export interface RegisterInterview {
  tipo: InterviewType;
  esito: InterviewOutcome;
  data?: string | null;
  note?: string | null;
}

export interface ApplicationListItem extends Application {
  annuncio: {
    id: number;
    hash_candidatura: string;
    piattaforma: string | null;
    citta: string | null;
    provincia: string | null;
    regione: string | null;
    stato: string;
    selezione_id: number;
    selezione: {
      id: number;
      titolo: string;
      figura_ricercata: string | null;
      stato: string;
      company: {
        id: number;
        nome: string;
      };
    };
  };
  test_bigster: BigsterResultSummary | null;
  colloqui: Array<{
    id: number;
    tipo: InterviewType;
    esito: InterviewOutcome | null;
    data: string | null;
    note: string | null;
  }>;
  shortlisted_in: ShortlistedInLight[];
}

export interface ApplicationDetail extends Application {
  annuncio: {
    id: number;
    hash_candidatura: string;
    piattaforma: string | null;
    citta: string | null;
    provincia: string | null;
    regione: string | null;
    stato: string;
    link_candidatura: string | null;
    link_annuncio: string | null;
    data_pubblicazione: string | null;
    selezione: {
      id: number;
      titolo: string;
      figura_ricercata: string | null;
      stato: string;
      pacchetto: string;
      note: string | null;
      company: {
        id: number;
        nome: string;
        citta: string | null;
      };
      consulente: {
        id: number;
        nome: string;
        cognome: string;
      };
      risorsa_umana: {
        id: number;
        nome: string;
        cognome: string;
      } | null;
    };
  };
  test_bigster: BigsterResultFull | null;
  colloqui: Interview[];
  shortlisted_in: ShortlistedInFull[];
}

export interface GetApplicationsQueryParams {

  page?: number;
  limit?: number;

  sort_by?: string;
  sort_order?: "asc" | "desc";

  annuncio_id?: number;
  selezione_id?: number;
  company_id?: number;

  stato?: string;

  sesso?: "M" | "F";
  regione?: string;
  provincia?: string;
  citta?: string;
  titolo_studio?: string;
  eta_min?: number;
  eta_max?: number;

  domicilio_regione?: string;
  domicilio_provincia?: string;
  domicilio_citta?: string;

  automunito?: boolean;
  disponibilita_trasferte?: boolean;
  partita_iva?: boolean;
  attestato_aso?: string;
  disponibilita_immediata?: boolean;
  preavviso_min?: number;
  preavviso_max?: number;

  has_cv?: boolean;
  has_note?: boolean;
  is_read?: boolean;

  has_test?: boolean;
  test_status?: string;
  test_completed?: boolean;
  test_eligible?: boolean;
  test_suspect?: boolean;
  test_unreliable?: boolean;
  test_preferred?: boolean;
  test_read?: boolean;
  test_evaluation?: string;
  test_profile_id?: number;

  score_a_min?: number; score_a_max?: number;
  score_b_min?: number; score_b_max?: number;
  score_c_min?: number; score_c_max?: number;
  score_d_min?: number; score_d_max?: number;
  score_e_min?: number; score_e_max?: number;
  score_f_min?: number; score_f_max?: number;
  score_g_min?: number; score_g_max?: number;
  score_h_min?: number; score_h_max?: number;
  score_i_min?: number; score_i_max?: number;
  score_j_min?: number; score_j_max?: number;
  score_k_min?: number; score_k_max?: number;
  score_l_min?: number; score_l_max?: number;
  score_egl_min?: number; score_egl_max?: number;
  score_etl_min?: number; score_etl_max?: number;
  score_m_min?: number; score_m_max?: number;
  score_c1_min?: number; score_c1_max?: number;
  score_c2_min?: number; score_c2_max?: number;
  score_c3_min?: number; score_c3_max?: number;
  score_c4_min?: number; score_c4_max?: number;
  score_c5_min?: number; score_c5_max?: number;
  score_c6_min?: number; score_c6_max?: number;
  score_c7_min?: number; score_c7_max?: number;
  score_c8_min?: number; score_c8_max?: number;
  score_c9_min?: number; score_c9_max?: number;
  score_c10_min?: number; score_c10_max?: number;
  score_n1_min?: number; score_n1_max?: number;
  score_n2_min?: number; score_n2_max?: number;
  score_n3_min?: number; score_n3_max?: number;
  score_n4_min?: number; score_n4_max?: number;
  score_n5_min?: number; score_n5_max?: number;
  score_p1_min?: number; score_p1_max?: number;
  score_p2_min?: number; score_p2_max?: number;
  score_p3_min?: number; score_p3_max?: number;
  score_p4_min?: number; score_p4_max?: number;
  score_p5_min?: number; score_p5_max?: number;

  has_colloqui?: boolean;
  tipo_colloquio?: string;
  esito_colloquio?: string;
  has_colloqui_positivi?: boolean;

  is_shortlisted?: boolean;

  piattaforma?: string;

  data_da?: string;
  data_a?: string;

  data_chiusura_da?: string;
  data_chiusura_a?: string;

  search?: string;
}

export interface CreateApplicationPayload {
  annuncio_id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string | null;
  sesso?: Gender | null;

  birthdate?: string | null;

  regione?: string | null;
  provincia?: string | null;
  citta?: string | null;

  domicilio_regione?: string | null;
  domicilio_provincia?: string | null;
  domicilio_citta?: string | null;

  automunito?: boolean | null;
  disponibilita_trasferte?: boolean | null;
  partita_iva?: boolean | null;
  attestato_aso?: AttestatoAsoStatus | null;
  disponibilita_immediata?: boolean | null;
  preavviso_settimane?: number | null;

  titoli_studio?: string | null;
  cv_s3_key?: string | null;
}

export interface UpdateApplicationPayload {
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string | null;
  sesso?: Gender | null;

  birthdate?: string | null;

  regione?: string | null;
  provincia?: string | null;
  citta?: string | null;

  domicilio_regione?: string | null;
  domicilio_provincia?: string | null;
  domicilio_citta?: string | null;

  automunito?: boolean | null;
  disponibilita_trasferte?: boolean | null;
  partita_iva?: boolean | null;
  attestato_aso?: AttestatoAsoStatus | null;
  disponibilita_immediata?: boolean | null;
  preavviso_settimane?: number | null;

  titoli_studio?: string | null;
  cv_s3_key?: string | null;
  stato?: ApplicationStatus;
  note?: string | null;
  data_chiusura?: string | null;
}

export interface ChangeApplicationStatusPayload {
  stato: ApplicationStatus;
  note?: string;
  data_chiusura?: string;
}

export interface RegisterInterviewPayload {
  tipo: InterviewType;
  esito: InterviewOutcome;
  data?: string;
  note?: string;
}

export interface CompleteTestPayload {
  punteggio_totale?: number;
  valutazione?: string;
  note?: string;
}

export interface TestVerifyResponse {
  data: {
    test_id: number;
    candidato: {
      nome: string;
      cognome: string;
    };
    selezione: string;
    figura: string | null;
    azienda: string;
  };
}

export interface ApplicationResponse {
  message: string;
  data: Application;
}

export interface ApplicationListResponse {
  data: ApplicationListItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ApplicationDetailResponse {
  data: ApplicationDetail;
}

export interface SendTestResponse {
  message: string;
  data: {
    test_id: number;
    token_accesso: string;
    inviato_il: string;
  };
}

export interface RegisterInterviewResponse {
  message: string;
  data: Interview;
}

export interface CvDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
  filename: string;
}

export interface UpdateCvKeyResponse {
  message: string;
  data: Application;
}

export interface DeleteCvResponse {
  message: string;
}

export interface CreateApplicationResponse {
  message: string;
  data: {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    data_creazione: string;
  };
}

export interface CompleteTestResponse {
  message: string;
  data: {
    test_id: number;
    punteggio_totale: number | null;
    valutazione: string | null;
    completato_il: string;
  };
}

export interface FilterOptionsResponse {
  regioni: string[];
  province: string[];
  citta: string[];
  titoli_studio: string[];
}

export const isInShortlist = (
  application: ApplicationListItem | ApplicationDetail,
  selectionId: number
): boolean => {
  return (
    application.shortlisted_in?.some((s) => s.selection_id === selectionId) ??
    false
  );
};

export const getShortlistOrder = (
  application: ApplicationListItem | ApplicationDetail,
  selectionId: number
): number | null => {
  const entry = application.shortlisted_in?.find(
    (s) => s.selection_id === selectionId
  );
  return entry?.ordine ?? null;
};

export const isInAnyShortlist = (
  application: ApplicationListItem | ApplicationDetail
): boolean => {
  return application.shortlisted_in && application.shortlisted_in.length > 0;
};

export const formatLocation = (
  citta: string | null,
  provincia: string | null,
  regione: string | null
): string => {
  const parts = [citta, provincia, regione].filter(Boolean);
  return parts.join(", ");
};

export const formatFullAddress = (
  _indirizzo: string | null,
  _cap: string | null,
  citta: string | null,
  provincia: string | null,
  regione: string | null
): string => {

  return formatLocation(citta, provincia, regione);
};

export const hasDifferentDomicilio = (
  application: Application | ApplicationListItem | ApplicationDetail
): boolean => {
  return !!(
    application.domicilio_regione ||
    application.domicilio_provincia ||
    application.domicilio_citta
  );
};

export const getAttestatoAsoLabel = (
  status: AttestatoAsoStatus | null
): string => {
  switch (status) {
    case AttestatoAsoStatus.SI:
      return "Sì";
    case AttestatoAsoStatus.NO:
      return "No";
    case AttestatoAsoStatus.IN_CORSO:
      return "In corso";
    default:
      return "Non specificato";
  }
};

export const calculateAge = (birthdate: string | null): number | null => {
  if (!birthdate) return null;

  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export interface ApplicationStatsResponse {
  total: number;
  by_status: {
    IN_CORSO?: number;
    ASSUNTO?: number;
    IN_PROVA?: number;
    SCARTATO?: number;
    RITIRATO?: number;
  };
  with_cv: number;
  with_test: number;
  test_completed: number;
  test_eligible: number;
  in_shortlist: number;
  unread: number;
  last_7_days: number;
  last_30_days: number;
}
