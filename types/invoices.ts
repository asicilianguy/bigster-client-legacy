export enum InvoiceType {
  AV = "AV",
  INS = "INS",
  MDO = "MDO",
}

export enum PackageType {
  BASE = "BASE",
  MDO = "MDO",
}

export interface CompanyBasic {
  id: number;
  nome: string;
}

export interface SelectionBasic {
  id: number;
  titolo: string;
  pacchetto: PackageType;
}

export interface InvoiceBase {
  id: number;
  numero_fattura: string;
  company_id: number;
  selezione_id: number;
  tipo_fattura: InvoiceType;
  data_emissione: string;
  data_pagamento?: string | null;
  data_creazione: string;
  data_modifica: string;
}

export interface InvoiceResponse extends InvoiceBase {
  company: CompanyBasic;
  selezione: SelectionBasic;
}

export interface InvoiceListItem extends InvoiceResponse {}

export interface InvoiceDetail extends InvoiceResponse {}

export interface InvoiceStatsItem {
  tipo_fattura: InvoiceType;
  totale: number;
  saldate: number;
  non_saldate: number;
  importo_totale?: number;
}

export interface InvoiceStatsResponse {
  totale: number;
  saldate: number;
  non_saldate: number;
  per_tipo: InvoiceStatsItem[];
}

export interface CreateInvoicePayload {
  numero_fattura: string;
  company_id: number;
  selezione_id: number;
  tipo_fattura: InvoiceType;
  data_emissione: string;
  data_pagamento?: string;
}

export interface UpdateInvoicePayload {
  numero_fattura?: string;
  tipo_fattura?: InvoiceType;
  data_emissione?: string;
  data_pagamento?: string | null;
}

export interface MarkInvoiceAsPaidPayload {
  data_pagamento?: string;
}

export interface GetInvoicesQueryParams {
  company_id?: number;
  selezione_id?: number;
  tipo_fattura?: InvoiceType;
  saldato?: boolean;
}

export interface DeleteInvoiceResponse {
  message: string;
}

export const isInvoiceResponse = (obj: any): obj is InvoiceResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.numero_fattura === "string" &&
    typeof obj.company_id === "number" &&
    typeof obj.selezione_id === "number" &&
    obj.company !== undefined &&
    obj.selezione !== undefined
  );
};

export const isInvoiceDetail = (obj: any): obj is InvoiceDetail => {
  return isInvoiceResponse(obj);
};
