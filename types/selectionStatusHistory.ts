import { SelectionStatus } from "./user";

export interface SelectionStatusHistoryBase {
  id: number;
  selezione_id: number;
  stato_precedente?: SelectionStatus | null;
  stato_nuovo: SelectionStatus;
  risorsa_umana_id?: number | null;
  data_cambio: string;
  data_scadenza?: string | null;
  note?: string | null;
}

export interface SelectionStatusHistoryResponse extends SelectionStatusHistoryBase {
  risorsa_umana?: {
    id: number;
    nome: string;
    cognome: string;
  } | null;
}

export interface CreateSelectionStatusHistoryPayload {
  selezione_id: number;
  stato_precedente?: SelectionStatus;
  stato_nuovo: SelectionStatus;
  risorsa_umana_id?: number;
  data_scadenza?: string;
  note?: string;
}
