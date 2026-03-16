export enum SelectionStatus {
  FATTURA_AV_SALDATA = "FATTURA_AV_SALDATA",
  HR_ASSEGNATA = "HR_ASSEGNATA",
  PRIMA_CALL_COMPLETATA = "PRIMA_CALL_COMPLETATA",
  RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE = "RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE",
  RACCOLTA_JOB_APPROVATA_CLIENTE = "RACCOLTA_JOB_APPROVATA_CLIENTE",
  BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO = "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
  ANNUNCIO_APPROVATO = "ANNUNCIO_APPROVATO",
  ANNUNCIO_PUBBLICATO = "ANNUNCIO_PUBBLICATO",
  CANDIDATURE_RICEVUTE = "CANDIDATURE_RICEVUTE",
  COLLOQUI_IN_CORSO = "COLLOQUI_IN_CORSO",
  CANDIDATO_IN_PROVA = "CANDIDATO_IN_PROVA",
  SELEZIONI_IN_SOSTITUZIONE = "SELEZIONI_IN_SOSTITUZIONE",
  CHIUSA = "CHIUSA",
  ANNULLATA = "ANNULLATA",
}

export enum PackageType {
  BASE = "BASE",
  MDO = "MDO",
}

export enum InvoiceType {
  AV = "AV",
  INS = "INS",
  MDO = "MDO",
}

export enum AnnouncementPlatform {
  LINKEDIN = "LINKEDIN",
  INDEED = "INDEED",
  ALTRO = "ALTRO",
}

export enum AnnouncementStatus {
  INIZIALIZZATO = "INIZIALIZZATO",
  BOZZA = "BOZZA",
  PUBBLICATO = "PUBBLICATO",
  SCADUTO = "SCADUTO",
  CHIUSO = "CHIUSO",
}

export interface UserBasic {
  id: number;
  nome: string;
  cognome: string;
  email?: string;
  ruolo?: string;
}

export interface CompanyBasic {
  id: number;
  nome: string;
  partita_iva?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  telefono?: string;
  email?: string;
}

export interface InvoiceBasic {
  id: number;
  numero_fattura: string;
  tipo_fattura: InvoiceType;
  data_emissione: string;
  data_pagamento?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface AnnouncementBasic {
  id: number;
  selezione_id: number;
  company_id: number;
  hash_candidatura: string;
  piattaforma?: AnnouncementPlatform | null;
  citta?: string | null;
  provincia?: string | null;
  regione?: string | null;
  link_candidatura: string;
  link_annuncio?: string | null;
  stato: AnnouncementStatus;
  data_pubblicazione?: string | null;
  data_creazione: string;
  data_modifica: string;
  _count?: {
    candidature: number;
  };
}

export interface JobCollectionBasic {
  id: number;
  selezione_id: number;
  s3_key: string;
  s3_key_json?: string | null;
  inviata_al_cliente: boolean;
  data_invio_cliente?: string | null;
  approvata_dal_cliente: boolean;
  data_approvazione_cliente?: string | null;
  note_cliente?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface AnnouncementApprovalBasic {
  id: number;
  selezione_id: number;
  testo_markdown: string;
  approvato: boolean;
  data_richiesta: string;
  data_approvazione?: string | null;
  note_approvazione?: string | null;
}

export interface SelectionStatusHistoryBasic {
  id: number;
  selezione_id: number;
  stato_precedente?: SelectionStatus | null;
  stato_nuovo: SelectionStatus;
  risorsa_umana_id?: number | null;
  risorsa_umana?: {
    id: number;
    nome: string;
    cognome: string;
  } | null;
  data_cambio: string;
  data_scadenza?: string | null;
  note?: string | null;
}

export interface SelectionBase {
  id: number;
  titolo: string;
  company_id: number;
  stato: SelectionStatus;
  pacchetto: PackageType;
  consulente_id: number;
  risorsa_umana_id?: number | null;
  figura_ricercata?: string | null;
  note?: string | null;
  data_creazione: string;
  data_modifica: string;
  data_chiusura?: string | null;
}

export interface SelectionResponse extends SelectionBase {
  company: CompanyBasic;
  consulente: UserBasic;
  risorsa_umana?: UserBasic | null;
}

export interface SelectionListItem extends SelectionBase {
  company: CompanyBasic;
  consulente: UserBasic;
  risorsa_umana?: UserBasic | null;
  fatture: InvoiceBasic[];
  _count: {
    annunci: number;
    rosa_candidati?: number;
  };
  totalApplications?: number;
  hasJobCollection?: boolean;
  shortlistCount?: number;
}

export interface SelectionDetail extends SelectionBase {
  company: CompanyBasic;
  consulente: UserBasic;
  risorsa_umana?: UserBasic | null;
  fatture: InvoiceBasic[];
  annunci: AnnouncementBasic[];
  raccolta_job?: JobCollectionBasic | null;
  bozza_annuncio?: AnnouncementApprovalBasic | null;
  storico_stati: SelectionStatusHistoryBasic[];
  rosa_candidati?: ShortlistEntryBasic[];
  shortlist_count?: number;
}

export type Selection = SelectionDetail;

export interface SelectionByConsulenteItem extends SelectionBase {
  company: CompanyBasic;
  risorsa_umana?: UserBasic | null;
  _count: {
    annunci: number;
    fatture: number;
    rosa_candidati?: number;
  };
}

export interface CreateSelectionPayload {
  titolo: string;
  company_id: number;
  consulente_id: number;
  pacchetto: PackageType;
  figura_ricercata?: string;
  risorsa_umana_id?: number;
  note?: string;
  invoice_data: {
    fic_id: number;
    numero_fattura: string;
    tipo_fattura: string;
    data_emissione: string;
  };
}

export interface UpdateSelectionPayload {
  titolo?: string;
  company_id?: number;
  consulente_id?: number;
  figura_ricercata?: string | null;
  risorsa_umana_id?: number | null;
  stato?: SelectionStatus;
  pacchetto?: PackageType;
  note?: string | null;
  data_chiusura?: string | null;
}

export interface AssignHRPayload {
  risorsa_umana_id: number;
  note?: string | null;
}

export interface ChangeStatusPayload {
  nuovo_stato: SelectionStatus;
  note?: string;
}

export interface CloseWithSuccessPayload {
  application_id: number;
  note?: string;
}

export interface PutOnTrialPayload {
  application_id: number;
  note?: string;
}

export interface PutOnTrialResponse {
  message: string;
  selection: SelectionDetail;
  trial_application: {
    id: number;
    nome: string;
    cognome: string;
    stato: string;
  };
}

export interface CloseWithSuccessResponse {
  message: string;
  selection: SelectionResponse;
  hired_application: {
    id: number;
    nome: string;
    cognome: string;
    stato: string;
  };
}

export interface GetSelectionsQueryParams {
  company_id?: string;
  consulente_id?: string;
  risorsa_umana_id?: string;
  stato?: SelectionStatus;
  pacchetto?: PackageType;
}

export interface GetSelectionsPaginatedQueryParams {

