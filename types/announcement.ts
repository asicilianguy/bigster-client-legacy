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

export interface CompanyBasic {
  id: number;
  nome: string;
  citta?: string | null;
}

export interface SelectionBasic {
  id: number;
  titolo: string;
  stato: SelectionStatus;
}

export interface AnnouncementBase {
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
}

export interface AnnouncementResponse extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
}

export interface AnnouncementListItem extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
  _count: {
    candidature: number;
  };
}

export interface AnnouncementDetail extends AnnouncementBase {
  selezione: {
    id: number;
    titolo: string;
    stato: SelectionStatus;
    figura_ricercata?: string | null;
    company: CompanyBasic;
    consulente: {
      id: number;
      nome: string;
      cognome: string;
    } | null;
    risorsa_umana: {
      id: number;
      nome: string;
      cognome: string;
    } | null;
  };
  company: {
    id: number;
    nome: string;
    citta?: string | null;
    indirizzo?: string | null;
  };
  candidature: Array<{
    id: number;
    nome: string;
    cognome: string;
    email: string;
    stato: string;
    data_creazione: string;
  }>;
  _count: {
    candidature: number;
  };
}

export interface AnnouncementBySelectionItem extends AnnouncementBase {
  company: CompanyBasic;
  _count: {
    candidature: number;
  };
}

export interface AnnouncementByCompanyItem extends AnnouncementBase {
  selezione: SelectionBasic;
  _count: {
    candidature: number;
  };
}

export interface PublishAnnouncementResponse {
  success: boolean;
  message: string;
  announcement: AnnouncementResponse;
}

export interface CloseAnnouncementResponse extends AnnouncementBase {
  selezione: SelectionBasic;
  company: CompanyBasic;
  _count: {
    candidature: number;
  };
}

export interface TopCompanyStats {
  company_id: number;
  company_nome: string;
  numero_annunci: number;
}

export interface AnnouncementStatsResponse {
  totale: number;
  per_stato: Record<AnnouncementStatus, number>;
  per_piattaforma: Record<AnnouncementPlatform, number>;
  top_companies: TopCompanyStats[];
}

export interface CreateAnnouncementPayload {
  selezione_id: number;
  company_id: number;
  hash_candidatura: string;
  piattaforma?: AnnouncementPlatform | null;
  citta?: string | null;
  provincia?: string | null;
  regione?: string | null;
  link_candidatura: string;
  link_annuncio?: string | null;
  data_pubblicazione?: string | null;
}

export interface UpdateAnnouncementPayload {
  piattaforma?: AnnouncementPlatform | null;
  citta?: string | null;
  provincia?: string | null;
  regione?: string | null;
  link_candidatura?: string;
  link_annuncio?: string | null;
  stato?: AnnouncementStatus;
  data_pubblicazione?: string | null;
}

export interface PublishAnnouncementPayload {
  piattaforma: AnnouncementPlatform;
  citta: string;
  provincia: string;
  regione: string;
  link_annuncio?: string | null;
}

export interface GetAnnouncementsQueryParams {
  stato?: AnnouncementStatus;
  piattaforma?: AnnouncementPlatform;
  selezione_id?: number;
  company_id?: number;
}

export interface DeleteAnnouncementResponse {
  message: string;
}

export const isAnnouncementResponse = (
  obj: unknown
): obj is AnnouncementResponse => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    typeof (obj as AnnouncementResponse).id === "number" &&
    "selezione" in obj &&
    "company" in obj
  );
};

export const isAnnouncementDetail = (
  obj: unknown
): obj is AnnouncementDetail => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    typeof (obj as AnnouncementDetail).id === "number" &&
    "selezione" in obj &&
    "company" in obj &&
    "candidature" in obj &&
    Array.isArray((obj as AnnouncementDetail).candidature) &&
    "_count" in obj &&
    typeof (obj as AnnouncementDetail)._count === "object" &&
    (obj as AnnouncementDetail)._count !== null &&
    typeof (obj as AnnouncementDetail)._count.candidature === "number"
  );
};

export function isAnnouncement(obj: unknown): obj is AnnouncementBase {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "selezione_id" in obj &&
    "hash_candidatura" in obj &&
    "link_candidatura" in obj
  );
}

export const isAnnouncementInitialized = (
  announcement: AnnouncementBase
): boolean => {
  return announcement.stato === AnnouncementStatus.INIZIALIZZATO;
};

export const isAnnouncementReadyToPublish = (
  announcement: AnnouncementBase
): boolean => {
  return (
    announcement.piattaforma !== null &&
    announcement.citta !== null &&
    announcement.provincia !== null &&
    announcement.regione !== null
  );
};
