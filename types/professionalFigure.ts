export enum Seniority {
  JUNIOR = "JUNIOR",
  MID = "MID",
  SENIOR = "SENIOR",
}

export interface ProfessionalFigureBase {
  id: number;
  nome: string;
  seniority: Seniority;
  prerequisiti?: string | null;
  descrizione: string;
  data_creazione: string;
  data_modifica: string;
}

export interface ProfessionalFigureResponse extends ProfessionalFigureBase {
  _count?: {
    selezioni: number;
  };
}

export interface ProfessionalFigureDetail extends ProfessionalFigureBase {
  _count: {
    selezioni: number;
  };
}

export interface ProfessionalFigureStatsItem {
  id: number;
  nome: string;
  seniority: Seniority;
  numero_selezioni: number;
}

export interface ProfessionalFigureStatsResponse {
  totale: number;
  per_seniority: Record<Seniority, number>;
  piu_utilizzate: ProfessionalFigureStatsItem[];
}

export interface CreateProfessionalFigurePayload {
  nome: string;
  seniority: Seniority;
  prerequisiti?: string;
  descrizione: string;
}

export interface UpdateProfessionalFigurePayload {
  nome?: string;
  seniority?: Seniority;
  prerequisiti?: string | null;
  descrizione?: string;
}

export interface GetProfessionalFiguresQueryParams {
  seniority?: Seniority;
  search?: string;
}

export interface DeleteProfessionalFigureResponse {
  message: string;
}

export const isProfessionalFigureResponse = (
  obj: any
): obj is ProfessionalFigureResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    typeof obj.seniority === "string" &&
    typeof obj.descrizione === "string"
  );
};

export const isProfessionalFigureDetail = (
  obj: any
): obj is ProfessionalFigureDetail => {
  return (
    isProfessionalFigureResponse(obj) &&
    obj._count !== undefined &&
    typeof obj._count === "object" &&
    typeof obj._count.selezioni === "number"
  );
};
