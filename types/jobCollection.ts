export interface SelectionBasic {
  id: number;
  titolo: string;
  risorsa_umana_id?: number | null;
  figura_ricercata?: string | null;
  company?: {
    id: number;
    nome: string;
  };
}

export interface JobCollectionBase {
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

export interface JobCollectionResponse extends JobCollectionBase {
  download_url?: string;
  download_url_json?: string;
}

export interface JobCollectionDetail extends JobCollectionBase {
  download_url?: string;
  download_url_json?: string;
  selezione: SelectionBasic;
}

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

export interface DownloadUrlResponse {
  download_url: string;
  expires_in: number;
}

export interface CreateJobCollectionPayload {
  selezione_id: number;
  s3_key: string;
  s3_key_json?: string;
}

export interface UpdateJobCollectionPayload {
  inviata_al_cliente?: boolean;
  approvata_dal_cliente?: boolean;
  note_cliente?: string | null;
}

export interface ReplaceJobCollectionPdfPayload {
  s3_key: string;
}

export interface UpdateJobCollectionJsonPayload {
  s3_key_json: string;
}

export interface SendToClientPayload {
  id: number;
  email: string;
}

export interface SendToClientResponse extends JobCollectionBase {
  message: string;
  email_sent_to: string;
  warning?: string;
}

export interface DeleteJobCollectionResponse {
  message: string;
}

export const isJobCollectionResponse = (
  obj: unknown
): obj is JobCollectionResponse => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    typeof (obj as JobCollectionResponse).id === "number" &&
    "selezione_id" in obj &&
    typeof (obj as JobCollectionResponse).selezione_id === "number" &&
    "s3_key" in obj &&
    typeof (obj as JobCollectionResponse).s3_key === "string"
  );
};

export const isJobCollectionDetail = (
  obj: unknown
): obj is JobCollectionDetail => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "id" in obj &&
    typeof (obj as JobCollectionDetail).id === "number" &&
    "selezione_id" in obj &&
    typeof (obj as JobCollectionDetail).selezione_id === "number" &&
    "s3_key" in obj &&
    typeof (obj as JobCollectionDetail).s3_key === "string" &&
    "selezione" in obj &&
    (obj as JobCollectionDetail).selezione !== undefined
  );
};

export const hasJsonData = (obj: JobCollectionBase): boolean => {
  return !!obj.s3_key_json;
};

export interface ClientViewResponse {
  id: number;
  inviata_al_cliente: boolean;
  data_invio_cliente: string | null;
  approvata_dal_cliente: boolean;
  data_approvazione_cliente: string | null;
  note_cliente: string | null;
  download_url: string | null;
  selezione: {
    id: number;
    titolo: string;
    company: {
      id: number;
      nome: string;
    };
    figura_ricercata: string | null;
  };
}

export interface ClientApprovalPayload {
  id: number;
  note_cliente?: string;
}

export interface ClientApprovalResponse {
  success: boolean;
  message: string;
  already_approved?: boolean;
  data_approvazione?: string;
  job_collection: {
    id: number;
    approvata_dal_cliente: boolean;
    data_approvazione_cliente: string | null;
    note_cliente: string | null;
  };
  selezione: {
    id: number;
    titolo: string;
    company: {
      id: number;
      nome: string;
    };
    figura_ricercata: string | null;
  };
  stato_aggiornato?: boolean;
}