  page?: number;
  limit?: number;

  sort_by?: string;

  company_id?: number;
  consulente_id?: number;
  risorsa_umana_id?: number;
  stato?: SelectionStatus;
  pacchetto?: PackageType;

  search?: string;
  figura_ricercata?: string;

  has_hr?: "assigned" | "unassigned";
  has_job_collection?: boolean;
  has_annunci?: boolean;
  has_shortlist?: boolean;

  data_da?: string;
  data_a?: string;
  data_chiusura_da?: string;
  data_chiusura_a?: string;
}

export interface SelectionsPaginatedResponse {
  data: SelectionListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface SelectionFilterOptions {
  stati: SelectionStatus[];
  pacchetti: PackageType[];
  figure_ricercate: string[];
  consulenti: Array<{ id: number; label: string }>;
  risorse_umane: Array<{ id: number; label: string }>;
  companies: Array<{ id: number; nome: string; citta: string }>;
}

export interface SelectionStats {
  totale: number;
  attive: number;
  chiuse: number;
  annullate: number;
  con_hr_assegnata: number;
  senza_hr: number;
  per_stato: Array<{ stato: string; count: number }>;
  per_pacchetto: Array<{ pacchetto: string; count: number }>;
}

export interface InvoiceStatusDetail {
  id: number;
  numero_fattura: string;
  tipo: InvoiceType;
  data_emissione: string;
  data_pagamento?: string | null;
  saldato: boolean;
}

export interface SelectionInvoicesStatusResponse {
  pacchetto: PackageType;
  fatture_previste: number;
  fatture_presenti: number;
  fatture_saldate: number;
  completamente_fatturato: boolean;
  tutto_saldato: boolean;
  dettaglio_fatture: InvoiceStatusDetail[];
}

export interface DeleteSelectionResponse {
  message: string;
}

export const isSelectionResponse = (obj: unknown): obj is SelectionResponse => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    typeof (obj as SelectionResponse).id === "number" &&
    "titolo" in obj &&
    typeof (obj as SelectionResponse).titolo === "string" &&
    "company" in obj &&
    "consulente" in obj
  );
};

export const isSelectionListItem = (obj: unknown): obj is SelectionListItem => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    typeof (obj as SelectionListItem).id === "number" &&
    "titolo" in obj &&
    typeof (obj as SelectionListItem).titolo === "string" &&
    "fatture" in obj &&
    Array.isArray((obj as SelectionListItem).fatture) &&
    "_count" in obj &&
    "company" in obj &&
    "consulente" in obj
  );
};

