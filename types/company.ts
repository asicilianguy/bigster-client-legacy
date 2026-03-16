import {
  AnnouncementStatus,
  SelectionStatus,
  PackageType,
  InvoiceType,
} from "./selection";

export interface CompanyBase {
  id: number;
  nome: string;
  partita_iva: string;
  indirizzo: string;
  citta: string;
  cap: string;
  telefono: string;
  email: string;
  data_creazione: string;
  data_modifica: string;
}

export interface UserBasic {
  id: number;
  nome: string;
  cognome: string;
}

export interface CompanyResponse extends CompanyBase {}

export interface CompanyListItem extends CompanyBase {
  _count: {
    annunci: number;
    selezioni: number;
    fatture: number;
  };
}

export interface CompanyDetail extends CompanyBase {
  annunci: Array<{
    id: number;
    titolo: string;
    stato: AnnouncementStatus;
    data_pubblicazione?: string | null;
    data_scadenza?: string | null;
    selezione: {
      id: number;
      titolo: string;
      stato: SelectionStatus;
    };
  }>;
  selezioni: Array<{
    id: number;
    titolo: string;
    stato: SelectionStatus;
    pacchetto: PackageType;
    consulente?: UserBasic | null;
    risorsa_umana?: UserBasic | null;
    data_creazione: string;
  }>;
  fatture: Array<{
    id: number;
    numero_fattura: string;
    tipo_fattura: InvoiceType;
    data_emissione: string;
    data_pagamento?: string | null;
    selezione: {
      id: number;
      titolo: string;
    };
  }>;
  _count: {
    annunci: number;
    selezioni: number;
    fatture: number;
  };
}

export interface CompanySearchResult {
  id: number;
  nome: string;
  citta: string;
}

export interface CompanyStatsResponse {
  company: {
    id: number;
    nome: string;
  };
  selezioni: {
    totale: number;
    per_stato: Record<SelectionStatus, number>;
  };
  fatture: {
    totale: number;
    per_tipo: Record<InvoiceType, number>;
  };
}

export interface CreateCompanyPayload {
  nome: string;
  partita_iva: string;
  indirizzo: string;
  citta: string;
  cap: string;
  telefono: string;
  email: string;
}

export interface UpdateCompanyPayload {
  nome?: string;
  partita_iva?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  telefono?: string;
  email?: string;
}

export interface GetCompaniesQueryParams {
  search?: string;
  citta?: string;
}

export interface DeleteCompanyResponse {
  message: string;
}

export const isCompanyResponse = (obj: any): obj is CompanyResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    typeof obj.partita_iva === "string" &&
    typeof obj.indirizzo === "string" &&
    typeof obj.citta === "string" &&
    typeof obj.cap === "string" &&
    typeof obj.telefono === "string" &&
    typeof obj.email === "string"
  );
};

export const isCompanyListItem = (obj: any): obj is CompanyListItem => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    obj._count !== undefined &&
    typeof obj._count === "object" &&
    typeof obj._count.annunci === "number" &&
    typeof obj._count.selezioni === "number" &&
    typeof obj._count.fatture === "number"
  );
};

export const isCompanyDetail = (obj: any): obj is CompanyDetail => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    Array.isArray(obj.annunci) &&
    Array.isArray(obj.selezioni) &&
    Array.isArray(obj.fatture) &&
    obj._count !== undefined &&
    typeof obj._count === "object"
  );
};