export interface SelectionDeadlineMonitoring {
  id: number;
  titolo: string;
  stato: SelectionStatus;
  data_creazione: string;
  company: {
    id: number;
    nome: string;
  };
  storico_stati: Array<{
    id: number;
    stato_nuovo: SelectionStatus;
    data_cambio: string;
    data_scadenza: string | null;
  }>;
}

export interface ShortlistTestBigster {
  id: number;
  status: string;
  completed: boolean;
  eligible: boolean | null;
  evaluation: string | null;
  charA?: number | null;
  charB?: number | null;
  charC?: number | null;
  charD?: number | null;
  charE?: number | null;
  charF?: number | null;
  charG?: number | null;
  charH?: number | null;
  charI?: number | null;
  charJ?: number | null;
}

export interface ShortlistInterview {
  id: number;
  tipo: string;
  data: string | null;
  esito: string | null;
}

export interface ShortlistApplication {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  stato: string;
  test_bigster: ShortlistTestBigster | null;
  colloqui?: ShortlistInterview[];
}

export interface ShortlistEntryDetail {
  id: number;
  selection_id: number;
  application_id: number;
  ordine: number;
  note: string | null;
  aggiunto_da_id: number | null;
  data_inserimento: string;
  data_modifica: string;
  application: ShortlistApplication;
}

export interface ShortlistEntryBasic {
  id: number;
  selection_id: number;
  application_id: number;
  ordine: number;
  note: string | null;
  data_inserimento: string;
  application: {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    telefono: string | null;
    stato: string;
    test_bigster: {
      id: number;
      status: string;
      completed: boolean;
      eligible: boolean | null;
      evaluation: string | null;
    } | null;
  };
}

export interface AddToShortlistPayload {
  application_id: number;
  ordine?: number;
  note?: string | null;
}

export interface UpdateShortlistEntryPayload {
  ordine?: number;
  note?: string | null;
}

export interface ReorderShortlistPayload {
  order: Array<{
    application_id: number;
    ordine: number;
  }>;
}

export interface GetShortlistResponse {
  data: ShortlistEntryDetail[];
  count: number;
  selection_id: number;
}

export interface AddToShortlistResponse {
  message: string;
  data: ShortlistEntryDetail;
}

export interface UpdateShortlistEntryResponse {
  message: string;
  data: {
    id: number;
    selection_id: number;
    application_id: number;
    ordine: number;
    note: string | null;
    application: {
      id: number;
      nome: string;
      cognome: string;
      email: string;
    };
  };
}

export interface ReorderShortlistResponse {
  message: string;
  data: Array<{
    id: number;
    application_id: number;
    ordine: number;
    application: {
      id: number;
      nome: string;
      cognome: string;
    };
  }>;
}

export interface RemoveFromShortlistResponse {
  message: string;
  removed_application_id: number;
}

export interface ClearShortlistResponse {
  message: string;
  removed_count: number;
}

export interface UsedInvoiceFicIdsResponse {
  used_fic_ids: number[];
}

export interface PendingInvoiceItem {
  id: number;
  fic_id: number | null;
  numero_fattura: string;
  tipo_fattura: InvoiceType;
  data_emissione: string;
  data_pagamento: string | null;
}

export interface PendingInvoiceSummary {
  expected: number;
  current: number;
  paid: number;
  missing_types: string[];
  has_missing_invoices: boolean;
  has_pending_payments: boolean;
}

export interface PendingSelectionItem {
  id: number;
  titolo: string;
  stato: SelectionStatus;
  pacchetto: PackageType;
  data_creazione: string;
  company: {
    id: number;
    nome: string;
    citta: string;
  };
  consulente: UserBasic;
  risorsa_umana: UserBasic | null;
  fatture: PendingInvoiceItem[];
  invoices_summary: PendingInvoiceSummary;
}

export interface PendingInvoicesResponse {
  data: PendingSelectionItem[];
  total: number;
}

export interface AddInvoiceToSelectionPayload {
  fic_id: number;
  numero_fattura: string;
  tipo_fattura: "INS" | "MDO";
  data_emissione: string;
}

export interface AddInvoiceToSelectionResponse {
  message: string;
  invoice: {
    id: number;
    fic_id: number;
    numero_fattura: string;
    tipo_fattura: string;
    data_emissione: string;
    company_id: number;
    selezione_id: number;
  };
}

export interface RegisterInvoicePaymentPayload {
  data_pagamento: string;
}

export interface RegisterInvoicePaymentResponse {
  message: string;
  invoice: {
    id: number;
    numero_fattura: string;
    tipo_fattura: string;
    data_emissione: string;
    data_pagamento: string;
  };
}
